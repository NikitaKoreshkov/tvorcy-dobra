# Быстрая настройка DNS и SSL

## IP сервера: 91.229.11.210

## Шаг 1: Настройка DNS (в панели регистратора доменов)

### Для каждого домена создайте A записи:

**Корневой домен:**
- Тип: **A**
- Имя: **@** (или оставьте пустым)
- Значение: **91.229.11.210**
- TTL: 3600

**Поддомен www:**
- Тип: **A**
- Имя: **www**
- Значение: **91.229.11.210**
- TTL: 3600

### Домены для настройки:

**Английские:**
- charityfond.online
- charityfond.ru
- charityfond.store

**Русские (.рф):**
- творцыдобра.рф
- творецдобра.рф
- странадобра.рф
- творцы-добра.рф
- творец-добра.рф
- страна-добра.рф

## Шаг 2: Проверка DNS (подождите 5-10 минут)

```bash
dig +short charityfond.online
# Должно вернуть: 91.229.11.210
```

Или онлайн: https://dnschecker.org

## Шаг 3: Получение SSL сертификатов

После настройки DNS выполните на сервере:

```bash
ssh root@91.229.11.210
check-dns-and-ssl.sh
```

Или вручную:

```bash
# Английские домены
certbot --nginx \
    -d charityfond.online -d www.charityfond.online \
    -d charityfond.ru -d www.charityfond.ru \
    -d charityfond.store -d www.charityfond.store \
    --non-interactive --agree-tos \
    --email cpvart@mail.ru --redirect

# Русские домены
certbot --nginx \
    -d творцыдобра.рф -d www.творцыдобра.рф \
    -d творецдобра.рф -d www.творецдобра.рф \
    -d странадобра.рф -d www.странадобра.рф \
    -d творцы-добра.рф -d www.творцы-добра.рф \
    -d творец-добра.рф -d www.творец-добра.рф \
    -d страна-добра.рф -d www.страна-добра.рф \
    --non-interactive --agree-tos \
    --email cpvart@mail.ru --redirect
```

## Готово! ✅

После получения сертификатов сайты будут доступны по HTTPS:
- https://charityfond.online
- https://творцыдобра.рф
- и т.д.


