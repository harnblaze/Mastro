# 🚀 Инструкция по деплою Mastro на VPS (Ubuntu)

Это руководство поможет вам развернуть проект Mastro на VPS сервере с Ubuntu.

## 📋 Предварительные требования

- VPS сервер с Ubuntu 20.04+ или Ubuntu 22.04+
- Root доступ или пользователь с sudo правами
- Домен, настроенный на IP адрес сервера (опционально, но рекомендуется)
- Минимум 1 GB RAM, 10 GB свободного места на диске
- Репозиторий на GitHub (или другом Git-хостинге)

## 🎯 План действий

### 1. Первоначальная настройка сервера

Подключитесь к серверу по SSH и выполните скрипт первоначальной настройки:

```bash
# Клонируйте репозиторий во временную директорию
git clone <your-repo-url> /tmp/mastro
cd /tmp/mastro

# Запустите скрипт настройки (требует sudo)
sudo bash scripts/setup-server.sh
```

Скрипт установит:
- Node.js 18.x
- Docker и Docker Compose
- Nginx
- PM2 (опционально)
- Создаст пользователя `mastro`
- Настроит firewall

**Важно:** После установки Docker, выйдите из SSH и зайдите снова, чтобы изменения группы docker вступили в силу.

### 2. Клонирование проекта

```bash
# Клонируйте проект в рабочую директорию
sudo git clone <your-repo-url> /var/www/mastro
sudo chown -R mastro:mastro /var/www/mastro
```

### 3. Настройка переменных окружения

#### Backend (.env)

Создайте файл `/var/www/mastro/backend/.env`:

```bash
sudo -u mastro nano /var/www/mastro/backend/.env
```

Заполните следующий шаблон:

```env
# База данных
DATABASE_URL="postgresql://mastro:ВАШ_ПАРОЛЬ@localhost:5432/mastro?schema=public"

# JWT
JWT_SECRET="сгенерируйте-случайную-строку-минимум-32-символа"
JWT_EXPIRES_IN="7d"

# CORS - укажите домен вашего фронтенда
CORS_ORIGINS="https://yourdomain.com,https://www.yourdomain.com"

# VK OAuth (если используется)
VK_CLIENT_ID="your-vk-client-id"
VK_CLIENT_SECRET="your-vk-client-secret"

# SMS (опционально)
SMS_API_KEY="your-sms-api-key"

# Email (опционально)
EMAIL_API_KEY="your-email-api-key"

# Environment
NODE_ENV="production"
PORT=3001
```

**Генерация JWT_SECRET:**
```bash
openssl rand -base64 32
```

#### Frontend (.env)

Создайте файл `/var/www/mastro/frontend/.env`:

```bash
sudo -u mastro nano /var/www/mastro/frontend/.env
```

```env
VITE_API_URL=https://yourdomain.com/api/v1
VITE_VK_APP_ID=your_vk_app_id
```

### 4. Настройка PostgreSQL через Docker

Создайте файл `.env` для docker-compose в корне проекта:

```bash
sudo -u mastro nano /var/www/mastro/.env.docker
```

```env
POSTGRES_DB=mastro
POSTGRES_USER=mastro
POSTGRES_PASSWORD=ВАШ_НАДЕЖНЫЙ_ПАРОЛЬ
```

Запустите PostgreSQL:

```bash
cd /var/www/mastro
sudo -u mastro docker-compose -f docker-compose.prod.yml --env-file .env.docker up -d postgres
```

Проверьте, что контейнер запущен:
```bash
docker ps
```

### 5. Настройка Systemd сервиса для Backend

```bash
# Скопируйте файл сервиса
sudo cp /var/www/mastro/scripts/mastro-backend.service /etc/systemd/system/

# Перезагрузите systemd
sudo systemctl daemon-reload

# Включите автозапуск
sudo systemctl enable mastro-backend
```

### 6. Первый деплой

```bash
# Переключитесь на пользователя mastro
sudo su - mastro

# Перейдите в директорию проекта
cd /var/www/mastro

# Запустите скрипт деплоя
bash scripts/deploy.sh
```

### 7. Настройка Nginx

```bash
# Скопируйте конфигурацию
sudo cp /var/www/mastro/scripts/nginx.conf.example /etc/nginx/sites-available/mastro

# Отредактируйте конфигурацию
sudo nano /etc/nginx/sites-available/mastro

# Замените yourdomain.com на ваш домен
# Если используете только IP, уберите SSL секции

# Создайте симлинк
sudo ln -s /etc/nginx/sites-available/mastro /etc/nginx/sites-enabled/

# Удалите дефолтную конфигурацию (если есть)
sudo rm /etc/nginx/sites-enabled/default

# Проверьте конфигурацию
sudo nginx -t

# Перезагрузите Nginx
sudo systemctl reload nginx
```

