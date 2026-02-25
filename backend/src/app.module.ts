import { Module, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD, APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import type { StringValue } from 'ms';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthController } from './auth/auth.controller';
import { AuthService } from './auth/auth.service';
import { EmailService } from './auth/email.service';
import { JwtStrategy } from './auth/strategies/jwt.strategy';
import { SecurityMiddleware } from './auth/middleware/security.middleware';
import { ActivityInterceptor } from './auth/interceptors/activity.interceptor';
import { CustomThrottlerGuard } from './auth/guards/rate-limit.guard';
import { ThrottlerExceptionFilter } from './auth/filters/throttler-exception.filter';
import { User, VerificationCode, LoginAttempt, NewsletterSubscription, PaymentMethod, Transaction, Achievement, UserAchievement, SubscriptionPlan, UserSubscription, UserNotificationSettings, UserGoal, Project, ProjectTranslation } from './entities';
import { PaymentsModule } from './payments/payments.module';
import { TransactionsModule } from './transactions/transactions.module';
import { GamificationModule } from './gamification/gamification.module';
import { SubscriptionsModule } from './subscriptions/subscriptions.module';
import { SettingsModule } from './settings/settings.module';
import { ProjectsModule } from './projects/projects.module';
import { RedisModule } from './common/redis/redis.module';
import { CacheModule } from './common/cache/cache.module';
import { ThrottlerRedisStorage } from './common/redis/throttler-redis.storage';

@Module({
  imports: [
    // Redis модуль для кэширования и rate limiting
    RedisModule,
    CacheModule,
    // TypeORM с PostgreSQL
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432'),
      username: process.env.DB_USERNAME || 'postgres',
      password: process.env.DB_PASSWORD || 'postgres',
      database: process.env.DB_DATABASE || 'donate',
      entities: [User, VerificationCode, LoginAttempt, NewsletterSubscription, PaymentMethod, Transaction, Achievement, UserAchievement, SubscriptionPlan, UserSubscription, UserNotificationSettings, UserGoal, Project, ProjectTranslation],
      synchronize: false, // Отключено после создания таблиц
      autoLoadEntities: true,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
      // Оптимизация производительности
      extra: {
        max: 100, // Максимальное количество соединений в пуле (увеличено для масштабирования)
        connectionTimeoutMillis: 5000, // Увеличено для стабильности
        idleTimeoutMillis: 30000,
      },
      logging: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : false,
      cache: {
        duration: 30000, // 30 секунд кэширования для запросов
      },
    }),
    // TypeORM для репозиториев
    TypeOrmModule.forFeature([User, VerificationCode, LoginAttempt, NewsletterSubscription, PaymentMethod, Transaction, Achievement, UserAchievement, SubscriptionPlan, UserSubscription, UserNotificationSettings, UserGoal, Project, ProjectTranslation]),
    // Модуль платежей
    PaymentsModule,
    // Модуль транзакций
    TransactionsModule,
    // Модуль достижений
    GamificationModule,
    // Модуль подписок
    SubscriptionsModule,
    // Модуль настроек
    SettingsModule,
    // Модуль проектов
    ProjectsModule,
    // Passport для JWT
    PassportModule.register({ defaultStrategy: 'jwt' }),
    // JWT модуль
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'your-secret-key-change-in-production-min-32-chars',
      signOptions: {
        expiresIn: (process.env.JWT_EXPIRES_IN || '7d') as StringValue,
      },
    }),
    // Throttler для rate limiting с Redis storage
    ThrottlerModule.forRootAsync({
      imports: [RedisModule],
      useFactory: (redisStorage: ThrottlerRedisStorage) => ({
        throttlers: [
          {
            ttl: 60000, // 1 минута
            limit: 10, // 10 запросов
          },
        ],
        storage: redisStorage,
      }),
      inject: [ThrottlerRedisStorage],
    }),
  ],
  controllers: [AppController, AuthController],
  providers: [
    AppService,
    AuthService,
    EmailService,
    JwtStrategy,
    ActivityInterceptor,
    // Глобальный rate limiting guard
    {
      provide: APP_GUARD,
      useClass: CustomThrottlerGuard,
    },
    // Глобальный фильтр для ThrottlerException
    {
      provide: APP_FILTER,
      useClass: ThrottlerExceptionFilter,
    },
    // Глобальный interceptor для обновления активности пользователя
    {
      provide: APP_INTERCEPTOR,
      useClass: ActivityInterceptor,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(SecurityMiddleware)
      .forRoutes('*');
  }
}
