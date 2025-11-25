import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  Unique,
} from 'typeorm';
import { Project } from './project.entity';

export type Locale = 'ru' | 'en';

@Entity('project_translations')
@Unique(['projectId', 'locale'])
export class ProjectTranslation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  @Index()
  projectId: string;

  @ManyToOne(() => Project, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'projectId' })
  project: Project;

  @Column({ type: 'varchar', length: 2 })
  @Index()
  locale: Locale;

  @Column({ nullable: true })
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'text', nullable: true })
  fullDescription: string;

  @Column({ nullable: true })
  location: string;

  @Column({ nullable: true })
  age: string;

  @Column({ nullable: true })
  disabilityType: string;

  @Column({ nullable: true })
  urgency: string;

  @Column({ type: 'simple-array', nullable: true })
  tags: string[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

