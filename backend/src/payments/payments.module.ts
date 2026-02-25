import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PaymentMethodController } from './payment-method.controller';
import { PaymentMethodService } from './payment-method.service';
import { PaymentMethod } from '../entities/payment-method.entity';
import { User } from '../entities/user.entity';
import { EmailService } from '../auth/email.service';

@Module({
  imports: [TypeOrmModule.forFeature([PaymentMethod, User])],
  controllers: [PaymentMethodController],
  providers: [PaymentMethodService, EmailService],
  exports: [PaymentMethodService],
})
export class PaymentsModule {}

