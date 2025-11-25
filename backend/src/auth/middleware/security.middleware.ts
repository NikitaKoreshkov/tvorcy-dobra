import { Injectable, NestMiddleware, HttpException, HttpStatus } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import * as dns from 'dns';
import { promisify } from 'util';

const dnsLookup = promisify(dns.lookup);

// Список известных временных email сервисов
const TEMPORARY_EMAIL_DOMAINS = [
  'tempmail.com',
  '10minutemail.com',
  'guerrillamail.com',
  'mailinator.com',
  'throwaway.email',
  'temp-mail.org',
  'mohmal.com',
  'yopmail.com',
  'getnada.com',
  'maildrop.cc',
  'trashmail.com',
  'fakeinbox.com',
  'dispostable.com',
  'mintemail.com',
  'mytrashmail.com',
  'sharklasers.com',
  'spamgourmet.com',
  'spamhole.com',
  'spamtraps.com',
  'tempail.com',
  'tempr.email',
  'tmpmail.org',
];

@Injectable()
export class SecurityMiddleware implements NestMiddleware {
  async use(req: Request, res: Response, next: NextFunction) {
    // Защита от SQL инъекций в query параметрах
    const queryString = JSON.stringify(req.query);
    if (this.containsSqlInjection(queryString)) {
      throw new HttpException('Недопустимый запрос', HttpStatus.BAD_REQUEST);
    }

    // Защита от XSS в body
    if (req.body) {
      const bodyString = JSON.stringify(req.body);
      if (this.containsXss(bodyString)) {
        throw new HttpException('Недопустимый запрос', HttpStatus.BAD_REQUEST);
      }
    }

    next();
  }

  private containsSqlInjection(input: string): boolean {
    const sqlPatterns = [
      /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|EXECUTE|UNION|SCRIPT)\b)/gi,
      /(--|;|\/\*|\*\/|xp_|sp_)/gi,
      /(\bOR\b.*=.*=)/gi,
      /(\bAND\b.*=.*=)/gi,
    ];

    return sqlPatterns.some(pattern => pattern.test(input));
  }

  private containsXss(input: string): boolean {
    const xssPatterns = [
      /<script[^>]*>.*?<\/script>/gi,
      /<iframe[^>]*>.*?<\/iframe>/gi,
      /javascript:/gi,
      /on\w+\s*=/gi,
      /<img[^>]+src[^>]*=.*javascript:/gi,
    ];

    return xssPatterns.some(pattern => pattern.test(input));
  }
}

// Валидация email
export async function validateEmail(email: string): Promise<boolean> {
  // Проверка формата email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return false;
  }

  // Проверка на временные email сервисы
  const domain = email.split('@')[1]?.toLowerCase();
  if (!domain) {
    return false;
  }

  if (TEMPORARY_EMAIL_DOMAINS.some(tempDomain => domain.includes(tempDomain))) {
    return false;
  }

  // Проверка DNS записи для домена
  try {
    await dnsLookup(domain);
    return true;
  } catch (error) {
    return false;
  }
}

