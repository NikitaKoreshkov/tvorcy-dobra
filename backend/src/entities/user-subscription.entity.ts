import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { User } from './user.entity';
import { SubscriptionPlan } from './subscription-plan.entity';
import { PaymentMethod } from './payment-method.entity';

export enum SubscriptionStatus {
  ACTIVE = 'active',
  PAUSED = 'paused',
  CANCELLED = 'cancelled',
  EXPIRED = 'expired',
}

@Entity('user_subscriptions')
export class UserSubscription {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({ type: 'uuid' })
  @Index('IDX_user_subscriptions_userId')
  userId: string;

  @ManyToOne(() => SubscriptionPlan)
  @JoinColumn({ name: 'planId' })
  plan: SubscriptionPlan;

  @Column({ type: 'uuid' })
  @Index('IDX_user_subscriptions_planId')
  planId: string;

  @ManyToOne(() => PaymentMethod, { nullable: true })
  @JoinColumn({ name: 'paymentMethodId' })
  paymentMethod: PaymentMethod;

  @Column({ type: 'uuid', nullable: true })
  paymentMethodId: string;

  @Column({ type: 'enum', enum: SubscriptionStatus, default: SubscriptionStatus.ACTIVE })
  status: SubscriptionStatus;

  @Column({ type: 'timestamp' })
  nextBillingDate: Date; // Дата следующего списания

  @Column({ type: 'timestamp', nullable: true })
  cancelledAt: Date; // Дата отмены подписки

  @Column({ type: 'timestamp', nullable: true })
  expiresAt: Date; // Дата истечения подписки (если отменена)

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount: number; // Сумма подписки

  @Column({ default: true })
  autoRenew: boolean; // Автоматическое продление

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

