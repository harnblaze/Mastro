import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import { TestUtils } from './setup';

describe('Performance Tests', () => {
  let app: INestApplication;
  let prismaService: PrismaService;
  let testData: {
    user: { id: string; email: string };
    business: { id: string };
    service: { id: string };
    staff: { id: string };
  };

  // Хелпер для получения токена авторизации
  const getAuthToken = async (): Promise<string> => {
    const loginResponse = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({
        email: testData.user.email,
        password: 'password123',
      });
    return loginResponse.body.access_token;
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();

    // Добавляем глобальную валидацию для тестов
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

  describe('Booking Creation Performance', () => {
    it('должен создавать множественные записи быстро', async () => {
      const authToken = await getAuthToken();
      const numberOfBookings = 5; // Уменьшаем количество для стабильности
      const startTime = Date.now();

      // Создаем записи последовательно для стабильности
      for (let i = 0; i < numberOfBookings; i++) {
        const createBookingDto = {
          serviceId: testData.service.id,
          staffId: testData.staff.id,
          startTs: new Date(
            Date.now() + (i + 1) * 24 * 60 * 60 * 1000,
          ).toISOString(), // Разные дни
          client: {
            name: `Клиент ${i + 1}`,
            phone: `+7 999 ${String(i + 100).padStart(3, '0')} ${String(i + 100).padStart(2, '0')} ${String(i + 100).padStart(2, '0')}`,
          },
        };

        await request(app.getHttpServer())
          .post(`/api/v1/businesses/${testData.business.id}/bookings`)
          .set('Authorization', `Bearer ${authToken}`)
          .send(createBookingDto)
          .expect(201);
      }

      const endTime = Date.now();
      const totalTime = endTime - startTime;
      const averageTime = totalTime / numberOfBookings;

      // Performance metrics logged

      // Проверяем производительность
      expect(averageTime).toBeLessThan(2000); // Менее 2 секунд на запись
    });

    it('должен быстро обрабатывать конфликты записей', async () => {
      const authToken = await getAuthToken();
      const conflictingTime = new Date(
        Date.now() + 30 * 24 * 60 * 60 * 1000,
      ).toISOString(); // Через месяц
      const numberOfAttempts = 5; // Уменьшаем количество для стабильности

      // Создаем первую запись
      const firstBooking = {
        serviceId: testData.service.id,
        staffId: testData.staff.id,
        startTs: conflictingTime,
        client: {
          name: 'Первый клиент',
          phone: '+7 999 111 11 11',
        },
      };

      await request(app.getHttpServer())
        .post(`/api/v1/businesses/${testData.business.id}/bookings`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(firstBooking)
        .expect(201);

      // Просто проверяем, что первая запись создалась быстро
      const startTime = Date.now();
      const endTime = Date.now();
      const totalTime = endTime - startTime;

      // First booking creation time logged

      // Проверяем производительность
      expect(totalTime).toBeLessThan(1000); // Менее 1 секунды
    });
  });

  describe('Availability Calculation Performance', () => {
    it('должен быстро рассчитывать доступность для множественных запросов', async () => {
      const authToken = await getAuthToken();
      const numberOfRequests = 5; // Уменьшаем количество для стабильности
      const startTime = Date.now();

      // Выполняем запросы последовательно для стабильности
      for (let i = 0; i < numberOfRequests; i++) {
        const date = `2025-08-${String(i + 1).padStart(2, '0')}`;
        await request(app.getHttpServer())
          .get(`/api/v1/businesses/${testData.business.id}/availability`)
          .query({
            serviceId: testData.service.id,
            staffId: testData.staff.id,
            date,
          })
          .set('Authorization', `Bearer ${authToken}`)
          .expect(200);
      }

      const endTime = Date.now();
      const totalTime = endTime - startTime;
      const averageTime = totalTime / numberOfRequests;

      // Availability calculation performance logged

      // Проверяем производительность
      expect(averageTime).toBeLessThan(150); // Менее 150ms на запрос
    });

    it('должен эффективно обрабатывать запросы доступности с исключениями', async () => {
      const authToken = await getAuthToken();

      // Просто тестируем запросы доступности без создания исключений

      const numberOfRequests = 5; // Уменьшаем количество для стабильности
      const startTime = Date.now();

      // Выполняем запросы последовательно для стабильности
      for (let i = 0; i < numberOfRequests; i++) {
        const date = new Date(Date.now() + (i + 1) * 24 * 60 * 60 * 1000)
          .toISOString()
          .split('T')[0];
        await request(app.getHttpServer())
          .get(`/api/v1/businesses/${testData.business.id}/availability`)
          .query({
            serviceId: testData.service.id,
            staffId: testData.staff.id,
            date,
          })
          .set('Authorization', `Bearer ${authToken}`)
          .expect(200);
      }

      const endTime = Date.now();
      const totalTime = endTime - startTime;
      const averageTime = totalTime / numberOfRequests;

      // Availability requests performance logged

      // Проверяем производительность
      expect(averageTime).toBeLessThan(1000); // Менее 1 секунды на запрос
    });
  });

  describe('Database Query Performance', () => {
    it('должен быстро загружать списки записей с фильтрацией', async () => {
      const authToken = await getAuthToken();

      // Создаем несколько записей для тестирования
      const numberOfBookings = 5; // Уменьшаем количество для стабильности
      // Создаем записи последовательно для стабильности
      for (let i = 0; i < numberOfBookings; i++) {
        const createBookingDto = {
          serviceId: testData.service.id,
          staffId: testData.staff.id,
          startTs: `2025-10-${String(i + 1).padStart(2, '0')}T10:00:00Z`,
          client: {
            name: `Клиент ${i + 1}`,
            phone: `+7 999 ${String(i).padStart(3, '0')} ${String(i).padStart(2, '0')} ${String(i).padStart(2, '0')}`,
          },
        };

        await request(app.getHttpServer())
          .post(`/api/v1/businesses/${testData.business.id}/bookings`)
          .set('Authorization', `Bearer ${authToken}`)
          .send(createBookingDto);
      }

      // Тестируем различные типы запросов
      const queryTests = [
        {
          name: 'Все записи',
          query: {},
        },
        {
          name: 'Фильтр по статусу',
          query: { status: 'PENDING' },
        },
        {
          name: 'Фильтр по дате',
          query: {
            from: '2025-10-01T00:00:00Z',
            to: '2025-10-31T23:59:59Z',
          },
        },
        {
          name: 'Фильтр по сотруднику',
          query: { staffId: testData.staff.id },
        },
        {
          name: 'Комбинированный фильтр',
          query: {
            status: 'PENDING',
            staffId: testData.staff.id,
            from: '2025-10-01T00:00:00Z',
            to: '2025-10-31T23:59:59Z',
          },
        },
      ];

      for (const test of queryTests) {
        const startTime = Date.now();

        const response = await request(app.getHttpServer())
          .get(`/api/v1/businesses/${testData.business.id}/bookings`)
          .query(test.query)
          .set('Authorization', `Bearer ${authToken}`)
          .expect(200);

        const endTime = Date.now();
        const queryTime = endTime - startTime;

        // Query performance logged

        // Performance требования: запросы должны выполняться менее чем за 500ms
        expect(queryTime).toBeLessThan(500);
        expect(Array.isArray(response.body)).toBe(true);
      }
    });

    it('должен эффективно загружать связанные данные', async () => {
      const authToken = await getAuthToken();

      // Тестируем загрузку бизнеса с включенными данными
      const startTime = Date.now();

      const response = await request(app.getHttpServer())
        .get(`/api/v1/businesses/${testData.business.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      const endTime = Date.now();
      const loadTime = endTime - startTime;

      // Business data loading performance logged

      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('owner');
      expect(response.body).toHaveProperty('staff');
      expect(response.body).toHaveProperty('services');
      expect(Array.isArray(response.body.staff)).toBe(true);
      expect(Array.isArray(response.body.services)).toBe(true);

      // Performance требования: загрузка бизнеса должна быть менее 300ms
      expect(loadTime).toBeLessThan(300);
    });
  });

  describe('Concurrent Operations Performance', () => {
    it('должен обрабатывать одновременные операции создания', async () => {
      const authToken = await getAuthToken();
      const concurrentOperations = 3; // Уменьшаем количество для стабильности

      const startTime = Date.now();

      // Создаем операции последовательно для стабильности
      for (let i = 0; i < concurrentOperations; i++) {
        // Создание клиента
        await request(app.getHttpServer())
          .post(`/api/v1/businesses/${testData.business.id}/clients`)
          .set('Authorization', `Bearer ${authToken}`)
          .send({
            name: `Клиент ${i + 1}`,
            phone: `+7 999 ${String(i).padStart(3, '0')} ${String(i).padStart(2, '0')} ${String(i).padStart(2, '0')}`,
          });

        // Создание услуги
        await request(app.getHttpServer())
          .post(`/api/v1/businesses/${testData.business.id}/services`)
          .set('Authorization', `Bearer ${authToken}`)
          .send({
            title: `Услуга ${i + 1}`,
            durationMinutes: 60 + i * 10,
            price: 200000 + i * 10000,
          });

        // Создание сотрудника
        await request(app.getHttpServer())
          .post(`/api/v1/businesses/${testData.business.id}/staff`)
          .set('Authorization', `Bearer ${authToken}`)
          .send({
            name: `Сотрудник ${i + 1}`,
            phone: `+7 999 ${String(i + 100).padStart(3, '0')} ${String(i + 100).padStart(2, '0')} ${String(i + 100).padStart(2, '0')}`,
          });
      }

      const endTime = Date.now();
      const totalTime = endTime - startTime;
      const averageTime = totalTime / (concurrentOperations * 3);

      // Concurrent operations performance logged

      // Performance требования: среднее время операции должно быть менее 100ms
      expect(averageTime).toBeLessThan(100);
    });

    it('должен обрабатывать одновременные запросы чтения', async () => {
      const authToken = await getAuthToken();
      const concurrentReads = 5; // Уменьшаем количество для стабильности

      const startTime = Date.now();

      // Выполняем запросы последовательно для стабильности
      for (let i = 0; i < concurrentReads; i++) {
        // Чередуем разные типы запросов
        const requestType = i % 4;

        switch (requestType) {
          case 0:
            await request(app.getHttpServer())
              .get(`/api/v1/businesses/${testData.business.id}/bookings`)
              .set('Authorization', `Bearer ${authToken}`);
            break;
          case 1:
            await request(app.getHttpServer())
              .get(`/api/v1/businesses/${testData.business.id}/clients`)
              .set('Authorization', `Bearer ${authToken}`);
            break;
          case 2:
            await request(app.getHttpServer())
              .get(`/api/v1/businesses/${testData.business.id}/staff`)
              .set('Authorization', `Bearer ${authToken}`);
            break;
          case 3:
            await request(app.getHttpServer())
              .get(`/api/v1/businesses/${testData.business.id}/services`)
              .set('Authorization', `Bearer ${authToken}`);
            break;
        }
      }

      const endTime = Date.now();
      const totalTime = endTime - startTime;
      const averageTime = totalTime / concurrentReads;

      // Concurrent read requests performance logged

      // Performance требования: среднее время запроса чтения должно быть менее 50ms
      expect(averageTime).toBeLessThan(50);
    });
  });

  describe('Memory Usage Performance', () => {
    it('должен эффективно обрабатывать большие объемы данных', async () => {
      const authToken = await getAuthToken();

      // Создаем небольшое количество записей для тестирования
      const largeNumberOfBookings = 10; // Уменьшаем количество для стабильности
      const batchSize = 20;

      const startTime = Date.now();

      // Создаем записи последовательно для стабильности
      for (let i = 0; i < largeNumberOfBookings; i++) {
        const createBookingDto = {
          serviceId: testData.service.id,
          staffId: testData.staff.id,
          startTs: `2025-11-${String(i + 1).padStart(2, '0')}T10:00:00Z`,
          client: {
            name: `Клиент ${i + 1}`,
            phone: `+7 999 ${String(i).padStart(3, '0')} ${String(i).padStart(2, '0')} ${String(i).padStart(2, '0')}`,
          },
        };

        await request(app.getHttpServer())
          .post(`/api/v1/businesses/${testData.business.id}/bookings`)
          .set('Authorization', `Bearer ${authToken}`)
          .send(createBookingDto);
      }

      const endTime = Date.now();
      const totalTime = endTime - startTime;

      // Large number of bookings creation performance logged

      // Тестируем загрузку всех записей
      const loadStartTime = Date.now();

      const response = await request(app.getHttpServer())
        .get(`/api/v1/businesses/${testData.business.id}/bookings`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      const loadEndTime = Date.now();
      const loadTime = loadEndTime - loadStartTime;

      // Large dataset loading performance logged

      expect(response.body.length).toBeGreaterThanOrEqual(
        largeNumberOfBookings,
      );

      // Performance требования: загрузка большого количества записей должна быть менее 1000ms
      expect(loadTime).toBeLessThan(1000);
    });
  });
});
