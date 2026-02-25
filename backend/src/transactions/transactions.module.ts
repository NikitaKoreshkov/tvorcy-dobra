import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TransactionController } from './transaction.controller';
import { RecurringPaymentController } from './recurring-payment.controller';
import { TransactionService } from './transaction.service';
import { ReceiptService } from './receipt.service';
import { Transaction } from '../entities/transaction.entity';
import { User } from '../entities/user.entity';
import { PaymentMethod } from '../entities/payment-method.entity';
import { Project } from '../entities/project.entity';
import { GamificationModule } from '../gamification/gamification.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Transaction, User, PaymentMethod, Project]),
    forwardRef(() => GamificationModule),
  ],
  controllers: [RecurringPaymentController, TransactionController],
  providers: [TransactionService, ReceiptService],
  exports: [TransactionService],
})
export class TransactionsModule {}

