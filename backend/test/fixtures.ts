import { PrismaService } from '../src/prisma/prisma.service';

// Фикстуры для тестирования
export const testFixtures = {
  users: {
    owner: {
      email: 'owner@test.com',
      vkId: '123456789',
      role: 'OWNER',
      passwordHash:
        '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password
    },
    staff: {
      email: 'staff@test.com',
      vkId: '987654321',
      role: 'STAFF',
      passwordHash:
        '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password
    },
  },

  businesses: {
    salon: {
      name: 'Тестовый салон красоты',
      address: 'ул. Тестовая, д. 1',
      timezone: 'Europe/Moscow',
      phone: '+7 999 123 45 67',
      email: 'test@salon.com',
      website: 'https://test-salon.com',
      description: 'Современный салон красоты для тестирования',
      workingHours: {
        monday: { start: '09:00', end: '18:00', isWorking: true },
        tuesday: { start: '09:00', end: '18:00', isWorking: true },
        wednesday: { start: '09:00', end: '18:00', isWorking: true },
        thursday: { start: '09:00', end: '18:00', isWorking: true },
        friday: { start: '09:00', end: '18:00', isWorking: true },
        saturday: { start: '10:00', end: '16:00', isWorking: true },
        sunday: { start: '10:00', end: '16:00', isWorking: false },
      },
    },
  },

  services: {
    manicure: {
      title: 'Маникюр',
      durationMinutes: 60,
      price: 200000, // 2000 рублей в копейках
      bufferBefore: 5,
      bufferAfter: 10,
      color: '#FF6B6B',
    },
    pedicure: {
      title: 'Педикюр',
      durationMinutes: 90,
      price: 300000, // 3000 рублей в копейках
      bufferBefore: 10,
      bufferAfter: 15,
      color: '#4ECDC4',
    },
    massage: {
      title: 'Массаж',
      durationMinutes: 120,
      price: 500000, // 5000 рублей в копейках
      bufferBefore: 15,
      bufferAfter: 20,
      color: '#45B7D1',
    },
  },

  staff: {
    master1: {
      name: 'Мария Иванова',
      phone: '+7 999 111 22 33',
    },
    master2: {
      name: 'Анна Петрова',
      phone: '+7 999 444 55 66',
    },
  },

  clients: {
    client1: {
      name: 'Елена Смирнова',
      phone: '+7 999 777 88 99',
      email: 'elena@example.com',
      notes: 'Предпочитает утренние записи',
    },
    client2: {
      name: 'Ольга Козлова',
      phone: '+7 999 000 11 22',
      email: 'olga@example.com',
      notes: 'Аллергия на лак',
    },
  },

  bookings: {
    future: {
      startTs: '2025-06-15T12:00:00Z',
      status: 'PENDING',
      source: 'WEB',
    },
    confirmed: {
      startTs: '2025-06-16T14:00:00Z',
      status: 'CONFIRMED',
      source: 'VK',
    },
    cancelled: {
      startTs: '2025-06-17T16:00:00Z',
      status: 'CANCELLED',
      source: 'ADMIN',
    },
  },

  availabilityExceptions: {
    closed: {
      date: '2025-06-20',
      type: 'CLOSED',
      reason: 'Выходной день',
    },
    customHours: {
      date: '2025-06-21',
      startTime: '11:00',
      endTime: '15:00',
      type: 'OPEN_CUSTOM',
      reason: 'Сокращенный рабочий день',
    },
  },
};

// Утилиты для создания тестовых данных
export class TestDataFactory {
  constructor(private prisma: PrismaService) {}

  async createUser(userData: any) {
    return this.prisma.user.create({
      data: userData,
    });
  }

  async createBusiness(ownerId: string, businessData: any) {
    return this.prisma.business.create({
      data: {
        ...businessData,
        ownerId,
      },
    });
  }

  async createService(businessId: string, serviceData: any) {
    return this.prisma.service.create({
      data: {
        ...serviceData,
        businessId,
      },
    });
  }

  async createStaff(businessId: string, staffData: any) {
    return this.prisma.staff.create({
      data: {
        ...staffData,
        businessId,
      },
    });
  }

  async createClient(businessId: string, clientData: any) {
    return this.prisma.client.create({
      data: {
        ...clientData,
        businessId,
      },
    });
  }

  async createBooking(bookingData: any) {
    return this.prisma.booking.create({
      data: bookingData,
      include: {
        service: true,
        staff: true,
        client: true,
      },
    });
  }

