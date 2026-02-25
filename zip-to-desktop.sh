#!/bin/bash
# Скрипт: создаёт zip всей папки «пожертвования» на рабочем столе
# Запуск: в Терминале выполнить: bash "/Users/nikitos/Desktop/All works/kwork/пожертвования/zip-to-desktop.sh"

set -e
DESKTOP="/Users/nikitos/Desktop"
SOURCE="/Users/nikitos/Desktop/All works/kwork/пожертвования"
ZIPNAME="пожертвования.zip"
OUTPUT="$DESKTOP/$ZIPNAME"

echo "Создаю архив: $OUTPUT"
echo "Источник: $SOURCE"
echo "Подождите, это может занять несколько минут (включая node_modules)..."

cd "/Users/nikitos/Desktop/All works/kwork"
zip -r "$OUTPUT" "пожертвования" -x "*.DS_Store"

echo ""
echo "Готово. Архив: $OUTPUT"
ls -lh "$OUTPUT"
