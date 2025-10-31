Проект: Местный сервис бронирования для самозанятых и мелких салонов
Цель: MVP мини‑приложение (VK Mini App + веб‑админка) для управления услугами, расписанием и записями клиентов.

Важно: этот документ — техническое и продуктовое спецификатор для реализации в Cursor IDE / любом другом окружении. Здесь — требования, API‑контракты, модель данных, UI‑флоу, интеграции и план работ.

1. Краткое описание продукта
Сервис позволяет мастерам и небольшим салонам:

быстро принимать записи от клиентов (через VK Mini App),
вести базу клиентов и историю посещений,
управлять расписанием и услугами,
отправлять напоминания и подтверждения.
Целевая аудитория: самозанятые (маникюр, парикмахер, массаж и т.д.), салоны 1–5 сотрудников.

MVP‑фокус: основная запись → подтверждение → напоминание + простая админ‑панель.

2. Обзор функционала (MVP)
Аутентификация мастера (VK OAuth via VK Bridge)
Профиль бизнеса (имя, адрес, часы работы, фото)
Управление услугами (title, duration, price, buffer)
Управление персоналом/staff (имя, услуги)
Управление расписанием / availability (рабочая неделя + исключения)
Форма записи для клиента (выбор услуги, мастера, время, имя, телефон)
Подтверждение/отмена записи (админ или клиент)
Уведомления: подтверждение + напоминание (VK push / SMS / email)
Админ‑панель: календарь/список записей, карточка клиента
Блокировка конфликтующих слотов (проверка пересечений)
Простейшая аналитика: число записей за период, список клиентов
3. Целевые метрики MVP
Конверсия визит→запись ≥ 5–10%
Количество записей/салон в неделю (пилот): ≥ 5
D7 retention владельцев/мастеров > 30%
NPS от пилотных пользователей ≥ 7
4. Технологический стек (предложение)
Frontend: React + TypeScript, VKUI, VK Bridge
State management: Reatom / Zustand (по выбору)
Backend: Node.js + TypeScript, NestJS/Express
DB: PostgreSQL, ORM: Prisma (реком.)
Auth: VK OAuth (VK Bridge); для веб — JWT
Notifications: VK Bridge (mini app), SMS (Twilio/SMS.ru), Email (SendGrid)
Payments (опционально): VK Pay / YooKassa
Analytics: PostHog / Amplitude
Error tracking: Sentry
CI/CD: GitHub Actions
Хостинг: Vercel (frontend), Railway/Render/AWS (backend + DB)
5. Архитектура данных (ER‑схема — основное)
User
id (uuid)
vk_id (string | null)
email
role: owner | staff
password_hash (nullable, если только VK)
created_at
Business
id
owner_id -> User.id
name
address
timezone
working_hours (json) — шаблон рабочей недели
created_at
Staff
id
business_id -> Business.id
name
phone (nullable)
services: array of Service.id (or join table)
Service
id
business_id
title
duration_minutes (int)
price (int)
buffer_before, buffer_after (minutes)
color (optional)
AvailabilityException
id
business_id
date
start_time (nullable)
end_time (nullable)
type: closed | open_custom
Client
id
business_id
name
phone
email
notes
created_at
Booking
id
business_id
service_id
staff_id
client_id (nullable for guest)
start_ts (timestamp)
end_ts (timestamp)
status: pending | confirmed | cancelled | completed | no_show
source: vk | web | admin
created_at
updated_at
Payment (опционально)
id
booking_id
amount
status: pending | paid | refunded
provider
created_at
NotificationLog
id
booking_id (nullable)
type: confirm | reminder | cancel | other
channel: vk | sms | email
status
sent_at
6. Основные флоу и sequence diagrams (текстово)
Регистрация мастера
Мастер открывает mini app → VK OAuth (VK Bridge) → получаем vk_id и профиль
Создаёт бизнес (настройка: услуги, рабочее время)
Система создаёт User + Business
Создание услуги / стэфа
Мастер добавляет Service (title, duration, price)
Можно создать Staff и привязать услуги
Клиентская запись
Клиент открывает карточку бизнеса (mini app / лендинг)
Выбирает услугу → список доступных временных слотов (с учётом работы мастера и других записей)
Выбирает слот → вводит имя + телефон → submit
Backend: создаёт Booking со статусом pending/confirmed (в зависимости от логики)
Уведомление: отправка подтверждения / рекомендация оплатить
Блокировка слота: при создании booking проверяем пересечения (status ≠ cancelled)
Подтверждение / отмена
Мастер видит pending → подтверждает или отменяет (в админке)
Клиент получает уведомление об изменении статуса
При отмене слот освобождается
Напоминания
Cron job / scheduler отправляет reminders (например, 24h, 2h до стартовой ts)
Mark NotificationLog
7. API — контракты (REST-подход, примеры JSON)
Базовый префикс: /api/v1

