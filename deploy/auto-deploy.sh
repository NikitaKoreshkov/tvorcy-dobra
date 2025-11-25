#!/bin/bash

# Автоматический скрипт развертывания
# Использование: SSH_PASS='your_password' ./auto-deploy.sh
# Или: ./auto-deploy.sh (запросит пароль)

set -e

SERVER_IP="91.229.11.210"
SERVER_USER="root"
DEPLOY_DIR="/var/www/charityfond"
PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

log_info() { echo -e "${GREEN}[INFO]${NC} $1"; }
log_warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }

# Проверка SSH ключа
if [ -f "$HOME/.ssh/charityfond_server" ]; then
    # Проверяем, работает ли SSH ключ
    if ssh -i "$HOME/.ssh/charityfond_server" -o ConnectTimeout=5 -o StrictHostKeyChecking=no -o BatchMode=yes ${SERVER_USER}@${SERVER_IP} "echo 'OK'" 2>/dev/null; then
        log_info "SSH ключ работает, пароль не требуется"
        USE_SSH_KEY=true
    else
        USE_SSH_KEY=false
        if [ -z "$SSH_PASS" ]; then
            read -sp "Введите пароль для ${SERVER_USER}@${SERVER_IP}: " SSH_PASS
            echo ""
        fi
    fi
else
    USE_SSH_KEY=false
    if [ -z "$SSH_PASS" ]; then
        read -sp "Введите пароль для ${SERVER_USER}@${SERVER_IP}: " SSH_PASS
        echo ""
    fi
fi

# Проверка sshpass
if ! command -v sshpass &> /dev/null; then
    log_error "Установите sshpass: brew install hudochenkov/sshpass/sshpass"
    exit 1
fi

# Использование SSH ключа, если доступен, иначе пароль
if [ "$USE_SSH_KEY" = true ]; then
    SSH_CMD="ssh -i $HOME/.ssh/charityfond_server -o StrictHostKeyChecking=no ${SERVER_USER}@${SERVER_IP}"
else
    SSH_CMD="sshpass -p '$SSH_PASS' ssh -o StrictHostKeyChecking=no ${SERVER_USER}@${SERVER_IP}"
fi

log_info "=== Развертывание на ${SERVER_IP} ==="

# 1. Создание директорий
log_info "[1/7] Создание директорий..."
eval "$SSH_CMD" "mkdir -p ${DEPLOY_DIR} /var/www/backups/charityfond /var/log/pm2"

# 2. Загрузка кода
log_info "[2/7] Загрузка кода..."
if [ "$USE_SSH_KEY" = true ]; then
    rsync -avz --progress -e "ssh -i $HOME/.ssh/charityfond_server -o StrictHostKeyChecking=no" \
        --exclude 'node_modules' --exclude '.next' --exclude 'dist' \
        --exclude '.git' --exclude '*.log' --exclude '.env*' \
        --exclude 'tsconfig.tsbuildinfo' \
        "${PROJECT_DIR}/" "${SERVER_USER}@${SERVER_IP}:${DEPLOY_DIR}/"
else
    sshpass -p "$SSH_PASS" rsync -avz --progress \
        --exclude 'node_modules' --exclude '.next' --exclude 'dist' \
        --exclude '.git' --exclude '*.log' --exclude '.env*' \
        --exclude 'tsconfig.tsbuildinfo' \
        "${PROJECT_DIR}/" "${SERVER_USER}@${SERVER_IP}:${DEPLOY_DIR}/"
fi

# 3. Установка и сборка
log_info "[3/7] Установка зависимостей и сборка..."
eval "$SSH_CMD" "cd ${DEPLOY_DIR} && bash" << 'REMOTE_SCRIPT'
set -e
if ! command -v node &> /dev/null; then
    curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
    apt-get install -y nodejs
fi
if ! command -v pm2 &> /dev/null; then
    npm install -g pm2
fi
npm install --production=false
cd frontend && npm install --production=false && cd ..
cd backend && npm install --production=false && cd ..
cd frontend && npm run build && cd ..
cd backend && npm run build && cd ..
REMOTE_SCRIPT

# 4. Переменные окружения
log_info "[4/7] Настройка переменных окружения..."
eval "$SSH_CMD" "cd ${DEPLOY_DIR} && bash" << 'REMOTE_SCRIPT'
[ ! -f backend/.env ] && cp deploy/env.example backend/.env
[ ! -f frontend/.env.local ] && cp deploy/env.example frontend/.env.local
REMOTE_SCRIPT

# 5. Nginx
log_info "[5/7] Настройка Nginx..."
eval "$SSH_CMD" "bash" << 'REMOTE_SCRIPT'
set -e
if ! command -v nginx &> /dev/null; then
    apt-get update && apt-get install -y nginx
fi
cp /var/www/charityfond/deploy/nginx.conf /etc/nginx/sites-available/charityfond
[ ! -L /etc/nginx/sites-enabled/charityfond ] && ln -s /etc/nginx/sites-available/charityfond /etc/nginx/sites-enabled/charityfond
[ -L /etc/nginx/sites-enabled/default ] && rm /etc/nginx/sites-enabled/default
nginx -t && systemctl reload nginx
REMOTE_SCRIPT

# 6. PM2
log_info "[6/7] Настройка PM2..."
eval "$SSH_CMD" "cd ${DEPLOY_DIR} && bash" << 'REMOTE_SCRIPT'
cp deploy/ecosystem.config.js ./
pm2 stop all 2>/dev/null || true
pm2 delete all 2>/dev/null || true
pm2 start ecosystem.config.js
pm2 save
pm2 startup systemd -u root --hp /root 2>/dev/null || true
REMOTE_SCRIPT

# 7. Статус
log_info "[7/7] Проверка статуса..."
eval "$SSH_CMD" "pm2 status"

log_info ""
log_info "✅ Развертывание завершено!"
log_warn ""
log_warn "Следующие шаги:"
echo "  1. Настройте .env файлы на сервере"
echo "  2. Настройте PostgreSQL"
echo "  3. Получите SSL сертификаты"
echo "  4. Инициализируйте базу данных"

