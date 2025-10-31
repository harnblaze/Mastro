import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, ForbiddenException } from '@nestjs/common';
import { AvailabilityService } from './availability.service';
import { PrismaService } from '../prisma/prisma.service';

describe('AvailabilityService', () => {
  let service: AvailabilityService;
  let prismaService: PrismaService;

  const mockPrismaService = {
    business: {
      findFirst: jest.fn(),
    },
    service: {
      findFirst: jest.fn(),
    },
    availabilityException: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      delete: jest.fn(),
    },
    booking: {
      findMany: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AvailabilityService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<AvailabilityService>(AvailabilityService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getBusinessAvailability', () => {
    const businessId = 'business-id';
    const userId = 'user-id';
    const date = '2025-01-15';

    const mockBusiness = {
      id: businessId,
      ownerId: userId,
      workingHours: {
        monday: { start: '09:00', end: '18:00', isWorking: true },
        tuesday: { start: '09:00', end: '18:00', isWorking: true },
        wednesday: { start: '09:00', end: '18:00', isWorking: true },
        thursday: { start: '09:00', end: '18:00', isWorking: true },
        friday: { start: '09:00', end: '18:00', isWorking: true },
        saturday: { start: '10:00', end: '16:00', isWorking: true },
        sunday: { start: '10:00', end: '16:00', isWorking: false },
      },
    };

    beforeEach(() => {
      mockPrismaService.business.findFirst.mockResolvedValue(mockBusiness);
      mockPrismaService.availabilityException.findMany.mockResolvedValue([]);
      mockPrismaService.booking.findMany.mockResolvedValue([]);
      mockPrismaService.service.findFirst.mockResolvedValue({
        id: 'service-id',
        durationMinutes: 60,
      });
    });

    it('должен вернуть доступные слоты для рабочего дня', async () => {
      const result = await service.getBusinessAvailability(
        businessId,
        userId,
        date,
      );

      expect(result).toHaveProperty('date', date);
      expect(result).toHaveProperty('isWorkingDay', true);
      expect(result).toHaveProperty('slots');
      expect(result).toHaveProperty('workingHours');
      expect(Array.isArray(result.slots)).toBe(true);
      expect(result.slots.length).toBeGreaterThan(0);

      // Проверяем формат слотов
      result.slots.forEach((slot) => {
        expect(slot).toHaveProperty('startTime');
        expect(slot).toHaveProperty('endTime');
        expect(slot).toHaveProperty('isAvailable');
        expect(slot.startTime).toMatch(/^\d{2}:\d{2}$/);
        expect(slot.endTime).toMatch(/^\d{2}:\d{2}$/);
        expect(typeof slot.isAvailable).toBe('boolean');
      });
    });

    it('должен вернуть пустые слоты для нерабочего дня', async () => {
      // Устанавливаем воскресенье (нерабочий день)
      const sundayDate = '2025-01-19'; // Воскресенье

      const result = await service.getBusinessAvailability(
        businessId,
        userId,
        sundayDate,
      );

      expect(result).toHaveProperty('date', sundayDate);
      expect(result).toHaveProperty('isWorkingDay', false);
      expect(result.slots).toEqual([]);
    });

    it('должен исключить занятые слоты', async () => {
      const existingBookings = [
        {
          id: 'booking-1',
          startTs: new Date('2025-01-15T10:00:00'),
          endTs: new Date('2025-01-15T11:00:00'),
          status: 'CONFIRMED',
          staffId: 'staff-id',
          service: { title: 'Маникюр' },
          staff: { name: 'Мария' },
        },
        {
          id: 'booking-2',
          startTs: new Date('2025-01-15T14:00:00'),
          endTs: new Date('2025-01-15T15:00:00'),
          status: 'PENDING',
          staffId: 'staff-id',
          service: { title: 'Педикюр' },
          staff: { name: 'Анна' },
        },
      ];

      mockPrismaService.booking.findMany.mockResolvedValue(existingBookings);

      const result = await service.getBusinessAvailability(
        businessId,
        userId,
        date,
        'staff-id',
      );

      expect(result.slots.length).toBeGreaterThan(0);

      // Проверяем, что некоторые слоты помечены как занятые
      const bookedSlots = result.slots.filter((slot) => !slot.isAvailable);
      expect(bookedSlots.length).toBeGreaterThan(0);

      // Проверяем причины недоступности
      bookedSlots.forEach((slot) => {
        expect(slot.reason).toBeDefined();
        expect(['Занято', 'Исключение']).toContain(slot.reason);
      });
    });

    it('должен обработать исключения типа CLOSED', async () => {
      const closedException = {
        id: 'exception-1',
        type: 'CLOSED',
        date: new Date('2025-01-15'),
        reason: 'Выходной день',
      };

      mockPrismaService.availabilityException.findMany.mockResolvedValue([
        closedException,
      ]);

      const result = await service.getBusinessAvailability(
        businessId,
        userId,
        date,
      );

      expect(result.slots).toHaveLength(1);
      expect(result.slots[0].isAvailable).toBe(false);
      expect(result.slots[0].reason).toBe('Выходной день');
    });

    it('должен обработать исключения типа OPEN_CUSTOM', async () => {
      const customException = {
        id: 'exception-1',
        type: 'OPEN_CUSTOM',
        startTime: '11:00',
        endTime: '15:00',
        date: new Date('2025-01-15'),
        reason: 'Сокращенный рабочий день',
      };

      mockPrismaService.availabilityException.findMany.mockResolvedValue([
        customException,
      ]);

      const result = await service.getBusinessAvailability(
        businessId,
        userId,
        date,
      );

      expect(result.slots.length).toBeGreaterThan(0);

      // Проверяем, что слоты в диапазоне исключения помечены как недоступные
      const exceptionSlots = result.slots.filter(
        (slot) => slot.reason === 'Исключение',
      );
      expect(exceptionSlots.length).toBeGreaterThan(0);
    });

    it('должен использовать длительность услуги для расчета слотов', async () => {
      const serviceId = 'service-id';
      const customService = {
        id: serviceId,
        durationMinutes: 90, // 90 минут вместо стандартных 60
      };

      mockPrismaService.service.findFirst.mockResolvedValue(customService);

      const result = await service.getBusinessAvailability(
        businessId,
        userId,
        date,
        serviceId,
      );

      expect(result.slots.length).toBeGreaterThan(0);

      // Проверяем, что слоты имеют правильную длительность
      result.slots.forEach((slot) => {
        const [startHour, startMinute] = slot.startTime.split(':').map(Number);
        const [endHour, endMinute] = slot.endTime.split(':').map(Number);
        const duration = (endHour - startHour) * 60 + (endMinute - startMinute);
        expect(duration).toBe(90);
      });
    });

    it('должен фильтровать записи по сотруднику', async () => {
      const staffId = 'staff-id';

      await service.getBusinessAvailability(
        businessId,
        userId,
        date,
        undefined,
        staffId,
      );

      expect(mockPrismaService.booking.findMany).toHaveBeenCalledWith({
        where: expect.objectContaining({
          staffId,
        }),
        include: {
          service: true,
          staff: true,
        },
      });
    });

    it('должен выбросить ForbiddenException если нет доступа к бизнесу', async () => {
      mockPrismaService.business.findFirst.mockResolvedValue(null);

      await expect(
        service.getBusinessAvailability(businessId, userId, date),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('createAvailabilityException', () => {
    const businessId = 'business-id';
    const userId = 'user-id';

    beforeEach(() => {
      mockPrismaService.business.findFirst.mockResolvedValue({
        id: businessId,
        ownerId: userId,
      });
    });

    it('должен создать исключение типа CLOSED', async () => {
      const exceptionData = {
        date: '2025-01-20',
        type: 'CLOSED' as const,
        reason: 'Выходной день',
      };

      const createdException = {
        id: 'exception-id',
        businessId,
        ...exceptionData,
        date: new Date(exceptionData.date),
      };

      mockPrismaService.availabilityException.create.mockResolvedValue(
        createdException,
      );

      const result = await service.createAvailabilityException(
        businessId,
        userId,
        exceptionData,
      );

      expect(
        mockPrismaService.availabilityException.create,
      ).toHaveBeenCalledWith({
        data: {
          businessId,
          date: new Date(exceptionData.date),
          startTime: undefined,
          endTime: undefined,
          type: 'CLOSED',
          reason: 'Выходной день',
        },
      });
      expect(result).toEqual(createdException);
    });

    it('должен создать исключение типа OPEN_CUSTOM', async () => {
      const exceptionData = {
        date: '2025-01-21',
        startTime: '11:00',
        endTime: '15:00',
        type: 'OPEN_CUSTOM' as const,
        reason: 'Сокращенный рабочий день',
      };

      const createdException = {
        id: 'exception-id',
        businessId,
        ...exceptionData,
        date: new Date(exceptionData.date),
      };

      mockPrismaService.availabilityException.create.mockResolvedValue(
        createdException,
      );

      const result = await service.createAvailabilityException(
        businessId,
        userId,
        exceptionData,
      );

      expect(
        mockPrismaService.availabilityException.create,
      ).toHaveBeenCalledWith({
        data: {
          businessId,
          date: new Date(exceptionData.date),
          startTime: '11:00',
          endTime: '15:00',
          type: 'OPEN_CUSTOM',
          reason: 'Сокращенный рабочий день',
        },
      });
      expect(result).toEqual(createdException);
    });

    it('должен выбросить ForbiddenException если нет доступа к бизнесу', async () => {
      mockPrismaService.business.findFirst.mockResolvedValue(null);

      const exceptionData = {
        date: '2025-01-20',
        type: 'CLOSED' as const,
      };

      await expect(
        service.createAvailabilityException(businessId, userId, exceptionData),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('getAvailabilityExceptions', () => {
    const businessId = 'business-id';
    const userId = 'user-id';

    beforeEach(() => {
      mockPrismaService.business.findFirst.mockResolvedValue({
        id: businessId,
        ownerId: userId,
      });
    });

    it('должен вернуть все исключения бизнеса', async () => {
      const exceptions = [
        {
          id: 'exception-1',
          businessId,
          date: new Date('2025-01-20'),
          type: 'CLOSED',
          reason: 'Выходной день',
        },
        {
          id: 'exception-2',
          businessId,
          date: new Date('2025-01-21'),
          startTime: '11:00',
          endTime: '15:00',
          type: 'OPEN_CUSTOM',
          reason: 'Сокращенный день',
        },
      ];

      mockPrismaService.availabilityException.findMany.mockResolvedValue(
        exceptions,
      );

      const result = await service.getAvailabilityExceptions(
        businessId,
        userId,
      );

      expect(
        mockPrismaService.availabilityException.findMany,
      ).toHaveBeenCalledWith({
        where: { businessId },
        orderBy: { date: 'asc' },
      });
      expect(result).toEqual(exceptions);
    });

    it('должен фильтровать исключения по дате', async () => {
      const from = '2025-01-20';
      const to = '2025-01-25';

      await service.getAvailabilityExceptions(businessId, userId, from, to);

      expect(
        mockPrismaService.availabilityException.findMany,
      ).toHaveBeenCalledWith({
        where: {
          businessId,
          date: {
            gte: new Date(from),
            lte: new Date(to),
          },
        },
        orderBy: { date: 'asc' },
      });
    });

    it('должен выбросить ForbiddenException если нет доступа к бизнесу', async () => {
      mockPrismaService.business.findFirst.mockResolvedValue(null);

      await expect(
        service.getAvailabilityExceptions(businessId, userId),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('deleteAvailabilityException', () => {
    const exceptionId = 'exception-id';
    const userId = 'user-id';
    const businessId = 'business-id';

    it('должен успешно удалить исключение для владельца бизнеса', async () => {
      const exception = {
        id: exceptionId,
        businessId,
        business: {
          ownerId: userId,
          staff: [],
        },
      };

      const deletedException = {
        id: exceptionId,
        businessId,
      };

      mockPrismaService.availabilityException.findFirst.mockResolvedValue(
        exception,
      );
      mockPrismaService.availabilityException.delete.mockResolvedValue(
        deletedException,
      );

      const result = await service.deleteAvailabilityException(
        exceptionId,
        userId,
      );

      expect(
        mockPrismaService.availabilityException.delete,
      ).toHaveBeenCalledWith({
        where: { id: exceptionId },
      });
      expect(result).toEqual(deletedException);
    });

    it('должен удалить исключение для сотрудника бизнеса', async () => {
      const exception = {
        id: exceptionId,
        businessId,
        business: {
          ownerId: 'other-user-id',
          staff: [{ userId }],
        },
      };

      const deletedException = {
        id: exceptionId,
        businessId,
      };

      mockPrismaService.availabilityException.findFirst.mockResolvedValue(
        exception,
      );
      mockPrismaService.availabilityException.delete.mockResolvedValue(
        deletedException,
      );

      const result = await service.deleteAvailabilityException(
        exceptionId,
        userId,
      );

      expect(result).toEqual(deletedException);
    });

    it('должен выбросить NotFoundException если исключение не найдено', async () => {
      mockPrismaService.availabilityException.findFirst.mockResolvedValue(null);

      await expect(
        service.deleteAvailabilityException(exceptionId, userId),
      ).rejects.toThrow(NotFoundException);
    });

    it('должен выбросить ForbiddenException если нет доступа к исключению', async () => {
      const exception = {
        id: exceptionId,
        businessId,
        business: {
          ownerId: 'other-user-id',
          staff: [],
        },
      };

      mockPrismaService.availabilityException.findFirst.mockResolvedValue(
        exception,
      );

      await expect(
        service.deleteAvailabilityException(exceptionId, userId),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('getDayOfWeek', () => {
    it('должен правильно определять день недели', () => {
      // Тестируем приватный метод через рефлексию
      const monday = new Date('2025-01-13'); // Понедельник
      const sunday = new Date('2025-01-19'); // Воскресенье

      expect((service as any).getDayOfWeek(monday)).toBe('monday');
      expect((service as any).getDayOfWeek(sunday)).toBe('sunday');
    });
  });

  describe('minutesToTimeString', () => {
    it('должен правильно конвертировать минуты в строку времени', () => {
      // Тестируем приватный метод через рефлексию
      expect((service as any).minutesToTimeString(0)).toBe('00:00');
      expect((service as any).minutesToTimeString(60)).toBe('01:00');
      expect((service as any).minutesToTimeString(90)).toBe('01:30');
      expect((service as any).minutesToTimeString(1440)).toBe('24:00');
    });
  });
});
