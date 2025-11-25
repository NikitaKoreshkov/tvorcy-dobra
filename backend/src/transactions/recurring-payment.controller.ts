import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  UseGuards,
  Request,
  HttpException,
  HttpStatus,
  UseInterceptors,
  ClassSerializerInterceptor,
} from '@nestjs/common';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { TransactionService } from './transaction.service';

@Controller('transactions/recurring')
@UseGuards(JwtAuthGuard)
@UseInterceptors(ClassSerializerInterceptor)
export class RecurringPaymentController {
  constructor(private readonly transactionService: TransactionService) {}

  // Создание регулярного платежа
  @Post()
  @UseGuards(ThrottlerGuard)
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  async createRecurringPayment(
    @Request() req: any,
    @Body() createData: {
      amount: number;
      currency?: string;
      projectName: string;
      description?: string;
      projectId?: string;
      paymentMethodId: string;
      nextPaymentDate: string;
    },
  ) {
    try {
      if (!createData.amount || !createData.projectName || !createData.paymentMethodId || !createData.nextPaymentDate) {
        throw new HttpException('Не все обязательные поля заполнены', HttpStatus.BAD_REQUEST);
      }

      const nextPaymentDate = new Date(createData.nextPaymentDate);
      if (isNaN(nextPaymentDate.getTime())) {
        throw new HttpException('Некорректная дата следующего платежа', HttpStatus.BAD_REQUEST);
      }

      const transaction = await this.transactionService.createRecurringPayment(req.user.id, {
        amount: createData.amount,
        currency: createData.currency || 'RUB',
        projectName: createData.projectName,
        description: createData.description,
        projectId: createData.projectId,
        paymentMethodId: createData.paymentMethodId,
        nextPaymentDate,
      });

      return {
        success: true,
        message: 'Регулярный платёж создан',
        transaction: {
          id: transaction.id,
          amount: Number(transaction.amount),
          currency: transaction.currency,
          projectName: transaction.projectName,
          description: transaction.description,
          projectId: transaction.projectId,
          nextPaymentDate: transaction.nextPaymentDate,
          paymentMethod: transaction.paymentMethod
            ? {
                id: transaction.paymentMethod.id,
                brand: transaction.paymentMethod.brand,
                last4: transaction.paymentMethod.last4,
              }
            : null,
          createdAt: transaction.createdAt,
        },
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        error.message || 'Ошибка создания регулярного платежа',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  // Получение регулярных платежей
  @Get()
  @UseGuards(ThrottlerGuard)
  @Throttle({ default: { limit: 20, ttl: 60000 } })
  async getRecurringPayments(@Request() req: any) {
    try {
      const recurring = await this.transactionService.getRecurringPayments(req.user.id);

      return {
        success: true,
        recurringPayments: recurring.map((t) => ({
          id: t.id,
          amount: Number(t.amount),
          currency: t.currency,
          projectName: t.projectName,
          description: t.description,
          projectId: t.projectId,
          recurringPaymentId: t.recurringPaymentId,
          nextPaymentDate: t.nextPaymentDate,
          paymentMethod: t.paymentMethod
            ? {
                id: t.paymentMethod.id,
                brand: t.paymentMethod.brand,
                last4: t.paymentMethod.last4,
              }
            : null,
          createdAt: t.createdAt,
        })),
      };
    } catch (error) {
      throw new HttpException(
        error.message || 'Ошибка получения регулярных платежей',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // Обновление регулярного платежа
  @Patch(':id')
  @UseGuards(ThrottlerGuard)
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  async updateRecurringPayment(
    @Request() req: any,
    @Param('id') id: string,
    @Body() updateData: {
      amount?: number;
      projectName?: string;
      description?: string;
      nextPaymentDate?: string;
    },
  ) {
    try {
      const nextPaymentDate = updateData.nextPaymentDate
        ? new Date(updateData.nextPaymentDate)
        : undefined;

      const transaction = await this.transactionService.updateRecurringPayment(req.user.id, id, {
        ...updateData,
        nextPaymentDate,
      });

      return {
        success: true,
        message: 'Регулярный платёж обновлен',
        transaction: {
          id: transaction.id,
          amount: Number(transaction.amount),
          currency: transaction.currency,
          projectName: transaction.projectName,
          description: transaction.description,
          nextPaymentDate: transaction.nextPaymentDate,
        },
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        error.message || 'Ошибка обновления регулярного платежа',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // Отмена регулярного платежа
  @Delete(':id')
  @UseGuards(ThrottlerGuard)
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  async cancelRecurringPayment(@Request() req: any, @Param('id') id: string) {
    try {
      console.log(`[DELETE] /transactions/recurring/${id} - userId: ${req.user.id}`);
      await this.transactionService.cancelRecurringPayment(req.user.id, id);
      return {
        success: true,
        message: 'Регулярный платёж отменен',
      };
    } catch (error) {
      console.error(`[DELETE] Error cancelling recurring payment ${id}:`, error);
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        error.message || 'Ошибка отмены регулярного платежа',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}

