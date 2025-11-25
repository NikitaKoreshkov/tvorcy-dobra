import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThanOrEqual, Not, In } from 'typeorm';
import { Achievement, AchievementType, AchievementIcon } from '../entities/achievement.entity';
import { UserAchievement } from '../entities/user-achievement.entity';
import { Transaction, TransactionStatus, TransactionType } from '../entities/transaction.entity';
import { EmailService } from '../auth/email.service';
import { User } from '../entities/user.entity';

@Injectable()
export class GamificationService {
  constructor(
    @InjectRepository(Achievement)
    private achievementRepository: Repository<Achievement>,
    @InjectRepository(UserAchievement)
    private userAchievementRepository: Repository<UserAchievement>,
    @InjectRepository(Transaction)
    private transactionRepository: Repository<Transaction>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private emailService: EmailService,
  ) {}

  // Инициализация достижений (вызывается при старте приложения)
  async initializeAchievements(): Promise<void> {
    const achievements = [
      // Базовые достижения
      {
        code: 'first_donation',
        name: 'Первый шаг',
        description: 'Сделайте ваше первое пожертвование',
        type: AchievementType.FIRST_DONATION,
        icon: AchievementIcon.HEART,
        targetValue: 1,
        order: 1,
        level: 1,
      },
      {
        code: 'donation_count_5',
        name: 'Помощник',
        description: 'Поддержите 5 различных проектов',
        type: AchievementType.PROJECTS_COUNT,
        icon: AchievementIcon.CHECK,
        targetValue: 5,
        order: 2,
        level: 1,
      },
      {
        code: 'donation_count_10',
        name: 'Активист',
        description: 'Поддержите 10 различных проектов',
        type: AchievementType.PROJECTS_COUNT,
        icon: AchievementIcon.CHECK,
        targetValue: 10,
        order: 3,
        level: 2,
      },
      {
        code: 'donation_count_25',
        name: 'Волонтёр',
        description: 'Поддержите 25 различных проектов',
        type: AchievementType.PROJECTS_COUNT,
        icon: AchievementIcon.STAR,
        targetValue: 25,
        order: 4,
        level: 3,
      },
      {
        code: 'donation_count_50',
        name: 'Ментор',
        description: 'Поддержите 50 различных проектов',
        type: AchievementType.PROJECTS_COUNT,
        icon: AchievementIcon.TROPHY,
        targetValue: 50,
        order: 5,
        level: 4,
      },
      // Достижения по сумме
      {
        code: 'total_amount_5000',
        name: 'Благотворитель',
        description: 'Пожертвуйте 5,000 рублей',
        type: AchievementType.TOTAL_AMOUNT,
        icon: AchievementIcon.HEART,
        targetValue: 500000, // в копейках
        order: 6,
        level: 1,
      },
      {
        code: 'total_amount_10000',
        name: 'Филантроп',
        description: 'Пожертвуйте 10,000 рублей',
        type: AchievementType.TOTAL_AMOUNT,
        icon: AchievementIcon.STAR,
        targetValue: 1000000,
        order: 7,
        level: 2,
      },
      {
        code: 'total_amount_50000',
        name: 'Великий филантроп',
        description: 'Пожертвуйте 50,000 рублей',
        type: AchievementType.TOTAL_AMOUNT,
        icon: AchievementIcon.TROPHY,
        targetValue: 5000000,
        order: 8,
        level: 3,
      },
      {
        code: 'total_amount_100000',
        name: 'Легенда добра',
        description: 'Пожертвуйте 100,000 рублей',
        type: AchievementType.TOTAL_AMOUNT,
        icon: AchievementIcon.TROPHY,
        targetValue: 10000000,
        order: 9,
        level: 4,
      },
      {
        code: 'total_amount_500000',
        name: 'Магнат добра',
        description: 'Пожертвуйте 500,000 рублей',
        type: AchievementType.TOTAL_AMOUNT,
        icon: AchievementIcon.TROPHY,
        targetValue: 50000000,
        order: 10,
        level: 5,
      },
      // Достижения по регулярности
      {
        code: 'monthly_donation',
        name: 'Месяц добра',
        description: 'Сделайте пожертвование в текущем месяце',
        type: AchievementType.MONTHLY_DONATION,
        icon: AchievementIcon.STAR,
        targetValue: 1,
        order: 11,
        level: 1,
      },
      {
        code: 'streak_3_months',
        name: 'Квартал добра',
        description: 'Делайте пожертвования 3 месяца подряд',
        type: AchievementType.STREAK_MONTHS,
        icon: AchievementIcon.FIRE,
        targetValue: 3,
        order: 12,
        level: 2,
      },
      {
        code: 'streak_6_months',
        name: 'Полгода добра',
        description: 'Делайте пожертвования 6 месяцев подряд',
        type: AchievementType.STREAK_MONTHS,
        icon: AchievementIcon.FIRE,
        targetValue: 6,
        order: 13,
        level: 3,
      },
      {
        code: 'streak_12_months',
        name: 'Год добра',
        description: 'Делайте пожертвования 12 месяцев подряд',
        type: AchievementType.STREAK_MONTHS,
        icon: AchievementIcon.TROPHY,
        targetValue: 12,
        order: 14,
        level: 4,
      },
      // Регулярные платежи
      {
        code: 'recurring_1',
        name: 'Постоянный донор',
        description: 'Создайте 1 регулярный платёж',
        type: AchievementType.RECURRING_COUNT,
        icon: AchievementIcon.HEART,
        targetValue: 1,
        order: 15,
        level: 1,
      },
      {
        code: 'recurring_3',
        name: 'Множественный донор',
        description: 'Создайте 3 регулярных платежа',
        type: AchievementType.RECURRING_COUNT,
        icon: AchievementIcon.STAR,
        targetValue: 3,
        order: 16,
        level: 2,
      },
      {
        code: 'recurring_5',
        name: 'Системный донор',
        description: 'Создайте 5 регулярных платежей',
        type: AchievementType.RECURRING_COUNT,
        icon: AchievementIcon.TROPHY,
        targetValue: 5,
        order: 17,
        level: 3,
      },
      // Большие разовые пожертвования
      {
        code: 'single_large_10000',
        name: 'Щедрый жест',
        description: 'Сделайте разовое пожертвование 10,000 рублей',
        type: AchievementType.SINGLE_LARGE_DONATION,
        icon: AchievementIcon.STAR,
        targetValue: 1000000,
        order: 18,
        level: 2,
      },
      {
        code: 'single_large_50000',
        name: 'Великодушный',
        description: 'Сделайте разовое пожертвование 50,000 рублей',
        type: AchievementType.SINGLE_LARGE_DONATION,
        icon: AchievementIcon.TROPHY,
        targetValue: 5000000,
        order: 19,
        level: 3,
      },
      // Географические достижения
      {
        code: 'countries_3',
        name: 'Глобальный помощник',
        description: 'Поддержите проекты в 3 разных странах',
        type: AchievementType.COUNTRIES_COUNT,
        icon: AchievementIcon.STAR,
        targetValue: 3,
        order: 20,
        level: 2,
      },
      {
        code: 'countries_10',
        name: 'Гражданин мира',
        description: 'Поддержите проекты в 10 разных странах',
        type: AchievementType.COUNTRIES_COUNT,
        icon: AchievementIcon.TROPHY,
        targetValue: 10,
        order: 21,
        level: 3,
      },
      // Главное достижение
      {
        code: 'all_achievements',
        name: 'Мастер добра',
        description: 'Получите все 20 достижений',
        type: AchievementType.ALL_ACHIEVEMENTS,
        icon: AchievementIcon.TROPHY,
        targetValue: 20,
        order: 22,
        level: 5,
      },
    ];

    for (const achievementData of achievements) {
      const existing = await this.achievementRepository.findOne({
        where: { code: achievementData.code },
      });

      if (!existing) {
        const achievement = this.achievementRepository.create(achievementData);
        await this.achievementRepository.save(achievement);
      }
    }
  }

