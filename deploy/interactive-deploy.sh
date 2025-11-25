#!/bin/bash

# Интерактивный скрипт развертывания
# Запрашивает пароль для SSH

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

log_info "=== Развертывание Charity Fond на сервер ${SERVER_IP} ==="
echo ""
log_warn "Вам потребуется ввести пароль для SSH несколько раз"
echo ""

# Запрос пароля
read -sp "Введите пароль для root@${SERVER_IP}: " SSH_PASS
echo ""

# Функция для выполнения команд через SSH с паролем
ssh_cmd() {
    sshpass -p "$SSH_PASS" ssh -o StrictHostKeyChecking=no ${SERVER_USER}@${SERVER_IP} "$@"
}

# Функция для rsync с паролем
rsync_cmd() {
    sshpass -p "$SSH_PASS" rsync -avz --progress "$@"
}

# Проверка sshpass
if ! command -v sshpass &> /dev/null; then
    log_error "sshpass не установлен. Установите его:"
    echo "  macOS: brew install hudochenkov/sshpass/sshpass"
    echo "  Linux: sudo apt-get install sshpass"
    exit 1
fi

# 1. Создание директорий
log_info "1/7 Создание директорий на сервере..."
ssh_cmd "mkdir -p ${DEPLOY_DIR} /var/www/backups/charityfond /var/log/pm2" || {
    log_error "Не удалось создать директории. Проверьте пароль и доступ."
    exit 1
}

# 2. Загрузка кода
log_info "2/7 Загрузка кода на сервер..."
rsync_cmd \
    --exclude 'node_modules' \
    --exclude '.next' \
    --exclude 'dist' \
    --exclude '.git' \
    --exclude '*.log' \
    --exclude '.env' \
    --exclude '.env.local' \
    --exclude '.env.production' \
    --exclude 'tsconfig.tsbuildinfo' \
    ${PROJECT_DIR}/ ${SERVER_USER}@${SERVER_IP}:${DEPLOY_DIR}/ || {
    log_error "Не удалось загрузить код."
    exit 1
}

# 3. Установка зависимостей и сборка
log_info "3/7 Установка зависимостей и сборка..."
ssh_cmd "cd ${DEPLOY_DIR} && bash -s" << 'ENDSSH'
set -e

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

# Сборка
echo "Сборка фронтенда..."
cd frontend && npm run build && cd ..
echo "Сборка бэкенда..."
cd backend && npm run build && cd ..
ENDSSH

# 4. Настройка переменных окружения
log_info "4/7 Настройка переменных окружения..."
ssh_cmd "cd ${DEPLOY_DIR} && bash -s" << 'ENDSSH'
if [ ! -f backend/.env ]; then
    cp deploy/env.example backend/.env || true
    echo "Создан backend/.env - отредактируйте его!"
fi
if [ ! -f frontend/.env.local ]; then
    cp deploy/env.example frontend/.env.local || true
    echo "Создан frontend/.env.local - отредактируйте его!"
    echo "ВАЖНО: Установите NEXT_PUBLIC_API_URL=https://charityfond.online/api"
fi
ENDSSH

# 5. Настройка Nginx
log_info "5/7 Настройка Nginx..."
ssh_cmd "bash -s" << 'ENDSSH'
set -e

if ! command -v nginx &> /dev/null; then
    apt-get update
    apt-get install -y nginx
fi

cp /var/www/charityfond/deploy/nginx.conf /etc/nginx/sites-available/charityfond
[ ! -L /etc/nginx/sites-enabled/charityfond ] && ln -s /etc/nginx/sites-available/charityfond /etc/nginx/sites-enabled/charityfond
[ -L /etc/nginx/sites-enabled/default ] && rm /etc/nginx/sites-enabled/default
nginx -t
systemctl reload nginx || systemctl restart nginx
ENDSSH

# 6. Настройка PM2
log_info "6/7 Настройка PM2..."
ssh_cmd "cd ${DEPLOY_DIR} && bash -s" << 'ENDSSH'
cp deploy/ecosystem.config.js ./
pm2 stop all 2>/dev/null || true
pm2 delete all 2>/dev/null || true
pm2 start ecosystem.config.js
pm2 save
pm2 startup systemd -u root --hp /root 2>/dev/null || true
ENDSSH

# 7. Проверка статуса
log_info "7/7 Проверка статуса..."
ssh_cmd "pm2 status"

log_info ""
log_info "✅ Развертывание завершено!"
log_warn ""
log_warn "ВАЖНО: Выполните следующие шаги:"
echo "  1. Настройте .env файлы:"
echo "     ssh ${SERVER_USER}@${SERVER_IP}"
echo "     nano ${DEPLOY_DIR}/backend/.env"
echo "     nano ${DEPLOY_DIR}/frontend/.env.local"
echo ""
echo "  2. Настройте PostgreSQL:"
echo "     sudo -u postgres psql"
echo "     CREATE DATABASE charityfond;"
echo "     CREATE USER charityfond_user WITH PASSWORD 'your_password';"
echo "     GRANT ALL PRIVILEGES ON DATABASE charityfond TO charityfond_user;"
echo ""
echo "  3. Получите SSL сертификаты:"
echo "     sudo certbot --nginx -d charityfond.online ..."
echo ""
echo "  4. Инициализируйте БД:"
echo "     cd ${DEPLOY_DIR}/backend"
echo "     psql -U charityfond_user -d charityfond -f scripts/create-db.sql"

