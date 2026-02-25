import { Injectable, ExecutionContext, HttpException, HttpStatus } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';

@Injectable()
export class CustomThrottlerGuard extends ThrottlerGuard {
  protected async throwThrottlingException(context: ExecutionContext, throttlerLimitDetail: any): Promise<void> {
    throw new HttpException(
      'Слишком много запросов. Пожалуйста, попробуйте позже.',
      HttpStatus.TOO_MANY_REQUESTS,
    );
  }

  // Пропускаем rate limiting для критических операций
  protected async shouldSkip(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const url = request.url || '';
    const method = request.method || '';

    // Пропускаем rate limiting для удаления аккаунта
    if (method === 'DELETE' && url.includes('/settings/account')) {
      return true;
    }

    return false;
  }
}

