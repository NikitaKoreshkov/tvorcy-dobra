# Устранение проблемы: "Loading profile..." на главной странице

## Проблема
На продакшн сервере (https://charityfond.online/en) главная страница показывает только синий фон и текст "Loading profile...", хотя на локалхосте все работает нормально.

## Возможные причины

### 1. Неправильная настройка NEXT_PUBLIC_API_URL
На сервере должна быть установлена переменная окружения:
```bash
NEXT_PUBLIC_API_URL=https://charityfond.online/api
```

**Проверка:**
```bash
# На сервере
cd /var/www/charityfond/frontend
cat .env.local | grep NEXT_PUBLIC_API_URL
```

**Исправление:**
```bash
# На сервере
cd /var/www/charityfond/frontend
echo "NEXT_PUBLIC_API_URL=https://charityfond.online/api" >> .env.local
# Перезапустить фронтенд
pm2 restart charityfond-frontend
```

### 2. Бэкенд не запущен или недоступен
Проверьте, что бэкенд работает:
```bash
# На сервере
pm2 status
pm2 logs charityfond-backend --lines 50
```

Если бэкенд не запущен:
```bash
pm2 start ecosystem.config.js --only charityfond-backend
pm2 save
```

### 3. Проблемы с Nginx проксированием
Проверьте, что Nginx правильно проксирует запросы к API:
```bash
# На сервере
sudo nginx -t
sudo systemctl status nginx
sudo tail -f /var/log/nginx/charityfond-en.error.log
```

Проверьте, что в `/etc/nginx/sites-available/charityfond` есть блок:
```nginx
location /api {
    proxy_pass http://backend;
    ...
}
```

### 4. Проблемы с CORS
Убедитесь, что в `backend/.env` правильно настроен `FRONTEND_URL`:
```bash
FRONTEND_URL=https://charityfond.online
```

### 5. Проблемы с базой данных
Проверьте подключение к БД:
```bash
# На сервере
cd /var/www/charityfond/backend
npm run start:dev  # Временно для проверки
```

## Диагностика

### Шаг 1: Проверка переменных окружения
```bash
# На сервере
cd /var/www/charityfond/frontend
cat .env.local
```

Должно быть:
```
NEXT_PUBLIC_API_URL=https://charityfond.online/api
NEXT_PUBLIC_APP_URL=https://charityfond.online
```

### Шаг 2: Проверка работы API
```bash
# С локальной машины или с сервера
curl https://charityfond.online/api/auth/verify-token -X POST -H "Content-Type: application/json"
```

Должен вернуть JSON ответ (даже если ошибка, но не 502/503).

### Шаг 3: Проверка логов
```bash
# Логи фронтенда
pm2 logs charityfond-frontend --lines 100

# Логи бэкенда
pm2 logs charityfond-backend --lines 100

# Логи Nginx
sudo tail -f /var/log/nginx/charityfond-en.error.log
```

### Шаг 4: Проверка в браузере
1. Откройте https://charityfond.online/en
2. Откройте DevTools (F12)
3. Перейдите на вкладку Network
4. Проверьте, какие запросы делаются и какие ошибки возникают
5. Проверьте Console на наличие ошибок

## Быстрое исправление

Если проблема в переменных окружения:

```bash
# На сервере
cd /var/www/charityfond/frontend

# Создать/обновить .env.local
cat > .env.local << EOF
NEXT_PUBLIC_API_URL=https://charityfond.online/api
NEXT_PUBLIC_APP_URL=https://charityfond.online
EOF

# Пересобрать фронтенд (если нужно)
npm run build

# Перезапустить
pm2 restart charityfond-frontend
```

## Проверка после исправления

1. Откройте https://charityfond.online/en в браузере
2. Должна загрузиться главная страница с Hero секцией, карточками проектов и т.д.
3. Проверьте консоль браузера (F12) - не должно быть ошибок API запросов

## Дополнительная информация

- Файл конфигурации API: `frontend/src/config.ts`
- Nginx конфигурация: `deploy/nginx.conf`
- Пример переменных окружения: `deploy/env.example`



