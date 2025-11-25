# Инструкция по развертыванию на сервере

## Информация о сервере

- **IP адрес**: 91.229.11.210
- **Домены (английские)**: 
  - charityfond.online
  - charityfond.ru
  - charityfond.store
- **Домены (русские)**:
  - творцыдобра.рф
  - творецдобра.рф
  - странадобра.рф
  - творцы-добра.рф
  - творец-добра.рф
  - страна-добра.рф

## Предварительные требования

### 1. Установка необходимого ПО на сервере

```bash
# Обновление системы
sudo apt update && sudo apt upgrade -y

# Установка Node.js (версия 18 или выше)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Установка PM2 для управления процессами
sudo npm install -g pm2

# Установка PostgreSQL
sudo apt install -y postgresql postgresql-contrib

# Установка Nginx
sudo apt install -y nginx

# Установка Certbot для SSL сертификатов
sudo apt install -y certbot python3-certbot-nginx

# Установка Redis (опционально, но рекомендуется)
sudo apt install -y redis-server
```

### 2. Настройка PostgreSQL

```bash
# Вход в PostgreSQL
sudo -u postgres psql

# Создание базы данных и пользователя
CREATE DATABASE charityfond;
CREATE USER charityfond_user WITH ENCRYPTED PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE charityfond TO charityfond_user;
\q
```

### 3. Настройка Redis (опционально)

```bash
# Запуск Redis
sudo systemctl start redis-server
sudo systemctl enable redis-server
```

## Развертывание

### Шаг 1: Загрузка кода на сервер

С локальной машины:

```bash
# Создание директории на сервере
ssh root@91.229.11.210 "mkdir -p /var/www/charityfond"

# Загрузка кода (исключая node_modules, .next, dist)
rsync -avz --exclude 'node_modules' \
           --exclude '.next' \
           --exclude 'dist' \
           --exclude '.git' \
           --exclude '*.log' \
           ./ root@83.166.245.24:/var/www/charityfond/
```

Или через Git (если репозиторий доступен):

```bash
ssh root@91.229.11.210
cd /var/www
git clone <your-repo-url> charityfond
cd charityfond
```

### Шаг 2: Настройка переменных окружения

```bash
# На сервере
cd /var/www/charityfond

# Создание .env для бэкенда
cp deploy/env.example backend/.env
nano backend/.env  # Отредактируйте значения

# Создание .env.local для фронтенда
cp deploy/env.example frontend/.env.local
nano frontend/.env.local  # Отредактируйте значения
```

**Важно**: Убедитесь, что в `frontend/.env.local` указан правильный API URL:
```
NEXT_PUBLIC_API_URL=https://charityfond.online/api
```

### Шаг 3: Установка зависимостей и сборка

```bash
cd /var/www/charityfond

# Установка зависимостей
npm install
cd frontend && npm install && cd ..
cd backend && npm install && cd ..

# Сборка проектов
npm run build
```

### Шаг 4: Настройка Nginx

```bash
# Копирование конфигурации Nginx
sudo cp /var/www/charityfond/deploy/nginx.conf /etc/nginx/sites-available/charityfond

# Создание симлинка
sudo ln -s /etc/nginx/sites-available/charityfond /etc/nginx/sites-enabled/

# Удаление дефолтной конфигурации (если нужно)
sudo rm /etc/nginx/sites-enabled/default

# Проверка конфигурации
sudo nginx -t

# Перезагрузка Nginx
sudo systemctl reload nginx
```

### Шаг 5: Получение SSL сертификатов

Для английских доменов:

```bash
sudo certbot --nginx -d charityfond.online -d www.charityfond.online \
             -d charityfond.ru -d www.charityfond.ru \
             -d charityfond.store -d www.charityfond.store
```

Для русских доменов (.рф):

```bash
sudo certbot --nginx -d творцыдобра.рф -d www.творцыдобра.рф \
             -d творецдобра.рф -d www.творецдобра.рф \
             -d странадобра.рф -d www.странадобра.рф \
             -d творцы-добра.рф -d www.творцы-добра.рф \
             -d творец-добра.рф -d www.творец-добра.рф \
             -d страна-добра.рф -d www.страна-добра.рф
```

