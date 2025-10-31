# Mastro - Сервис бронирования для самозанятых и салонов

MVP мини-приложение (VK Mini App + веб-админка) для управления услугами, расписанием и записями клиентов.

## 🚀 Быстрый старт

### Монорепо и node_modules

Проект использует npm workspaces (корневой `package.json` указывает на `backend` и `frontend`). Рекомендуется устанавливать зависимости только из корня командой `npm install`. Это создаёт общую папку `node_modules` в корне и предотвращает дублирование в `backend/node_modules` и `frontend/node_modules`. Скрипт `install:all` в корне запускает установки и в подпапках — он полезен для изолированных окружений, но создаёт дубликаты зависимостей.

### Предварительные требования

- Node.js 18+
- npm или yarn
- SQLite (для разработки)

### Установка и запуск

1. **Клонируйте репозиторий**
```bash
git clone <repository-url>
cd Mastro
```

2. **Установите зависимости**
```bash
# Рекомендуемый способ (workspaces)
npm install

# Не рекомендуется (создаёт дубликаты node_modules)
# cd backend && npm install
# cd ../frontend && npm install
```

3. **Настройте базу данных**
```bash
cd backend
npm run db:setup
```

4. **Запустите приложение**

Единая команда из корня (поднимет backend и frontend параллельно):
```bash
npm run dev
```

5. **Откройте приложение**
- Frontend: http://localhost:5173
- Backend API: http://localhost:3001
- API Health Check: http://localhost:3001/api/v1/health

### Скрипты (корень)

```bash
npm run dev            # Запуск backend и frontend параллельно
npm run build          # Сборка backend и frontend
npm run build:backend  # Сборка только backend
npm run build:frontend # Сборка только frontend
npm run db:migrate     # Prisma migrate dev (SQLite по умолчанию)
npm run db:generate    # Prisma generate
npm run db:studio      # Prisma Studio
npm run generate:api   # Генерация клиента в frontend/src/generated/api
npm run watch:api      # Отслеживание изменений API (требуется fswatch)
```

## 🔑 Тестовые данные

После выполнения `npm run db:setup` будут созданы тестовые данные:

**Пользователь для входа:**
- Email: `test@example.com`
- Пароль: `password`

**Тестовый бизнес:**
- Название: "Салон красоты Элегант"
- Адрес: ул. Тверская, 15, Москва
- Услуги: маникюр, педикюр, стрижка, окрашивание
- Сотрудники: Анна Петрова, Мария Иванова

## 📱 Функциональность

### Для владельцев бизнеса (Админ-панель)
- ✅ Аутентификация через VK или email/password
- ✅ Управление профилем бизнеса
- ✅ Создание и редактирование услуг
- ✅ Управление сотрудниками
- ✅ Настройка рабочего расписания
- ✅ Просмотр и управление записями
- ✅ База клиентов (CRM)
- ✅ Система уведомлений
- ✅ Шаблоны уведомлений

### Для клиентов (VK Mini App)
- ✅ Просмотр услуг и цен
- ✅ Выбор мастера
- ✅ Выбор доступного времени
- ✅ Создание записи
- ✅ Получение подтверждений

## 🛠 Технологический стек

### Backend
- **Framework**: NestJS + TypeScript
- **Database**: SQLite (dev) / PostgreSQL (prod)
- **ORM**: Prisma
- **Auth**: JWT + VK OAuth
- **API**: REST

### Frontend
- **Framework**: React + TypeScript
- **UI Library**: VKUI
- **Routing**: React Router
- **State**: Context API
- **Build**: Vite

### Интеграции
- **VK**: VK Bridge API для авторизации и уведомлений
- **Notifications**: SMS, Email, VK Push
- **Payments**: VK Pay (планируется)

## 📁 Структура проекта

```
Mastro/
├── backend/                 # NestJS API
│   ├── src/
│   │   ├── auth/           # Авторизация и VK интеграция
│   │   ├── business/       # Управление бизнесом
│   │   ├── bookings/       # Записи и слоты
│   │   ├── services/       # Услуги
│   │   ├── staff/          # Сотрудники
│   │   ├── clients/        # Клиенты
│   │   ├── notifications/  # Уведомления
│   │   └── prisma/         # База данных
│   └── prisma/
│       ├── schema.prisma   # Схема БД
│       └── seed.ts         # Тестовые данные
├── frontend/               # React приложение
│   ├── src/
│   │   ├── components/    # UI компоненты
│   │   ├── pages/         # Страницы
│   │   ├── contexts/      # React Context
│   │   ├── services/      # API клиент
│   │   ├── hooks/         # Custom hooks
│   │   └── types/         # TypeScript типы
└── README.md
```

## 🔧 Разработка

### Полезные команды

**Backend (внутри папки backend):**
```bash
npm run start:dev      # Запуск в режиме разработки
npm run build          # Сборка
npm run test           # Тесты
npm run lint           # Линтинг
npm run prisma:studio  # Prisma Studio (GUI для БД)
```

