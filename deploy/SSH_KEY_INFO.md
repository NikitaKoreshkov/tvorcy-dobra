# SSH Ключ для сервера

## Публичный ключ:

```
ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIAFnZjwbic78+w9dKZhxRsbeHQUyeWxM1HxauDj4NJHT charityfond-deploy
```

## Как добавить ключ на сервер:

### Способ 1: Через панель управления хостингом
1. Войдите в панель управления (Reg.ru, Timeweb и т.д.)
2. Найдите раздел "SSH ключи" или "Безопасность"
3. Добавьте новый ключ, вставив публичный ключ выше

### Способ 2: Через веб-терминал (если доступен)
```bash
mkdir -p ~/.ssh
chmod 700 ~/.ssh
echo "ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIAFnZjwbic78+w9dKZhxRsbeHQUyeWxM1HxauDj4NJHT charityfond-deploy" >> ~/.ssh/authorized_keys
chmod 600 ~/.ssh/authorized_keys
```

### Способ 3: Через SSH с паролем (если SSH порт открыт)
```bash
ssh root@91.229.11.210
# Введите пароль: 28041985qqq
mkdir -p ~/.ssh
chmod 700 ~/.ssh
echo "ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIAFnZjwbic78+w9dKZhxRsbeHQUyeWxM1HxauDj4NJHT charityfond-deploy" >> ~/.ssh/authorized_keys
chmod 600 ~/.ssh/authorized_keys
exit
```

## После добавления ключа:

Проверьте подключение:
```bash
ssh -i ~/.ssh/charityfond_server root@83.166.245.24
```

Если подключение работает без пароля, можно запустить развертывание:
```bash
cd /Users/nikitos/Desktop/donate
./deploy/auto-deploy.sh
```

Скрипт автоматически использует SSH ключ, если он доступен.

