import {
  Controller,
  Get,
  Put,
  Post,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { SettingsService } from './settings.service';

@Controller('settings')
@UseGuards(JwtAuthGuard)
export class SettingsController {
  private readonly logger = new Logger(SettingsController.name);

  constructor(private readonly settingsService: SettingsService) {}

  // Получение профиля
  @Get('profile')
  @UseGuards(ThrottlerGuard)
  @Throttle({ default: { limit: 20, ttl: 60000 } })
  async getProfile(@Request() req: any) {
    try {
      const user = await this.settingsService.getProfile(req.user.id);
      return {
        success: true,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          profileDescription: user.profileDescription || null,
          profileAvatar: user.profileAvatar || null,
          profileBackground: user.profileBackground || null,
          pageBackground: user.pageBackground || null,
          profilePhotos: user.profilePhotos || [],
          profileVideo: user.profileVideo || null,
        },
      };
    } catch (error) {
      this.logger.error(`Error getting profile for user ${req.user.id}:`, error);
      throw new HttpException(
        error.message || 'Ошибка получения профиля',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // Обновление профиля
  @Put('profile')
  @UseGuards(ThrottlerGuard)
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  async updateProfile(@Request() req: any, @Body() body: any) {
    try {
      const user = await this.settingsService.updateProfile(req.user.id, body);
      return {
        success: true,
        user,
      };
    } catch (error) {
      this.logger.error(`Error updating profile for user ${req.user.id}:`, error);
      throw new HttpException(
        error.message || 'Ошибка обновления профиля',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  // Получение настроек уведомлений
  @Get('notifications')
  @UseGuards(ThrottlerGuard)
  @Throttle({ default: { limit: 20, ttl: 60000 } })
  async getNotificationSettings(@Request() req: any) {
    try {
      const settings = await this.settingsService.getNotificationSettings(req.user.id);
      return {
        success: true,
        settings,
      };
    } catch (error) {
      throw new HttpException(
        error.message || 'Ошибка получения настроек',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // Обновление настроек уведомлений
  @Put('notifications')
  @UseGuards(ThrottlerGuard)
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  async updateNotificationSettings(@Request() req: any, @Body() body: any) {
    try {
      const settings = await this.settingsService.updateNotificationSettings(
        req.user.id,
        body,
      );
      return {
        success: true,
        settings,
      };
    } catch (error) {
      throw new HttpException(
        error.message || 'Ошибка обновления настроек',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  // Получение целей
  @Get('goals')
  @UseGuards(ThrottlerGuard)
  @Throttle({ default: { limit: 20, ttl: 60000 } })
  async getGoals(@Request() req: any) {
    try {
      const goals = await this.settingsService.getUserGoals(req.user.id);
      return {
        success: true,
        goals,
      };
    } catch (error) {
      throw new HttpException(
        error.message || 'Ошибка получения целей',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // Создание цели
  @Post('goals')
  @UseGuards(ThrottlerGuard)
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  async createGoal(@Request() req: any, @Body() body: any) {
    try {
      const goal = await this.settingsService.createGoal(req.user.id, {
        description: body.description,
        targetValue: body.targetValue,
        unit: body.unit,
        deadline: new Date(body.deadline),
      });
      return {
        success: true,
        goal,
      };
    } catch (error) {
      throw new HttpException(
        error.message || 'Ошибка создания цели',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  // Обновление цели
  @Put('goals/:id')
  @UseGuards(ThrottlerGuard)
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  async updateGoal(@Request() req: any, @Param('id') id: string, @Body() body: any) {
    try {
      const goal = await this.settingsService.updateGoal(req.user.id, id, body);
      return {
        success: true,
        goal,
      };
    } catch (error) {
      throw new HttpException(
        error.message || 'Ошибка обновления цели',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  // Удаление цели
  @Delete('goals/:id')
  @UseGuards(ThrottlerGuard)
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  async deleteGoal(@Request() req: any, @Param('id') id: string) {
    try {
      await this.settingsService.deleteGoal(req.user.id, id);
      return {
        success: true,
      };
    } catch (error) {
      throw new HttpException(
        error.message || 'Ошибка удаления цели',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  // Проверка биометрии
  @Get('biometric')
  @UseGuards(ThrottlerGuard)
  @Throttle({ default: { limit: 20, ttl: 60000 } })
  async hasBiometric(@Request() req: any) {
    try {
      const hasBiometric = await this.settingsService.hasBiometric(req.user.id);
      return {
        success: true,
        hasBiometric,
      };
    } catch (error) {
      throw new HttpException(
        error.message || 'Ошибка проверки биометрии',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // Отключение биометрии
  @Delete('biometric')
  @UseGuards(ThrottlerGuard)
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  async disableBiometric(@Request() req: any) {
    try {
      await this.settingsService.disableBiometric(req.user.id);
      return {
        success: true,
      };
    } catch (error) {
      throw new HttpException(
        error.message || 'Ошибка отключения биометрии',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  // Отправка кода для смены пароля
  @Post('password/send-code')
  @UseGuards(ThrottlerGuard)
  @Throttle({ default: { limit: 3, ttl: 60000 } })
  async sendPasswordChangeCode(@Request() req: any) {
    try {
      await this.settingsService.sendPasswordChangeCode(req.user.id);
      return {
        success: true,
        message: 'Код отправлен на email',
      };
    } catch (error) {
      throw new HttpException(
        error.message || 'Ошибка отправки кода',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  // Смена пароля с кодом
  @Post('password/change-with-code')
  @UseGuards(ThrottlerGuard)
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  async changePasswordWithCode(@Request() req: any, @Body() body: any) {
    try {
      await this.settingsService.changePasswordWithCode(
        req.user.id,
        body.code,
        body.newPassword,
      );
      return {
        success: true,
        message: 'Пароль успешно изменен',
      };
    } catch (error) {
      throw new HttpException(
        error.message || 'Ошибка смены пароля',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  // Смена пароля с биометрией
  @Post('password/change-with-biometric')
  @UseGuards(ThrottlerGuard)
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  async changePasswordWithBiometric(@Request() req: any, @Body() body: any) {
    try {
      await this.settingsService.changePasswordWithBiometric(
        req.user.id,
        body.newPassword,
      );
      return {
        success: true,
        message: 'Пароль успешно изменен',
      };
    } catch (error) {
      throw new HttpException(
        error.message || 'Ошибка смены пароля',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  // Удаление аккаунта
  @Delete('account')
  async deleteAccount(@Request() req: any) {
    try {
      await this.settingsService.deleteAccount(req.user.id);
      return {
        success: true,
        message: 'Аккаунт успешно удален',
      };
    } catch (error) {
      throw new HttpException(
        error.message || 'Ошибка удаления аккаунта',
        HttpStatus.BAD_REQUEST,
      );
    }
  }
}

