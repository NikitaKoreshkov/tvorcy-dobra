#!/bin/bash

# Скрипт для развертывания с локальной машины на сервер
# Использование: ./remote-deploy.sh

set -e

SERVER_IP="91.229.11.210"
SERVER_USER="root"
DEPLOY_DIR="/var/www/charityfond"
PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Проверка SSH подключения
log_info "Проверка SSH подключения к серверу..."
if ! ssh -o ConnectTimeout=5 -o BatchMode=yes ${SERVER_USER}@${SERVER_IP} "echo 'OK'" 2>/dev/null; then
    log_warn "SSH ключ не настроен. Потребуется ввод пароля."
    log_info "Рекомендуется настроить SSH ключи для автоматического доступа:"
    echo "  ssh-copy-id ${SERVER_USER}@${SERVER_IP}"
fi

log_info "Начинаем развертывание на ${SERVER_IP}..."

# 1. Создание директорий на сервере
log_info "Создание директорий на сервере..."
ssh ${SERVER_USER}@${SERVER_IP} << 'ENDSSH'
mkdir -p /var/www/charityfond
mkdir -p /var/www/backups/charityfond
mkdir -p /var/log/pm2
ENDSSH

# 2. Загрузка кода на сервер
log_info "Загрузка кода на сервер (исключая node_modules, .next, dist)..."
rsync -avz --progress \
    --exclude 'node_modules' \
    --exclude '.next' \
    --exclude 'dist' \
    --exclude '.git' \
    --exclude '*.log' \
    --exclude '.env' \
    --exclude '.env.local' \
    --exclude '.env.production' \
    --exclude 'tsconfig.tsbuildinfo' \
    ${PROJECT_DIR}/ ${SERVER_USER}@${SERVER_IP}:${DEPLOY_DIR}/

# 3. Установка зависимостей и сборка на сервере
log_info "Установка зависимостей и сборка на сервере..."
ssh ${SERVER_USER}@${SERVER_IP} << ENDSSH
set -e
cd ${DEPLOY_DIR}

# Проверка Node.js
if ! command -v node &> /dev/null; then
    echo "Установка Node.js..."
    curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
    apt-get install -y nodejs
fi

# Проверка PM2
if ! command -v pm2 &> /dev/null; then
    echo "Установка PM2..."
    npm install -g pm2
fi

# Установка зависимостей
echo "Установка зависимостей..."
npm install --production=false || true
cd frontend && npm install --production=false && cd ..
cd backend && npm install --production=false && cd ..

# Сборка проектов
echo "Сборка фронтенда..."
cd frontend
npm run build || { echo "Ошибка сборки фронтенда"; exit 1; }
cd ..

echo "Сборка бэкенда..."
cd backend
npm run build || { echo "Ошибка сборки бэкенда"; exit 1; }
cd ..

echo "Сборка завершена!"
ENDSSH

# 4. Настройка переменных окружения (если не существуют)
log_info "Проверка переменных окружения..."
ssh ${SERVER_USER}@${SERVER_IP} << ENDSSH
cd ${DEPLOY_DIR}

if [ ! -f backend/.env ]; then
    echo "Создание backend/.env из примера..."
    cp deploy/env.example backend/.env || true
    echo "ВАЖНО: Отредактируйте backend/.env с правильными значениями!"
fi

if [ ! -f frontend/.env.local ]; then
    echo "Создание frontend/.env.local из примера..."
    cp deploy/env.example frontend/.env.local || true
    echo "ВАЖНО: Отредактируйте frontend/.env.local с правильными значениями!"
    echo "Убедитесь, что NEXT_PUBLIC_API_URL=https://charityfond.online/api"
fi
ENDSSH

# 5. Настройка Nginx
log_info "Настройка Nginx..."
ssh ${SERVER_USER}@${SERVER_IP} << 'ENDSSH'
set -e

# Проверка Nginx
if ! command -v nginx &> /dev/null; then
    echo "Установка Nginx..."
    apt-get update
    apt-get install -y nginx
fi

# Копирование конфигурации
cp /var/www/charityfond/deploy/nginx.conf /etc/nginx/sites-available/charityfond

# Создание симлинка
if [ ! -L /etc/nginx/sites-enabled/charityfond ]; then
    ln -s /etc/nginx/sites-available/charityfond /etc/nginx/sites-enabled/charityfond
fi

# Удаление дефолтной конфигурации (если нужно)
if [ -L /etc/nginx/sites-enabled/default ]; then
    rm /etc/nginx/sites-enabled/default
fi

# Проверка конфигурации
nginx -t

# Перезагрузка Nginx
systemctl reload nginx || systemctl restart nginx

echo "Nginx настроен!"
ENDSSH

# 6. Настройка PM2
log_info "Настройка PM2..."
ssh ${SERVER_USER}@${SERVER_IP} << ENDSSH
set -e
cd ${DEPLOY_DIR}

# Копирование конфигурации PM2
cp deploy/ecosystem.config.js ./

# Остановка старых процессов
pm2 stop all 2>/dev/null || true
pm2 delete all 2>/dev/null || true

# Запуск приложений
pm2 start ecosystem.config.js
pm2 save

# Настройка автозапуска
pm2 startup systemd -u root --hp /root 2>/dev/null || true

echo "PM2 настроен!"
ENDSSH

log_info "✅ Развертывание завершено!"
log_info ""
log_warn "ВАЖНО: Выполните следующие шаги вручную:"
echo "  1. Настройте переменные окружения:"
echo "     ssh ${SERVER_USER}@${SERVER_IP}"
echo "     nano ${DEPLOY_DIR}/backend/.env"
echo "     nano ${DEPLOY_DIR}/frontend/.env.local"
echo ""
echo "  2. Настройте базу данных PostgreSQL:"
echo "     sudo -u postgres psql"
echo "     CREATE DATABASE charityfond;"
echo "     CREATE USER charityfond_user WITH ENCRYPTED PASSWORD 'your_password';"
echo "     GRANT ALL PRIVILEGES ON DATABASE charityfond TO charityfond_user;"
echo ""
echo "  3. Получите SSL сертификаты:"
echo "     sudo certbot --nginx -d charityfond.online -d www.charityfond.online ..."
echo ""
echo "  4. Инициализируйте базу данных:"
echo "     cd ${DEPLOY_DIR}/backend"
echo "     psql -U charityfond_user -d charityfond -f scripts/create-db.sql"
echo ""
log_info "Проверьте статус: ssh ${SERVER_USER}@${SERVER_IP} 'pm2 status'"