  async createAvailabilityException(businessId: string, exceptionData: any) {
    return this.prisma.availabilityException.create({
      data: {
        ...exceptionData,
        businessId,
        date: new Date(exceptionData.date),
      },
    });
  }

  async linkStaffToService(staffId: string, serviceId: string) {
    return this.prisma.staffService.create({
      data: {
        staffId,
        serviceId,
      },
    });
  }

  // Создание полного набора тестовых данных
  async createCompleteTestScenario() {
    // Создаем пользователя-владельца
    const owner = await this.createUser(testFixtures.users.owner);

    // Создаем бизнес
    const business = await this.createBusiness(
      owner.id,
      testFixtures.businesses.salon,
    );

    // Создаем услуги
    const manicure = await this.createService(
      business.id,
      testFixtures.services.manicure,
    );
    const pedicure = await this.createService(
      business.id,
      testFixtures.services.pedicure,
    );

    // Создаем сотрудников
    const master1 = await this.createStaff(
      business.id,
      testFixtures.staff.master1,
    );
    const master2 = await this.createStaff(
      business.id,
      testFixtures.staff.master2,
    );

    // Связываем сотрудников с услугами
    await this.linkStaffToService(master1.id, manicure.id);
    await this.linkStaffToService(master1.id, pedicure.id);
    await this.linkStaffToService(master2.id, manicure.id);

    // Создаем клиентов
    const client1 = await this.createClient(
      business.id,
      testFixtures.clients.client1,
    );
    const client2 = await this.createClient(
      business.id,
      testFixtures.clients.client2,
    );

    // Создаем записи
    const booking1 = await this.createBooking({
      businessId: business.id,
      serviceId: manicure.id,
      staffId: master1.id,
      clientId: client1.id,
      startTs: new Date(testFixtures.bookings.future.startTs),
      endTs: new Date(
        new Date(testFixtures.bookings.future.startTs).getTime() +
          (manicure.durationMinutes + manicure.bufferAfter) * 60000,
      ),
      status: testFixtures.bookings.future.status,
      source: testFixtures.bookings.future.source,
    });

    const booking2 = await this.createBooking({
      businessId: business.id,
      serviceId: pedicure.id,
      staffId: master1.id,
      clientId: client2.id,
      startTs: new Date(testFixtures.bookings.confirmed.startTs),
      endTs: new Date(
        new Date(testFixtures.bookings.confirmed.startTs).getTime() +
          (pedicure.durationMinutes + pedicure.bufferAfter) * 60000,
      ),
      status: testFixtures.bookings.confirmed.status,
      source: testFixtures.bookings.confirmed.source,
    });

    return {
      owner,
      business,
      services: { manicure, pedicure },
      staff: { master1, master2 },
      clients: { client1, client2 },
      bookings: { booking1, booking2 },
    };
  }
}

// Моки для внешних сервисов
export const mockExternalServices = {
  vkApi: {
    validateToken: jest.fn().mockResolvedValue({
      id: 123456789,
      first_name: 'Тестовый',
      last_name: 'Пользователь',
      email: 'test@vk.com',
    }),
    sendMessage: jest.fn().mockResolvedValue(true),
    getGroupInfo: jest.fn().mockResolvedValue({
      id: 123456789,
      name: 'Тестовая группа',
    }),
  },

  smsService: {
    sendSms: jest
      .fn()
      .mockResolvedValue({ success: true, messageId: 'msg123' }),
  },

  emailService: {
    sendEmail: jest
      .fn()
      .mockResolvedValue({ success: true, messageId: 'email123' }),
  },

  notificationService: {
    create: jest.fn().mockResolvedValue({ id: 'notif123' }),
    send: jest.fn().mockResolvedValue({ success: true }),
  },
};

// Утилиты для проверки тестовых данных
export class TestAssertions {
  static expectValidBooking(booking: any) {
    expect(booking).toHaveProperty('id');
    expect(booking).toHaveProperty('businessId');
    expect(booking).toHaveProperty('serviceId');
    expect(booking).toHaveProperty('staffId');
    expect(booking).toHaveProperty('startTs');
    expect(booking).toHaveProperty('endTs');
    expect(booking).toHaveProperty('status');
    expect(booking).toHaveProperty('source');
    expect(booking).toHaveProperty('createdAt');
    expect(booking).toHaveProperty('updatedAt');

    // Проверяем типы данных
    expect(typeof booking.id).toBe('string');
    expect(typeof booking.businessId).toBe('string');
    expect(typeof booking.serviceId).toBe('string');
    expect(typeof booking.staffId).toBe('string');
    expect(booking.startTs).toBeInstanceOf(Date);
    expect(booking.endTs).toBeInstanceOf(Date);
    expect(typeof booking.status).toBe('string');
    expect(typeof booking.source).toBe('string');
  }

