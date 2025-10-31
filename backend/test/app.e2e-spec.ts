import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import { TestUtils } from './setup';

describe('E2E Tests - Complete User Flows', () => {
  let app: INestApplication;
  let prismaService: PrismaService;
  let testData: {
    user: { id: string; email: string };
    business: { id: string };
    service: { id: string };
    staff: { id: string };
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();

    // Настройка валидации для тестов
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );

    await app.init();

    prismaService = moduleFixture.get<PrismaService>(PrismaService);
    await TestUtils.cleanupDatabase(prismaService);
    testData = await TestUtils.seedTestData(prismaService);
  });

  afterAll(async () => {
    await TestUtils.cleanupDatabase(prismaService);
    await app.close();
  });

  describe('Complete Booking Flow', () => {
    let authToken: string;
    let businessId: string;
    let serviceId: string;
    let staffId: string;

    beforeAll(async () => {
      // Авторизация пользователя
      const loginResponse = await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({
          email: testData.user.email,
          password: 'password123',
        });

      authToken = loginResponse.body.access_token;
      businessId = testData.business.id;
      serviceId = testData.service.id;
      staffId = testData.staff.id;
    });

    it('должен выполнить полный флоу записи клиента', async () => {
      // Используем динамическую дату - следующий рабочий день
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const dateStr = tomorrow.toISOString().split('T')[0]; // YYYY-MM-DD

      // Шаг 1: Получаем доступные слоты
      const availabilityResponse = await request(app.getHttpServer())
        .get(`/api/v1/businesses/${businessId}/availability`)
        .query({
          serviceId,
          staffId,
          date: dateStr,
        })
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(availabilityResponse.body).toHaveProperty('slots');
      expect(Array.isArray(availabilityResponse.body.slots)).toBe(true);

      // Отладочная информация удалена

      expect(availabilityResponse.body.slots.length).toBeGreaterThan(0);

      const availableSlot = availabilityResponse.body.slots[0]; // Берем первый доступный слот
      const slotDateTime = `${dateStr}T${availableSlot.startTime}:00Z`;

      // Шаг 2: Создаем запись
      const createBookingDto = {
        serviceId,
        staffId,
        startTs: slotDateTime,
        client: {
          name: 'Елена Смирнова',
          phone: '+7 999 555 66 77',
          email: 'elena@example.com',
        },
      };

      const bookingResponse = await request(app.getHttpServer())
        .post(`/api/v1/businesses/${businessId}/bookings`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(createBookingDto)
        .expect(201);

      expect(bookingResponse.body).toHaveProperty('id');
      expect(bookingResponse.body.status).toBe('PENDING');
      expect(bookingResponse.body.client.name).toBe('Елена Смирнова');

      const bookingId = bookingResponse.body.id;

      // Шаг 3: Проверяем, что запись появилась в списке
      const bookingsResponse = await request(app.getHttpServer())
        .get(`/api/v1/businesses/${businessId}/bookings`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      const createdBooking = bookingsResponse.body.find(
        (b: any) => b.id === bookingId,
      );
      expect(createdBooking).toBeDefined();
      expect(createdBooking.status).toBe('PENDING');

      // Шаг 4: Подтверждаем запись
      const confirmResponse = await request(app.getHttpServer())
        .patch(`/api/v1/businesses/${businessId}/bookings/${bookingId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ status: 'CONFIRMED' })
        .expect(200);

      expect(confirmResponse.body.status).toBe('CONFIRMED');

      // Шаг 5: Проверяем, что слот больше недоступен
      const updatedAvailabilityResponse = await request(app.getHttpServer())
        .get(`/api/v1/businesses/${businessId}/availability`)
        .query({
          serviceId,
          staffId,
          date: dateStr,
        })
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(updatedAvailabilityResponse.body).not.toContain(availableSlot);

      // Шаг 6: Отменяем запись
      const cancelResponse = await request(app.getHttpServer())
        .patch(`/api/v1/businesses/${businessId}/bookings/${bookingId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ status: 'CANCELLED' })
        .expect(200);

      expect(cancelResponse.body.status).toBe('CANCELLED');

      // Шаг 7: Проверяем, что слот снова доступен
      const finalAvailabilityResponse = await request(app.getHttpServer())
        .get(`/api/v1/businesses/${businessId}/availability`)
        .query({
          serviceId,
          staffId,
          date: dateStr,
        })
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(finalAvailabilityResponse.body.slots).toContainEqual(
        availableSlot,
      );
    });

    it('должен обработать конфликт при попытке двойной записи', async () => {
      // Используем динамическое время - следующий рабочий день
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 2); // Через 2 дня чтобы избежать конфликтов
      const slotDateTime = tomorrow.toISOString();

      // Создаем первую запись
      const firstBooking = {
        serviceId,
        staffId,
        startTs: slotDateTime,
        client: {
          name: 'Первый клиент',
          phone: '+7 999 111 11 11',
        },
      };

      const firstResponse = await request(app.getHttpServer())
        .post(`/api/v1/businesses/${businessId}/bookings`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(firstBooking)
        .expect(201);

      // Пытаемся создать вторую запись на то же время
      const secondBooking = {
        serviceId,
        staffId,
        startTs: slotDateTime,
        client: {
          name: 'Второй клиент',
          phone: '+7 999 222 22 22',
        },
      };

      const conflictResponse = await request(app.getHttpServer())
        .post(`/api/v1/businesses/${businessId}/bookings`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(secondBooking)
        .expect(409);

      expect(conflictResponse.body).toHaveProperty('code', 'SLOT_CONFLICT');
      expect(conflictResponse.body).toHaveProperty('conflictingBooking');
      expect(conflictResponse.body.conflictingBooking.id).toBe(
        firstResponse.body.id,
      );

      // Очищаем - отменяем первую запись
      await request(app.getHttpServer())
        .patch(
          `/api/v1/businesses/${businessId}/bookings/${firstResponse.body.id}`,
        )
        .set('Authorization', `Bearer ${authToken}`)
        .send({ status: 'CANCELLED' })
        .expect(200);
    });
  });

  describe('Business Management Flow', () => {
    let authToken: string;

    beforeAll(async () => {
      const loginResponse = await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({
          email: testData.user.email,
          password: 'password123',
        });

      authToken = loginResponse.body.access_token;
    });

    it('должен выполнить полный флоу управления бизнесом', async () => {
      // Шаг 1: Создаем новый бизнес
      const createBusinessDto = {
        name: 'Новый салон красоты',
        address: 'ул. Новая, д. 1',
        timezone: 'Europe/Moscow',
        phone: '+7 999 888 77 66',
        email: 'new@salon.com',
        description: 'Современный салон красоты',
      };

      const businessResponse = await request(app.getHttpServer())
        .post('/api/v1/businesses')
        .set('Authorization', `Bearer ${authToken}`)
        .send(createBusinessDto)
        .expect(201);

      const newBusinessId = businessResponse.body.id;

      // Шаг 2: Создаем услугу
      const createServiceDto = {
        title: 'Маникюр + покрытие',
        durationMinutes: 90,
        price: 250000, // 2500 рублей
        bufferBefore: 5,
        bufferAfter: 10,
        color: '#FF6B6B',
      };

      const serviceResponse = await request(app.getHttpServer())
        .post(`/api/v1/businesses/${newBusinessId}/services`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(createServiceDto)
        .expect(201);

      const newServiceId = serviceResponse.body.id;

      // Шаг 3: Создаем сотрудника
      const createStaffDto = {
        name: 'Анна Мастерова',
        phone: '+7 999 777 66 55',
        serviceIds: [newServiceId],
      };

      const staffResponse = await request(app.getHttpServer())
        .post(`/api/v1/businesses/${newBusinessId}/staff`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(createStaffDto)
        .expect(201);

      const newStaffId = staffResponse.body.id;

      // Шаг 4: Проверяем, что все создано корректно
      const businessDetailsResponse = await request(app.getHttpServer())
        .get(`/api/v1/businesses/${newBusinessId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(businessDetailsResponse.body.name).toBe(createBusinessDto.name);
      expect(businessDetailsResponse.body.services).toHaveLength(1);
      expect(businessDetailsResponse.body.staff).toHaveLength(1);

      // Шаг 5: Обновляем информацию о бизнесе
      const updateBusinessDto = {
        name: 'Обновленный салон красоты',
        address: 'ул. Обновленная, д. 2',
      };

      const updateResponse = await request(app.getHttpServer())
        .patch(`/api/v1/businesses/${newBusinessId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateBusinessDto)
        .expect(200);

      expect(updateResponse.body.name).toBe(updateBusinessDto.name);
      expect(updateResponse.body.address).toBe(updateBusinessDto.address);

      // Шаг 6: Проверяем список всех бизнесов пользователя
      const businessesListResponse = await request(app.getHttpServer())
        .get('/api/v1/businesses')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(businessesListResponse.body.length).toBeGreaterThanOrEqual(2);
      const updatedBusiness = businessesListResponse.body.find(
        (b: any) => b.id === newBusinessId,
      );
      expect(updatedBusiness.name).toBe(updateBusinessDto.name);
    });
  });

  describe('Client Management Flow', () => {
    let authToken: string;
    let businessId: string;

    beforeAll(async () => {
      const loginResponse = await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({
          email: testData.user.email,
          password: 'password123',
        });

      authToken = loginResponse.body.access_token;
      businessId = testData.business.id;
    });

    it('должен выполнить флоу управления клиентами', async () => {
      // Шаг 1: Создаем клиента
      const createClientDto = {
        name: 'Мария Петрова',
        phone: '+7 999 333 44 55',
        email: 'maria@example.com',
        notes: 'Предпочитает утренние записи',
      };

      const clientResponse = await request(app.getHttpServer())
        .post(`/api/v1/businesses/${businessId}/clients`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(createClientDto)
        .expect(201);

      const clientId = clientResponse.body.id;

      // Шаг 2: Проверяем список клиентов
      const clientsResponse = await request(app.getHttpServer())
        .get(`/api/v1/businesses/${businessId}/clients`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(clientsResponse.body.length).toBeGreaterThan(0);
      const createdClient = clientsResponse.body.find(
        (c: any) => c.id === clientId,
      );
      expect(createdClient.name).toBe(createClientDto.name);
      expect(createdClient.phone).toBe(createClientDto.phone);

      // Шаг 3: Создаем запись для этого клиента
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 3); // Через 3 дня чтобы избежать конфликтов
      const createBookingDto = {
        serviceId: testData.service.id,
        staffId: testData.staff.id,
        startTs: tomorrow.toISOString(),
        clientId, // Используем существующего клиента
      };

      const bookingResponse = await request(app.getHttpServer())
        .post(`/api/v1/businesses/${businessId}/bookings`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(createBookingDto)
        .expect(201);

      expect(bookingResponse.body.clientId).toBe(clientId);
      expect(bookingResponse.body.client.name).toBe(createClientDto.name);

      // Шаг 4: Проверяем историю записей клиента
      const clientBookingsResponse = await request(app.getHttpServer())
        .get(`/api/v1/businesses/${businessId}/bookings`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(clientBookingsResponse.body.length).toBeGreaterThan(0);
      const clientBooking = clientBookingsResponse.body.find(
        (b: any) => b.clientId === clientId,
      );
      expect(clientBooking).toBeDefined();
    });
  });

  describe('Error Handling', () => {
    it('должен корректно обрабатывать ошибки авторизации', async () => {
      // Попытка доступа без токена
      await request(app.getHttpServer()).get('/api/v1/businesses').expect(401);

      // Попытка доступа с неверным токеном
      await request(app.getHttpServer())
        .get('/api/v1/businesses')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);
    });

    it('должен корректно обрабатывать ошибки валидации', async () => {
      const loginResponse = await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({
          email: testData.user.email,
          password: 'password123',
        });

      const authToken = loginResponse.body.access_token;

      // Попытка создать бизнес с невалидными данными
      await request(app.getHttpServer())
        .post('/api/v1/businesses')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: '', // Пустое имя
          address: 'a'.repeat(1000), // Слишком длинный адрес
        })
        .expect(400);

      // Попытка создать услугу с отрицательной ценой
      await request(app.getHttpServer())
        .post(`/api/v1/businesses/${testData.business.id}/services`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Тестовая услуга',
          durationMinutes: -10, // Отрицательная длительность
          price: -1000, // Отрицательная цена
        })
        .expect(400);
    });

    it('должен корректно обрабатывать ошибки доступа', async () => {
      const loginResponse = await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({
          email: testData.user.email,
          password: 'password123',
        });

      const authToken = loginResponse.body.access_token;

      // Попытка доступа к несуществующему бизнесу
      await request(app.getHttpServer())
        .get('/api/v1/businesses/non-existent-id')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);

      // Попытка доступа к несуществующей записи
      await request(app.getHttpServer())
        .get('/api/v1/bookings/non-existent-id')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });
  });

  describe('Notifications Flow', () => {
    let authToken: string;
    let businessId: string;
    let bookingId: string;

    beforeAll(async () => {
      const loginResponse = await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({
          email: testData.user.email,
          password: 'password123',
        });

      authToken = loginResponse.body.access_token;
      businessId = testData.business.id;

      // Создаем запись для тестирования уведомлений
      const createBookingDto = {
        serviceId: testData.service.id,
        staffId: testData.staff.id,
        startTs: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Завтра
        client: {
          name: 'Клиент для уведомлений',
          phone: '+7 999 555 44 33',
          email: 'notifications@example.com',
        },
      };

      const bookingResponse = await request(app.getHttpServer())
        .post(`/api/v1/businesses/${businessId}/bookings`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(createBookingDto)
        .expect(201);

      bookingId = bookingResponse.body.id;
    });

    it('должен выполнить полный флоу уведомлений', async () => {
      // Шаг 1: Создаем уведомление о подтверждении записи
      const createNotificationDto = {
        bookingId,
        type: 'SMS',
        template: 'BOOKING_CONFIRMED',
      };

      const notificationResponse = await request(app.getHttpServer())
        .post(`/api/v1/businesses/${businessId}/notifications`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(createNotificationDto)
        .expect(201);

      expect(notificationResponse.body).toHaveProperty('id');
      expect(notificationResponse.body.type).toBe('SMS');
      expect(notificationResponse.body.template).toBe('BOOKING_CONFIRMED');
      expect(notificationResponse.body.status).toBe('PENDING');
      expect(notificationResponse.body.message).toContain('подтверждена');

      const notificationId = notificationResponse.body.id;

      // Шаг 2: Проверяем список уведомлений
      const notificationsResponse = await request(app.getHttpServer())
        .get(`/api/v1/businesses/${businessId}/notifications`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(Array.isArray(notificationsResponse.body)).toBe(true);
      const createdNotification = notificationsResponse.body.find(
        (n: any) => n.id === notificationId,
      );
      expect(createdNotification).toBeDefined();

      // Шаг 3: Создаем уведомление с кастомным сообщением
      const customNotificationDto = {
        bookingId,
        type: 'EMAIL',
        template: 'BOOKING_REMINDER',
        customMessage: 'Напоминание: завтра у вас запись в 14:00',
      };

      const customNotificationResponse = await request(app.getHttpServer())
        .post(`/api/v1/businesses/${businessId}/notifications`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(customNotificationDto)
        .expect(201);

      expect(customNotificationResponse.body.message).toBe(
        customNotificationDto.customMessage,
      );

      // Шаг 4: Фильтруем уведомления по типу
      const smsNotificationsResponse = await request(app.getHttpServer())
        .get(`/api/v1/businesses/${businessId}/notifications`)
        .query({ type: 'SMS' })
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(smsNotificationsResponse.body.length).toBeGreaterThan(0);
      smsNotificationsResponse.body.forEach((notification: any) => {
        expect(notification.type).toBe('SMS');
      });
    });

    it('должен обработать ошибки при создании уведомлений', async () => {
      // Попытка создать уведомление для несуществующей записи
      const invalidNotificationDto = {
        bookingId: 'non-existent-booking-id',
        type: 'SMS',
        template: 'BOOKING_CONFIRMED',
      };

      await request(app.getHttpServer())
        .post(`/api/v1/businesses/${businessId}/notifications`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidNotificationDto)
        .expect(400);

      // Попытка создать уведомление с невалидными данными
      const invalidDataDto = {
        bookingId,
        type: 'INVALID_TYPE',
        template: 'INVALID_TEMPLATE',
      };

      await request(app.getHttpServer())
        .post(`/api/v1/businesses/${businessId}/notifications`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidDataDto)
        .expect(400);
    });
  });

  describe('Availability Exceptions Flow', () => {
    let authToken: string;
    let businessId: string;

    beforeAll(async () => {
      const loginResponse = await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({
          email: testData.user.email,
          password: 'password123',
        });

      authToken = loginResponse.body.access_token;
      businessId = testData.business.id;
    });

    it('должен выполнить полный флоу управления исключениями расписания', async () => {
      // Используем динамическую дату - следующий рабочий день
      const closedDate = new Date();
      closedDate.setDate(closedDate.getDate() + 6); // Через 6 дней чтобы избежать конфликтов
      const closedDateStr = closedDate.toISOString().split('T')[0]; // YYYY-MM-DD

      // Шаг 1: Создаем исключение типа CLOSED
      const closedExceptionDto = {
        date: closedDateStr,
        type: 'CLOSED',
        reason: 'Выходной день',
      };

      const closedExceptionResponse = await request(app.getHttpServer())
        .post(`/api/v1/businesses/${businessId}/availability/exceptions`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(closedExceptionDto)
        .expect(201);

      expect(closedExceptionResponse.body).toHaveProperty('id');
      expect(closedExceptionResponse.body.type).toBe('CLOSED');
      expect(closedExceptionResponse.body.date).toMatch(
        new RegExp(closedDateStr),
      );
      expect(closedExceptionResponse.body.reason).toBe('Выходной день');

      const closedExceptionId = closedExceptionResponse.body.id;

      // Шаг 2: Создаем исключение типа OPEN_CUSTOM для другого рабочего дня
      const customDate = new Date();
      customDate.setDate(customDate.getDate() + 7); // Через 7 дней
      // Убеждаемся, что это рабочий день (понедельник-пятница)
      while (customDate.getDay() === 0 || customDate.getDay() === 6) {
        customDate.setDate(customDate.getDate() + 1);
      }
      const customDateStr = customDate.toISOString().split('T')[0]; // YYYY-MM-DD

      const customExceptionDto = {
        date: customDateStr,
        startTime: '11:00',
        endTime: '15:00',
        type: 'OPEN_CUSTOM',
        reason: 'Сокращенный рабочий день',
      };

      const customExceptionResponse = await request(app.getHttpServer())
        .post(`/api/v1/businesses/${businessId}/availability/exceptions`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(customExceptionDto)
        .expect(201);

      expect(customExceptionResponse.body.type).toBe('OPEN_CUSTOM');
      expect(customExceptionResponse.body.startTime).toBe('11:00');
      expect(customExceptionResponse.body.endTime).toBe('15:00');

      const customExceptionId = customExceptionResponse.body.id;

      // Шаг 3: Проверяем список исключений
      const exceptionsResponse = await request(app.getHttpServer())
        .get(`/api/v1/businesses/${businessId}/availability/exceptions`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(Array.isArray(exceptionsResponse.body)).toBe(true);
      expect(exceptionsResponse.body.length).toBeGreaterThanOrEqual(2);

      const closedException = exceptionsResponse.body.find(
        (e: any) => e.id === closedExceptionId,
      );
      const customException = exceptionsResponse.body.find(
        (e: any) => e.id === customExceptionId,
      );

      expect(closedException).toBeDefined();
      expect(customException).toBeDefined();

      // Шаг 4: Фильтруем исключения по дате (используем диапазон дат)
      const filteredExceptionsResponse = await request(app.getHttpServer())
        .get(`/api/v1/businesses/${businessId}/availability/exceptions`)
        .query({
          from: closedDateStr,
          to: customDateStr,
        })
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(filteredExceptionsResponse.body.length).toBeGreaterThanOrEqual(2);

      // Шаг 5: Проверяем влияние исключений на доступность
      const availabilityResponse = await request(app.getHttpServer())
        .get(`/api/v1/businesses/${businessId}/availability`)
        .query({
          serviceId: testData.service.id,
          staffId: testData.staff.id,
          date: closedDateStr, // Используем дату исключения CLOSED
        })
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(availabilityResponse.body.isWorkingDay).toBe(false);
      expect(availabilityResponse.body.slots).toHaveLength(1);
      expect(availabilityResponse.body.slots[0].isAvailable).toBe(false);
      expect(availabilityResponse.body.slots[0].reason).toBe('Выходной день');

      // Шаг 6: Проверяем доступность в день с кастомными часами
      const customAvailabilityResponse = await request(app.getHttpServer())
        .get(`/api/v1/businesses/${businessId}/availability`)
        .query({
          serviceId: testData.service.id,
          staffId: testData.staff.id,
          date: customDateStr, // Используем дату исключения OPEN_CUSTOM
        })
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(customAvailabilityResponse.body.isWorkingDay).toBe(true);
      expect(customAvailabilityResponse.body.slots.length).toBeGreaterThan(0);

      // Проверяем, что слоты в диапазоне 11:00-15:00
      customAvailabilityResponse.body.slots.forEach((slot: any) => {
        const [hours] = slot.startTime.split(':').map(Number);
        expect(hours).toBeGreaterThanOrEqual(11);
        expect(hours).toBeLessThan(15);
      });

      // Шаг 7: Удаляем исключения
      await request(app.getHttpServer())
        .delete(
          `/api/v1/businesses/${businessId}/availability/exceptions/${closedExceptionId}`,
        )
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      await request(app.getHttpServer())
        .delete(
          `/api/v1/businesses/${businessId}/availability/exceptions/${customExceptionId}`,
        )
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      // Шаг 8: Проверяем, что исключения удалены
      const finalExceptionsResponse = await request(app.getHttpServer())
        .get(`/api/v1/businesses/${businessId}/availability/exceptions`)
        .query({
          from: closedDateStr,
          to: customDateStr,
        })
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(finalExceptionsResponse.body.length).toBe(0);
    });

    it('должен обработать ошибки при работе с исключениями', async () => {
      // Попытка создать исключение с невалидными данными
      const invalidExceptionDto = {
        date: 'invalid-date',
        type: 'INVALID_TYPE',
      };

      await request(app.getHttpServer())
        .post(`/api/v1/businesses/${businessId}/availability/exceptions`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidExceptionDto)
        .expect(400);

      // Попытка удалить несуществующее исключение
      await request(app.getHttpServer())
        .delete(
          `/api/v1/businesses/${businessId}/availability/exceptions/non-existent-id`,
        )
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);

      // Попытка доступа к исключениям без авторизации
      await request(app.getHttpServer())
        .get(`/api/v1/businesses/${businessId}/availability/exceptions`)
        .expect(401);
    });
  });

  describe('Complex Business Scenarios', () => {
    let authToken: string;
    let businessId: string;

    beforeAll(async () => {
      const loginResponse = await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({
          email: testData.user.email,
          password: 'password123',
        });

      authToken = loginResponse.body.access_token;
      businessId = testData.business.id;
    });

    it('должен обработать сложный сценарий: массовая отмена записей', async () => {
      // Создаем несколько записей
      const bookings: any[] = [];
      for (let i = 0; i < 3; i++) {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 4 + i); // Через 4+ дней чтобы избежать конфликтов
        const createBookingDto = {
          serviceId: testData.service.id,
          staffId: testData.staff.id,
          startTs: tomorrow.toISOString(),
          client: {
            name: `Клиент ${i + 1}`,
            phone: `+7 999 000 ${i}${i} ${i}${i}`,
          },
        };

        const bookingResponse = await request(app.getHttpServer())
          .post(`/api/v1/businesses/${businessId}/bookings`)
          .set('Authorization', `Bearer ${authToken}`)
          .send(createBookingDto);

        bookings.push(bookingResponse.body);
      }

      // Создаем исключение CLOSED для всех дат
      const exceptionDate = new Date();
      exceptionDate.setDate(exceptionDate.getDate() + 4);
      const exceptionDto = {
        date: exceptionDate.toISOString().split('T')[0],
        type: 'CLOSED',
        reason: 'Массовая отмена - выходной день',
      };

      await request(app.getHttpServer())
        .post(`/api/v1/businesses/${businessId}/availability/exceptions`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(exceptionDto);

      // Отменяем все записи
      for (const booking of bookings) {
        await request(app.getHttpServer())
          .patch(`/api/v1/businesses/${businessId}/bookings/${booking.id}`)
          .set('Authorization', `Bearer ${authToken}`)
          .send({ status: 'CANCELLED' })
          .expect(200);
      }

      // Проверяем, что все записи отменены
      const bookingsResponse = await request(app.getHttpServer())
        .get(`/api/v1/businesses/${businessId}/bookings`)
        .query({ status: 'CANCELLED' })
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(bookingsResponse.body.length).toBeGreaterThanOrEqual(3);
      bookingsResponse.body.forEach((booking: any) => {
        expect(booking.status).toBe('CANCELLED');
      });

      // Проверяем, что слоты снова доступны
      const availabilityDate = new Date();
      availabilityDate.setDate(availabilityDate.getDate() + 7); // Через неделю чтобы избежать конфликтов
      const availabilityResponse = await request(app.getHttpServer())
        .get(`/api/v1/businesses/${businessId}/availability`)
        .query({
          serviceId: testData.service.id,
          staffId: testData.staff.id,
          date: availabilityDate.toISOString().split('T')[0], // Следующий день без исключений
        })
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(availabilityResponse.body.slots.length).toBeGreaterThan(0);
    });

    it('должен обработать сценарий: изменение расписания сотрудника', async () => {
      // Создаем нового сотрудника
      const createStaffDto = {
        name: 'Новый мастер',
        phone: '+7 999 888 77 66',
        serviceIds: [testData.service.id],
      };

      const staffResponse = await request(app.getHttpServer())
        .post(`/api/v1/businesses/${businessId}/staff`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(createStaffDto);

      const staffId = staffResponse.body.id;

      // Создаем запись для этого сотрудника
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 5); // Через 5 дней чтобы избежать конфликтов
      const createBookingDto = {
        serviceId: testData.service.id,
        staffId,
        startTs: tomorrow.toISOString(),
        client: {
          name: 'Клиент для нового мастера',
          phone: '+7 999 777 66 55',
        },
      };

      const bookingResponse = await request(app.getHttpServer())
        .post(`/api/v1/businesses/${businessId}/bookings`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(createBookingDto);

      const bookingId = bookingResponse.body.id;

      // Обновляем услуги сотрудника (убираем текущую услугу)
      const updateStaffDto = {
        serviceIds: [], // Убираем все услуги
      };

      await request(app.getHttpServer())
        .patch(`/api/v1/businesses/${businessId}/staff/${staffId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateStaffDto)
        .expect(200);

      // Проверяем, что запись все еще существует
      const bookingCheckResponse = await request(app.getHttpServer())
        .get(`/api/v1/businesses/${businessId}/bookings/${bookingId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(bookingCheckResponse.body.id).toBe(bookingId);
      expect(bookingCheckResponse.body.status).toBe('PENDING');

      // Проверяем, что сотрудник больше не предоставляет услуги
      const staffCheckResponse = await request(app.getHttpServer())
        .get(`/api/v1/businesses/${businessId}/staff/${staffId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(staffCheckResponse.body.staffServices).toHaveLength(0);
    });
  });
});
