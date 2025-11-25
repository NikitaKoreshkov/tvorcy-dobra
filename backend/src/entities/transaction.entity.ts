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
import { PaymentMethod } from './payment-method.entity';

export enum TransactionStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
  REFUNDED = 'refunded',
}

export enum TransactionType {
  ONE_TIME = 'one-time',
  RECURRING = 'recurring',
  SUBSCRIPTION = 'subscription',
}

@Entity('transactions')
export class Transaction {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({ type: 'uuid' })
  @Index('IDX_transactions_userId')
  userId: string;

  // Связь с платежным методом (может быть null, если карта удалена)
  @ManyToOne(() => PaymentMethod, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'paymentMethodId' })
  paymentMethod: PaymentMethod | null;

  @Column({ type: 'uuid', nullable: true })
  paymentMethodId: string | null;

  // Тип транзакции
  @Column({ type: 'enum', enum: TransactionType, default: TransactionType.ONE_TIME })
  type: TransactionType;

  // Статус транзакции
  @Column({ type: 'enum', enum: TransactionStatus, default: TransactionStatus.PENDING })
  @Index('IDX_transactions_status')
  status: TransactionStatus;

  // Сумма транзакции (в копейках для точности)
  @Column({ type: 'bigint' })
  amount: number;

  // Валюта
  @Column({ default: 'RUB' })
  currency: string;

  // Название проекта/кампании
  @Column()
  projectName: string;

  // Описание транзакции
  @Column({ type: 'text', nullable: true })
  description: string;

  // ID проекта (если есть)
  @Column({ nullable: true })
  projectId: string | null;

  // ID регулярного платежа (если это регулярная транзакция)
  @Column({ nullable: true })
  recurringPaymentId: string | null;

  // Дата следующего платежа (для регулярных)
  @Column({ type: 'timestamp', nullable: true })
  nextPaymentDate: Date | null;

  // Внешний ID транзакции от платежного процессора
  @Column({ nullable: true, unique: true })
  externalTransactionId: string | null;

  // Метаданные (JSON)
  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any> | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