**Frontend (внутри папки frontend):**
```bash
npm run dev            # Запуск в режиме разработки
npm run build          # Сборка
npm run preview        # Предварительный просмотр сборки
npm run lint           # Линтинг
```

**База данных:**
```bash
npm run db:setup       # Полная настройка БД
npm run prisma:migrate # Создание миграций
npm run prisma:seed    # Заполнение тестовыми данными
```

### Переменные окружения

Создайте файл `.env` в папке `backend` (можно взять за основу `backend/env.example`):

```env
# База данных
DATABASE_URL="file:./dev.db"

# JWT
JWT_SECRET="your-super-secret-jwt-key"

# VK API (опционально)
VK_CLIENT_ID="your-vk-app-id"
VK_CLIENT_SECRET="your-vk-app-secret"
VK_ACCESS_TOKEN="your-vk-access-token"

# SMS (опционально)
SMS_API_KEY="your-sms-provider-key"

# Email (опционально)
EMAIL_API_KEY="your-email-provider-key"

# Режим
NODE_ENV="development"
PORT=3001
```

Создайте файл `.env` в папке `frontend` (см. `frontend/env.example`):
```env
VITE_API_URL=http://localhost:3001/api/v1
VITE_VK_APP_ID=your_vk_app_id
```

### Генерация клиента из OpenAPI

В dev‑режиме backend экспортирует спецификацию в `backend/dist/openapi.json`. Сгенерировать TypeScript‑клиент:

```bash
# Однократно
npm run generate:api

# Следить за изменениями (требуется fswatch: brew install fswatch)
npm run watch:api
```

## 📋 API Документация

### Основные эндпоинты

**Аутентификация:**
- `POST /api/v1/auth/vk` - VK авторизация
- `POST /api/v1/auth/login` - Вход по email/password
- `POST /api/v1/auth/register` - Регистрация

**Бизнес:**
- `GET /api/v1/businesses` - Список бизнесов пользователя
- `POST /api/v1/businesses` - Создание бизнеса
- `GET /api/v1/businesses/:id` - Получение бизнеса
- `PATCH /api/v1/businesses/:id` - Обновление бизнеса

**Услуги:**
- `GET /api/v1/businesses/:id/services` - Список услуг
- `POST /api/v1/businesses/:id/services` - Создание услуги
- `PATCH /api/v1/services/:id` - Обновление услуги
- `DELETE /api/v1/services/:id` - Удаление услуги

**Записи:**
- `GET /api/v1/businesses/:id/bookings` - Список записей
- `POST /api/v1/businesses/:id/bookings` - Создание записи
- `GET /api/v1/businesses/:id/bookings/available-slots` - Доступные слоты
- `PATCH /api/v1/bookings/:id` - Обновление записи

## 🚀 Деплой

### Вариант A: Backend + PostgreSQL (локально или в облаке)
1. Поднимите PostgreSQL. Локально можно использовать `docker-compose.yml` в корне:
   ```bash
   docker compose up -d postgres
   ```
2. Настройте `backend/.env` (см. `backend/env.example`):
   ```env
   DATABASE_URL="postgresql://mastro:mastro123@localhost:5432/mastro?schema=public"
   NODE_ENV="production"
   PORT=3001
   JWT_SECRET="change-me"
   ```
3. Примените миграции в продакшен-режиме:
   ```bash
   cd backend
   npx prisma migrate deploy
   ```
4. Соберите и запустите backend:
   ```bash
   cd backend && npm ci && npm run build && npm run start:prod
   ```

### Вариант B: Frontend на статическом хостинге (Vercel/S3/Cloudflare Pages)
1. Установите `VITE_API_URL` так, чтобы он указывал на ваш прод‑backend (например, `https://api.example.com/api/v1`).
2. Соберите фронтенд и задеплойте содержимое `frontend/dist`:
   ```bash
   cd frontend && npm ci && npm run build
   ```

### Домены и CORS
В продакшене добавьте ваш домен фронтенда в CORS (см. `backend/src/main.ts`).

### База данных
- Dev по умолчанию: SQLite (`file:./dev.db`).
- Продакшен: рекомендуется PostgreSQL + `npx prisma migrate deploy`.

## 🤝 Вклад в проект

1. Fork репозитория
2. Создайте feature branch: `git checkout -b feature/amazing-feature`
3. Commit изменения: `git commit -m 'Add amazing feature'`
4. Push в branch: `git push origin feature/amazing-feature`
5. Создайте Pull Request

## 📄 Лицензия

Этот проект лицензирован под MIT License.

## 📞 Поддержка

Если у вас есть вопросы или проблемы:
- Создайте Issue в GitHub
- Напишите на email: support@mastro.ru

---

**Mastro** - делаем бронирование простым и удобным! 🎉