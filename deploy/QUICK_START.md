# Быстрый старт развертывания

## Краткая инструкция для развертывания на сервере 91.229.11.210

### 1. Подключение к серверу

```bash
ssh root@91.229.11.210
```

### 2. Установка необходимого ПО (один раз)

```bash
# Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# PM2
sudo npm install -g pm2

# PostgreSQL
sudo apt install -y postgresql postgresql-contrib

# Nginx
sudo apt install -y nginx

# Certbot для SSL
sudo apt install -y certbot python3-certbot-nginx

# Redis (опционально)
sudo apt install -y redis-server
```

### 3. Настройка базы данных

```bash
sudo -u postgres psql
CREATE DATABASE charityfond;
CREATE USER charityfond_user WITH ENCRYPTED PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE charityfond TO charityfond_user;
\q
```

### 4. Загрузка кода

**С локальной машины:**

```bash
rsync -avz --exclude 'node_modules' --exclude '.next' --exclude 'dist' --exclude '.git' \
  ./ root@91.229.11.210:/var/www/charityfond/
```

### 5. Настройка переменных окружения

```bash
# На сервере
cd /var/www/charityfond
cp deploy/env.example backend/.env
nano backend/.env  # Заполните значения

cp deploy/env.example frontend/.env.local
nano frontend/.env.local  # Заполните значения
```

**Важно в frontend/.env.local:**
```
NEXT_PUBLIC_API_URL=https://charityfond.online/api
NEXT_PUBLIC_APP_URL=https://charityfond.online
```

### 6. Установка и сборка

```bash
cd /var/www/charityfond
npm install
cd frontend && npm install && cd ..
cd backend && npm install && cd ..
npm run build
```

### 7. Настройка Nginx

```bash
sudo cp /var/www/charityfond/deploy/nginx.conf /etc/nginx/sites-available/charityfond
sudo ln -s /etc/nginx/sites-available/charityfond /etc/nginx/sites-enabled/
sudo rm /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl reload nginx
```

### 8. SSL сертификаты

```bash
# Для английских доменов
sudo certbot --nginx -d charityfond.online -d www.charityfond.online \
             -d charityfond.ru -d www.charityfond.ru \
             -d charityfond.store -d www.charityfond.store

# Для русских доменов (может потребоваться ручная настройка)
sudo certbot --nginx -d творцыдобра.рф -d творецдобра.рф -d странадобра.рф \
             -d творцы-добра.рф -d творец-добра.рф -d страна-добра.рф
```

### 9. Запуск приложений

```bash
cd /var/www/charityfond
cp deploy/ecosystem.config.js ./
pm2 start ecosystem.config.js
pm2 save
pm2 startup systemd -u root --hp /root
```

### 10. Инициализация базы данных

```bash
cd /var/www/charityfond/backend
psql -U charityfond_user -d charityfond -f scripts/create-db.sql
```

### Готово! 🎉

Проверьте работу:
- `pm2 status` - статус процессов
- `pm2 logs` - логи приложений
- Откройте в браузере: https://charityfond.online

### Обновление приложения

```bash
cd /var/www/charityfond
pm2 stop all
# Обновите код (git pull или rsync)
npm run build
pm2 start all
```

### Полезные команды

```bash
pm2 status          # Статус
pm2 logs            # Логи
pm2 restart all     # Перезапуск
pm2 monit           # Мониторинг
sudo nginx -t       # Проверка Nginx
sudo systemctl reload nginx  # Перезагрузка Nginx
```