**Примечание**: Certbot может не поддерживать кириллические домены напрямую. В этом случае:
1. Используйте DNS-провайдера, который поддерживает IDN (Internationalized Domain Names)
2. Или получите сертификаты вручную через DNS challenge

### Шаг 6: Настройка PM2

```bash
cd /var/www/charityfond

# Копирование конфигурации PM2
cp deploy/ecosystem.config.js ./

# Запуск приложений
pm2 start ecosystem.config.js

# Сохранение конфигурации PM2
pm2 save

# Настройка автозапуска при перезагрузке сервера
pm2 startup systemd -u root --hp /root
```

### Шаг 7: Настройка базы данных

```bash
# Запуск миграций (если используются)
cd /var/www/charityfond/backend
# npm run migration:run  # Если есть скрипт миграций

# Или создание таблиц вручную
psql -U charityfond_user -d charityfond -f scripts/create-db.sql
```

## Управление приложением

### Просмотр статуса

```bash
pm2 status
pm2 logs
pm2 logs charityfond-backend
pm2 logs charityfond-frontend
```

### Перезапуск

```bash
pm2 restart all
# или
pm2 restart charityfond-backend
pm2 restart charityfond-frontend
```

### Обновление приложения

```bash
cd /var/www/charityfond

# Остановка процессов
pm2 stop all

# Обновление кода (через git или rsync)
git pull  # или rsync с локальной машины

# Пересборка
npm run build

# Запуск
pm2 start all
```

### Использование скрипта развертывания

```bash
cd /var/www/charityfond
chmod +x deploy/deploy.sh
./deploy/deploy.sh
```

## Настройка DNS

Убедитесь, что все домены указывают на IP сервера:

```
A запись:
charityfond.online -> 91.229.11.210
charityfond.ru -> 91.229.11.210
charityfond.store -> 91.229.11.210
творцыдобра.рф -> 91.229.11.210
творецдобра.рф -> 91.229.11.210
странадобра.рф -> 91.229.11.210
творцы-добра.рф -> 91.229.11.210
творец-добра.рф -> 91.229.11.210
страна-добра.рф -> 91.229.11.210
```

## Мониторинг

### Логи Nginx

```bash
sudo tail -f /var/log/nginx/charityfond-en.access.log
sudo tail -f /var/log/nginx/charityfond-en.error.log
sudo tail -f /var/log/nginx/charityfond-ru.access.log
sudo tail -f /var/log/nginx/charityfond-ru.error.log
```

### Логи PM2

```bash
pm2 logs
pm2 monit
```

## Безопасность

1. **Firewall**: Настройте UFW или iptables
```bash
sudo ufw allow 22/tcp   # SSH
sudo ufw allow 80/tcp   # HTTP
sudo ufw allow 443/tcp  # HTTPS
sudo ufw enable
```

2. **Обновления**: Регулярно обновляйте систему
```bash
sudo apt update && sudo apt upgrade -y
```

3. **Резервные копии**: Настройте автоматическое резервное копирование базы данных

## Устранение неполадок

### Приложение не запускается

1. Проверьте логи: `pm2 logs`
2. Проверьте переменные окружения
3. Проверьте, что порты 3000 и 3001 свободны: `netstat -tulpn | grep -E '3000|3001'`

### Nginx не работает

1. Проверьте конфигурацию: `sudo nginx -t`
2. Проверьте логи: `sudo tail -f /var/log/nginx/error.log`
3. Проверьте, что Nginx запущен: `sudo systemctl status nginx`

### Проблемы с SSL

1. Проверьте сертификаты: `sudo certbot certificates`
2. Обновите сертификаты: `sudo certbot renew`

## Поддержка

При возникновении проблем проверьте:
- Логи PM2: `pm2 logs`
- Логи Nginx: `/var/log/nginx/`
- Статус сервисов: `systemctl status nginx`, `systemctl status postgresql`, `systemctl status redis`

