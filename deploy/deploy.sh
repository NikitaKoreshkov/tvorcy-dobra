#!/bin/bash

# Скрипт развертывания для сервера
# Использование: ./deploy.sh

set -e  # Остановить при ошибке

echo "🚀 Начинаем развертывание Charity Fond..."

# Цвета для вывода
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Переменные
SERVER_IP="91.229.11.210"
DEPLOY_DIR="/var/www/charityfond"
BACKUP_DIR="/var/www/backups/charityfond"

# Функция для вывода сообщений
log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Проверка, что скрипт запущен на сервере
if [ "$(hostname -I | grep -o $SERVER_IP)" != "$SERVER_IP" ]; then
    log_warn "Этот скрипт должен быть запущен на сервере $SERVER_IP"
    log_info "Для развертывания с локальной машины используйте:"
    echo "  rsync -avz --exclude 'node_modules' --exclude '.next' --exclude 'dist' ./ root@$SERVER_IP:$DEPLOY_DIR/"
    exit 1
fi

# Создание директорий
log_info "Создание директорий..."
mkdir -p $DEPLOY_DIR
mkdir -p $BACKUP_DIR
mkdir -p /var/log/pm2

# Резервное копирование (если уже развернуто)
if [ -d "$DEPLOY_DIR/backend" ]; then
    log_info "Создание резервной копии..."
    BACKUP_NAME="backup-$(date +%Y%m%d-%H%M%S)"
    mkdir -p "$BACKUP_DIR/$BACKUP_NAME"
    cp -r $DEPLOY_DIR/* "$BACKUP_DIR/$BACKUP_NAME/" 2>/dev/null || true
    log_info "Резервная копия создана: $BACKUP_DIR/$BACKUP_NAME"
fi

# Переход в директорию проекта
cd $DEPLOY_DIR

# Остановка PM2 процессов
log_info "Остановка процессов..."
pm2 stop all 2>/dev/null || true
pm2 delete all 2>/dev/null || true

# Установка зависимостей
log_info "Установка зависимостей..."
cd $DEPLOY_DIR
npm install --production=false

cd $DEPLOY_DIR/frontend
npm install --production=false

cd $DEPLOY_DIR/backend
npm install --production=false

# Сборка проектов
log_info "Сборка фронтенда..."
cd $DEPLOY_DIR/frontend
npm run build

log_info "Сборка бэкенда..."
cd $DEPLOY_DIR/backend
npm run build

# Проверка наличия .env файлов
if [ ! -f "$DEPLOY_DIR/backend/.env" ]; then
    log_error "Файл backend/.env не найден!"
    log_info "Создайте его на основе deploy/.env.production.example"
    exit 1
fi

if [ ! -f "$DEPLOY_DIR/frontend/.env.local" ]; then
    log_warn "Файл frontend/.env.local не найден!"
    log_info "Создайте его на основе deploy/.env.production.example"
fi

# Запуск через PM2
log_info "Запуск приложений через PM2..."
cd $DEPLOY_DIR
pm2 start ecosystem.config.js
pm2 save

# Настройка автозапуска PM2
pm2 startup systemd -u root --hp /root

log_info "✅ Развертывание завершено!"
log_info "Проверьте статус: pm2 status"
log_info "Просмотр логов: pm2 logs"

