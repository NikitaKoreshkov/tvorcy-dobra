import { Controller, Get, UseGuards, Request, HttpException, HttpStatus, Query, Param } from '@nestjs/common';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GamificationService } from './gamification.service';
import { LeaderboardService } from './leaderboard.service';
import { CacheService } from '../common/cache/cache.service';

@Controller('gamification')
export class GamificationController {
  constructor(
    private readonly gamificationService: GamificationService,
    private readonly leaderboardService: LeaderboardService,
    private readonly cacheService: CacheService,
  ) {}

  // Публичный эндпоинт для топ-3 пользователей (обновление каждые 24 часа)
  @Get('leaderboard/top3')
  @UseGuards(ThrottlerGuard)
  @Throttle({ default: { limit: 100, ttl: 60000 } })
  async getTop3Users() {
    try {
      const cacheKey = 'leaderboard:top3';
      // Для разработки используем меньший TTL (5 минут), для продакшена - 24 часа
      const cacheTTL = process.env.NODE_ENV === 'production' ? 86400 : 300; // 24 часа или 5 минут

      // Проверяем кэш
      const cached = await this.cacheService.get<any[]>(cacheKey);
      if (cached !== null) {
        return {
          success: true,
          leaderboard: cached || [],
        };
      }

      // Получаем данные из базы
      const leaderboard = await this.leaderboardService.getGlobalLeaderboard(3);
      
      // Если нет пользователей, не кэшируем и возвращаем пустой массив
      if (!leaderboard || leaderboard.length === 0) {
        return {
          success: true,
          leaderboard: [],
        };
      }
      
      // Добавляем информацию об аватаре из профиля пользователя
      const enrichedTop3 = await Promise.all(
        leaderboard.map(async (user) => {
          const profileData = await this.leaderboardService.getUserProfileData(user.userId);
          return {
            ...user,
            profileAvatar: profileData.profileAvatar,
            profileBackground: profileData.profileBackground,
          };
        }),
      );

      // Кэшируем только если есть данные
      await this.cacheService.set(cacheKey, enrichedTop3, cacheTTL);

      return {
        success: true,
        leaderboard: enrichedTop3,
      };
    } catch (error) {
      throw new HttpException(
        error.message || 'Ошибка получения топ-3 пользователей',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // Эндпоинт для очистки кэша топ-3 (для разработки)
  @Get('leaderboard/top3/clear-cache')
  @UseGuards(ThrottlerGuard)
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  async clearTop3Cache() {
    try {
      const cacheKey = 'leaderboard:top3';
      await this.cacheService.delete(cacheKey);
      return {
        success: true,
        message: 'Кэш топ-3 очищен',
      };
    } catch (error) {
      throw new HttpException(
        error.message || 'Ошибка очистки кэша',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get()
  @UseGuards(JwtAuthGuard, ThrottlerGuard)
  @Throttle({ default: { limit: 20, ttl: 60000 } })
  async getUserAchievements(@Request() req: any) {
    try {
      const data = await this.gamificationService.getUserAchievements(req.user.id);
      return {
        success: true,
        ...data,
      };
    } catch (error) {
      throw new HttpException(
        error.message || 'Ошибка получения достижений',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('check')
  @UseGuards(JwtAuthGuard, ThrottlerGuard)
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  async checkAchievements(@Request() req: any) {
    try {
      await this.gamificationService.checkAndUpdateAchievements(req.user.id);
      const data = await this.gamificationService.getUserAchievements(req.user.id);
      return {
        success: true,
        ...data,
      };
    } catch (error) {
      throw new HttpException(
        error.message || 'Ошибка проверки достижений',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // Получение мирового рейтинга
  @Get('leaderboard/global')
  @UseGuards(JwtAuthGuard, ThrottlerGuard)
  @Throttle({ default: { limit: 30, ttl: 60000 } })
  async getGlobalLeaderboard(@Query('limit') limit?: string) {
    try {
      const limitNum = limit ? parseInt(limit, 10) : 100;
      const leaderboard = await this.leaderboardService.getGlobalLeaderboard(limitNum);
      return {
        success: true,
        leaderboard,
      };
    } catch (error) {
      throw new HttpException(
        error.message || 'Ошибка получения рейтинга',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // Получение рейтинга по стране
  @Get('leaderboard/country')
  @UseGuards(JwtAuthGuard, ThrottlerGuard)
  @Throttle({ default: { limit: 30, ttl: 60000 } })
  async getCountryLeaderboard(
    @Query('country') country: string,
    @Query('limit') limit?: string,
  ) {
    try {
      if (!country) {
        throw new HttpException('Страна не указана', HttpStatus.BAD_REQUEST);
      }
      const limitNum = limit ? parseInt(limit, 10) : 100;
      const leaderboard = await this.leaderboardService.getCountryLeaderboard(
        country,
        limitNum,
      );
      return {
        success: true,
        leaderboard,
      };
    } catch (error) {
      throw new HttpException(
        error.message || 'Ошибка получения рейтинга',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // Получение позиции пользователя в рейтинге
  @Get('leaderboard/rank')
  @UseGuards(JwtAuthGuard, ThrottlerGuard)
  @Throttle({ default: { limit: 20, ttl: 60000 } })
  async getUserRank(@Request() req: any) {
    try {
      const rank = await this.leaderboardService.getUserRank(req.user.id);
      return {
        success: true,
        ...rank,
      };
    } catch (error) {
      throw new HttpException(
        error.message || 'Ошибка получения позиции',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // Получение профиля пользователя
  @Get('profile/:userId')
  @UseGuards(JwtAuthGuard, ThrottlerGuard)
  @Throttle({ default: { limit: 30, ttl: 60000 } })
  async getUserProfile(@Param('userId') userId: string) {
    try {
      const stats = await this.leaderboardService.getUserProfileStats(userId);
      const achievements = await this.gamificationService.getUserAchievements(userId);
      return {
        success: true,
        profile: {
          ...stats,
          achievements: achievements.achievements,
        },
      };
    } catch (error) {
      throw new HttpException(
        error.message || 'Ошибка получения профиля',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}