  // Проверка и обновление достижений пользователя
  async checkAndUpdateAchievements(userId: string): Promise<UserAchievement[]> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      return [];
    }

    // Получаем все достижения
    const allAchievements = await this.achievementRepository.find({
      order: { order: 'ASC' },
    });

    // Получаем или создаем UserAchievement для каждого достижения
    const userAchievements: UserAchievement[] = [];
    const completedAchievements: UserAchievement[] = [];

    for (const achievement of allAchievements) {
      let userAchievement = await this.userAchievementRepository.findOne({
        where: { userId, achievementId: achievement.id },
        relations: ['achievement'],
      });

      if (!userAchievement) {
        userAchievement = this.userAchievementRepository.create({
          userId,
          achievementId: achievement.id,
          currentProgress: 0,
          isCompleted: false,
        });
      }

      // Если уже выполнено, пропускаем
      if (userAchievement.isCompleted) {
        userAchievements.push(userAchievement);
        continue;
      }

      // Вычисляем текущий прогресс в зависимости от типа достижения
      const progress = await this.calculateProgress(userId, achievement);
      userAchievement.currentProgress = progress;

      // Проверяем, выполнено ли достижение
      if (progress >= achievement.targetValue && !userAchievement.isCompleted) {
        userAchievement.isCompleted = true;
        userAchievement.completedAt = new Date();
        userAchievement.currentProgress = achievement.targetValue;

        // Отправляем email уведомление
        if (!userAchievement.notificationSent) {
          await this.sendAchievementNotification(user, achievement);
          userAchievement.notificationSent = true;
        }

        completedAchievements.push(userAchievement);
      }

      await this.userAchievementRepository.save(userAchievement);
      userAchievements.push(userAchievement);
    }

    return userAchievements;
  }

  // Вычисление прогресса для достижения
  private async calculateProgress(userId: string, achievement: Achievement): Promise<number> {
    switch (achievement.type) {
      case AchievementType.FIRST_DONATION: {
        const count = await this.transactionRepository.count({
          where: {
            userId,
            status: TransactionStatus.COMPLETED,
          },
        });
        return count > 0 ? 1 : 0;
      }

      case AchievementType.PROJECTS_COUNT: {
        const transactions = await this.transactionRepository.find({
          where: {
            userId,
            status: TransactionStatus.COMPLETED,
          },
        });
        const uniqueProjects = new Set(
          transactions.map((t) => t.projectId || t.projectName),
        );
        return uniqueProjects.size;
      }

      case AchievementType.TOTAL_AMOUNT: {
        const transactions = await this.transactionRepository.find({
          where: {
            userId,
            status: TransactionStatus.COMPLETED,
          },
        });
        const total = transactions.reduce((sum, t) => sum + Number(t.amount), 0);
        return total;
      }

      case AchievementType.MONTHLY_DONATION: {
        const now = new Date();
        const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const count = await this.transactionRepository.count({
          where: {
            userId,
            status: TransactionStatus.COMPLETED,
            createdAt: MoreThanOrEqual(firstDayOfMonth),
          },
        });
        return count > 0 ? 1 : 0;
      }

      case AchievementType.STREAK_MONTHS: {
        const transactions = await this.transactionRepository.find({
          where: {
            userId,
            status: TransactionStatus.COMPLETED,
          },
          order: { createdAt: 'DESC' },
        });

        if (transactions.length === 0) return 0;

        // Группируем по месяцам
        const months = new Set<string>();
        transactions.forEach((t) => {
          const date = new Date(t.createdAt);
          const monthKey = `${date.getFullYear()}-${date.getMonth()}`;
          months.add(monthKey);
        });

        // Проверяем последовательность месяцев
        const sortedMonths = Array.from(months).sort().reverse();
        let streak = 0;
        const now = new Date();
        let expectedMonth = `${now.getFullYear()}-${now.getMonth()}`;

        for (const month of sortedMonths) {
          if (month === expectedMonth) {
            streak++;
            // Вычисляем предыдущий месяц
            const [year, monthNum] = expectedMonth.split('-').map(Number);
            const prevDate = new Date(year, monthNum - 1, 1);
            expectedMonth = `${prevDate.getFullYear()}-${prevDate.getMonth()}`;
          } else {
            break;
          }
        }

        return streak;
      }

      case AchievementType.RECURRING_COUNT: {
        const count = await this.transactionRepository.count({
          where: {
            userId,
            type: TransactionType.RECURRING,
            status: TransactionStatus.COMPLETED,
          },
        });
        return count;
      }

      case AchievementType.SINGLE_LARGE_DONATION: {
        const transactions = await this.transactionRepository.find({
          where: {
            userId,
            status: TransactionStatus.COMPLETED,
            type: TransactionType.ONE_TIME,
          },
        });
        const maxAmount = transactions.reduce((max, t) => {
          const amount = Number(t.amount);
          return amount > max ? amount : max;
        }, 0);
        return maxAmount;
      }

      case AchievementType.COUNTRIES_COUNT: {
        const transactions = await this.transactionRepository.find({
          where: {
            userId,
            status: TransactionStatus.COMPLETED,
          },
        });
        const countries = new Set<string>();
        transactions.forEach((t) => {
          if (t.metadata?.country) {
            countries.add(t.metadata.country);
          }
        });
        return countries.size;
      }

      case AchievementType.ALL_ACHIEVEMENTS: {
        // Считаем количество выполненных достижений (кроме самого ALL_ACHIEVEMENTS)
        const allAchievements = await this.achievementRepository.find({
          where: { type: Not(AchievementType.ALL_ACHIEVEMENTS) },
        });
        const userAchievements = await this.userAchievementRepository.find({
          where: {
            userId,
            achievementId: In(allAchievements.map((a) => a.id)),
            isCompleted: true,
          },
        });
        return userAchievements.length;
      }

      default:
        return 0;
    }
  }

  // Отправка email уведомления о получении достижения
  private async sendAchievementNotification(
    user: User,
    achievement: Achievement,
  ): Promise<void> {
    try {
      await this.emailService.sendAchievementEmail(
        user.email,
        user.name || 'друг',
        achievement.name,
        achievement.description || '',
        achievement.icon || 'trophy',
        'ru', // TODO: получить locale из пользователя или запроса
      );
    } catch (error) {
      console.error('Error sending achievement notification:', error);
      // Не прерываем выполнение, если email не отправился
    }
  }

  // Получение всех достижений пользователя с прогрессом
  async getUserAchievements(userId: string): Promise<{
    achievements: Array<{
      id: string;
      code: string;
      name: string;
      description: string;
      icon: string;
      targetValue: number;
      currentProgress: number;
      isCompleted: boolean;
      completedAt: Date | null;
      progressPercent: number;
    }>;
    level: string;
    nextLevel: string;
    levelProgress: number;
    hasMasterAchievement: boolean;
  }> {
    // Обновляем достижения перед получением
    await this.checkAndUpdateAchievements(userId);

    const userAchievements = await this.userAchievementRepository.find({
      where: { userId },
      relations: ['achievement'],
      order: { createdAt: 'ASC' },
    });

    const achievements = userAchievements.map((ua) => {
      const progressPercent = ua.achievement.targetValue > 0
        ? Math.min((ua.currentProgress / ua.achievement.targetValue) * 100, 100)
        : 0;

      return {
        id: ua.achievement.id,
        code: ua.achievement.code,
        name: ua.achievement.name,
        description: ua.achievement.description || '',
        icon: ua.achievement.icon,
        targetValue: ua.achievement.targetValue,
        currentProgress: Number(ua.currentProgress),
        isCompleted: ua.isCompleted,
        completedAt: ua.completedAt,
        progressPercent: Math.round(progressPercent),
      };
    });

    // Вычисляем уровень пользователя
    const completedCount = achievements.filter((a) => a.isCompleted).length;
    const level = this.calculateLevel(completedCount);
    const nextLevel = this.getNextLevel(level);
    const levelProgress = this.calculateLevelProgress(completedCount, level);

    // Проверяем наличие главного достижения
    const masterAchievement = achievements.find((a) => a.code === 'all_achievements');
    const hasMasterAchievement = masterAchievement?.isCompleted || false;

    return {
      achievements,
      level,
      nextLevel,
      levelProgress,
      hasMasterAchievement,
    };
  }

  // Вычисление уровня пользователя
  private calculateLevel(completedCount: number): string {
    if (completedCount === 0) return 'Новичок';
    if (completedCount <= 2) return 'Друг';
    if (completedCount <= 4) return 'Посланник добра';
    if (completedCount <= 6) return 'Филантроп';
    return 'Великий филантроп';
  }

  // Получение следующего уровня
  private getNextLevel(currentLevel: string): string {
    const levels = ['Новичок', 'Друг', 'Посланник добра', 'Филантроп', 'Великий филантроп'];
    const currentIndex = levels.indexOf(currentLevel);
    return currentIndex < levels.length - 1 ? levels[currentIndex + 1] : 'Максимальный уровень';
  }

  // Вычисление прогресса до следующего уровня
  private calculateLevelProgress(completedCount: number, currentLevel: string): number {
    const levelThresholds: Record<string, { min: number; max: number }> = {
      'Новичок': { min: 0, max: 1 },
      'Друг': { min: 1, max: 3 },
      'Посланник добра': { min: 3, max: 5 },
      'Филантроп': { min: 5, max: 6 },
      'Великий филантроп': { min: 6, max: 6 },
    };

    const threshold = levelThresholds[currentLevel];
    if (!threshold || threshold.max === threshold.min) return 100;

    const progress = ((completedCount - threshold.min) / (threshold.max - threshold.min)) * 100;
    return Math.min(Math.max(progress, 0), 100);
  }
}

