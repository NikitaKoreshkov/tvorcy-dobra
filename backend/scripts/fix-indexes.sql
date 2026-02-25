-- Скрипт для исправления проблем с индексами
-- Выполните этот скрипт в PostgreSQL, если возникают ошибки с существующими индексами

-- Удаляем старые индексы, если они существуют
DROP INDEX IF EXISTS "IDX_580f1dbf7bceb9c2cde8baf7ff";
DROP INDEX IF EXISTS "IDX_payment_methods_userId";
DROP INDEX IF EXISTS "IDX_payment_methods_fingerprint";
DROP INDEX IF EXISTS "IDX_transactions_userId";
DROP INDEX IF EXISTS "IDX_transactions_status";

-- TypeORM создаст индексы заново при следующем запуске

