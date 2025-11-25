import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { User } from './user.entity';

@Entity('user_notification_settings')
export class UserNotificationSettings {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @OneToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({ type: 'uuid', unique: true })
  userId: string;

  // Email уведомления
  @Column({ default: true })
  emailNewProjects: boolean; // Уведомления о новых проектах

  @Column({ default: true })
  emailReports: boolean; // Отчёты о результатах

  @Column({ default: false })
  emailNews: boolean; // Новости и обновления

  @Column({ default: true })
  emailAchievements: boolean; // Уведомления о достижениях

  @Column({ default: true })
  emailGoalReminders: boolean; // Напоминания о целях

  @Column({ default: true })
  emailGoalCompleted: boolean; // Уведомления о выполнении целей

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

