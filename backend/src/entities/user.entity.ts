import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  @Index()
  email: string;

  @Column({ nullable: true })
  name: string;

  @Column({ nullable: true })
  passwordHash: string;

  @Column({ nullable: true, unique: true })
  @Index()
  googleId: string;

  @Column({ default: false })
  isEmailVerified: boolean;

  @Column({ default: false })
  isActive: boolean;

  @Column({ nullable: true })
  lastLoginAt: Date;

  @Column({ nullable: true })
  lastActivityAt: Date; // Последняя активность пользователя (для определения онлайн статуса)

  @Column({ default: 0 })
  failedLoginAttempts: number;

  @Column({ nullable: true })
  lockedUntil: Date;

  @Column({ default: false })
  hasSeenTutorial: boolean;

  @Column({ nullable: true })
  @Index()
  biometricIdHash: string;

  @Column({ nullable: true })
  country: string; // Страна пользователя (определяется по IP)

  @Column({ nullable: true, type: 'text' })
  profileDescription: string; // Описание профиля

  @Column({ nullable: true })
  profileAvatar: string; // URL аватара профиля

  @Column({ nullable: true })
  profileBackground: string; // URL фона мини-профиля (только цвет или изображение)

  @Column({ nullable: true })
  pageBackground: string; // URL фона всей страницы (цвет, изображение или видео)

  @Column({ type: 'jsonb', nullable: true })
  profilePhotos: string[]; // Массив URL фотографий (максимум 3)

  @Column({ nullable: true })
  profileVideo: string; // URL видео профиля

  @Column({ type: 'jsonb', nullable: true })
  showcaseAchievements: string[]; // Массив ID достижений для витрины

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

