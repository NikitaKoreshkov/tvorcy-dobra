import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
} from 'typeorm';

@Entity('login_attempts')
export class LoginAttempt {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  @Index()
  email: string;

  @Column({ nullable: true })
  ipAddress: string;

  @Column({ default: false })
  success: boolean;

  @CreateDateColumn()
  @Index()
  createdAt: Date;
}

