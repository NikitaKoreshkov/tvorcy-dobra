import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
  Unique,
} from 'typeorm';
import { User } from './user.entity';
import { Achievement } from './achievement.entity';

@Entity('user_achievements')
@Unique(['userId', 'achievementId'])
export class UserAchievement {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({ type: 'uuid' })
  @Index('IDX_user_achievements_userId')
  userId: string;

  @ManyToOne(() => Achievement, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'achievementId' })
  achievement: Achievement;

  @Column({ type: 'uuid' })
  @Index('IDX_user_achievements_achievementId')
  achievementId: string;

  // Текущий прогресс (например, 3 из 5)
  @Column({ type: 'bigint', default: 0 })
  currentProgress: number;

  // Достигнуто ли достижение
  @Column({ default: false })
  isCompleted: boolean;

  // Дата получения достижения
  @Column({ type: 'timestamp', nullable: true })
  completedAt: Date | null;

  // Отправлено ли уведомление на email
  @Column({ default: false })
  notificationSent: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

