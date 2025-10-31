#!/bin/bash

echo "🚀 Генерация типизированного API клиента..."

# Переходим в директорию бэкенда
cd "$(dirname "$0")"

# Запускаем бэкенд в фоне для генерации OpenAPI спецификации
echo "📡 Запуск бэкенда для генерации OpenAPI спецификации..."
npm run start:dev &
BACKEND_PID=$!

# Ждем запуска бэкенда
echo "⏳ Ожидание запуска бэкенда..."
sleep 10

# Проверяем, что бэкенд запустился
if ! curl -f http://localhost:3001/api/v1/health > /dev/null 2>&1; then
    echo "❌ Бэкенд не запустился. Проверьте настройки."
    kill $BACKEND_PID 2>/dev/null
    exit 1
fi

echo "✅ Бэкенд запущен. Генерация OpenAPI спецификации..."

# Генерируем клиент
npm run generate:client

# Останавливаем бэкенд
echo "🛑 Остановка бэкенда..."
kill $BACKEND_PID 2>/dev/null

echo "✅ Генерация завершена! API клиент создан в frontend/src/generated/api"
