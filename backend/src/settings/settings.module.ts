import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SettingsController } from './settings.controller';
import { SettingsService } from './settings.service';
import { User } from '../entities/user.entity';
import { UserNotificationSettings } from '../entities/user-notification-settings.entity';
import { UserGoal } from '../entities/user-goal.entity';
import { VerificationCode } from '../entities/verification-code.entity';
import { EmailService } from '../auth/email.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      UserNotificationSettings,
      UserGoal,
      VerificationCode,
    ]),
  ],
  controllers: [SettingsController],
  providers: [SettingsService, EmailService],
  exports: [SettingsService],
})
export class SettingsModule {}

