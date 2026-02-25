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

export enum GoalStatus {
  ACTIVE = 'active',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

@Entity('user_goals')
export class UserGoal {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({ type: 'uuid' })
  @Index('IDX_user_goals_userId')
  userId: string;

  @Column({ type: 'text' })
  description: string; // Описание цели (например, "Помочь 10 людям")

  @Column({ type: 'int' })
  targetValue: number; // Целевое значение (например, 10)

  @Column({ type: 'int', default: 0 })
  currentValue: number; // Текущее значение

  @Column({ type: 'varchar', length: 50 })
  unit: string; // Единица измерения (например, "людей", "рублей", "проектов")

  @Column({ type: 'timestamp' })
  deadline: Date; // Срок выполнения цели

  @Column({ type: 'enum', enum: GoalStatus, default: GoalStatus.ACTIVE })
  status: GoalStatus;

  @Column({ default: false })
  reminderSent: boolean; // Отправлено ли напоминание о приближающемся сроке

  @Column({ default: false })
  completionEmailSent: boolean; // Отправлено ли уведомление о выполнении

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