Аутентификация

POST /auth/vk — тело { vk_token } → возвращает { access_token, user }
POST /auth/login — { email, password } → { access_token, user }
Business

GET /businesses/:id → { business }
POST /businesses → { name, address, timezone } → { business }
PATCH /businesses/:id → обновление
Services

GET /businesses/:id/services
POST /businesses/:id/services → { title, duration_minutes, price, buffer_before, buffer_after }
PATCH /services/:id
DELETE /services/:id
Staff

GET /businesses/:id/staff
POST /businesses/:id/staff → { name, phone, service_ids }
PATCH /staff/:id
Availability

GET /businesses/:id/availability?date=YYYY-MM-DD → возвращает рабочие слоты с учётом исключений/записей
POST /businesses/:id/exceptions → { date, start_time, end_time, type }
Clients

GET /businesses/:id/clients
POST /businesses/:id/clients → { name, phone, email }
Bookings

GET /businesses/:id/bookings?from=&to=&staff_id=&status=
POST /businesses/:id/bookings → body:
{
service_id,
staff_id,
start_ts, // ISO string
client: { name, phone, email } // optional client_id instead
}
Response success: { booking: { id, status, start_ts, end_ts } }
PATCH /bookings/:id → { status } (confirm/cancel/complete)
DELETE /bookings/:id
Notifications

GET /businesses/:id/notification-templates
PATCH /businesses/:id/notification-templates
Errors

400 Bad Request (validation) { code: "VALIDATION_ERROR", messages: [...] }
409 Conflict (slot conflict) { code: "SLOT_CONFLICT", conflicting_booking }
401 Unauthorized
403 Forbidden
Примеры: создание booking
Request:
POST /api/v1/businesses/123/bookings
{
"service_id": "svc_1",
"staff_id": "staff_1",
"start_ts": "2025-11-15T12:00:00+03:00",
"client": { "name": "Анна", "phone": "+7 999 111 22 33" }
}

Response 201:
{
"booking": {
"id": "bk_123",
"status": "pending",
"start_ts": "2025-11-15T12:00:00+03:00",
"end_ts": "2025-11-15T12:45:00+03:00"
}
}

Error (slot conflict) 409:
{
"code": "SLOT_CONFLICT",
"message": "Выбранное время уже занято",
"conflicting_booking": { "id": "bk_122", "start_ts": "...", "status": "confirmed" }
}

8. Frontend — страницы / компоненты (VK Mini App + Web Admin)
VK Mini App (клиентская часть)

Home / BusinessCard: карточка бизнеса с услугами, контактами
ServiceList: список услуг + выбор мастера
SlotPicker: выбор даты/слота (влад. календарь)
BookingForm: имя, телефон, комментарий
BookingConfirmation: статус и кнопка «Добавить в календарь»
BookingList (для клиента): список своих записей (опционально)
Web Admin (для мастера/салона)

Dashboard: краткая статистика (записи сегодня, загрузка)
Calendar / Timeline: drag&drop (базовый) + фильтр по мастерам
BookingDetails modal: информация о клиенте, смена статуса
Services management
Staff management
Clients list / CRM
Settings: notifications, business hours, templates
Компоненты

