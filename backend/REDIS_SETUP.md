# Настройка Redis для масштабирования

## Зачем нужен Redis?

Redis используется для:
1. **Распределенного rate limiting** - работает при нескольких инстансах приложения
2. **Кэширования данных** - ускорение ответов API
3. **Снижения нагрузки на базу данных** - часто запрашиваемые данные кэшируются

## Установка Redis

### macOS (через Homebrew)
```bash
brew install redis
brew services start redis
```

### Linux (Ubuntu/Debian)
```bash
sudo apt-get update
sudo apt-get install redis-server
sudo systemctl start redis
sudo systemctl enable redis
```

### Docker
```bash
docker run -d -p 6379:6379 --name redis redis:latest
```

### Windows
Скачайте и установите Redis из [официального сайта](https://redis.io/download) или используйте WSL.

## Настройка переменных окружения

Добавьте в файл `.env` в папке `backend/`:

```env
# Redis настройки (опционально, по умолчанию localhost:6379)
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_DB=0
```

Если Redis не настроен, приложение будет работать с in-memory кэшем (только для одного инстанса).

## Проверка работы Redis

### Проверка подключения
```bash
redis-cli ping
# Должен вернуть: PONG
```

### Мониторинг Redis
```bash
redis-cli monitor
```

## Производительность

### С Redis
- ✅ Работает с несколькими инстансами приложения
- ✅ Распределенный rate limiting
- ✅ Кэширование на уровне приложения
- ✅ Ожидаемая нагрузка: **1000+ одновременных пользователей**

### Без Redis (только in-memory)
- ⚠️ Работает только с одним инстансом
- ⚠️ Rate limiting не работает при нескольких инстансах
- ⚠️ Кэш не синхронизируется между инстансами
- ⚠️ Ожидаемая нагрузка: **50-100 одновременных пользователей**

## Рекомендации для production

1. **Используйте Redis Cluster** для высокой доступности
2. **Настройте персистентность** (RDB или AOF) для сохранения данных
3. **Установите лимиты памяти** (`maxmemory` и `maxmemory-policy`)
4. **Используйте пароль** для безопасности (`REDIS_PASSWORD`)
5. **Мониторьте производительность** Redis

### Пример конфигурации для production (redis.conf)
```
maxmemory 256mb
maxmemory-policy allkeys-lru
save 900 1
save 300 10
save 60 10000
requirepass your-strong-password
```

## Troubleshooting

### Redis не подключается
1. Проверьте, что Redis запущен: `redis-cli ping`
2. Проверьте настройки в `.env`
3. Проверьте логи приложения - должно быть предупреждение, но приложение продолжит работать

### Высокое использование памяти
1. Настройте `maxmemory` в redis.conf
2. Используйте `maxmemory-policy allkeys-lru` для автоматической очистки старых ключей
3. Мониторьте использование: `redis-cli info memory`

### Медленные запросы
1. Проверьте количество ключей: `redis-cli dbsize`
2. Используйте `redis-cli --latency` для проверки задержек
3. Рассмотрите использование Redis Cluster для распределения нагрузки

