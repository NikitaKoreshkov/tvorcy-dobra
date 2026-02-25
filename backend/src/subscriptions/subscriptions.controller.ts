import { Controller, Get, Post, Delete, Body, Param, UseGuards, Request, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { SubscriptionsService } from './subscriptions.service';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';

@Controller('subscriptions')
@UseGuards(JwtAuthGuard) // Все endpoints требуют JWT аутентификации
export class SubscriptionsController {
  private readonly logger = new Logger(SubscriptionsController.name);

  constructor(private readonly subscriptionsService: SubscriptionsService) {}

  // Получение всех доступных планов
  @Get('plans')
  @UseGuards(ThrottlerGuard)
  @Throttle({ default: { limit: 30, ttl: 60000 } })
  async getPlans() {
    try {
      const plans = await this.subscriptionsService.getAvailablePlans();
      return {
        success: true,
        plans,
      };
    } catch (error) {
      throw new HttpException(
        error.message || 'Ошибка получения планов',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // Получение подписок пользователя
  @Get()
  @UseGuards(ThrottlerGuard)
  @Throttle({ default: { limit: 50, ttl: 60000 } })
  async getUserSubscriptions(@Request() req: any) {
    try {
      const subscriptions = await this.subscriptionsService.getUserSubscriptions(req.user.id);
      return {
        success: true,
        subscriptions: subscriptions || [],
      };
    } catch (error) {
      throw new HttpException(
        error.message || 'Ошибка получения подписок',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // Создание новой подписки
  @Post()
  @UseGuards(ThrottlerGuard)
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  async createSubscription(
    @Request() req: any,
    @Body() createSubscriptionDto: CreateSubscriptionDto,
  ) {
    try {
      const subscription = await this.subscriptionsService.createSubscription(
        req.user.id,
        createSubscriptionDto.planId,
        createSubscriptionDto.paymentMethodId,
      );
      return {
        success: true,
        subscription,
      };
    } catch (error) {
      // Логируем ошибку с понятным русским текстом
      if (error instanceof HttpException) {
        this.logger.warn(`Ошибка создания подписки для пользователя ${req.user.id}: ${error.message}`);
        throw error;
      }
      
      // Для неизвестных ошибок логируем детали, но не раскрываем их клиенту
      this.logger.error(`Неожиданная ошибка создания подписки для пользователя ${req.user.id}:`, error);
      
      throw new HttpException(
        {
          message: 'Ошибка создания подписки. Пожалуйста, попробуйте позже или обратитесь в поддержку.',
          error: 'SubscriptionCreationFailed',
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  // Отмена подписки
  @Delete(':id')
  @UseGuards(ThrottlerGuard)
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  async cancelSubscription(@Request() req: any, @Param('id') id: string) {
    try {
      const subscription = await this.subscriptionsService.cancelSubscription(req.user.id, id);
      return {
        success: true,
        subscription,
      };
    } catch (error) {
      throw new HttpException(
        error.message || 'Ошибка отмены подписки',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  // Проверка доступа к ИИ
  @Get('ai-access')
  @UseGuards(ThrottlerGuard)
  @Throttle({ default: { limit: 20, ttl: 60000 } })
  async checkAIAccess(@Request() req: any) {
    try {
      const hasAccess = await this.subscriptionsService.hasAIAccess(req.user.id);
      return {
        success: true,
        hasAccess,
      };
    } catch (error) {
      throw new HttpException(
        error.message || 'Ошибка проверки доступа',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}