Header / BottomNav (VKUI)
TimeSlot button
BookingCard
ConfirmationToast / Alerts
Forms + Validation (React Hook Form + zod)
9. Логика расписания — детали
Рассчитываем end_ts = start_ts + duration + buffer_after
При проверке конфликтов учитываем:
buffer_before и buffer_after у услуг
другие confirmed/pending bookings
availability exceptions (closed day)
Atomicity: использовать транзакции при создании брони; проверка и вставка в одной транзакции.
Резерв временный (optional): пометить booking status = locking, истекает через 3–5 минут если не подтверждён (оплата/подтверждение).
10. Уведомления и расписание задач
Scheduler (cron / background job)
Проверять bookings со статусом confirmed и отправлять reminders в определённые тайминги (24h, 2h)
Каналы:
VK push via VK Bridge (внутри mini app) — лучше для клиентов внутри VK
SMS (Twilio/SMS.ru)
Email (SendGrid)
Логи и ретраи: помечать попытки отправки, retry 1–2 раза при ошибке.
11. Безопасность и соответствие ПД
HTTPS для API и frontend
Хранение паролей — bcrypt/argon2
RBAC: доступ на бизнес‑данные только owner/staff
Согласие на обработку персональных данных: чекбокс при записи
Удаление/анонимизация данных по запросу
Минимизация хранения: хранить только необходимые поля
12. Dev / Deploy — локальная среда и переменные окружения
Переменные (пример)

DATABASE_URL=postgres://user:pass@host:5432/db
JWT_SECRET=...
VK_CLIENT_ID=...
VK_CLIENT_SECRET=...
SMS_API_KEY=...
EMAIL_API_KEY=...
SENTRY_DSN=...
NODE_ENV=development
Локальный запуск:

Postgres (docker compose)
Backend: npm install && npm run dev
Frontend: npm install && npm run start (использовать VK Bridge mock / dev mode)
Seed: скрипт создания тестового business + services
CI/CD:

Tests → build → deploy to staging (Railway/Vercel)
Миграции при deploy (Prisma migrate)
13. Тестирование
Unit: бизнес‑логика (проверка конфликтов слотов, расчёт end_ts)
Integration: API эндпоинты, авторизация
E2E: основная запись (Cypress / Playwright)
Load: базовые сценарии нагрузки (несколько сотен запросов/день — MVP не требует сильного масштабирования)
14. План релизов / milestones
Sprint 0 (1 неделя)

Исследование, интервью с 3–5 салонами
Прототип экранов + wireframes
Решение по стеку, инфраструктуре
Sprint 1 (2 недели)

Backend core: модели, миграции, auth (VK)
Services + Staff + Business CRUD
Simple frontend: настройка, карточка бизнеса, CRUD услуг
Sprint 2 (2 недели)

Bookings API и логика conflict checking
Frontend: слотпикер, форма записи
Notifications: базовая отправка (email mock)
Sprint 3 (1–2 недели)

Admin panel: calendar + booking details
Scheduler reminders
Testing, pilot onboarding (3 салона)
Sprint 4 (1–2 недели)

Improvements: UX, import/export, analytics
Пилотные исправления, сбор метрик
15. Acceptance criteria (MVP)
Мастер может авторизоваться через VK и создать бизнес
Мастер создаёт услуги и staff
Клиент может создать запись через mini app: получить подтверждение (201)
Система не позволяет создать пересекающуюся запись (возвращает 409)
Мастер видит запись в админке и может подтвердить/отменить
Напоминание отправляется за 24ч (log entry)
Данные клиентов сохраняются и видны в CRM
16. Edge cases и дополнительные требования
Часовые пояса: хранить timestamps в ISO + timezone бизнеса; вычислять доступные слоты в локальном времени бизнеса
Изменение услуги/длительности: не влиять на уже подтверждённые брони (запись фиксирует duration на момент создания)
Массовая отмена (например, закрытие на праздник) — создать availability exception и уведомить клиентов
Отказ от уведомлений: клиент может отказаться от SMS/email; на мобильном внутри VK — push будет доступен, если открыт mini app
17. UI / UX рекомендации (кратко)
Минимум полей в форме записи: имя + телефон (телефон маска + валидация)
Подсказки: «свободно на завтра: 10:00, 11:00…»
Быстрая запись: «записаться в один клик» для возвращённых клиентов
Календарь администратора — основной экран, быстрый фильтр по мастеру и дате
18. Checklist перед началом кодирования
Подтвердить MVP‑scope с пилотными салонами
Получить VK developer access + client_id, оплатить/настроить SMS/email
Создать репозиторий и CI
Подготовить DB schema и миграции
Подготовить wireframes основных экранов
19. Что я могу подготовить далее (при запросе)
Детализованный backlog (тикеты для 2‑недельных спринтов)
Полные API спецификации в OpenAPI/Swagger
Прототипы экранов (Figma/экспорт изображений)
SQL‑схему и Prisma schema
Скрипт интервью для пилотных салонов и шаблон лендинга