  static expectValidService(service: any) {
    expect(service).toHaveProperty('id');
    expect(service).toHaveProperty('businessId');
    expect(service).toHaveProperty('title');
    expect(service).toHaveProperty('durationMinutes');
    expect(service).toHaveProperty('price');
    expect(service).toHaveProperty('bufferBefore');
    expect(service).toHaveProperty('bufferAfter');

    expect(typeof service.id).toBe('string');
    expect(typeof service.businessId).toBe('string');
    expect(typeof service.title).toBe('string');
    expect(typeof service.durationMinutes).toBe('number');
    expect(typeof service.price).toBe('number');
    expect(typeof service.bufferBefore).toBe('number');
    expect(typeof service.bufferAfter).toBe('number');
  }

  static expectValidBusiness(business: any) {
    expect(business).toHaveProperty('id');
    expect(business).toHaveProperty('ownerId');
    expect(business).toHaveProperty('name');
    expect(business).toHaveProperty('timezone');
    expect(business).toHaveProperty('workingHours');
    expect(business).toHaveProperty('createdAt');

    expect(typeof business.id).toBe('string');
    expect(typeof business.ownerId).toBe('string');
    expect(typeof business.name).toBe('string');
    expect(typeof business.timezone).toBe('string');
    expect(typeof business.workingHours).toBe('object');
    expect(business.createdAt).toBeInstanceOf(Date);
  }

  static expectValidClient(client: any) {
    expect(client).toHaveProperty('id');
    expect(client).toHaveProperty('businessId');
    expect(client).toHaveProperty('name');
    expect(client).toHaveProperty('phone');
    expect(client).toHaveProperty('createdAt');

    expect(typeof client.id).toBe('string');
    expect(typeof client.businessId).toBe('string');
    expect(typeof client.name).toBe('string');
    expect(typeof client.phone).toBe('string');
    expect(client.createdAt).toBeInstanceOf(Date);
  }

  static expectValidStaff(staff: any) {
    expect(staff).toHaveProperty('id');
    expect(staff).toHaveProperty('businessId');
    expect(staff).toHaveProperty('name');
    expect(staff).toHaveProperty('createdAt');

    expect(typeof staff.id).toBe('string');
    expect(typeof staff.businessId).toBe('string');
    expect(typeof staff.name).toBe('string');
    expect(staff.createdAt).toBeInstanceOf(Date);
  }

  static expectTimeSlotFormat(slot: string) {
    expect(slot).toMatch(/^\d{2}:\d{2}$/);
    const [hours, minutes] = slot.split(':').map(Number);
    expect(hours).toBeGreaterThanOrEqual(0);
    expect(hours).toBeLessThan(24);
    expect(minutes).toBeGreaterThanOrEqual(0);
    expect(minutes).toBeLessThan(60);
  }

  static expectConflictError(error: any) {
    expect(error).toHaveProperty('code', 'SLOT_CONFLICT');
    expect(error).toHaveProperty('message');
    expect(error).toHaveProperty('conflictingBooking');
    expect(error.conflictingBooking).toHaveProperty('id');
    expect(error.conflictingBooking).toHaveProperty('startTs');
    expect(error.conflictingBooking).toHaveProperty('endTs');
    expect(error.conflictingBooking).toHaveProperty('status');
  }
}

// Утилиты для работы с датами в тестах
export class TestDateUtils {
  static getFutureDate(daysFromNow: number = 30): string {
    const date = new Date();
    date.setDate(date.getDate() + daysFromNow);
    return date.toISOString();
  }

  static getPastDate(daysAgo: number = 30): string {
    const date = new Date();
    date.setDate(date.getDate() - daysAgo);
    return date.toISOString();
  }

  static getTodayAtTime(time: string): string {
    const [hours, minutes] = time.split(':').map(Number);
    const date = new Date();
    date.setHours(hours, minutes, 0, 0);
    return date.toISOString();
  }

  static getTomorrowAtTime(time: string): string {
    const [hours, minutes] = time.split(':').map(Number);
    const date = new Date();
    date.setDate(date.getDate() + 1);
    date.setHours(hours, minutes, 0, 0);
    return date.toISOString();
  }

  static formatTimeSlot(date: Date): string {
    return date.toTimeString().slice(0, 5); // HH:MM format
  }
}
