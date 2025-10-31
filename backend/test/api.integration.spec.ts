import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import { TestUtils } from './setup';

describe('API Integration Tests', () => {
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
    try {
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

      // App initialized successfully
    } catch (error) {
      console.error('Failed to initialize app:', error);
      throw error;
    }
  });

  afterAll(async () => {
    await TestUtils.cleanupDatabase(prismaService);
    await app.close();
  });

  describe('Auth API', () => {
    describe('POST /api/v1/auth/vk', () => {
      it('должен вернуть ошибку при неверном VK токене', async () => {
        const vkAuthDto = {
          vkToken: 'invalid-vk-token',
        };

        await request(app.getHttpServer())
          .post('/api/v1/auth/vk')
          .send(vkAuthDto)
          .expect(401);
      });
    });

    describe('POST /api/v1/auth/login', () => {
      it('должен успешно авторизовать пользователя с email и паролем', async () => {
        const loginDto = {
          email: testData.user.email,
          password: 'password123',
        };

        const response = await request(app.getHttpServer())
          .post('/api/v1/auth/login')
          .send(loginDto)
          .expect(201);

        expect(response.body).toHaveProperty('access_token');
        expect(response.body.user.email).toBe(testData.user.email);
      });

      it('должен вернуть ошибку при неверных учетных данных', async () => {
        const loginDto = {
          email: 'wrong@example.com',
          password: 'wrongpassword',
        };

        await request(app.getHttpServer())
          .post('/api/v1/auth/login')
          .send(loginDto)
          .expect(401);
      });
    });
  });

  describe('Business API', () => {
    describe('GET /api/v1/businesses', () => {
      it('должен вернуть список бизнесов пользователя', async () => {
        const authToken = await getAuthToken();

        const response = await request(app.getHttpServer())
          .get('/api/v1/businesses')
          .set('Authorization', `Bearer ${await getAuthToken()}`)
          .expect(200);

        expect(Array.isArray(response.body)).toBe(true);
        expect(response.body.length).toBeGreaterThan(0);
        expect(response.body[0]).toHaveProperty('id');
        expect(response.body[0]).toHaveProperty('name');
        expect(response.body[0]).toHaveProperty('ownerId');
      });

      it('должен вернуть ошибку без авторизации', async () => {
        await request(app.getHttpServer())
          .get('/api/v1/businesses')
          .expect(401);
      });
    });

    describe('POST /api/v1/businesses', () => {
      it('должен создать новый бизнес', async () => {
        const createBusinessDto = {
          name: 'Новый салон',
          address: 'Новый адрес',
          timezone: 'Europe/Moscow',
          phone: '+7 999 888 77 66',
          email: 'new@salon.com',
        };

        const response = await request(app.getHttpServer())
          .post('/api/v1/businesses')
          .set('Authorization', `Bearer ${await getAuthToken()}`)
          .send(createBusinessDto)
          .expect(201);

        expect(response.body).toHaveProperty('id');
        expect(response.body.name).toBe(createBusinessDto.name);
        expect(response.body.address).toBe(createBusinessDto.address);
        expect(response.body.ownerId).toBe(testData.user.id);
      });

      it('должен вернуть ошибку валидации при неполных данных', async () => {
        const invalidDto = {
          name: '', // Пустое имя
          address: '', // Пустой адрес
        };

        await request(app.getHttpServer())
          .post('/api/v1/businesses')
          .set('Authorization', `Bearer ${await getAuthToken()}`)
          .send(invalidDto)
          .expect(400);
      });
    });

    describe('GET /api/v1/businesses/:id', () => {
      it('должен вернуть информацию о бизнесе', async () => {
        const response = await request(app.getHttpServer())
          .get(`/api/v1/businesses/${testData.business.id}`)
          .set('Authorization', `Bearer ${await getAuthToken()}`)
          .expect(200);

        expect(response.body).toHaveProperty('id', testData.business.id);
        expect(response.body).toHaveProperty('name');
        expect(response.body).toHaveProperty('owner');
        expect(response.body).toHaveProperty('staff');
        expect(response.body).toHaveProperty('services');
      });

      it('должен вернуть ошибку для несуществующего бизнеса', async () => {
        await request(app.getHttpServer())
          .get('/api/v1/businesses/non-existent-id')
          .set('Authorization', `Bearer ${await getAuthToken()}`)
          .expect(404);
      });
    });

    describe('PATCH /api/v1/businesses/:id', () => {
      it('должен обновить информацию о бизнесе', async () => {
        const updateDto = {
          name: 'Обновленное название',
          address: 'Новый адрес',
        };

        const response = await request(app.getHttpServer())
          .patch(`/api/v1/businesses/${testData.business.id}`)
          .set('Authorization', `Bearer ${await getAuthToken()}`)
          .send(updateDto)
          .expect(200);

        expect(response.body.name).toBe(updateDto.name);
        expect(response.body.address).toBe(updateDto.address);
      });
    });
  });

  describe('Services API', () => {
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

    describe('GET /api/v1/businesses/:id/services', () => {
      it('должен вернуть список услуг бизнеса', async () => {
        const response = await request(app.getHttpServer())
          .get(`/api/v1/businesses/${testData.business.id}/services`)
          .set('Authorization', `Bearer ${await getAuthToken()}`)
          .expect(200);

        expect(Array.isArray(response.body)).toBe(true);
        expect(response.body.length).toBeGreaterThan(0);
        expect(response.body[0]).toHaveProperty('id');
        expect(response.body[0]).toHaveProperty('title');
        expect(response.body[0]).toHaveProperty('durationMinutes');
        expect(response.body[0]).toHaveProperty('price');
      });
    });

    describe('POST /api/v1/businesses/:id/services', () => {
      it('должен создать новую услугу', async () => {
        const createServiceDto = {
          title: 'Новая услуга',
          durationMinutes: 90,
          price: 300000, // 3000 рублей в копейках
          bufferBefore: 10,
          bufferAfter: 15,
        };

        const response = await request(app.getHttpServer())
          .post(`/api/v1/businesses/${testData.business.id}/services`)
          .set('Authorization', `Bearer ${await getAuthToken()}`)
          .send(createServiceDto)
          .expect(201);

        expect(response.body).toHaveProperty('id');
        expect(response.body.title).toBe(createServiceDto.title);
        expect(response.body.durationMinutes).toBe(
          createServiceDto.durationMinutes,
        );
        expect(response.body.price).toBe(createServiceDto.price);
        expect(response.body.businessId).toBe(testData.business.id);
      });

      it('должен вернуть ошибку валидации при неполных данных', async () => {
        const invalidDto = {
          title: '', // Пустое название
          durationMinutes: -10, // Отрицательная длительность
          price: 1000, // Добавляем обязательное поле price
        };

        await request(app.getHttpServer())
          .post(`/api/v1/businesses/${testData.business.id}/services`)
          .set('Authorization', `Bearer ${await getAuthToken()}`)
          .send(invalidDto)
          .expect(400);
      });
    });
  });

  describe('Bookings API', () => {
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

    describe('POST /api/v1/businesses/:id/bookings', () => {
      it('должен создать новую запись', async () => {
        const createBookingDto = {
          serviceId: testData.service.id,
          staffId: testData.staff.id,
          startTs: '2025-12-01T10:00:00Z', // Используем декабрь 2025
          client: {
            name: 'Тестовый клиент',
            phone: '+7 999 111 22 33',
            email: 'client@example.com',
          },
        };

        const response = await request(app.getHttpServer())
          .post(`/api/v1/businesses/${testData.business.id}/bookings`)
          .set('Authorization', `Bearer ${await getAuthToken()}`)
          .send(createBookingDto)
          .expect(201);

        expect(response.body).toHaveProperty('id');
        expect(response.body).toHaveProperty('status', 'PENDING');
        expect(response.body).toHaveProperty('startTs');
        expect(response.body).toHaveProperty('endTs');
        expect(response.body).toHaveProperty('service');
        expect(response.body).toHaveProperty('staff');
        expect(response.body).toHaveProperty('client');
      });

      it('должен вернуть ошибку конфликта при занятом времени', async () => {
        // Сначала создаем первую запись
        const firstBooking = {
          serviceId: testData.service.id,
          staffId: testData.staff.id,
          startTs: '2025-12-02T14:00:00Z', // Другая дата в декабре 2025
          client: {
            name: 'Первый клиент',
            phone: '+7 999 111 22 33',
          },
        };

        await request(app.getHttpServer())
          .post(`/api/v1/businesses/${testData.business.id}/bookings`)
          .set('Authorization', `Bearer ${await getAuthToken()}`)
          .send(firstBooking)
          .expect(201);

        // Пытаемся создать вторую запись на то же время
        const conflictingBooking = {
          serviceId: testData.service.id,
          staffId: testData.staff.id,
          startTs: '2025-12-02T14:00:00Z', // То же время для конфликта
          client: {
            name: 'Второй клиент',
            phone: '+7 999 222 33 44',
          },
        };

        const response = await request(app.getHttpServer())
          .post(`/api/v1/businesses/${testData.business.id}/bookings`)
          .set('Authorization', `Bearer ${await getAuthToken()}`)
          .send(conflictingBooking)
          .expect(409);

        expect(response.body).toHaveProperty('code', 'SLOT_CONFLICT');
        expect(response.body).toHaveProperty('message');
        expect(response.body).toHaveProperty('conflictingBooking');
      });

      it('должен вернуть ошибку при попытке записи в прошлом', async () => {
        const pastBooking = {
          serviceId: testData.service.id,
          staffId: testData.staff.id,
          startTs: '2020-01-15T12:00:00Z', // Прошлое время
          client: {
            name: 'Клиент',
            phone: '+7 999 111 22 33',
          },
        };

        const response = await request(app.getHttpServer())
          .post(`/api/v1/businesses/${testData.business.id}/bookings`)
          .set('Authorization', `Bearer ${await getAuthToken()}`)
          .send(pastBooking)
          .expect(409);

        expect(response.body).toHaveProperty('code', 'PAST_TIME');
      });
    });

    describe('GET /api/v1/businesses/:id/bookings', () => {
      it('должен вернуть список записей бизнеса', async () => {
        const response = await request(app.getHttpServer())
          .get(`/api/v1/businesses/${testData.business.id}/bookings`)
          .set('Authorization', `Bearer ${await getAuthToken()}`)
          .expect(200);

        expect(Array.isArray(response.body)).toBe(true);
      });

      it('должен фильтровать записи по дате', async () => {
        const response = await request(app.getHttpServer())
          .get(`/api/v1/businesses/${testData.business.id}/bookings`)
          .query({
            from: '2025-02-15T00:00:00Z',
            to: '2025-02-15T23:59:59Z',
          })
          .set('Authorization', `Bearer ${await getAuthToken()}`)
          .expect(200);

        expect(Array.isArray(response.body)).toBe(true);
      });

      it('должен фильтровать записи по статусу и сотруднику', async () => {
        const response = await request(app.getHttpServer())
          .get(`/api/v1/businesses/${testData.business.id}/bookings`)
          .query({
            status: 'PENDING',
            staffId: testData.staff.id,
          })
          .set('Authorization', `Bearer ${await getAuthToken()}`)
          .expect(200);

        expect(Array.isArray(response.body)).toBe(true);
      });
    });

    describe('PATCH /api/v1/businesses/${testData.business.id}/bookings/:id', () => {
      let bookingId: string;

      beforeAll(async () => {
        // Создаем запись для тестирования обновления
        const createBookingDto = {
          serviceId: testData.service.id,
          staffId: testData.staff.id,
          startTs: '2025-02-20T12:00:00Z',
          client: {
            name: 'Клиент для обновления',
            phone: '+7 999 333 44 55',
          },
        };

        const response = await request(app.getHttpServer())
          .post(`/api/v1/businesses/${testData.business.id}/bookings`)
          .set('Authorization', `Bearer ${await getAuthToken()}`)
          .send(createBookingDto);

        bookingId = response.body.id;
      });

      it('должен обновить статус записи', async () => {
        // Сначала создаем запись для обновления
        const createBookingDto = {
          serviceId: testData.service.id,
          staffId: testData.staff.id,
          startTs: '2025-12-03T11:00:00Z', // Другая дата в декабре 2025
          client: {
            name: 'Клиент для обновления',
            phone: '+7 999 111 22 33',
          },
        };

        const createResponse = await request(app.getHttpServer())
          .post(`/api/v1/businesses/${testData.business.id}/bookings`)
          .set('Authorization', `Bearer ${await getAuthToken()}`)
          .send(createBookingDto)
          .expect(201);

        const bookingId = createResponse.body.id;

        const updateDto = {
          status: 'CONFIRMED',
        };

        const response = await request(app.getHttpServer())
          .patch(
            `/api/v1/businesses/${testData.business.id}/bookings/${bookingId}`,
          )
          .set('Authorization', `Bearer ${await getAuthToken()}`)
          .send(updateDto)
          .expect(200);

        expect(response.body.status).toBe('CONFIRMED');
      });

      it('должен отменить запись', async () => {
        // Сначала создаем запись для отмены
        const createBookingDto = {
          serviceId: testData.service.id,
          staffId: testData.staff.id,
          startTs: '2025-12-04T13:00:00Z', // Другая дата в декабре 2025
          client: {
            name: 'Клиент для отмены',
            phone: '+7 999 111 22 33',
          },
        };

        const createResponse = await request(app.getHttpServer())
          .post(`/api/v1/businesses/${testData.business.id}/bookings`)
          .set('Authorization', `Bearer ${await getAuthToken()}`)
          .send(createBookingDto)
          .expect(201);

        const bookingId = createResponse.body.id;

        const updateDto = {
          status: 'CANCELLED',
        };

        const response = await request(app.getHttpServer())
          .patch(
            `/api/v1/businesses/${testData.business.id}/bookings/${bookingId}`,
          )
          .set('Authorization', `Bearer ${await getAuthToken()}`)
          .send(updateDto)
          .expect(200);

        expect(response.body.status).toBe('CANCELLED');
      });
    });
  });

  describe('Availability API', () => {
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

    describe('GET /api/v1/businesses/:id/availability', () => {
      it('должен вернуть доступные слоты на указанную дату', async () => {
        const response = await request(app.getHttpServer())
          .get(`/api/v1/businesses/${testData.business.id}/availability`)
          .query({
            serviceId: testData.service.id,
            staffId: testData.staff.id,
            date: '2025-02-25',
          })
          .set('Authorization', `Bearer ${await getAuthToken()}`)
          .expect(200);

        expect(response.body).toHaveProperty('date');
        expect(response.body).toHaveProperty('slots');
        expect(response.body).toHaveProperty('isWorkingDay');
        expect(Array.isArray(response.body.slots)).toBe(true);
        // Проверяем формат времени в слотах
        response.body.slots.forEach((slot: any) => {
          expect(slot).toHaveProperty('startTime');
          expect(slot).toHaveProperty('endTime');
          expect(slot).toHaveProperty('isAvailable');
          expect(slot.startTime).toMatch(/^\d{2}:\d{2}$/);
          expect(slot.endTime).toMatch(/^\d{2}:\d{2}$/);
        });
      });

      it('должен вернуть пустой массив для нерабочего дня', async () => {
        const response = await request(app.getHttpServer())
          .get(`/api/v1/businesses/${testData.business.id}/availability`)
          .query({
            serviceId: testData.service.id,
            staffId: testData.staff.id,
            date: '2025-02-23', // Воскресенье (нерабочий день)
          })
          .set('Authorization', `Bearer ${await getAuthToken()}`)
          .expect(200);

        expect(response.body).toHaveProperty('date', '2025-02-23');
        expect(response.body).toHaveProperty('isWorkingDay', false);
        expect(Array.isArray(response.body.slots)).toBe(true);
        expect(response.body.slots).toHaveLength(0);
      });
    });
  });

  describe('Staff API', () => {
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

    describe('GET /api/v1/businesses/:id/staff', () => {
      it('должен вернуть список сотрудников бизнеса', async () => {
        const response = await request(app.getHttpServer())
          .get(`/api/v1/businesses/${testData.business.id}/staff`)
          .set('Authorization', `Bearer ${await getAuthToken()}`)
          .expect(200);

        expect(Array.isArray(response.body)).toBe(true);
        expect(response.body.length).toBeGreaterThan(0);
        expect(response.body[0]).toHaveProperty('id');
        expect(response.body[0]).toHaveProperty('name');
        expect(response.body[0]).toHaveProperty('businessId');
        expect(response.body[0]).toHaveProperty('staffServices');
      });

      it('должен вернуть ошибку без авторизации', async () => {
        await request(app.getHttpServer())
          .get(`/api/v1/businesses/${testData.business.id}/staff`)
          .expect(401);
      });
    });

    describe('POST /api/v1/businesses/:id/staff', () => {
      it('должен создать нового сотрудника', async () => {
        const createStaffDto = {
          name: 'Новый мастер',
          phone: '+7 999 888 77 66',
          serviceIds: [testData.service.id],
        };

        const response = await request(app.getHttpServer())
          .post(`/api/v1/businesses/${testData.business.id}/staff`)
          .set('Authorization', `Bearer ${await getAuthToken()}`)
          .send(createStaffDto)
          .expect(201);

        expect(response.body).toHaveProperty('id');
        expect(response.body.name).toBe(createStaffDto.name);
        expect(response.body.phone).toBe(createStaffDto.phone);
        expect(response.body.businessId).toBe(testData.business.id);
        expect(response.body.staffServices).toHaveLength(1);
        expect(response.body.staffServices[0].service.id).toBe(
          testData.service.id,
        );
      });

      it('должен создать сотрудника без услуг', async () => {
        const createStaffDto = {
          name: 'Мастер без услуг',
          phone: '+7 999 777 66 55',
        };

        const response = await request(app.getHttpServer())
          .post(`/api/v1/businesses/${testData.business.id}/staff`)
          .set('Authorization', `Bearer ${await getAuthToken()}`)
          .send(createStaffDto)
          .expect(201);

        expect(response.body.name).toBe(createStaffDto.name);
        expect(response.body.staffServices).toHaveLength(0);
      });

      it('должен вернуть ошибку валидации при неполных данных', async () => {
        const invalidDto = {
          name: '', // Пустое имя
        };

        await request(app.getHttpServer())
          .post(`/api/v1/businesses/${testData.business.id}/staff`)
          .set('Authorization', `Bearer ${await getAuthToken()}`)
          .send(invalidDto)
          .expect(400);
      });
    });

    describe('PATCH /api/v1/businesses/:businessId/staff/:id', () => {
      let staffId: string;

      beforeAll(async () => {
        // Создаем сотрудника для тестирования обновления
        const createStaffDto = {
          name: 'Сотрудник для обновления',
          phone: '+7 999 111 22 33',
          serviceIds: [testData.service.id],
        };

        const response = await request(app.getHttpServer())
          .post(`/api/v1/businesses/${testData.business.id}/staff`)
          .set('Authorization', `Bearer ${await getAuthToken()}`)
          .send(createStaffDto);

        staffId = response.body.id;
      });

      it('должен обновить информацию о сотруднике', async () => {
        const updateDto = {
          name: 'Обновленное имя',
          phone: '+7 999 999 99 99',
        };

        const response = await request(app.getHttpServer())
          .patch(`/api/v1/businesses/${testData.business.id}/staff/${staffId}`)
          .set('Authorization', `Bearer ${await getAuthToken()}`)
          .send(updateDto)
          .expect(200);

        expect(response.body.name).toBe(updateDto.name);
        expect(response.body.phone).toBe(updateDto.phone);
      });

      it('должен обновить услуги сотрудника', async () => {
        // Создаем дополнительную услугу
        const createServiceDto = {
          title: 'Дополнительная услуга',
          durationMinutes: 30,
          price: 150000,
        };

        const serviceResponse = await request(app.getHttpServer())
          .post(`/api/v1/businesses/${testData.business.id}/services`)
          .set('Authorization', `Bearer ${await getAuthToken()}`)
          .send(createServiceDto);

        const newServiceId = serviceResponse.body.id;

        const updateDto = {
          serviceIds: [testData.service.id, newServiceId],
        };

        const response = await request(app.getHttpServer())
          .patch(`/api/v1/businesses/${testData.business.id}/staff/${staffId}`)
          .set('Authorization', `Bearer ${await getAuthToken()}`)
          .send(updateDto)
          .expect(200);

        expect(response.body.staffServices).toHaveLength(2);
      });
    });
  });

  describe('Clients API', () => {
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

    describe('GET /api/v1/businesses/:id/clients', () => {
      it('должен вернуть список клиентов бизнеса', async () => {
        const response = await request(app.getHttpServer())
          .get(`/api/v1/businesses/${testData.business.id}/clients`)
          .set('Authorization', `Bearer ${await getAuthToken()}`)
          .expect(200);

        expect(Array.isArray(response.body)).toBe(true);
        expect(response.body[0]).toHaveProperty('id');
        expect(response.body[0]).toHaveProperty('name');
        expect(response.body[0]).toHaveProperty('phone');
        expect(response.body[0]).toHaveProperty('businessId');
        expect(response.body[0]).toHaveProperty('bookings');
      });

      it('должен вернуть ошибку без авторизации', async () => {
        await request(app.getHttpServer())
          .get(`/api/v1/businesses/${testData.business.id}/clients`)
          .expect(401);
      });
    });

    describe('POST /api/v1/businesses/:id/clients', () => {
      it('должен создать нового клиента', async () => {
        const createClientDto = {
          name: 'Новый клиент',
          phone: '+7 999 555 44 33',
          email: 'newclient@example.com',
          notes: 'Предпочитает вечерние записи',
        };

        const response = await request(app.getHttpServer())
          .post(`/api/v1/businesses/${testData.business.id}/clients`)
          .set('Authorization', `Bearer ${await getAuthToken()}`)
          .send(createClientDto)
          .expect(201);

        expect(response.body).toHaveProperty('id');
        expect(response.body.name).toBe(createClientDto.name);
        expect(response.body.phone).toBe(createClientDto.phone);
        expect(response.body.email).toBe(createClientDto.email);
        expect(response.body.notes).toBe(createClientDto.notes);
        expect(response.body.businessId).toBe(testData.business.id);
      });

      it('должен создать клиента с минимальными данными', async () => {
        const createClientDto = {
          name: 'Минимальный клиент',
          phone: '+7 999 444 33 22',
        };

        const response = await request(app.getHttpServer())
          .post(`/api/v1/businesses/${testData.business.id}/clients`)
          .set('Authorization', `Bearer ${await getAuthToken()}`)
          .send(createClientDto)
          .expect(201);

        expect(response.body.name).toBe(createClientDto.name);
        expect(response.body.phone).toBe(createClientDto.phone);
        expect(response.body.email).toBeNull();
        expect(response.body.notes).toBeNull();
      });

      it('должен вернуть ошибку валидации при неполных данных', async () => {
        const invalidDto = {
          name: '', // Пустое имя
          phone: '', // Пустой телефон
        };

        await request(app.getHttpServer())
          .post(`/api/v1/businesses/${testData.business.id}/clients`)
          .set('Authorization', `Bearer ${await getAuthToken()}`)
          .send(invalidDto)
          .expect(400);
      });
    });

    describe('PATCH /api/v1/businesses/:businessId/clients/:id', () => {
      let clientId: string;

      beforeAll(async () => {
        // Создаем клиента для тестирования обновления
        const createClientDto = {
          name: 'Клиент для обновления',
          phone: '+7 999 333 22 11',
          email: 'update@example.com',
        };

        const response = await request(app.getHttpServer())
          .post(`/api/v1/businesses/${testData.business.id}/clients`)
          .set('Authorization', `Bearer ${await getAuthToken()}`)
          .send(createClientDto);

        clientId = response.body.id;
      });

      it('должен обновить информацию о клиенте', async () => {
        const updateDto = {
          name: 'Обновленное имя клиента',
          email: 'updated@example.com',
          notes: 'Обновленные заметки',
        };

        const response = await request(app.getHttpServer())
          .patch(
            `/api/v1/businesses/${testData.business.id}/clients/${clientId}`,
          )
          .set('Authorization', `Bearer ${await getAuthToken()}`)
          .send(updateDto)
          .expect(200);

        expect(response.body.name).toBe(updateDto.name);
        expect(response.body.email).toBe(updateDto.email);
        expect(response.body.notes).toBe(updateDto.notes);
      });
    });
  });

  describe('Availability API Extended', () => {
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

    describe('POST /api/v1/businesses/:businessId/availability/exceptions', () => {
      it('должен создать исключение типа CLOSED', async () => {
        const exceptionDto = {
          date: '2025-02-28',
          type: 'CLOSED',
          reason: 'Выходной день',
        };

        const response = await request(app.getHttpServer())
          .post(
            `/api/v1/businesses/${testData.business.id}/availability/exceptions`,
          )
          .set('Authorization', `Bearer ${await getAuthToken()}`)
          .send(exceptionDto)
          .expect(201);

        expect(response.body).toHaveProperty('id');
        expect(response.body.type).toBe('CLOSED');
        expect(response.body.date).toBe('2025-02-28T00:00:00.000Z');
        expect(response.body.reason).toBe('Выходной день');
        expect(response.body.businessId).toBe(testData.business.id);
      });

      it('должен создать исключение типа OPEN_CUSTOM', async () => {
        const exceptionDto = {
          date: '2025-03-01',
          startTime: '11:00',
          endTime: '15:00',
          type: 'OPEN_CUSTOM',
          reason: 'Сокращенный рабочий день',
        };

        const response = await request(app.getHttpServer())
          .post(
            `/api/v1/businesses/${testData.business.id}/availability/exceptions`,
          )
          .set('Authorization', `Bearer ${await getAuthToken()}`)
          .send(exceptionDto)
          .expect(201);

        expect(response.body.type).toBe('OPEN_CUSTOM');
        expect(response.body.startTime).toBe('11:00');
        expect(response.body.endTime).toBe('15:00');
        expect(response.body.reason).toBe('Сокращенный рабочий день');
      });

      it('должен вернуть ошибку валидации при неполных данных', async () => {
        const invalidDto = {
          // Отсутствует обязательное поле date
          type: 'CLOSED',
        };

        await request(app.getHttpServer())
          .post(
            `/api/v1/businesses/${testData.business.id}/availability/exceptions`,
          )
          .set('Authorization', `Bearer ${await getAuthToken()}`)
          .send(invalidDto)
          .expect(400);
      });
    });

    describe('GET /api/v1/businesses/:businessId/availability/exceptions', () => {
      it('должен вернуть список исключений бизнеса', async () => {
        const response = await request(app.getHttpServer())
          .get(
            `/api/v1/businesses/${testData.business.id}/availability/exceptions`,
          )
          .set('Authorization', `Bearer ${await getAuthToken()}`)
          .expect(200);

        expect(Array.isArray(response.body)).toBe(true);
        response.body.forEach((exception: any) => {
          expect(exception).toHaveProperty('id');
          expect(exception).toHaveProperty('type');
          expect(exception).toHaveProperty('date');
          expect(exception).toHaveProperty('businessId');
        });
      });

      it('должен фильтровать исключения по дате', async () => {
        const response = await request(app.getHttpServer())
          .get(
            `/api/v1/businesses/${testData.business.id}/availability/exceptions`,
          )
          .query({
            from: '2025-02-01',
            to: '2025-02-28',
          })
          .set('Authorization', `Bearer ${await getAuthToken()}`)
          .expect(200);

        expect(Array.isArray(response.body)).toBe(true);
      });
    });

    describe('DELETE /api/v1/businesses/:businessId/availability/exceptions/:id', () => {
      let exceptionId: string;

      beforeAll(async () => {
        // Создаем исключение для тестирования удаления
        const exceptionDto = {
          date: '2025-03-15',
          type: 'CLOSED',
          reason: 'Тестовое исключение для удаления',
        };

        const response = await request(app.getHttpServer())
          .post(
            `/api/v1/businesses/${testData.business.id}/availability/exceptions`,
          )
          .set('Authorization', `Bearer ${await getAuthToken()}`)
          .send(exceptionDto);

        exceptionId = response.body.id;
      });

      it('должен удалить исключение', async () => {
        await request(app.getHttpServer())
          .delete(
            `/api/v1/businesses/${testData.business.id}/availability/exceptions/${exceptionId}`,
          )
          .set('Authorization', `Bearer ${await getAuthToken()}`)
          .expect(200);

        // Проверяем, что исключение действительно удалено
        await request(app.getHttpServer())
          .get(
            `/api/v1/businesses/${testData.business.id}/availability/exceptions/${exceptionId}`,
          )
          .set('Authorization', `Bearer ${await getAuthToken()}`)
          .expect(404);
      });

      it('должен вернуть ошибку для несуществующего исключения', async () => {
        await request(app.getHttpServer())
          .delete(
            '/api/v1/businesses/${testData.business.id}/availability/exceptions/non-existent-id',
          )
          .set('Authorization', `Bearer ${await getAuthToken()}`)
          .expect(404);
      });
    });
  });
});
