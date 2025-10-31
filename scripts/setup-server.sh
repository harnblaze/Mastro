#!/bin/bash

# Скрипт первоначальной настройки VPS сервера для деплоя Mastro
# Использование: bash scripts/setup-server.sh

set -e

echo "🚀 Начинаем настройку сервера для Mastro..."

# Проверка, что скрипт запущен от root или с sudo
if [ "$EUID" -ne 0 ]; then
	echo "❌ Пожалуйста, запустите скрипт с sudo"
	exit 1
fi

# Обновление системы
echo "📦 Обновление системы..."
apt-get update
apt-get upgrade -y

# Установка базовых зависимостей
echo "📦 Установка базовых зависимостей..."
apt-get install -y \
	curl \
	wget \
	git \
	build-essential \
	software-properties-common \
	apt-transport-https \
	ca-certificates \
	gnupg \
	lsb-release

# Установка Node.js 18.x
if ! command -v node &> /dev/null; then
	echo "📦 Установка Node.js..."
	curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
	apt-get install -y nodejs
fi

# Проверка версии Node.js
NODE_VERSION=$(node -v)
echo "✅ Node.js установлен: $NODE_VERSION"

# Установка npm (если не установлен)
if ! command -v npm &> /dev/null; then
	apt-get install -y npm
fi

# Установка Docker
if ! command -v docker &> /dev/null; then
	echo "📦 Установка Docker..."
	curl -fsSL https://get.docker.com -o get-docker.sh
	sh get-docker.sh
	rm get-docker.sh
	
	# Добавление текущего пользователя в группу docker
	if [ -n "$SUDO_USER" ]; then
		usermod -aG docker $SUDO_USER
		echo "✅ Пользователь $SUDO_USER добавлен в группу docker"
	else
		# Попытка определить пользователя другим способом
		USER=$(logname 2>/dev/null || echo "")
		if [ -n "$USER" ] && [ "$USER" != "root" ]; then
			usermod -aG docker $USER
			echo "✅ Пользователь $USER добавлен в группу docker"
		fi
	fi
fi

# Установка Docker Compose
if ! command -v docker-compose &> /dev/null; then
	echo "📦 Установка Docker Compose..."
	curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
	chmod +x /usr/local/bin/docker-compose
fi

# Установка Nginx
if ! command -v nginx &> /dev/null; then
	echo "📦 Установка Nginx..."
	apt-get install -y nginx
	systemctl enable nginx
fi

# Установка PM2 для управления процессами Node.js (опционально, альтернатива systemd)
if ! command -v pm2 &> /dev/null; then
	echo "📦 Установка PM2..."
	npm install -g pm2
fi

# Создание пользователя для приложения (если еще не создан)
APP_USER="mastro"
if ! id "$APP_USER" &>/dev/null; then
	echo "👤 Создание пользователя $APP_USER..."
	useradd -m -s /bin/bash $APP_USER
	usermod -aG docker $APP_USER
fi

# Создание директории для приложения
APP_DIR="/var/www/mastro"
mkdir -p $APP_DIR
chown -R $APP_USER:$APP_USER $APP_DIR

# Настройка firewall (UFW)
if command -v ufw &> /dev/null; then
	echo "🔥 Настройка firewall..."
	ufw --force enable
	ufw allow 22/tcp   # SSH
	ufw allow 80/tcp   # HTTP
	ufw allow 443/tcp  # HTTPS
	echo "✅ Firewall настроен"
fi

echo ""
echo "✅ Настройка сервера завершена!"
echo ""
echo "📝 Следующие шаги:"
echo "1. Клонируйте репозиторий: git clone <your-repo-url> $APP_DIR"
echo "2. Создайте файлы .env в backend/ и frontend/"
echo "3. Запустите скрипт деплоя: bash scripts/deploy.sh"
echo "4. Настройте Nginx (см. scripts/nginx.conf.example)"
echo "5. Настройте SSL сертификат (Let's Encrypt): certbot --nginx"

