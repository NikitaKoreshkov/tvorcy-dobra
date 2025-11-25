import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { GamificationService } from './gamification/gamification.service';
import { SubscriptionsService } from './subscriptions/subscriptions.service';
import { ProjectsService } from './projects/projects.service';
import helmet from 'helmet';
import * as express from 'express';
import * as compression from 'compression';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bodyParser: true,
    rawBody: false,
  });
  
  // Compression middleware для уменьшения размера ответов
  app.use(compression());
  
  // Увеличиваем лимит размера тела запроса до 50MB для загрузки изображений
  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ extended: true, limit: '50mb' }));

  // Helmet для безопасности HTTP заголовков
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", 'data:', 'https:'],
      },
    },
    crossOriginEmbedderPolicy: false,
  }));

  // Валидация входных данных
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Удаляет свойства, которых нет в DTO
      forbidNonWhitelisted: true, // Выбрасывает ошибку при наличии неразрешенных свойств
      transform: true, // Автоматически преобразует типы
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Enable CORS for frontend - поддерживаем все домены
  const allowedOrigins = [
    process.env.FRONTEND_URL || 'http://localhost:3000',
    'https://charityfond.online',
    'https://www.charityfond.online',
    'https://charityfond.ru',
    'https://www.charityfond.ru',
    'https://charityfond.store',
    'https://www.charityfond.store',
    'https://творцыдобра.рф',
    'https://www.творцыдобра.рф',
    'https://творецдобра.рф',
    'https://www.творецдобра.рф',
    'https://странадобра.рф',
    'https://www.странадобра.рф',
    'https://творцы-добра.рф',
    'https://www.творцы-добра.рф',
    'https://творец-добра.рф',
    'https://www.творец-добра.рф',
    'https://страна-добра.рф',
    'https://www.страна-добра.рф',
  ];

  app.enableCors({
    origin: (origin, callback) => {
      // Разрешаем запросы без origin (например, Postman, curl)
      if (!origin) {
        return callback(null, true);
      }
      // Проверяем, есть ли origin в списке разрешенных
      if (allowedOrigins.some(allowed => origin.includes(allowed.replace('https://', '').replace('http://', '')))) {
        return callback(null, true);
      }
      // Разрешаем все для разработки
      if (process.env.NODE_ENV !== 'production') {
        return callback(null, true);
      }
      callback(null, true);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  // Инициализация достижений
  try {
    const gamificationService = app.get(GamificationService);
    await gamificationService.initializeAchievements();
    console.log('Achievements initialized');
  } catch (error) {
    console.error('Error initializing achievements:', error);
  }

  // Инициализация планов подписок
  try {
    const subscriptionsService = app.get(SubscriptionsService);
    await subscriptionsService.initializePlans();
    console.log('Subscription plans initialized');
  } catch (error) {
    console.error('Error initializing subscription plans:', error);
  }

  // Инициализация проектов
  try {
    const projectsService = app.get(ProjectsService);
    await projectsService.initializeProjects();
    console.log('Projects initialized');
  } catch (error) {
    console.error('Error initializing projects:', error);
  }

  // Устанавливаем глобальный префикс для всех роутов
  app.setGlobalPrefix('api');

  const port = process.env.PORT || 3001;
  await app.listen(port);
  console.log(`Backend is running on: http://localhost:${port}`);
}
bootstrap();

