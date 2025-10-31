#!/bin/bash

# Скрипт для автоматической генерации API клиента при изменениях
# Использование: ./watch-api-changes.sh

echo "🔍 Отслеживание изменений API..."

# Функция для генерации клиента
generate_client() {
    echo "🔄 Обнаружены изменения в API. Генерация клиента..."
    
    # Переходим в директорию бэкенда
    cd "$(dirname "$0")/backend"
    
    # Генерируем клиент
    npm run generate:client-only
    
    if [ $? -eq 0 ]; then
        echo "✅ API клиент успешно обновлен!"
        echo "📁 Файлы обновлены в frontend/src/generated/api/"
    else
        echo "❌ Ошибка при генерации клиента"
        exit 1
    fi
}

# Отслеживаем изменения в контроллерах и DTO
echo "👀 Отслеживание файлов:"
echo "  - backend/src/*/controllers/*.ts"
echo "  - backend/src/*/dto/*.ts"
echo "  - backend/src/main.ts"
echo ""
echo "Нажмите Ctrl+C для остановки"

# Используем fswatch для отслеживания изменений (если установлен)
if command -v fswatch &> /dev/null; then
    fswatch -o backend/src/*/controllers/*.ts backend/src/*/dto/*.ts backend/src/main.ts | while read; do
        generate_client
    done
else
    echo "⚠️  fswatch не установлен. Установите его для автоматического отслеживания:"
    echo "   brew install fswatch"
    echo ""
    echo "Пока что запускаем генерацию вручную..."
    generate_client
fi
