import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { User } from '../entities/user.entity';
import { UserNotificationSettings } from '../entities/user-notification-settings.entity';
import { UserGoal, GoalStatus } from '../entities/user-goal.entity';
import { VerificationCode } from '../entities/verification-code.entity';
import * as argon2 from 'argon2';
import { EmailService } from '../auth/email.service';

@Injectable()
export class SettingsService {
  private readonly logger = new Logger(SettingsService.name);

  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(UserNotificationSettings)
    private notificationSettingsRepository: Repository<UserNotificationSettings>,
    @InjectRepository(UserGoal)
    private userGoalRepository: Repository<UserGoal>,
    @InjectRepository(VerificationCode)
    private verificationCodeRepository: Repository<VerificationCode>,
    private emailService: EmailService,
    private dataSource: DataSource,
  ) {}

  // Обновление профиля
  async updateProfile(
    userId: string,
    data: {
      name?: string;
      profileDescription?: string;
      profileAvatar?: string;
      profileBackground?: string | null;
      pageBackground?: string | null;
      profilePhotos?: string[];
      profileVideo?: string;
    },
  ): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('Пользователь не найден');
    }

    // Логируем данные для отладки
    this.logger.log(`Updating profile for user ${userId}:`, {
      name: data.name,
      hasDescription: !!data.profileDescription,
      hasAvatar: !!data.profileAvatar,
      hasBackground: !!data.profileBackground,
      backgroundValue: data.profileBackground,
      photosCount: data.profilePhotos?.length || 0,
    });

    if (data.name !== undefined) {
      user.name = data.name || null;
    }
    if (data.profileDescription !== undefined) {
      user.profileDescription = data.profileDescription || null;
    }
    if (data.profileAvatar !== undefined) {
      user.profileAvatar = data.profileAvatar || null;
    }
    if (data.profileBackground !== undefined) {
      // Если null, очищаем фон, иначе устанавливаем значение (цвет или URL)
      user.profileBackground = data.profileBackground || null;
    }
    if (data.pageBackground !== undefined) {
      // Если null, очищаем фон, иначе устанавливаем значение (цвет, изображение или видео URL)
      user.pageBackground = data.pageBackground || null;
    }
    if (data.profilePhotos !== undefined) {
      // Ограничиваем до 3 фотографий
      if (data.profilePhotos && Array.isArray(data.profilePhotos) && data.profilePhotos.length > 0) {
        user.profilePhotos = data.profilePhotos.slice(0, 3);
      } else {
        user.profilePhotos = null;
      }
    }
    if (data.profileVideo !== undefined) {
      user.profileVideo = data.profileVideo;
    }

    const savedUser = await this.userRepository.save(user);
    this.logger.log(`Profile updated successfully for user ${userId}`);
    
    return savedUser;
  }

  // Получение профиля
  async getProfile(userId: string): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('Пользователь не найден');
    }
    return user;
  }

  // Получение настроек уведомлений
  async getNotificationSettings(userId: string): Promise<UserNotificationSettings> {
    let settings = await this.notificationSettingsRepository.findOne({
      where: { userId },
    });

    if (!settings) {
      // Создаем настройки по умолчанию
      settings = this.notificationSettingsRepository.create({
        userId,
      });
      settings = await this.notificationSettingsRepository.save(settings);
    }

    return settings;
  }

  // Обновление настроек уведомлений
  async updateNotificationSettings(
    userId: string,
    data: Partial<UserNotificationSettings>,
  ): Promise<UserNotificationSettings> {
    let settings = await this.notificationSettingsRepository.findOne({
      where: { userId },
    });

    if (!settings) {
      settings = this.notificationSettingsRepository.create({
        userId,
        ...data,
      });
    } else {
      Object.assign(settings, data);
    }

    return this.notificationSettingsRepository.save(settings);
  }

  // Получение целей пользователя
  async getUserGoals(userId: string): Promise<UserGoal[]> {
    return this.userGoalRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
  }

  // Создание цели
  async createGoal(
    userId: string,
    data: {
      description: string;
      targetValue: number;
      unit: string;
      deadline: Date;
    },
  ): Promise<UserGoal> {
    const goal = this.userGoalRepository.create({
      userId,
      ...data,
      status: GoalStatus.ACTIVE,
    });

    return this.userGoalRepository.save(goal);
  }

  // Обновление цели
  async updateGoal(
    userId: string,
    goalId: string,
    data: Partial<UserGoal>,
  ): Promise<UserGoal> {
    const goal = await this.userGoalRepository.findOne({
      where: { id: goalId, userId },
    });

    if (!goal) {
      throw new NotFoundException('Цель не найдена');
    }

    Object.assign(goal, data);
    return this.userGoalRepository.save(goal);
  }

  // Удаление цели
  async deleteGoal(userId: string, goalId: string): Promise<void> {
    const goal = await this.userGoalRepository.findOne({
      where: { id: goalId, userId },
    });

    if (!goal) {
      throw new NotFoundException('Цель не найдена');
    }

    await this.userGoalRepository.remove(goal);
  }

  // Проверка биометрии
  async hasBiometric(userId: string): Promise<boolean> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      select: ['id', 'biometricIdHash'],
    });

    return user ? !!user.biometricIdHash : false;
  }

  // Отключение биометрии
  async disableBiometric(userId: string): Promise<void> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('Пользователь не найден');
    }

    user.biometricIdHash = null;
    await this.userRepository.save(user);
  }

  // Отправка кода для смены пароля
  async sendPasswordChangeCode(userId: string): Promise<void> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('Пользователь не найден');
    }

    // Генерируем 6-значный код
    const code = Math.floor(100000 + Math.random() * 900000).toString();

    // Сохраняем код
    await this.verificationCodeRepository.delete({
      email: user.email,
      isUsed: false,
    });

    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 минут

    const verificationCode = this.verificationCodeRepository.create({
      email: user.email,
      code,
      expiresAt,
    });

    await this.verificationCodeRepository.save(verificationCode);

    // Отправляем email с красивым шаблоном
    const htmlTemplate = this.getPasswordChangeCodeTemplate(code);
    await this.emailService.sendEmail(
      user.email,
      'Код для смены пароля - Творцы Добра',
      htmlTemplate,
    );
  }

  // Смена пароля с кодом
  async changePasswordWithCode(
    userId: string,
    code: string,
    newPassword: string,
  ): Promise<void> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('Пользователь не найден');
    }

    // Проверяем код
    const verificationCode = await this.verificationCodeRepository.findOne({
      where: {
        email: user.email,
        code,
        isUsed: false,
      },
    });

    if (!verificationCode) {
      throw new BadRequestException('Неверный код');
    }

    if (new Date() > verificationCode.expiresAt) {
      throw new BadRequestException('Код истек');
    }

    // Хешируем новый пароль
    const passwordHash = await argon2.hash(newPassword);

    // Обновляем пароль
    user.passwordHash = passwordHash;
    await this.userRepository.save(user);

    // Помечаем код как использованный
    verificationCode.isUsed = true;
    await this.verificationCodeRepository.save(verificationCode);
  }

  // Смена пароля с биометрией
  async changePasswordWithBiometric(
    userId: string,
    newPassword: string,
  ): Promise<void> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('Пользователь не найден');
    }

    if (!user.biometricIdHash) {
      throw new BadRequestException('Биометрия не настроена');
    }

    // Хешируем новый пароль
    const passwordHash = await argon2.hash(newPassword);

    // Обновляем пароль
    user.passwordHash = passwordHash;
    await this.userRepository.save(user);
  }

  // Удаление аккаунта
  async deleteAccount(userId: string): Promise<void> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const user = await queryRunner.manager.findOne(User, { where: { id: userId } });
      if (!user) {
        throw new NotFoundException('Пользователь не найден');
      }

      // Удаляем пользователя (каскадное удаление удалит все связанные данные)
      await queryRunner.manager.remove(user);
      
      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.logger.error(`Error deleting account for user ${userId}:`, error);
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  // Шаблон email для кода смены пароля (тот же дизайн, что и для регистрации)
  private getPasswordChangeCodeTemplate(code: string): string {
    return `
<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Код для смены пароля</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #f5f5f5;">
        <tr>
            <td align="center" style="padding: 40px 20px;">
                <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="600" style="max-width: 600px; background-color: #ffffff; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                    <!-- Header -->
                    <tr>
                        <td style="padding: 40px 40px 20px; text-align: center; border-bottom: 1px solid #f0f0f0;">
                            <h1 style="margin: 0; font-size: 28px; font-weight: 600; color: #000000; letter-spacing: -0.5px;">
                                Творцы Добра
                            </h1>
                        </td>
                    </tr>
                    
                    <!-- Content -->
                    <tr>
                        <td style="padding: 40px;">
                            <h2 style="margin: 0 0 20px; font-size: 24px; font-weight: 600; color: #000000;">
                                Код для смены пароля
                            </h2>
                            <p style="margin: 0 0 30px; font-size: 16px; line-height: 1.6; color: #666666;">
                                Для смены пароля введите следующий код подтверждения:
                            </p>
                            
                            <!-- Code Box -->
                            <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                                <tr>
                                    <td align="center" style="padding: 20px 0;">
                                        <div style="background-color: #000000; border-radius: 12px; padding: 30px; display: inline-block;">
                                            <div style="font-size: 36px; font-weight: 700; letter-spacing: 8px; color: #ffffff; font-family: 'Courier New', monospace;">
                                                ${code}
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            </table>
                            
                            <p style="margin: 30px 0 0; font-size: 14px; line-height: 1.6; color: #999999;">
                                Этот код действителен в течение 15 минут. Если вы не запрашивали смену пароля, просто проигнорируйте это письмо.
                            </p>
                        </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                        <td style="padding: 30px 40px; background-color: #fafafa; border-top: 1px solid #f0f0f0; border-radius: 0 0 12px 12px;">
                            <p style="margin: 0; font-size: 12px; line-height: 1.6; color: #999999; text-align: center;">
                                © ${new Date().getFullYear()} Творцы Добра. Все права защищены.
                            </p>
                            <p style="margin: 10px 0 0; font-size: 12px; line-height: 1.6; color: #999999; text-align: center;">
                                Создаём добро с масштабом
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
    `;
  }
}

