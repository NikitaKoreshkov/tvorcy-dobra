import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { UserAchievement } from './user-achievement.entity';

export enum AchievementType {
  FIRST_DONATION = 'first_donation',
  DONATION_COUNT = 'donation_count',
  DONATION_AMOUNT = 'donation_amount',
  PROJECTS_COUNT = 'projects_count',
  MONTHLY_DONATION = 'monthly_donation',
  TOTAL_AMOUNT = 'total_amount',
  STREAK_DAYS = 'streak_days',
  STREAK_MONTHS = 'streak_months',
  RECURRING_COUNT = 'recurring_count',
  SINGLE_LARGE_DONATION = 'single_large_donation',
  COUNTRIES_COUNT = 'countries_count',
  ALL_ACHIEVEMENTS = 'all_achievements', // Главное достижение
}

export enum AchievementIcon {
  HEART = 'heart',
  STAR = 'star',
  CHECK = 'check',
  TROPHY = 'trophy',
  FIRE = 'fire',
}

@Entity('achievements')
export class Achievement {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  code: string; // Уникальный код достижения (например, 'first_donation')

  @Column()
  name: string; // Название достижения

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'enum', enum: AchievementType })
  type: AchievementType;

  @Column({ type: 'enum', enum: AchievementIcon, default: AchievementIcon.STAR })
  icon: AchievementIcon;

  // Целевое значение для достижения (например, 5 для "Помог 5 проектам")
  @Column({ type: 'bigint', default: 1 })
  targetValue: number;

  // Порядок отображения
  @Column({ default: 0 })
  order: number;

  // Уровень достижения (для многоуровневых достижений)
  @Column({ default: 1 })
  level: number;

  @OneToMany(() => UserAchievement, (userAchievement) => userAchievement.achievement)
  userAchievements: UserAchievement[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

