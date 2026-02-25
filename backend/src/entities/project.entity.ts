import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

export enum ProjectStatus {
  ACTIVE = 'active',
  COMPLETED = 'completed',
  DRAFT = 'draft',
  ARCHIVED = 'archived',
}

export enum ProjectCategory {
  HEALTHCARE = 'Здравоохранение',
  EDUCATION = 'Образование',
  SOCIAL = 'Социальная помощь',
  ECOLOGY = 'Экология',
  EMERGENCY = 'Экстренная помощь',
  CULTURE = 'Культура',
  SPORTS = 'Спорт',
  OTHER = 'Разное',
}

@Entity('projects')
export class Project {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  @Index()
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ nullable: true })
  image: string; // URL изображения

  @Column({ type: 'simple-array', nullable: true })
  images: string[]; // Дополнительные изображения

  @Column({
    type: 'enum',
    enum: ProjectCategory,
    default: ProjectCategory.OTHER,
  })
  @Index()
  category: ProjectCategory;

  @Column({ nullable: true })
  location: string;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  raised: number; // Собранная сумма

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  goal: number; // Целевая сумма

  @Column({ default: 0 })
  donors: number; // Количество доноров

  @Column({
    type: 'enum',
    enum: ProjectStatus,
    default: ProjectStatus.ACTIVE,
  })
  @Index()
  status: ProjectStatus;

  // Дополнительные поля для фильтрации (как у Nike)
  @Column({ type: 'simple-array', nullable: true })
  colors: string[]; // Доступные цвета/варианты

  @Column({ type: 'simple-array', nullable: true })
  sizes: string[]; // Размеры (если применимо)

  @Column({ type: 'simple-array', nullable: true })
  tags: string[]; // Теги для дополнительной фильтрации

  @Column({ default: false })
  isBestseller: boolean; // Флаг бестселлера

  @Column({ default: false })
  isNew: boolean; // Новый проект

  @Column({ default: false })
  isFeatured: boolean; // Рекомендуемый проект

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  price: number; // Цена (если применимо)

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>; // Дополнительные метаданные

  // Новые поля для фильтров
  @Column({ nullable: true })
  age: string; // Возраст ребёнка (например: "7-12 лет")

  @Column({ nullable: true })
  disabilityType: string; // Тип инвалидности / потребностей (например: "ДЦП", "Аутизм")

  @Column({ nullable: true })
  urgency: string; // Срочность ("Экстренные случаи" или "Обычные")

  @Column({ nullable: true })
  deadline: Date; // Дата окончания проекта (дедлайн для сбора средств)

  @Column({ nullable: true })
  completedAt: Date; // Дата завершения проекта (когда достигнута цель)

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

