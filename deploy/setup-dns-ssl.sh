#!/bin/bash

# Скрипт для настройки DNS и получения SSL сертификатов
# Использование: ./setup-dns-ssl.sh

set -e

SERVER_IP="91.229.11.210"
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

log_info() { echo -e "${GREEN}[INFO]${NC} $1"; }
log_warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }

log_info "=== Проверка DNS записей ==="
echo ""

# Английские домены
EN_DOMAINS=(
    "charityfond.online"
    "www.charityfond.online"
    "charityfond.ru"
    "www.charityfond.ru"
    "charityfond.store"
    "www.charityfond.store"
)

# Русские домены
RU_DOMAINS=(
    "творцыдобра.рф"
    "www.творцыдобра.рф"
    "творецдобра.рф"
    "www.творецдобра.рф"
    "странадобра.рф"
    "www.странадобра.рф"
    "творцы-добра.рф"
    "www.творцы-добра.рф"
    "творец-добра.рф"
    "www.творец-добра.рф"
    "страна-добра.рф"
    "www.страна-добра.рф"
)

all_ok=true

log_info "Проверка английских доменов:"
for domain in "${EN_DOMAINS[@]}"; do
    ip=$(dig +short "$domain" 2>/dev/null | tail -1)
    if [ "$ip" = "$SERVER_IP" ]; then
        echo "  ✅ $domain -> $ip"
    elif [ -n "$ip" ]; then
        echo "  ⚠️  $domain -> $ip (ожидается $SERVER_IP)"
        all_ok=false
    else
        echo "  ❌ $domain -> не резолвится"
        all_ok=false
    fi
done

echo ""
log_info "Проверка русских доменов:"
for domain in "${RU_DOMAINS[@]}"; do
    ip=$(dig +short "$domain" 2>/dev/null | tail -1)
    if [ "$ip" = "$SERVER_IP" ]; then
        echo "  ✅ $domain -> $ip"
    elif [ -n "$ip" ]; then
        echo "  ⚠️  $domain -> $ip (ожидается $SERVER_IP)"
        all_ok=false
    else
        echo "  ❌ $domain -> не резолвится"
        all_ok=false
    fi
done

echo ""
if [ "$all_ok" = false ]; then
    log_warn "Некоторые DNS записи не настроены правильно!"
    echo ""
    log_info "Настройте DNS записи в панели управления доменами:"
    echo ""
    echo "Для всех доменов создайте A записи:"
    echo "  Тип: A"
    echo "  Имя: @ (или оставьте пустым для корневого домена)"
    echo "  Значение: $SERVER_IP"
    echo "  TTL: 3600 (или автоматически)"
    echo ""
    echo "Для поддоменов www создайте A записи:"
    echo "  Тип: A"
    echo "  Имя: www"
    echo "  Значение: $SERVER_IP"
    echo "  TTL: 3600"
    echo ""
    log_warn "После настройки DNS подождите 5-10 минут для распространения записей"
    log_warn "Затем запустите этот скрипт снова для получения SSL сертификатов"
    exit 1
fi

log_info "✅ Все DNS записи настроены правильно!"
echo ""

# Получение SSL сертификатов
log_info "=== Получение SSL сертификатов ==="

# Английские домены
log_info "Получение сертификатов для английских доменов..."
certbot --nginx \
    -d charityfond.online \
    -d www.charityfond.online \
    -d charityfond.ru \
    -d www.charityfond.ru \
    -d charityfond.store \
    -d www.charityfond.store \
    --non-interactive \
    --agree-tos \
    --email cpvart@mail.ru \
    --redirect 2>&1 | tail -20

# Русские домены (может потребоваться ручная настройка)
log_info ""
log_info "Попытка получения сертификатов для русских доменов..."
certbot --nginx \
    -d творцыдобра.рф \
    -d www.творцыдобра.рф \
    -d творецдобра.рф \
    -d www.творецдобра.рф \
    -d странадобра.рф \
    -d www.странадобра.рф \
    -d творцы-добра.рф \
    -d www.творцы-добра.рф \
    -d творец-добра.рф \
    -d www.творец-добра.рф \
    -d страна-добра.рф \
    -d www.страна-добра.рф \
    --non-interactive \
    --agree-tos \
    --email cpvart@mail.ru \
    --redirect 2>&1 | tail -20 || log_warn "Не удалось получить сертификаты для русских доменов (может потребоваться DNS challenge)"

echo ""
log_info "=== Проверка полученных сертификатов ==="
certbot certificates

echo ""
log_info "=== Перезагрузка Nginx ==="
systemctl reload nginx

echo ""
log_info "✅ Настройка завершена!"
log_info "Проверьте сайты:"
echo "  https://charityfond.online"
echo "  https://charityfond.ru"
echo "  https://charityfond.store"


