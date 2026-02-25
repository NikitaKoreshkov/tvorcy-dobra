import {
  Controller,
  Get,
  Query,
  Param,
  UseGuards,
  Request,
  HttpException,
  HttpStatus,
  UseInterceptors,
  ClassSerializerInterceptor,
  Post,
  Patch,
  Delete,
  Res,
  Body,
} from '@nestjs/common';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { TransactionService } from './transaction.service';
import { ReceiptService } from './receipt.service';
import { Response } from 'express';

@Controller('transactions')
@UseGuards(JwtAuthGuard)
@UseInterceptors(ClassSerializerInterceptor)
export class TransactionController {
  constructor(
    private readonly transactionService: TransactionService,
    private readonly receiptService: ReceiptService,
  ) {}

  // Получение всех транзакций пользователя
  @Get()
  @UseGuards(ThrottlerGuard)
  @Throttle({ default: { limit: 30, ttl: 60000 } })
  async getUserTransactions(
    @Request() req: any,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
    @Query('sortBy') sortBy?: string,
    @Query('sortOrder') sortOrder?: 'ASC' | 'DESC',
  ) {
    try {
      const limitNum = limit ? parseInt(limit, 10) : 50;
      const offsetNum = offset ? parseInt(offset, 10) : 0;
      const sortByField = sortBy || 'createdAt';
      const sortOrderField = sortOrder || 'DESC';

      const result = await this.transactionService.getUserTransactions(
        req.user.id,
        limitNum,
        offsetNum,
        sortByField,
        sortOrderField,
      );

      return {
        success: true,
        transactions: result.transactions.map((t) => ({
          id: t.id,
          type: t.type,
          status: t.status,
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
        total: result.total,
        limit: limitNum,
        offset: offsetNum,
      };
    } catch (error) {
      throw new HttpException(
        error.message || 'Ошибка получения транзакций',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // Получение статистики
  @Get('stats')
  @UseGuards(ThrottlerGuard)
  @Throttle({ default: { limit: 20, ttl: 60000 } })
  async getStats(@Request() req: any) {
    try {
      const stats = await this.transactionService.getUserTransactionStats(req.user.id);
      return {
        success: true,
        stats: {
          totalAmount: stats.totalAmount,
          totalTransactions: stats.totalTransactions,
          completedTransactions: stats.completedTransactions,
          pendingTransactions: stats.pendingTransactions,
          recurringPayments: stats.recurringPayments,
        },
      };
    } catch (error) {
      throw new HttpException(
        error.message || 'Ошибка получения статистики',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // Получение данных для dashboard
  @Get('dashboard')
  @UseGuards(ThrottlerGuard)
  @Throttle({ default: { limit: 20, ttl: 60000 } })
  async getDashboard(@Request() req: any) {
    try {
      const dashboardData = await this.transactionService.getDashboardData(req.user.id);
      return {
        success: true,
        dashboard: {
          totalDonated: dashboardData.totalDonated,
          projectsCount: dashboardData.projectsCount,
          countriesCount: dashboardData.countriesCount,
          recentDonations: dashboardData.recentDonations,
          totalPlatformAmount: dashboardData.totalPlatformAmount,
        },
      };
    } catch (error) {
      throw new HttpException(
        error.message || 'Ошибка получения данных dashboard',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // Генерация квитанции (должен быть ДО @Get(':id'))
  @Get(':id/receipt')
  @UseGuards(ThrottlerGuard)
  @Throttle({ default: { limit: 20, ttl: 60000 } })
  async getReceipt(@Request() req: any, @Param('id') id: string, @Res() res: Response) {
    try {
      const html = await this.receiptService.generateReceiptHTML(req.user.id, id);
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      res.send(html);
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        error.message || 'Ошибка генерации квитанции',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // Получение транзакции по ID (самый общий роут, должен быть последним)
  @Get(':id')
  @UseGuards(ThrottlerGuard)
  @Throttle({ default: { limit: 20, ttl: 60000 } })
  async getTransaction(@Request() req: any, @Param('id') id: string) {
    try {
      const transaction = await this.transactionService.getTransactionById(req.user.id, id);
      return {
        success: true,
        transaction: {
          id: transaction.id,
          type: transaction.type,
          status: transaction.status,
          amount: Number(transaction.amount),
          currency: transaction.currency,
          projectName: transaction.projectName,
          description: transaction.description,
          projectId: transaction.projectId,
          recurringPaymentId: transaction.recurringPaymentId,
          nextPaymentDate: transaction.nextPaymentDate,
          paymentMethod: transaction.paymentMethod
            ? {
                id: transaction.paymentMethod.id,
                brand: transaction.paymentMethod.brand,
                last4: transaction.paymentMethod.last4,
              }
            : null,
          createdAt: transaction.createdAt,
          updatedAt: transaction.updatedAt,
        },
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        error.message || 'Ошибка получения транзакции',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // Создание разового пожертвования
  @Post()
  @UseGuards(ThrottlerGuard)
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  async createDonation(
    @Request() req: any,
    @Body() body: {
      amount: number;
      currency?: string;
      projectName?: string;
      description?: string;
      projectId?: string;
      paymentMethodId?: string;
    },
  ) {
    try {
      if (!body.amount || body.amount <= 0) {
        throw new HttpException('Сумма пожертвования должна быть больше нуля', HttpStatus.BAD_REQUEST);
      }

      const transaction = await this.transactionService.createOneTimeDonation(req.user.id, {
        amount: body.amount,
        currency: body.currency || 'RUB',
        projectName: body.projectName || 'Общий фонд',
        description: body.description || null,
        projectId: body.projectId || null,
        paymentMethodId: body.paymentMethodId || null,
      });

      return {
        success: true,
        message: 'Пожертвование успешно создано',
        transaction: {
          id: transaction.id,
          type: transaction.type,
          status: transaction.status,
          amount: Number(transaction.amount) / 100, // Конвертируем из копеек в рубли
          currency: transaction.currency,
          projectName: transaction.projectName,
          description: transaction.description,
          projectId: transaction.projectId,
          createdAt: transaction.createdAt,
        },
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        error.message || 'Ошибка создания пожертвования',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // Создание тестовых транзакций (только для разработки)
  @Post('create-test')
  @UseGuards(ThrottlerGuard)
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  async createTestTransactions(@Request() req: any) {
    try {
      // Проверяем, есть ли уже транзакции
      const existing = await this.transactionService.getUserTransactions(req.user.id, 1, 0);
      if (existing.total > 0) {
        return {
          success: false,
          message: 'Тестовые транзакции уже созданы',
        };
      }

      const transactions = await this.transactionService.createTestTransactions(req.user.id);
      return {
        success: true,
        message: `Создано ${transactions.length} тестовых транзакций`,
        count: transactions.length,
      };
    } catch (error) {
      throw new HttpException(
        error.message || 'Ошибка создания тестовых транзакций',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}

