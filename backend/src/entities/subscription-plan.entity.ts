import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum SubscriptionPlanType {
  BASIC = 'basic',
  PREMIUM = 'premium',
  ULTIMATE = 'ultimate',
}

@Entity('subscription_plans')
export class SubscriptionPlan {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'enum', enum: SubscriptionPlanType, unique: true })
  type: SubscriptionPlanType;

  @Column()
  name: string; // Название плана (например, "Базовый", "Премиум", "Максимальный")

  @Column({ type: 'text', nullable: true })
  description: string; // Описание плана

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price: number; // Цена в рублях

  @Column({ type: 'varchar', length: 20 })
  billingPeriod: string; // 'monthly', 'yearly'

  @Column({ type: 'jsonb', nullable: true })
  features: string[]; // Массив функций, которые включены в план

  @Column({ default: true })
  isActive: boolean; // Активен ли план для продажи

  @Column({ default: false })
  includesAI: boolean; // Включает ли план доступ к ИИ

  @Column({ default: false })
  includesAdvancedReports: boolean; // Включает ли план расширенные отчеты

  @Column({ default: false })
  includesPrioritySupport: boolean; // Включает ли план приоритетную поддержку

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

