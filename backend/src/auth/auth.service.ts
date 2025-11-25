import { Injectable, UnauthorizedException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan } from 'typeorm';
import * as argon2 from 'argon2';
import * as crypto from 'crypto';
import { JwtService } from '@nestjs/jwt';
import * as geoip from 'geoip-lite';
import { User } from '../entities/user.entity';
import { VerificationCode } from '../entities/verification-code.entity';
import { LoginAttempt } from '../entities/login-attempt.entity';
import { validateEmail } from './middleware/security.middleware';
import { EmailService } from './email.service';

@Injectable()
export class AuthService {
  private readonly MAX_FAILED_ATTEMPTS = 5;
  private readonly LOCKOUT_DURATION = 15 * 60 * 1000; // 15 минут
  private readonly CODE_EXPIRY = 15 * 60 * 1000; // 15 минут

  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(VerificationCode)
    private verificationCodeRepository: Repository<VerificationCode>,
    @InjectRepository(LoginAttempt)
    private loginAttemptRepository: Repository<LoginAttempt>,
    private jwtService: JwtService,
    private emailService: EmailService,
  ) {}

  // Генерация 6-значного кода подтверждения
  generateVerificationCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  // Сохранение кода подтверждения в БД
  async saveVerificationCode(email: string, code: string): Promise<void> {
    // Удаляем старые неиспользованные коды для этого email
    await this.verificationCodeRepository.delete({
      email,
      isUsed: false,
    });

    const expiresAt = new Date(Date.now() + this.CODE_EXPIRY);

    const verificationCode = this.verificationCodeRepository.create({
      email,
      code,
      expiresAt,
    });

    await this.verificationCodeRepository.save(verificationCode);
  }

  // Получение времени последней отправки кода
  async getLastCodeSentTime(email: string): Promise<Date | null> {
    const lastCode = await this.verificationCodeRepository.findOne({
      where: { email },
      order: { createdAt: 'DESC' },
    });

    return lastCode ? lastCode.createdAt : null;
  }

  // Проверка, можно ли отправить код снова (прошло ли 30 секунд)
  async canSendCode(email: string): Promise<{ canSend: boolean; remainingSeconds: number }> {
    const lastSentTime = await this.getLastCodeSentTime(email);
    const COOLDOWN_SECONDS = 30;

    if (!lastSentTime) {
      return { canSend: true, remainingSeconds: 0 };
    }

    const now = new Date();
    const timeSinceLastSent = (now.getTime() - lastSentTime.getTime()) / 1000;
    const remainingSeconds = Math.max(0, COOLDOWN_SECONDS - timeSinceLastSent);

    return {
      canSend: remainingSeconds === 0,
      remainingSeconds: Math.ceil(remainingSeconds),
    };
  }

  // Проверка кода подтверждения (без удаления)
  async checkCode(email: string, code: string): Promise<boolean> {
    const verificationCode = await this.verificationCodeRepository.findOne({
      where: {
        email,
        code,
        isUsed: false,
        expiresAt: MoreThan(new Date()),
      },
    });

    if (!verificationCode) {
      // Увеличиваем счетчик попыток
      const existingCode = await this.verificationCodeRepository.findOne({
        where: { email, isUsed: false },
      });

      if (existingCode) {
        existingCode.attempts += 1;
        await this.verificationCodeRepository.save(existingCode);

        // Блокируем после 5 неудачных попыток
        if (existingCode.attempts >= 5) {
          await this.verificationCodeRepository.delete({ email, isUsed: false });
        }
      }

      return false;
    }

    return true;
  }

  // Проверка кода подтверждения (с удалением)
  async verifyCode(email: string, code: string): Promise<boolean> {
    const verificationCode = await this.verificationCodeRepository.findOne({
      where: {
        email,
        code,
        isUsed: false,
        expiresAt: MoreThan(new Date()),
      },
    });

    if (!verificationCode) {
      // Увеличиваем счетчик попыток
      const existingCode = await this.verificationCodeRepository.findOne({
        where: { email, isUsed: false },
      });

      if (existingCode) {
        existingCode.attempts += 1;
        await this.verificationCodeRepository.save(existingCode);

        // Блокируем после 5 неудачных попыток
        if (existingCode.attempts >= 5) {
          await this.verificationCodeRepository.delete({ email, isUsed: false });
        }
      }

      return false;
    }

    // Помечаем код как использованный
    verificationCode.isUsed = true;
    await this.verificationCodeRepository.save(verificationCode);

    return true;
  }

  // Регистрация или вход через Google
  async registerOrLoginWithGoogle(googleId: string, email: string, name: string, ip?: string): Promise<{ user: User; accessToken: string }> {
    const normalizedEmail = email.toLowerCase();

    // Проверяем, существует ли пользователь с таким Google ID
    let user = await this.userRepository.findOne({
      where: { googleId },
    });

    // Если не найден по Google ID, ищем по email
    if (!user) {
      user = await this.userRepository.findOne({
        where: { email: normalizedEmail },
      });
    }

    if (user) {
      // Пользователь существует - обновляем Google ID если его нет, и входим
      if (!user.googleId) {
        user.googleId = googleId;
      }
      user.lastLoginAt = new Date();
      user.lastActivityAt = new Date(); // Обновляем активность при логине
      user.isEmailVerified = true;
      user.isActive = true;
      await this.userRepository.save(user);

      // Генерация JWT токена
      const payload = { sub: user.id, email: user.email };
      const accessToken = this.jwtService.sign(payload);

      return { user, accessToken };
    }

    // Пользователь не существует - создаем нового
    const country = ip ? this.getCountryFromIp(ip) : null;
    const newUser = this.userRepository.create({
      email: normalizedEmail,
      name: name.trim(),
      googleId,
      passwordHash: null, // Нет пароля для Google пользователей
      isEmailVerified: true, // Google email уже верифицирован
      isActive: true,
      country,
    });

    const savedUser = await this.userRepository.save(newUser);

    // Отправляем welcome email
    try {
      await this.emailService.sendWelcomeEmail(savedUser.email, savedUser.name || 'друг', 'ru');
    } catch (error) {
      console.error('Error sending welcome email:', error);
      // Не прерываем выполнение, если email не отправился
    }

    // Генерация JWT токена
    const payload = { sub: savedUser.id, email: savedUser.email };
    const accessToken = this.jwtService.sign(payload);

    return { user: savedUser, accessToken };
  }

  // Поиск пользователя по email
  async findUserByEmail(email: string): Promise<User | null> {
    return await this.userRepository.findOne({
      where: { email: email.toLowerCase() },
    });
  }

  // Определение страны по IP
  private getCountryFromIp(ip: string): string | null {
    try {
      // Убираем IPv6 префикс если есть
      const cleanIp = ip.replace(/^::ffff:/, '');
      const geo = geoip.lookup(cleanIp);
      return geo?.country || null;
    } catch (error) {
      console.error('Error getting country from IP:', error);
      return null;
    }
  }

  // Регистрация пользователя
  async register(email: string, name: string, password: string, ip?: string, locale: 'ru' | 'en' = 'ru'): Promise<{ user: User; accessToken: string }> {
    // Валидация email
    const isValidEmail = await validateEmail(email);
    if (!isValidEmail) {
      throw new BadRequestException('Некорректный email адрес или использование временных email сервисов запрещено');
    }

    // Проверка существования пользователя
    const existingUser = await this.findUserByEmail(email);

    if (existingUser) {
      throw new BadRequestException('Пользователь с таким email уже существует');
    }

    // Хэширование пароля с Argon2
    const passwordHash = await argon2.hash(password, {
      type: argon2.argon2id,
      memoryCost: 65536, // 64 MB
      timeCost: 3, // 3 итерации
      parallelism: 4, // 4 потока
    });

    // Определение страны по IP
    const country = ip ? this.getCountryFromIp(ip) : null;

    // Создание пользователя
    const user = this.userRepository.create({
      email: email.toLowerCase(),
      name: name.trim(),
      passwordHash,
      isEmailVerified: true, // После проверки кода
      isActive: true,
      country,
    });

    const savedUser = await this.userRepository.save(user);

    // Отправляем welcome email
    try {
      await this.emailService.sendWelcomeEmail(savedUser.email, savedUser.name || 'друг', locale);
    } catch (error) {
      console.error('Error sending welcome email:', error);
      // Не прерываем выполнение, если email не отправился
    }

    // Генерация JWT токена
    const payload = { sub: savedUser.id, email: savedUser.email };
    const accessToken = this.jwtService.sign(payload);

    return { user: savedUser, accessToken };
  }

  // Вход пользователя
  async login(email: string, password: string, ipAddress?: string): Promise<{ user: User; accessToken: string }> {
    // Валидация email
    const isValidEmail = await validateEmail(email);
    if (!isValidEmail) {
      throw new BadRequestException('Некорректный email адрес');
    }

    const normalizedEmail = email.toLowerCase();

    // Поиск пользователя
    const user = await this.userRepository.findOne({
      where: { email: normalizedEmail },
    });

    // Логируем попытку входа
    await this.logLoginAttempt(normalizedEmail, ipAddress, false);

    if (!user) {
      // Задержка для защиты от брутфорса
      await this.delay(1000);
      throw new UnauthorizedException('Неверный email или пароль');
    }

    // Проверка блокировки аккаунта
    if (user.lockedUntil && user.lockedUntil > new Date()) {
      const minutesLeft = Math.ceil((user.lockedUntil.getTime() - Date.now()) / 60000);
      throw new ForbiddenException(`Аккаунт заблокирован. Попробуйте через ${minutesLeft} минут`);
    }

    // Проверка активности аккаунта
    if (!user.isActive) {
      throw new ForbiddenException('Аккаунт неактивен');
    }

    // Проверка пароля
    if (!user.passwordHash) {
      throw new UnauthorizedException('Неверный email или пароль');
    }

    try {
      const isPasswordValid = await argon2.verify(user.passwordHash, password);

      if (!isPasswordValid) {
        // Увеличиваем счетчик неудачных попыток
        user.failedLoginAttempts += 1;

        if (user.failedLoginAttempts >= this.MAX_FAILED_ATTEMPTS) {
          user.lockedUntil = new Date(Date.now() + this.LOCKOUT_DURATION);
          user.failedLoginAttempts = 0;
          await this.userRepository.save(user);
          throw new ForbiddenException('Слишком много неудачных попыток. Аккаунт заблокирован на 15 минут');
        } else {
          await this.userRepository.save(user);
          await this.delay(1000 + user.failedLoginAttempts * 500); // Увеличивающаяся задержка
          throw new UnauthorizedException('Неверный email или пароль');
        }
      }

      // Успешный вход
      user.failedLoginAttempts = 0;
      user.lockedUntil = null;
      user.lastLoginAt = new Date();
      user.lastActivityAt = new Date(); // Обновляем активность при логине
      await this.userRepository.save(user);

      await this.logLoginAttempt(normalizedEmail, ipAddress, true);

      // Генерация JWT токена
      const payload = { sub: user.id, email: user.email };
      const accessToken = this.jwtService.sign(payload);

      return { user, accessToken };
    } catch (error) {
      if (error instanceof UnauthorizedException || error instanceof ForbiddenException) {
        throw error;
      }
      throw new UnauthorizedException('Ошибка проверки пароля');
    }
  }

  // Отметить туториал как просмотренный
  async markTutorialAsSeen(userId: string): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new BadRequestException('Пользователь не найден');
    }

    user.hasSeenTutorial = true;
    return await this.userRepository.save(user);
  }

  // Логирование попыток входа
  private async logLoginAttempt(email: string, ipAddress: string | undefined, success: boolean): Promise<void> {
    const loginAttempt = this.loginAttemptRepository.create({
      email,
      ipAddress,
      success,
    });

    await this.loginAttemptRepository.save(loginAttempt);

    // Удаляем старые записи (старше 30 дней)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    await this.loginAttemptRepository.delete({
      createdAt: MoreThan(thirtyDaysAgo),
    });
  }

  // Проверка подозрительной активности
  async checkSuspiciousActivity(email: string, ipAddress: string | undefined): Promise<boolean> {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);

    const recentAttempts = await this.loginAttemptRepository.count({
      where: {
        email,
        success: false,
        createdAt: MoreThan(oneHourAgo),
      },
    });

    if (recentAttempts > 10) {
      return true;
    }

    // Проверка разных IP адресов
    if (ipAddress) {
      const uniqueIPs = await this.loginAttemptRepository
        .createQueryBuilder('attempt')
        .select('COUNT(DISTINCT attempt.ipAddress)', 'count')
        .where('attempt.email = :email', { email })
        .andWhere('attempt.createdAt > :date', { date: oneHourAgo })
        .getRawOne();

      if (parseInt(uniqueIPs.count) > 5) {
        return true;
      }
    }

    return false;
  }

  // Задержка для защиты от брутфорса
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Старые методы для WebAuthn (оставляем для совместимости)
  async generateChallenge(): Promise<string> {
    return crypto.randomBytes(32).toString('base64');
  }

  async verifySignature(
    credentialId: number[],
    authenticatorData: number[],
    clientDataJSON: number[],
    signature: number[],
    challenge: string,
  ): Promise<boolean> {
    // Реализация проверки WebAuthn (упрощенная версия)
    return (
      credentialId.length > 0 &&
      authenticatorData.length > 0 &&
      clientDataJSON.length > 0 &&
      signature.length > 0
    );
  }

  // Регистрация биометрии для пользователя
  async registerBiometric(
    userId: string,
    credentialId: number[],
    clientDataJSON: number[],
    attestationObject: number[],
    challenge: string,
  ): Promise<void> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new BadRequestException('Пользователь не найден');
    }

    // Создаем хэш из credentialId для безопасного хранения
    const credentialIdString = Buffer.from(credentialId).toString('base64');
    const biometricIdHash = await argon2.hash(credentialIdString, {
      type: argon2.argon2id,
      memoryCost: 65536,
      timeCost: 3,
      parallelism: 4,
    });

    // Сохраняем хэш в БД
    user.biometricIdHash = biometricIdHash;
    await this.userRepository.save(user);
  }

  // Поиск пользователя по хэшу биометрического ID
  async findUserByBiometricId(credentialId: number[]): Promise<User | null> {
    const credentialIdString = Buffer.from(credentialId).toString('base64');

    // Получаем всех пользователей с биометрией
    const users = await this.userRepository
      .createQueryBuilder('user')
      .where('user.biometricIdHash IS NOT NULL')
      .getMany();

    // Проверяем каждый хэш
    for (const user of users) {
      if (user.biometricIdHash) {
        try {
          const isValid = await argon2.verify(user.biometricIdHash, credentialIdString);
          if (isValid) {
            return user;
          }
        } catch (error) {
          // Продолжаем проверку следующего пользователя
          continue;
        }
      }
    }

    return null;
  }

  // Вход через биометрию
  async loginWithBiometric(
    credentialId: number[],
    authenticatorData: number[],
    clientDataJSON: number[],
    signature: number[],
    challenge: string,
  ): Promise<{ user: User; accessToken: string }> {
    // Находим пользователя по credentialId
    const user = await this.findUserByBiometricId(credentialId);

    if (!user) {
      throw new UnauthorizedException('Биометрия не привязана к аккаунту');
    }

    // Проверяем активность аккаунта
    if (!user.isActive) {
      throw new ForbiddenException('Аккаунт неактивен');
    }

    // Проверяем блокировку
    if (user.lockedUntil && user.lockedUntil > new Date()) {
      const minutesLeft = Math.ceil((user.lockedUntil.getTime() - Date.now()) / 60000);
      throw new ForbiddenException(`Аккаунт заблокирован. Попробуйте через ${minutesLeft} минут`);
    }

    // Упрощенная проверка подписи (в реальном приложении нужна полная проверка WebAuthn)
    if (
      credentialId.length === 0 ||
      authenticatorData.length === 0 ||
      clientDataJSON.length === 0 ||
      signature.length === 0
    ) {
      throw new UnauthorizedException('Неверные данные биометрии');
    }

    // Обновляем время последнего входа
    user.lastLoginAt = new Date();
    user.lastActivityAt = new Date(); // Обновляем активность при биометрическом входе
    user.failedLoginAttempts = 0;
    await this.userRepository.save(user);

    // Генерация JWT токена
    const payload = { sub: user.id, email: user.email };
    const accessToken = this.jwtService.sign(payload);

    return { user, accessToken };
  }

  // Проверка наличия биометрии у пользователя
  async hasBiometric(userId: string): Promise<boolean> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      select: ['id', 'biometricIdHash'],
    });

    return user ? !!user.biometricIdHash : false;
  }
}
