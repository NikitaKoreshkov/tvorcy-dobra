import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Request, Response } from 'express';

@Injectable()
export class CacheInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const ctx = context.switchToHttp();
    const request = ctx.getRequest<Request>();
    const response = ctx.getResponse<Response>();

    // Устанавливаем заголовки кэширования для GET запросов
    if (request.method === 'GET') {
      // Для статических данных - кэш на 5 минут
      if (request.path.includes('/projects') && !request.path.includes('/projects/')) {
        response.setHeader('Cache-Control', 'public, max-age=300, s-maxage=300');
      }
      // Для отдельных проектов - кэш на 1 минуту
      else if (request.path.match(/\/projects\/[^/]+$/)) {
        response.setHeader('Cache-Control', 'public, max-age=60, s-maxage=60');
      }
      // Для других GET запросов - кэш на 30 секунд
      else {
        response.setHeader('Cache-Control', 'public, max-age=30, s-maxage=30');
      }
    }

    return next.handle();
  }
}

