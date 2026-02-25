# Donate Website

Проект состоит из фронтенда (Next.js) и бэкенда (Nest.js).

## Структура проекта

- `frontend/` - Next.js приложение с TypeScript и Tailwind CSS
- `backend/` - Nest.js приложение с TypeScript и PostgreSQL

## Установка и запуск

### Быстрый старт (из корня проекта)

```bash
# Установить все зависимости
npm run install:all

# Запустить оба проекта одновременно
npm run dev
```

### Запуск по отдельности

**Frontend:**
```bash
npm run dev:frontend
# или
cd frontend && npm run dev
```

Фронтенд будет доступен на http://localhost:3000

**Backend:**
```bash
npm run dev:backend
# или
cd backend && npm run dev
```

Бэкенд будет доступен на http://localhost:3001

## Настройка PostgreSQL

Создайте файл `.env` в папке `backend/`:

```
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_DATABASE=donate
PORT=3001
FRONTEND_URL=http://localhost:3000

# Redis (опционально, для масштабирования)
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_DB=0
```

## Настройка Redis (опционально)

Redis используется для распределенного кэширования и rate limiting. Приложение будет работать и без Redis, но для масштабирования рекомендуется его установить.

Подробные инструкции: [backend/REDIS_SETUP.md](backend/REDIS_SETUP.md)

### Быстрая установка (macOS)
```bash
brew install redis
brew services start redis
```

## Технологии

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **Backend**: Nest.js, TypeScript, PostgreSQL, TypeORM, Redis (опционально)
- **Масштабирование**: Redis для кэширования, Connection pooling (100 соединений)

