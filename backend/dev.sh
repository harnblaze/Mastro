#!/bin/bash

# Установка переменных окружения для разработки
export DATABASE_URL="file:./dev.db"
export JWT_SECRET="dev-secret-key"
export JWT_EXPIRES_IN="7d"
export NODE_ENV="development"
export PORT=3001

# Генерация Prisma клиента и миграции
echo "Генерация Prisma клиента..."
npx prisma generate

echo "Применение миграций..."
npx prisma migrate dev --name init

echo "Запуск сервера..."
npm run start:dev
