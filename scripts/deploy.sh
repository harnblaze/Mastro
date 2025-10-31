#!/bin/bash

# Скрипт деплоя Mastro на продакшен сервер
# Использование: bash scripts/deploy.sh [--skip-deps] [--skip-build]

set -e

APP_DIR="/var/www/mastro"
APP_USER="mastro"
BACKEND_DIR="$APP_DIR/backend"
FRONTEND_DIR="$APP_DIR/frontend"

# Флаги
SKIP_DEPS=false
SKIP_BUILD=false

# Парсинг аргументов
for arg in "$@"; do
	case $arg in
		--skip-deps)
			SKIP_DEPS=true
			shift
			;;
		--skip-build)
			SKIP_BUILD=true
			shift
			;;
	esac
done

echo "🚀 Начинаем деплой Mastro..."

# Проверка, что мы в правильной директории
if [ ! -d "$BACKEND_DIR" ] || [ ! -d "$FRONTEND_DIR" ]; then
	echo "❌ Не найдены директории backend или frontend в $APP_DIR"
	echo "Убедитесь, что проект клонирован в $APP_DIR"
	exit 1
fi

# Переключение на пользователя приложения (если запущен от root/sudo)
if [ "$(id -u)" -eq 0 ]; then
	echo "⚠️  Запуск от имени пользователя $APP_USER..."
	exec sudo -u $APP_USER "$0" "$@"
fi

cd $APP_DIR

# Получение последних изменений из Git
echo "📥 Получение изменений из Git..."
git fetch origin
git reset --hard origin/main
git clean -fd

# Установка зависимостей
if [ "$SKIP_DEPS" = false ]; then
	echo "📦 Установка зависимостей..."
	npm ci
	
	# Генерация Prisma клиента
	echo "🔧 Генерация Prisma клиента..."
	cd $BACKEND_DIR
	npx prisma generate
	cd $APP_DIR
else
	echo "⏭️  Пропуск установки зависимостей"
fi

# Применение миграций БД
echo "🗄️  Применение миграций БД..."
cd $BACKEND_DIR
npx prisma migrate deploy
cd $APP_DIR

# Сборка проекта
if [ "$SKIP_BUILD" = false ]; then
	echo "🏗️  Сборка проекта..."
	
	# Сборка backend
	echo "  📦 Сборка backend..."
	cd $BACKEND_DIR
	npm run build
	cd $APP_DIR
	
	# Сборка frontend
	echo "  📦 Сборка frontend..."
	cd $FRONTEND_DIR
	npm run build
	cd $APP_DIR
else
	echo "⏭️  Пропуск сборки"
fi

# Перезапуск backend сервиса
echo "🔄 Перезапуск backend сервиса..."
sudo systemctl restart mastro-backend || echo "⚠️  Сервис mastro-backend не найден, пропуск"

# Перезагрузка Nginx
echo "🔄 Перезагрузка Nginx..."
sudo systemctl reload nginx || echo "⚠️  Nginx не настроен, пропуск"

echo ""
echo "✅ Деплой завершен успешно!"
echo ""
echo "📊 Проверка статуса:"
echo "  - Backend: sudo systemctl status mastro-backend"
echo "  - Nginx: sudo systemctl status nginx"
echo "  - Логи backend: sudo journalctl -u mastro-backend -f"

