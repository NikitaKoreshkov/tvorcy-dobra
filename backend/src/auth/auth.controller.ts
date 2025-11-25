import {
  Controller,
  Post,
  Body,
  HttpException,
  HttpStatus,
  UseGuards,
  Request,
  Ip,
  UseInterceptors,
  ClassSerializerInterceptor,
} from '@nestjs/common';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';
import { AuthService } from './auth.service';
import { EmailService } from './email.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { validateEmail } from './middleware/security.middleware';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { SendCodeDto } from './dto/send-code.dto';
import { SubscriptionsService } from '../subscriptions/subscriptions.service';

@Controller('auth')
@UseInterceptors(ClassSerializerInterceptor)
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly emailService: EmailService,
    private readonly subscriptionsService: SubscriptionsService,
  ) {}

  // Endpoint для проверки времени последней отправки кода
  @Post('check-code-cooldown')
  @UseGuards(ThrottlerGuard)
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  async checkCodeCooldown(@Body() body: { email: string }) {
    try {
      const { email } = body;

      if (!email) {
        throw new HttpException('Email обязателен', HttpStatus.BAD_REQUEST);
      }

      const cooldownInfo = await this.authService.canSendCode(email);

      return {
        canSend: cooldownInfo.canSend,
        remainingSeconds: cooldownInfo.remainingSeconds,
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        error.message || 'Ошибка проверки времени отправки',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // Endpoint для отправки кода подтверждения на email
  @Post('send-verification-code')
  @UseGuards(ThrottlerGuard)
  @Throttle({ default: { limit: 3, ttl: 60000 } }) // 3 запроса в минуту
  async sendVerificationCode(@Body() body: SendCodeDto, @Ip() ip: string) {
    try {
      const { email } = body;

      if (!email) {
        throw new HttpException('Email обязателен', HttpStatus.BAD_REQUEST);
      }

      // Проверка кулдауна (30 секунд)
      const cooldownInfo = await this.authService.canSendCode(email);
      if (!cooldownInfo.canSend) {
        throw new HttpException(
          `Повторная отправка возможна через ${cooldownInfo.remainingSeconds} секунд`,
          HttpStatus.TOO_MANY_REQUESTS,
        );
      }

      // Валидация email
      const isValidEmail = await validateEmail(email);
      if (!isValidEmail) {
        throw new HttpException(
          'Некорректный email адрес или использование временных email сервисов запрещено',
          HttpStatus.BAD_REQUEST,
        );
      }

      // Проверка существования пользователя
      const existingUser = await this.authService.findUserByEmail(email);
      if (existingUser) {
        throw new HttpException(
          'Пользователь с таким email уже существует',
          HttpStatus.BAD_REQUEST,
        );
      }

      // Проверка подозрительной активности
      const isSuspicious = await this.authService.checkSuspiciousActivity(email, ip);
      if (isSuspicious) {
        throw new HttpException(
          'Обнаружена подозрительная активность. Попробуйте позже.',
          HttpStatus.TOO_MANY_REQUESTS,
        );
      }

      // Генерируем код
      const code = this.authService.generateVerificationCode();

      // Сохраняем код в БД
      await this.authService.saveVerificationCode(email, code);

      // Отправляем email
      const locale = body.locale || 'ru';
      await this.emailService.sendVerificationCode(email, code, locale as 'ru' | 'en');

      return {
        success: true,
        message: 'Код подтверждения отправлен на email',
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        error.message || 'Ошибка отправки кода подтверждения',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // Endpoint для проверки кода (без регистрации)
  @Post('verify-code-check')
  @UseGuards(ThrottlerGuard)
  @Throttle({ default: { limit: 5, ttl: 60000 } }) // 5 запросов в минуту
  async verifyCodeCheck(@Body() body: { email: string; code: string }, @Ip() ip: string) {
    try {
      const { email, code } = body;

      if (!email || !code) {
        throw new HttpException('Email и код обязательны', HttpStatus.BAD_REQUEST);
      }

      // Проверка кода (без удаления)
      const isValid = await this.authService.checkCode(email, code);

      if (!isValid) {
        throw new HttpException('Неверный код подтверждения или код истек', HttpStatus.UNAUTHORIZED);
      }

      return {
        success: true,
        message: 'Код подтвержден',
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(error.message || 'Ошибка проверки кода', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // Endpoint для проверки кода подтверждения и регистрации
  @Post('verify-code')
  @UseGuards(ThrottlerGuard)
  @Throttle({ default: { limit: 5, ttl: 60000 } }) // 5 запросов в минуту
  async verifyCode(@Body() body: RegisterDto, @Ip() ip: string) {
    try {
      const { email, code, password, name } = body;

      if (!email || !code || !password || !name) {
        throw new HttpException('Email, код, имя и пароль обязательны', HttpStatus.BAD_REQUEST);
      }

      // Проверка кода
      const isValid = await this.authService.verifyCode(email, code);

      if (!isValid) {
        throw new HttpException('Неверный код подтверждения или код истек', HttpStatus.UNAUTHORIZED);
      }

      // Регистрация пользователя
      const locale = body.locale || 'ru';
      const result = await this.authService.register(email, name, password, undefined, locale as 'ru' | 'en');

      return {
        success: true,
        message: 'Регистрация успешна',
        accessToken: result.accessToken,
        user: {
          id: result.user.id,
          email: result.user.email,
        },
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(error.message || 'Ошибка проверки кода', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // Endpoint для входа
  @Post('login')
  @UseGuards(ThrottlerGuard)
  @Throttle({ default: { limit: 5, ttl: 60000 } }) // 5 запросов в минуту
  async login(@Body() body: LoginDto, @Ip() ip: string) {
    try {
      const { email, password } = body;

      if (!email || !password) {
        throw new HttpException('Email и пароль обязательны', HttpStatus.BAD_REQUEST);
      }

      // Проверка подозрительной активности
      const isSuspicious = await this.authService.checkSuspiciousActivity(email, ip);
      if (isSuspicious) {
        throw new HttpException(
          'Обнаружена подозрительная активность. Попробуйте позже.',
          HttpStatus.TOO_MANY_REQUESTS,
        );
      }

      const result = await this.authService.login(email, password, ip);

      return {
        success: true,
        message: 'Вход выполнен успешно',
        accessToken: result.accessToken,
        user: {
          id: result.user.id,
          email: result.user.email,
        },
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(error.message || 'Ошибка входа', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // Endpoint для проверки токена
  @Post('verify-token')
  @UseGuards(JwtAuthGuard)
  async verifyToken(@Request() req: any) {
    const hasBiometric = await this.authService.hasBiometric(req.user.id);
    const activeSubscription = await this.subscriptionsService.getActiveSubscription(req.user.id);
    
    return {
      success: true,
      user: {
        id: req.user.id,
        email: req.user.email,
        name: req.user.name,
        hasSeenTutorial: req.user.hasSeenTutorial,
        hasBiometric: hasBiometric,
        profileDescription: req.user.profileDescription || null,
        profileAvatar: req.user.profileAvatar || null,
        profileBackground: req.user.profileBackground || null,
        pageBackground: req.user.pageBackground || null,
        profilePhotos: req.user.profilePhotos || [],
        profileVideo: req.user.profileVideo || null,
        subscription: activeSubscription ? {
          id: activeSubscription.id,
          planName: activeSubscription.plan.name,
          planType: activeSubscription.plan.type,
          status: activeSubscription.status,
        } : null,
      },
    };
  }

  // Endpoint для обновления статуса туториала
  @Post('mark-tutorial-seen')
  @UseGuards(JwtAuthGuard)
  async markTutorialSeen(@Request() req: any) {
    try {
      const user = await this.authService.markTutorialAsSeen(req.user.id);
      return {
        success: true,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          hasSeenTutorial: user.hasSeenTutorial,
        },
      };
    } catch (error) {
      throw new HttpException(
        error.message || 'Ошибка обновления статуса туториала',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // Endpoint для регистрации/входа через Google
  @Post('google')
  @UseGuards(ThrottlerGuard)
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  async googleAuth(@Body() body: { googleId: string; email: string; name: string }, @Ip() ip: string) {
    try {
      const { googleId, email, name } = body;

      if (!googleId || !email) {
        throw new HttpException('Google ID и email обязательны', HttpStatus.BAD_REQUEST);
      }

      // Регистрация или вход через Google
      const result = await this.authService.registerOrLoginWithGoogle(googleId, email, name, ip);

      return {
        success: true,
        message: 'Авторизация через Google успешна',
        accessToken: result.accessToken,
        user: {
          id: result.user.id,
          email: result.user.email,
          name: result.user.name,
          hasSeenTutorial: result.user.hasSeenTutorial,
        },
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        error.message || 'Ошибка авторизации через Google',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // Endpoint для получения challenge для регистрации биометрии (требует авторизации)
  @Post('biometric/challenge')
  @UseGuards(JwtAuthGuard, ThrottlerGuard)
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  async getBiometricChallenge(@Request() req: any) {
    try {
      const challenge = await this.authService.generateChallenge();
      return {
        challenge: challenge,
      };
    } catch (error) {
      throw new HttpException('Ошибка генерации challenge', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // Endpoint для получения challenge для входа через биометрию (без авторизации)
  @Post('biometric/login-challenge')
  @UseGuards(ThrottlerGuard)
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  async getBiometricLoginChallenge() {
    try {
      const challenge = await this.authService.generateChallenge();
      return {
        challenge: challenge,
      };
    } catch (error) {
      throw new HttpException('Ошибка генерации challenge', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // Endpoint для регистрации биометрии
  @Post('biometric/register')
  @UseGuards(JwtAuthGuard, ThrottlerGuard)
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  async registerBiometric(
    @Request() req: any,
    @Body() body: {
      credentialId: number[];
      clientDataJSON: number[];
      attestationObject: number[];
      challenge: string;
    },
  ) {
    try {
      const { credentialId, clientDataJSON, attestationObject, challenge } = body;

      if (!credentialId || !clientDataJSON || !attestationObject || !challenge) {
        throw new HttpException('Недостаточно данных для регистрации', HttpStatus.BAD_REQUEST);
      }

      await this.authService.registerBiometric(
        req.user.id,
        credentialId,
        clientDataJSON,
        attestationObject,
        challenge,
      );

      return {
        success: true,
        message: 'Биометрия успешно подключена',
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        error.message || 'Ошибка регистрации биометрии',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // Endpoint для входа через биометрию
  @Post('biometric/login')
  @UseGuards(ThrottlerGuard)
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  async loginWithBiometric(
    @Body() body: {
      credentialId: number[];
      authenticatorData: number[];
      clientDataJSON: number[];
      signature: number[];
      challenge: string;
    },
    @Ip() ip: string,
  ) {
    try {
      const { credentialId, authenticatorData, clientDataJSON, signature, challenge } = body;

      if (!credentialId || !authenticatorData || !clientDataJSON || !signature || !challenge) {
        throw new HttpException('Недостаточно данных для входа', HttpStatus.BAD_REQUEST);
      }

      const result = await this.authService.loginWithBiometric(
        credentialId,
        authenticatorData,
        clientDataJSON,
        signature,
        challenge,
      );

      return {
        success: true,
        message: 'Вход выполнен успешно',
        accessToken: result.accessToken,
        user: {
          id: result.user.id,
          email: result.user.email,
          name: result.user.name,
          hasSeenTutorial: result.user.hasSeenTutorial,
        },
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        error.message || 'Ошибка входа через биометрию',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // WebAuthn endpoints (оставляем для совместимости)
  @Post('webauthn/challenge')
  @UseGuards(ThrottlerGuard)
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  async getChallenge() {
    try {
      const challenge = await this.authService.generateChallenge();
      return {
        challenge: challenge,
        userId: 'user-id-placeholder',
      };
    } catch (error) {
      throw new HttpException('Ошибка генерации challenge', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post('webauthn/verify')
  @UseGuards(ThrottlerGuard)
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  async verify(@Body() body: any) {
    try {
      const { credentialId, authenticatorData, clientDataJSON, signature, userHandle, challenge } = body;

      if (!credentialId || !signature || !challenge) {
        throw new HttpException('Недостаточно данных для проверки', HttpStatus.BAD_REQUEST);
      }

      const isValid = await this.authService.verifySignature(
        credentialId,
        authenticatorData,
        clientDataJSON,
        signature,
        challenge,
      );

      if (!isValid) {
        throw new HttpException('Ошибка проверки подписи', HttpStatus.UNAUTHORIZED);
      }

      return {
        success: true,
        message: 'Аутентификация успешна',
        userId: userHandle ? Buffer.from(userHandle).toString('utf-8') : 'user-id',
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        error.message || 'Ошибка проверки аутентификации',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
