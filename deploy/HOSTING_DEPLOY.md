# Развертывание через панель управления хостингом

Если SSH недоступен, используйте один из следующих методов:

## Метод 1: Через FTP/SFTP

### Подключение через FileZilla или другой FTP клиент:

1. **Хост**: 91.229.11.210
2. **Порт**: 21 (FTP) или 22 (SFTP, если доступен)
3. **Пользователь**: cpvart@mail.ru (или root, или имя пользователя от хостинга)
4. **Пароль**: 28041985qqq

### Загрузка файлов:

1. Подключитесь к серверу через FTP
2. Загрузите все файлы проекта в `/var/www/charityfond/` или в корневую директорию сайта
3. Исключите при загрузке:
   - `node_modules/`
   - `.next/`
   - `dist/`
   - `.git/`

## Метод 2: Через панель управления (Reg.ru, Timeweb и т.д.)

### Если у вас панель управления хостингом:

1. Войдите в панель управления
2. Откройте "Файловый менеджер"
3. Загрузите файлы проекта
4. Используйте SSH через панель управления (если доступен)

## Метод 3: Подготовка файлов для загрузки

Я создам архив с необходимыми файлами:

```bash
cd /Users/nikitos/Desktop/donate
tar -czf charityfond-deploy.tar.gz \
  --exclude='node_modules' \
  --exclude='.next' \
  --exclude='dist' \
  --exclude='.git' \
  --exclude='*.log' \
  --exclude='.env*' \
  .
```

Затем загрузите этот архив на сервер и распакуйте.

## Метод 4: Через веб-интерфейс SSH (если доступен)

Многие хостинг-провайдеры предоставляют веб-терминал в панели управления.

## Что нужно сделать на сервере после загрузки файлов:

1. **Установить Node.js** (если не установлен):
   ```bash
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt-get install -y nodejs
   ```

2. **Установить PM2**:
   ```bash
   sudo npm install -g pm2
   ```

3. **Установить зависимости**:
   ```bash
   cd /var/www/charityfond  # или путь к вашему проекту
   npm install
   cd frontend && npm install && cd ..
   cd backend && npm install && cd ..
   ```

4. **Собрать проекты**:
   ```bash
   npm run build
   ```

5. **Настроить переменные окружения**:
   ```bash
   cp deploy/env.example backend/.env
   nano backend/.env  # Отредактируйте значения
   
   cp deploy/env.example frontend/.env.local
   nano frontend/.env.local  # Отредактируйте значения
   ```

6. **Настроить Nginx** (если есть доступ):
   ```bash
   sudo cp deploy/nginx.conf /etc/nginx/sites-available/charityfond
   sudo ln -s /etc/nginx/sites-available/charityfond /etc/nginx/sites-enabled/
   sudo nginx -t
   sudo systemctl reload nginx
   ```

7. **Запустить через PM2**:
   ```bash
   cp deploy/ecosystem.config.js ./
   pm2 start ecosystem.config.js
   pm2 save
   ```

## Важные настройки в .env файлах:

### backend/.env:
```
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=your_db_user
DB_PASSWORD=your_password
DB_DATABASE=charityfond
PORT=3001
FRONTEND_URL=https://charityfond.online
```

### frontend/.env.local:
```
NEXT_PUBLIC_API_URL=https://charityfond.online/api
NEXT_PUBLIC_APP_URL=https://charityfond.online
```

## Настройка базы данных PostgreSQL:

```bash
sudo -u postgres psql
CREATE DATABASE charityfond;
CREATE USER charityfond_user WITH ENCRYPTED PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE charityfond TO charityfond_user;
\q

# Инициализация таблиц
cd /var/www/charityfond/backend
psql -U charityfond_user -d charityfond -f scripts/create-db.sql
```

## Получение SSL сертификатов:

```bash
sudo certbot --nginx -d charityfond.online -d www.charityfond.online \
             -d charityfond.ru -d www.charityfond.ru \
             -d charityfond.store -d www.charityfond.store \
             -d творцыдобра.рф -d творецдобра.рф -d странадобра.рф \
             -d творцы-добра.рф -d творец-добра.рф -d страна-добра.рф
```

