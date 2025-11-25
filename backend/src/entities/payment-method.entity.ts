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

export enum CardType {
  VISA = 'visa',
  MASTERCARD = 'mastercard',
  MIR = 'mir',
  AMEX = 'amex',
  OTHER = 'other',
}

@Entity('payment_methods')
export class PaymentMethod {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({ type: 'uuid' })
  @Index('IDX_payment_methods_userId')
  userId: string;

  // Тип карты (visa, mastercard, mir, amex)
  @Column({ type: 'enum', enum: CardType, default: CardType.OTHER })
  cardType: CardType;

  // Последние 4 цифры карты (для отображения)
  @Column({ length: 4 })
  last4: string;

  // Зашифрованный токен карты (в продакшене это будет токен от платежного процессора)
  @Column({ type: 'text' })
  token: string;

  // Имя держателя карты
  @Column({ nullable: true })
  cardholderName: string;

  // Месяц истечения (MM)
  @Column({ length: 2 })
  expiryMonth: string;

  // Год истечения (YYYY)
  @Column({ length: 4 })
  expiryYear: string;

  // Является ли карта основной (по умолчанию)
  @Column({ default: false })
  isDefault: boolean;

  // Активна ли карта
  @Column({ default: true })
  isActive: boolean;

  // Бренд карты (для отображения)
  @Column({ nullable: true })
  brand: string;

  // Страна выпуска карты
  @Column({ nullable: true })
  country: string;

  // Фингерпринт карты для обнаружения дубликатов (хеш от номера карты + userId)
  @Column({ nullable: true })
  @Index('IDX_payment_methods_fingerprint')
  fingerprint: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

