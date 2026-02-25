import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Transaction, TransactionStatus } from '../entities/transaction.entity';
import { User } from '../entities/user.entity';
import { UserAchievement } from '../entities/user-achievement.entity';
import { Achievement, AchievementType } from '../entities/achievement.entity';

export interface LeaderboardUser {
  userId: string;
  name: string;
  email: string;
  totalDonated: number;
  projectsCount: number;
  achievementsCount: number;
  hasMasterAchievement: boolean;
  rank: number;
  country?: string;
}

@Injectable()
export class LeaderboardService {
  constructor(
    @InjectRepository(Transaction)
    private transactionRepository: Repository<Transaction>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(UserAchievement)
    private userAchievementRepository: Repository<UserAchievement>,
    @InjectRepository(Achievement)
    private achievementRepository: Repository<Achievement>,
  ) {}

  // Получение мирового рейтинга
  async getGlobalLeaderboard(limit: number = 100): Promise<LeaderboardUser[]> {
    // Получаем всех пользователей с завершенными транзакциями
    const users = await this.userRepository.find({
      where: { isActive: true },
    });

    const leaderboard: LeaderboardUser[] = [];

    for (const user of users) {
      const transactions = await this.transactionRepository.find({
        where: {
          userId: user.id,
          status: TransactionStatus.COMPLETED,
        },
      });

      if (transactions.length === 0) continue;

      const totalDonated = transactions.reduce(
        (sum, t) => sum + Number(t.amount),
        0,
      );
      const uniqueProjects = new Set(
        transactions.map((t) => t.projectId || t.projectName),
      );

      // Получаем количество достижений
      const achievements = await this.userAchievementRepository.find({
        where: {
          userId: user.id,
          isCompleted: true,
        },
        relations: ['achievement'],
      });

      // Проверяем наличие главного достижения
      const masterAchievement = await this.achievementRepository.findOne({
        where: { code: 'all_achievements' },
      });
      const hasMasterAchievement = masterAchievement
        ? achievements.some(
            (ua) => ua.achievementId === masterAchievement.id && ua.isCompleted,
          )
        : false;

      leaderboard.push({
        userId: user.id,
        name: user.name || user.email.split('@')[0],
        email: user.email,
        totalDonated,
        projectsCount: uniqueProjects.size,
        achievementsCount: achievements.length,
        hasMasterAchievement,
        rank: 0, // Будет установлен после сортировки
        country: user.country || null,
      });
    }

    // Сортируем по общей сумме пожертвований
    leaderboard.sort((a, b) => b.totalDonated - a.totalDonated);

    // Устанавливаем ранги
    leaderboard.forEach((user, index) => {
      user.rank = index + 1;
    });

    return leaderboard.slice(0, limit);
  }

  // Получение рейтинга по стране
  async getCountryLeaderboard(
    country: string,
    limit: number = 100,
  ): Promise<LeaderboardUser[]> {
    const globalLeaderboard = await this.getGlobalLeaderboard(1000);
    const countryLeaderboard = globalLeaderboard.filter(
      (user) => user.country === country,
    );
    return countryLeaderboard.slice(0, limit);
  }

  // Получение позиции пользователя в рейтинге
  async getUserRank(userId: string, country?: string): Promise<{
    globalRank: number;
    countryRank: number | null;
    totalUsers: number;
    countryUsers: number | null;
  }> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      return { globalRank: 0, countryRank: null, totalUsers: 0, countryUsers: null };
    }

    const globalLeaderboard = await this.getGlobalLeaderboard(10000);
    const globalRank =
      globalLeaderboard.findIndex((u) => u.userId === userId) + 1;

    let countryRank: number | null = null;
    let countryUsers: number | null = null;

    if (user.country) {
      const countryLeaderboard = await this.getCountryLeaderboard(
        user.country,
        10000,
      );
      countryRank =
        countryLeaderboard.findIndex((u) => u.userId === userId) + 1;
      countryUsers = countryLeaderboard.length;
    }

    return {
      globalRank,
      countryRank,
      totalUsers: globalLeaderboard.length,
      countryUsers,
    };
  }

  // Получение данных пользователя для топ-3
  async getUserProfileData(userId: string): Promise<{
    profileAvatar: string | null;
    profileBackground: string | null;
  }> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      select: ['profileAvatar', 'profileBackground'],
    });
    return {
      profileAvatar: user?.profileAvatar || null,
      profileBackground: user?.profileBackground || null,
    };
  }

  // Получение статистики пользователя для профиля
  async getUserProfileStats(userId: string): Promise<{
    totalDonated: number;
    projectsCount: number;
    transactionsCount: number;
    achievementsCount: number;
    hasMasterAchievement: boolean;
    level: string;
    globalRank: number;
    countryRank: number | null;
    country: string | null;
    userName: string;
    userEmail: string;
    profileDescription: string | null;
    profileAvatar: string | null;
    profileBackground: string | null;
    pageBackground: string | null;
    profilePhotos: string[];
    profileVideo: string | null;
    showcaseAchievements: string[];
    isOnline: boolean;
  }> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new Error('User not found');
    }

    const transactions = await this.transactionRepository.find({
      where: {
        userId,
        status: TransactionStatus.COMPLETED,
      },
    });

    const totalDonated = transactions.reduce(
      (sum, t) => sum + Number(t.amount),
      0,
    );
    const uniqueProjects = new Set(
      transactions.map((t) => t.projectId || t.projectName),
    );

    const achievements = await this.userAchievementRepository.find({
      where: {
        userId,
        isCompleted: true,
      },
      relations: ['achievement'],
    });

    const masterAchievement = await this.achievementRepository.findOne({
      where: { code: 'all_achievements' },
    });
    const hasMasterAchievement = masterAchievement
      ? achievements.some(
          (ua) => ua.achievementId === masterAchievement.id && ua.isCompleted,
        )
      : false;

    const rank = await this.getUserRank(userId, user.country || undefined);

    // Определяем уровень на основе количества достижений
    const completedCount = achievements.length;
    let level = 'Новичок';
    if (completedCount >= 20) level = 'Мастер добра';
    else if (completedCount >= 15) level = 'Великий филантроп';
    else if (completedCount >= 10) level = 'Филантроп';
    else if (completedCount >= 5) level = 'Посланник добра';
    else if (completedCount >= 2) level = 'Друг';

    // Определяем онлайн статус (онлайн если последняя активность была менее 5 минут назад)
    const isOnline = user.lastActivityAt 
      ? (Date.now() - new Date(user.lastActivityAt).getTime()) < 5 * 60 * 1000
      : false;

    return {
      totalDonated,
      projectsCount: uniqueProjects.size,
      transactionsCount: transactions.length,
      achievementsCount: achievements.length,
      hasMasterAchievement,
      level,
      globalRank: rank.globalRank,
      countryRank: rank.countryRank,
      country: user.country || null,
      userName: user.name || user.email.split('@')[0],
      userEmail: user.email,
      profileDescription: user.profileDescription || null,
      profileAvatar: user.profileAvatar || null,
      profileBackground: user.profileBackground || null,
      pageBackground: user.pageBackground || null,
      profilePhotos: user.profilePhotos || [],
      profileVideo: user.profileVideo || null,
      showcaseAchievements: user.showcaseAchievements || [],
      isOnline,
    };
  }
}

