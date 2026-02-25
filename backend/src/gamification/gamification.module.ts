import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GamificationController } from './gamification.controller';
import { GamificationService } from './gamification.service';
import { LeaderboardService } from './leaderboard.service';
import { Achievement, UserAchievement } from '../entities';
import { Transaction } from '../entities/transaction.entity';
import { User } from '../entities/user.entity';
import { EmailService } from '../auth/email.service';
import { CacheModule } from '../common/cache/cache.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Achievement, UserAchievement, Transaction, User]),
    CacheModule,
  ],
  controllers: [GamificationController],
  providers: [GamificationService, LeaderboardService, EmailService],
  exports: [GamificationService, LeaderboardService],
})
export class GamificationModule {}

