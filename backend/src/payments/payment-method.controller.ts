import {
  Controller,
  Get,
  Post,
  Delete,
  Patch,
  Body,
  Param,
  UseGuards,
  Request,
  HttpException,
  HttpStatus,
  UseInterceptors,
  ClassSerializerInterceptor,
} from '@nestjs/common';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PaymentMethodService } from './payment-method.service';
import { EmailService } from '../auth/email.service';
import { AddCardDto } from './dto/add-card.dto';
import { User } from '../entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Controller('payments')
@UseGuards(JwtAuthGuard)
@UseInterceptors(ClassSerializerInterceptor)
export class PaymentMethodController {
  constructor(
    private readonly paymentMethodService: PaymentMethodService,
    private readonly emailService: EmailService,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  // Получение всех карт пользователя
  @Get('cards')
  @UseGuards(ThrottlerGuard)
  @Throttle({ default: { limit: 20, ttl: 60000 } })
  async getUserCards(@Request() req: any) {
    try {
      const cards = await this.paymentMethodService.getUserCards(req.user.id);
      return {
        success: true,
        cards: cards.map((card) => ({
          id: card.id,
          cardType: card.cardType,
          last4: card.last4,
          cardholderName: card.cardholderName,
          expiryMonth: card.expiryMonth,
          expiryYear: card.expiryYear,
          isDefault: card.isDefault,
          brand: card.brand,
          createdAt: card.createdAt,
        })),
      };
    } catch (error) {
      throw new HttpException(
        error.message || 'Ошибка получения карт',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // Добавление новой карты
  @Post('cards')
  @UseGuards(ThrottlerGuard)
  @Throttle({ default: { limit: 5, ttl: 60000 } }) // 5 запросов в минуту
  async addCard(@Request() req: any, @Body() addCardDto: AddCardDto) {
    try {
      const card = await this.paymentMethodService.addCard(req.user.id, addCardDto);

      // Получаем пользователя для отправки email
      const user = await this.userRepository.findOne({ where: { id: req.user.id } });
      if (user) {
        // Отправляем email уведомление
        await this.emailService.sendCardAddedNotification(
          user.email,
          user.name || 'Пользователь',
          card.brand || 'Карта',
          card.last4,
          'ru', // TODO: получить locale из пользователя или запроса
        );
      }

      return {
        success: true,
        message: 'Карта успешно добавлена',
        card: {
          id: card.id,
          cardType: card.cardType,
          last4: card.last4,
          cardholderName: card.cardholderName,
          expiryMonth: card.expiryMonth,
          expiryYear: card.expiryYear,
          isDefault: card.isDefault,
          brand: card.brand,
          createdAt: card.createdAt,
        },
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        error.message || 'Ошибка добавления карты',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // Удаление карты
  @Delete('cards/:cardId')
  @UseGuards(ThrottlerGuard)
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  async deleteCard(@Request() req: any, @Param('cardId') cardId: string) {
    try {
      // Получаем информацию о карте перед удалением
      const card = await this.paymentMethodService.getCardById(req.user.id, cardId);
      
      // Удаляем карту
      await this.paymentMethodService.deleteCard(req.user.id, cardId);

      // Получаем пользователя для отправки email
      const user = await this.userRepository.findOne({ where: { id: req.user.id } });
      if (user) {
        // Отправляем email уведомление
        await this.emailService.sendCardRemovedNotification(
          user.email,
          user.name || 'Пользователь',
          card.brand || 'Карта',
          card.last4,
          'ru', // TODO: получить locale из пользователя или запроса
        );
      }

      return {
        success: true,
        message: 'Карта успешно удалена',
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        error.message || 'Ошибка удаления карты',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // Установка карты как основной
  @Patch('cards/:cardId/default')
  @UseGuards(ThrottlerGuard)
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  async setDefaultCard(@Request() req: any, @Param('cardId') cardId: string) {
    try {
      const card = await this.paymentMethodService.setDefaultCard(req.user.id, cardId);
      return {
        success: true,
        message: 'Основная карта изменена',
        card: {
          id: card.id,
          cardType: card.cardType,
          last4: card.last4,
          isDefault: card.isDefault,
          brand: card.brand,
        },
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        error.message || 'Ошибка установки основной карты',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // Получение основной карты
  @Get('cards/default')
  @UseGuards(ThrottlerGuard)
  @Throttle({ default: { limit: 20, ttl: 60000 } })
  async getDefaultCard(@Request() req: any) {
    try {
      const card = await this.paymentMethodService.getDefaultCard(req.user.id);
      if (!card) {
        return {
          success: true,
          card: null,
        };
      }
      return {
        success: true,
        card: {
          id: card.id,
          cardType: card.cardType,
          last4: card.last4,
          cardholderName: card.cardholderName,
          expiryMonth: card.expiryMonth,
          expiryYear: card.expiryYear,
          isDefault: card.isDefault,
          brand: card.brand,
        },
      };
    } catch (error) {
      throw new HttpException(
        error.message || 'Ошибка получения основной карты',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}

