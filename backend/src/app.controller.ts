import { Controller, Get, Post, Body, BadRequestException } from '@nestjs/common';
import { AppService } from './app.service';
import { IsEmail, IsNotEmpty, IsIn, IsOptional } from 'class-validator';
import { getValidationMessage } from './common/i18n/validation-messages';

function getMessage(key: string, locale: 'ru' | 'en' = 'ru'): string {
  return getValidationMessage(key, locale);
}

export class SubscribeDto {
  @IsEmail({}, { message: getMessage('email.invalid') })
  @IsNotEmpty({ message: getMessage('email.required') })
  email: string;

  @IsOptional()
  @IsIn(['ru', 'en'], { message: getMessage('locale.invalid') })
  locale?: 'ru' | 'en';
}

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('health')
  getHealth(): { status: string; timestamp: string } {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
    };
  }

  @Post('newsletter/subscribe')
  async subscribe(@Body() subscribeDto: SubscribeDto) {
    try {
      const locale = subscribeDto.locale || 'ru';
      const result = await this.appService.subscribeToNewsletter(subscribeDto.email, locale as 'ru' | 'en');
      return result;
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      const locale = subscribeDto.locale || 'ru';
      throw new BadRequestException(getValidationMessage('subscription.error', locale as 'ru' | 'en'));
    }
  }
}