### 8. Настройка SSL (Let's Encrypt)

Если у вас есть домен:

```bash
# Установите Certbot
sudo apt-get install -y certbot python3-certbot-nginx

# Получите сертификат
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Настройте автообновление
sudo certbot renew --dry-run
```

### 9. Проверка работы

```bash
# Проверьте статус сервисов
sudo systemctl status mastro-backend
sudo systemctl status nginx
docker ps

# Проверьте логи backend
sudo journalctl -u mastro-backend -f

# Проверьте доступность API
curl http://localhost:3001/api/v1/health
```

## 🔄 Обновление проекта

Для обновления проекта после изменений в Git:

```bash
sudo su - mastro
cd /var/www/mastro
bash scripts/deploy.sh
```

Или если хотите пропустить установку зависимостей и сборку:

```bash
bash scripts/deploy.sh --skip-deps --skip-build
```

## 🛠 Полезные команды

### Управление сервисом backend

```bash
# Статус
sudo systemctl status mastro-backend

# Перезапуск
sudo systemctl restart mastro-backend

# Остановка
sudo systemctl stop mastro-backend

# Запуск
sudo systemctl start mastro-backend

# Логи
sudo journalctl -u mastro-backend -f
```

### Управление PostgreSQL

```bash
# Запуск
cd /var/www/mastro
sudo -u mastro docker-compose -f docker-compose.prod.yml --env-file .env.docker up -d postgres

# Остановка
sudo -u mastro docker-compose -f docker-compose.prod.yml stop postgres

# Логи
docker logs -f mastro-postgres

# Подключение к БД
docker exec -it mastro-postgres psql -U mastro -d mastro
```

### Применение миграций БД

```bash
sudo su - mastro
cd /var/www/mastro/backend
npx prisma migrate deploy
```

### Prisma Studio (GUI для БД)

```bash
sudo su - mastro
cd /var/www/mastro/backend
npx prisma studio
# Откройте http://yourdomain.com:5555 через SSH туннель
```

### Nginx

```bash
# Проверка конфигурации
sudo nginx -t

# Перезагрузка
sudo systemctl reload nginx

# Перезапуск
sudo systemctl restart nginx

# Логи
sudo tail -f /var/log/nginx/mastro-error.log
sudo tail -f /var/log/nginx/mastro-access.log
```

## 🔒 Безопасность

### Рекомендации:

1. **Firewall:** Убедитесь, что включен UFW и открыты только необходимые порты:
   ```bash
   sudo ufw status
   ```

2. **SSH:** Настройте SSH ключи вместо паролей

3. **Backup:** Регулярно делайте бэкапы БД:
   ```bash
   docker exec mastro-postgres pg_dump -U mastro mastro > backup_$(date +%Y%m%d).sql
   ```

4. **Обновления:** Регулярно обновляйте систему:
   ```bash
   sudo apt-get update && sudo apt-get upgrade -y
   ```

5. **Мониторинг:** Настройте мониторинг логов и метрик

## 📊 Мониторинг

### Проверка использования ресурсов

```bash
# CPU и память
htop

# Диск
df -h

# Docker контейнеры
docker stats
```

### Логи приложения

```bash
# Backend логи
sudo journalctl -u mastro-backend -n 100

# Nginx логи
sudo tail -f /var/log/nginx/mastro-access.log
sudo tail -f /var/log/nginx/mastro-error.log
```

## ❗ Решение проблем

### Backend не запускается

1. Проверьте логи: `sudo journalctl -u mastro-backend -n 50`
2. Проверьте `.env` файл
3. Проверьте подключение к БД: `docker ps`
4. Проверьте права на файлы: `ls -la /var/www/mastro/backend/dist`

### Nginx не работает

1. Проверьте конфигурацию: `sudo nginx -t`
2. Проверьте логи: `sudo tail -f /var/log/nginx/error.log`
3. Проверьте, что backend работает: `curl http://localhost:3001/api/v1/health`

### База данных недоступна

1. Проверьте контейнер: `docker ps`
2. Проверьте логи: `docker logs mastro-postgres`
3. Проверьте переменные окружения в `.env.docker`

## 📞 Поддержка

Если возникли проблемы:
1. Проверьте логи всех сервисов
2. Убедитесь, что все переменные окружения установлены правильно
3. Проверьте доступность всех портов

---

**Успешного деплоя! 🎉**

