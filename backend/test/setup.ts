import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { PrismaService } from '../src/prisma/prisma.service';
import { AppModule } from '../src/app.module';

// Глобальная настройка для тестов
beforeAll(async () => {
  // Настройка тестовой базы данных
  process.env.DATABASE_URL = 'file:./test.db';
  process.env.JWT_SECRET = 'test-secret';
  process.env.NODE_ENV = 'test';
});

afterAll(async () => {
  // Очистка после всех тестов
});

// Утилиты для тестирования
export class TestUtils {
  static async createTestApp(): Promise<INestApplication> {
    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    const app = moduleFixture.createNestApplication();
    await app.init();
    return app;
  }

  static async cleanupDatabase(prisma: PrismaService): Promise<void> {
    // Очистка всех таблиц в правильном порядке (с учетом foreign keys)
    await prisma.notification.deleteMany();
    await prisma.payment.deleteMany();
    await prisma.booking.deleteMany();
    await prisma.client.deleteMany();
    await prisma.staffService.deleteMany();
    await prisma.staff.deleteMany();
    await prisma.service.deleteMany();
    await prisma.availabilityException.deleteMany();
    await prisma.notificationTemplate.deleteMany();
    await prisma.business.deleteMany();
    await prisma.user.deleteMany();
  }

  static async seedTestData(prisma: PrismaService) {
    // Создание тестового пользователя
    const bcrypt = require('bcryptjs');
    const hashedPassword = await bcrypt.hash('password123', 10);

    const user = await prisma.user.create({
      data: {
        email: 'test@example.com',
        vkId: '123456789',
        role: 'OWNER',
        passwordHash: hashedPassword,
      },
    });

    // Создание тестового бизнеса
    const business = await prisma.business.create({
      data: {
        ownerId: user.id,
        name: 'Тестовый салон',
        address: 'Тестовый адрес',
        timezone: 'Europe/Moscow',
        workingHours: {
          monday: { start: '09:00', end: '18:00' },
          tuesday: { start: '09:00', end: '18:00' },
          wednesday: { start: '09:00', end: '18:00' },
          thursday: { start: '09:00', end: '18:00' },
          friday: { start: '09:00', end: '18:00' },
          saturday: { start: '10:00', end: '16:00' },
          sunday: { closed: true },
        },
      },
    });

    // Создание тестовой услуги
    const service = await prisma.service.create({
      data: {
        businessId: business.id,
        title: 'Маникюр',
        durationMinutes: 60,
        price: 200000, // 2000 рублей в копейках
        bufferBefore: 5,
        bufferAfter: 10,
      },
    });

    // Создание тестового сотрудника
    const staff = await prisma.staff.create({
      data: {
        businessId: business.id,
        name: 'Мария Иванова',
        phone: '+7 999 123 45 67',
      },
    });

    // Связывание сотрудника с услугой
    await prisma.staffService.create({
      data: {
        staffId: staff.id,
        serviceId: service.id,
      },
    });

    return { user, business, service, staff };
  }
}
