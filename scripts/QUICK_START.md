# ⚡ Быстрый старт деплоя

## Пошаговая инструкция

### 1. Подключитесь к серверу по SSH

```bash
ssh root@your-server-ip
```

### 2. Запустите первоначальную настройку

```bash
# Клонируйте репозиторий (временно)
git clone <your-repo-url> /tmp/mastro
cd /tmp/mastro

# Запустите скрипт настройки
sudo bash scripts/setup-server.sh
```

**После завершения выйдите и войдите снова в SSH** (для применения группы docker)

### 3. Клонируйте проект в рабочую директорию

```bash
sudo git clone <your-repo-url> /var/www/mastro
sudo chown -R mastro:mastro /var/www/mastro
```

### 4. Настройте переменные окружения

#### Backend:
```bash
sudo -u mastro cp /var/www/mastro/backend/env.example /var/www/mastro/backend/.env
sudo -u mastro nano /var/www/mastro/backend/.env
```

**Важно заполнить:**
- `DATABASE_URL` - строка подключения к PostgreSQL
- `JWT_SECRET` - сгенерируйте: `openssl rand -base64 32`
- `CORS_ORIGINS` - ваш домен (например: `https://yourdomain.com`)
- `NODE_ENV=production`

#### Frontend:
```bash
sudo -u mastro cp /var/www/mastro/frontend/env.example /var/www/mastro/frontend/.env
sudo -u mastro nano /var/www/mastro/frontend/.env
```

**Заполните:**
- `VITE_API_URL=https://yourdomain.com/api/v1`

### 5. Настройте PostgreSQL

```bash
# Создайте .env.docker
sudo -u mastro nano /var/www/mastro/.env.docker
```

Добавьте:
```env
POSTGRES_DB=mastro
POSTGRES_USER=mastro
POSTGRES_PASSWORD=ВАШ_НАДЕЖНЫЙ_ПАРОЛЬ
```

Обновите `DATABASE_URL` в backend/.env с этим паролем.

Запустите PostgreSQL:
```bash
cd /var/www/mastro
sudo -u mastro docker-compose -f docker-compose.prod.yml --env-file .env.docker up -d postgres
```

### 6. Настройте Systemd сервис

```bash
sudo cp /var/www/mastro/scripts/mastro-backend.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable mastro-backend
```

### 7. Первый деплой

```bash
sudo su - mastro
cd /var/www/mastro
bash scripts/deploy.sh
```

### 8. Настройте Nginx

```bash
# Скопируйте и отредактируйте конфигурацию
sudo cp /var/www/mastro/scripts/nginx.conf.example /etc/nginx/sites-available/mastro
sudo nano /etc/nginx/sites-available/mastro
# Замените yourdomain.com на ваш домен

# Включите сайт
sudo ln -s /etc/nginx/sites-available/mastro /etc/nginx/sites-enabled/
sudo rm /etc/nginx/sites-enabled/default 2>/dev/null || true

# Проверьте и перезагрузите
sudo nginx -t
sudo systemctl reload nginx
```

### 9. Настройте SSL (опционально, если есть домен)

```bash
sudo apt-get install -y certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

### 10. Проверьте работу

```bash
# Статус сервисов
sudo systemctl status mastro-backend
sudo systemctl status nginx

# Тест API
curl http://localhost:3001/api/v1/health

# Откройте в браузере
# http://yourdomain.com или http://your-server-ip
```

## 🔄 Обновление

```bash
sudo su - mastro
cd /var/www/mastro
bash scripts/deploy.sh
```

## ❗ Проблемы?

См. полную документацию в `DEPLOY.md`

