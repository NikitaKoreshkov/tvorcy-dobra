#!/bin/bash

# Скрипт для добавления SSH ключа на сервер
# Использование: ./add-ssh-key.sh

SERVER_IP="91.229.11.210"
SERVER_USER="root"
SSH_KEY_PATH="$HOME/.ssh/charityfond_server.pub"
SSH_PASS="28041985qqq"

echo "Добавление SSH ключа на сервер..."

# Проверка наличия ключа
if [ ! -f "$SSH_KEY_PATH" ]; then
    echo "Ошибка: SSH ключ не найден: $SSH_KEY_PATH"
    exit 1
fi

# Чтение публичного ключа
PUBLIC_KEY=$(cat "$SSH_KEY_PATH")

# Добавление ключа на сервер
sshpass -p "$SSH_PASS" ssh -o StrictHostKeyChecking=no ${SERVER_USER}@${SERVER_IP} << ENDSSH
mkdir -p ~/.ssh
chmod 700 ~/.ssh
echo "$PUBLIC_KEY" >> ~/.ssh/authorized_keys
chmod 600 ~/.ssh/authorized_keys
echo "SSH ключ успешно добавлен!"
ENDSSH

if [ $? -eq 0 ]; then
    echo "✅ SSH ключ успешно добавлен на сервер!"
    echo ""
    echo "Теперь можно подключаться без пароля:"
    echo "  ssh -i ~/.ssh/charityfond_server ${SERVER_USER}@${SERVER_IP}"
else
    echo "❌ Ошибка при добавлении ключа. Возможно, SSH недоступен."
    echo "Попробуйте добавить ключ вручную через панель управления хостингом."
fi

