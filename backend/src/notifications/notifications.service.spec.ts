import { Test, TestingModule } from '@nestjs/testing';
import {
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { PrismaService } from '../prisma/prisma.service';
import { VkService } from '../auth/vk.service';
import {
  CreateNotificationDto,
  NotificationQueryDto,
} from './dto/notification.dto';

describe('NotificationsService', () => {
  let service: NotificationsService;
  let prismaService: PrismaService;
  let vkService: VkService;

  const mockPrismaService = {
    business: {
      findUnique: jest.fn(),
    },
    booking: {
      findUnique: jest.fn(),
    },
    notification: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
    },
  };

  const mockVkService = {
    sendMessage: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationsService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: VkService,
          useValue: mockVkService,
        },
      ],
    }).compile();

    service = module.get<NotificationsService>(NotificationsService);
    prismaService = module.get<PrismaService>(PrismaService);
    vkService = module.get<VkService>(VkService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    const businessId = 'business-id';
    const userId = 'user-id';
    const createNotificationDto: CreateNotificationDto = {
      bookingId: 'booking-id',
      type: 'SMS',
      template: 'BOOKING_CONFIRMED',
    };

    const mockBooking = {
      id: 'booking-id',
      businessId,
      startTs: new Date('2025-01-15T12:00:00Z'),
      clientId: 'client-id',
      business: {
        id: businessId,
        name: 'Тестовый салон',
      },
      service: {
        id: 'service-id',
        title: 'Маникюр',
      },
      staff: {
        id: 'staff-id',
        name: 'Мария Иванова',
      },
      client: {
        id: 'client-id',
        name: 'Елена Смирнова',
        phone: '+7 999 123 45 67',
        email: 'elena@example.com',
      },
    };

    beforeEach(() => {
      mockPrismaService.business.findUnique.mockResolvedValue({
        id: businessId,
        ownerId: userId,
      });
      mockPrismaService.booking.findUnique.mockResolvedValue(mockBooking);
    });

    it('должен успешно создать уведомление', async () => {
      const createdNotification = {
        id: 'notification-id',
        businessId,
        bookingId: 'booking-id',
        clientId: 'client-id',
        type: 'SMS',
        template: 'BOOKING_CONFIRMED',
        message: expect.any(String),
        status: 'PENDING',
        scheduledFor: expect.any(Date),
        createdAt: new Date(),
      };

      mockPrismaService.notification.create.mockResolvedValue(
        createdNotification,
      );

      // Мокаем приватный метод sendNotificationAsync
      jest.spyOn(service as any, 'sendNotificationAsync').mockImplementation();

      const result = await service.create(
        businessId,
        userId,
        createNotificationDto,
      );

      expect(mockPrismaService.notification.create).toHaveBeenCalledWith({
        data: {
          businessId,
          bookingId: 'booking-id',
          clientId: 'client-id',
          type: 'SMS',
          template: 'BOOKING_CONFIRMED',
          message: expect.any(String),
          status: 'PENDING',
          scheduledFor: expect.any(Date),
        },
      });
      expect(result).toEqual(createdNotification);
    });

    it('должен использовать кастомное сообщение', async () => {
      const customMessage = 'Кастомное сообщение для клиента';
      const dtoWithCustomMessage = {
        ...createNotificationDto,
        customMessage,
      };

      const createdNotification = {
        id: 'notification-id',
        message: customMessage,
      };

      mockPrismaService.notification.create.mockResolvedValue(
        createdNotification,
      );
      jest.spyOn(service as any, 'sendNotificationAsync').mockImplementation();

      await service.create(businessId, userId, dtoWithCustomMessage);

      expect(mockPrismaService.notification.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          message: customMessage,
        }),
      });
    });

    it('должен выбросить NotFoundException если запись не найдена', async () => {
      mockPrismaService.booking.findUnique.mockResolvedValue(null);

      await expect(
        service.create(businessId, userId, createNotificationDto),
      ).rejects.toThrow(NotFoundException);
    });

    it('должен выбросить ForbiddenException если запись не принадлежит бизнесу', async () => {
      const bookingFromOtherBusiness = {
        ...mockBooking,
        businessId: 'other-business-id',
      };
      mockPrismaService.booking.findUnique.mockResolvedValue(
        bookingFromOtherBusiness,
      );

      await expect(
        service.create(businessId, userId, createNotificationDto),
      ).rejects.toThrow(ForbiddenException);
    });

    it('должен выбросить BadRequestException если у записи нет клиента', async () => {
      const bookingWithoutClient = {
        ...mockBooking,
        clientId: null,
        client: null,
      };
      mockPrismaService.booking.findUnique.mockResolvedValue(
        bookingWithoutClient,
      );

      await expect(
        service.create(businessId, userId, createNotificationDto),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('findAll', () => {
    const businessId = 'business-id';
    const userId = 'user-id';

    beforeEach(() => {
      mockPrismaService.business.findUnique.mockResolvedValue({
        id: businessId,
        ownerId: userId,
      });
    });

    it('должен вернуть все уведомления бизнеса', async () => {
      const notifications = [
        {
          id: 'notification-1',
          businessId,
          type: 'SMS',
          status: 'SENT',
          booking: {
            id: 'booking-1',
            service: { title: 'Маникюр' },
            staff: { name: 'Мария' },
            client: { name: 'Елена' },
          },
          client: { name: 'Елена' },
        },
        {
          id: 'notification-2',
          businessId,
          type: 'EMAIL',
          status: 'PENDING',
          booking: {
            id: 'booking-2',
            service: { title: 'Педикюр' },
            staff: { name: 'Анна' },
            client: { name: 'Ольга' },
          },
          client: { name: 'Ольга' },
        },
      ];

      mockPrismaService.notification.findMany.mockResolvedValue(notifications);

      const result = await service.findAll(businessId, userId, {});

      expect(mockPrismaService.notification.findMany).toHaveBeenCalledWith({
        where: { businessId },
        include: {
          booking: {
            include: {
              service: true,
              staff: true,
              client: true,
            },
          },
          client: true,
        },
        orderBy: { createdAt: 'desc' },
      });
      expect(result).toEqual(notifications);
    });

    it('должен фильтровать уведомления по параметрам', async () => {
      const query: NotificationQueryDto = {
        bookingId: 'booking-id',
        type: 'SMS',
        status: 'SENT',
      };

      await service.findAll(businessId, userId, query);

      expect(mockPrismaService.notification.findMany).toHaveBeenCalledWith({
        where: {
          businessId,
          bookingId: 'booking-id',
          type: 'SMS',
          status: 'SENT',
        },
        include: expect.any(Object),
        orderBy: { createdAt: 'desc' },
      });
    });
  });

  describe('findOne', () => {
    const notificationId = 'notification-id';
    const userId = 'user-id';
    const businessId = 'business-id';

    it('должен вернуть уведомление для владельца бизнеса', async () => {
      const notification = {
        id: notificationId,
        businessId,
        type: 'SMS',
        status: 'SENT',
        business: {
          id: businessId,
          ownerId: userId,
        },
        booking: {
          id: 'booking-id',
          service: { title: 'Маникюр' },
          staff: { name: 'Мария' },
          client: { name: 'Елена' },
        },
        client: { name: 'Елена' },
      };

      mockPrismaService.notification.findUnique.mockResolvedValue(notification);
      mockPrismaService.business.findUnique.mockResolvedValue({
        id: businessId,
        ownerId: userId,
      });

      const result = await service.findOne(notificationId, userId);

      expect(mockPrismaService.notification.findUnique).toHaveBeenCalledWith({
        where: { id: notificationId },
        include: {
          business: true,
          booking: {
            include: {
              service: true,
              staff: true,
              client: true,
            },
          },
          client: true,
        },
      });
      expect(result).toEqual(notification);
    });

    it('должен выбросить NotFoundException если уведомление не найдено', async () => {
      mockPrismaService.notification.findUnique.mockResolvedValue(null);

      await expect(service.findOne(notificationId, userId)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('должен выбросить ForbiddenException если нет доступа к уведомлению', async () => {
      const notification = {
        id: notificationId,
        businessId,
        business: {
          id: businessId,
          ownerId: 'other-user-id',
        },
      };

      mockPrismaService.notification.findUnique.mockResolvedValue(notification);
      mockPrismaService.business.findUnique.mockResolvedValue({
        id: businessId,
        ownerId: 'other-user-id',
      });

      await expect(service.findOne(notificationId, userId)).rejects.toThrow(
        ForbiddenException,
      );
    });
  });

  describe('resend', () => {
    const notificationId = 'notification-id';
    const userId = 'user-id';
    const businessId = 'business-id';

    it('должен успешно переотправить уведомление', async () => {
      const notification = {
        id: notificationId,
        businessId,
        status: 'FAILED',
        business: {
          id: businessId,
          ownerId: userId,
        },
        booking: {
          id: 'booking-id',
          service: { title: 'Маникюр' },
          staff: { name: 'Мария' },
          client: { name: 'Елена' },
        },
        client: { name: 'Елена' },
      };

      mockPrismaService.notification.findUnique
        .mockResolvedValueOnce(notification) // Первый вызов в findOne
        .mockResolvedValueOnce(notification); // Второй вызов в sendNotificationAsync
      mockPrismaService.business.findUnique.mockResolvedValue({
        id: businessId,
        ownerId: userId,
      });
      mockPrismaService.notification.update.mockResolvedValue({
        ...notification,
        status: 'PENDING',
      });

      // Мокаем приватный метод sendNotificationAsync
      jest.spyOn(service as any, 'sendNotificationAsync').mockImplementation();

      const result = await service.resend(notificationId, userId);

      expect(mockPrismaService.notification.update).toHaveBeenCalledWith({
        where: { id: notificationId },
        data: { status: 'PENDING' },
      });
      expect(result).toEqual({
        message: 'Уведомление поставлено в очередь на отправку',
      });
    });

    it('должен выбросить BadRequestException если уведомление уже отправлено', async () => {
      const sentNotification = {
        id: notificationId,
        businessId,
        status: 'SENT',
        business: {
          id: businessId,
          ownerId: userId,
        },
        booking: {
          id: 'booking-id',
          service: { title: 'Маникюр' },
          staff: { name: 'Мария' },
          client: { name: 'Елена' },
        },
        client: { name: 'Елена' },
      };

      // Мокаем findOne чтобы он вернул отправленное уведомление
      jest.spyOn(service, 'findOne').mockResolvedValue(sentNotification as any);

      await expect(service.resend(notificationId, userId)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('generateMessage', () => {
    const mockBooking = {
      business: { name: 'Тестовый салон' },
      service: { title: 'Маникюр' },
      staff: { name: 'Мария Иванова' },
      client: { name: 'Елена Смирнова' },
      startTs: new Date('2025-01-15T12:00:00Z'),
    };

    it('должен генерировать сообщение для BOOKING_CONFIRMED', () => {
      const message = (service as any).generateMessage(
        'BOOKING_CONFIRMED',
        mockBooking,
      );

      expect(message).toContain('Елена Смирнова');
      expect(message).toContain('Тестовый салон');
      expect(message).toContain('Маникюр');
      expect(message).toContain('Мария Иванова');
      expect(message).toContain('подтверждена');
    });

    it('должен генерировать сообщение для BOOKING_CANCELLED', () => {
      const message = (service as any).generateMessage(
        'BOOKING_CANCELLED',
        mockBooking,
      );

      expect(message).toContain('отменена');
      expect(message).toContain('переноса');
    });

    it('должен генерировать сообщение для BOOKING_REMINDER', () => {
      const message = (service as any).generateMessage(
        'BOOKING_REMINDER',
        mockBooking,
      );

      expect(message).toContain('Напоминаем');
      expect(message).toContain('завтра');
    });

    it('должен использовать кастомное сообщение', () => {
      const customMessage = 'Кастомное сообщение';
      const message = (service as any).generateMessage(
        'BOOKING_CONFIRMED',
        mockBooking,
        customMessage,
      );

      expect(message).toBe(customMessage);
    });

    it('должен вернуть дефолтное сообщение для неизвестного шаблона', () => {
      const message = (service as any).generateMessage(
        'UNKNOWN_TEMPLATE',
        mockBooking,
      );

      expect(message).toBe('Уведомление от Тестовый салон');
    });
  });

  describe('calculateScheduledTime', () => {
    it('должен рассчитать время для BOOKING_REMINDER', () => {
      const bookingStartTs = '2025-01-16T12:00:00Z'; // Завтра
      const scheduledTime = (service as any).calculateScheduledTime(
        'BOOKING_REMINDER',
        bookingStartTs,
      );

      expect(scheduledTime).toBeInstanceOf(Date);
      // Проверяем, что время установлено на 18:00 предыдущего дня
      // Учитываем, что если напоминание в прошлом, то возвращается текущее время
      const bookingTime = new Date(bookingStartTs);
      const reminderTime = new Date(bookingTime);
      reminderTime.setDate(reminderTime.getDate() - 1);
      reminderTime.setHours(18, 0, 0, 0);

      if (reminderTime > new Date()) {
        expect(scheduledTime.getHours()).toBe(18);
        expect(scheduledTime.getMinutes()).toBe(0);
      } else {
        // Если напоминание в прошлом, должно вернуться текущее время
        expect(scheduledTime).toBeInstanceOf(Date);
      }
    });

    it('должен вернуть текущее время для других шаблонов', () => {
      const bookingStartTs = '2025-01-15T12:00:00Z';
      const scheduledTime = (service as any).calculateScheduledTime(
        'BOOKING_CONFIRMED',
        bookingStartTs,
      );

      expect(scheduledTime).toBeInstanceOf(Date);
      // Время должно быть близко к текущему
      const now = new Date();
      const timeDiff = Math.abs(scheduledTime.getTime() - now.getTime());
      expect(timeDiff).toBeLessThan(1000); // Разница менее 1 секунды
    });
  });

  describe('sendNotificationAsync', () => {
    const notificationId = 'notification-id';

    it('должен успешно отправить SMS уведомление', async () => {
      const notification = {
        id: notificationId,
        type: 'SMS',
        message: 'Тестовое сообщение',
        client: {
          phone: '+7 999 123 45 67',
        },
        booking: {
          business: { name: 'Тестовый салон' },
          service: { title: 'Маникюр' },
          staff: { name: 'Мария' },
        },
      };

      // Мокаем findUnique с правильной структурой
      mockPrismaService.notification.findUnique.mockResolvedValue({
        ...notification,
        type: 'SMS', // Добавляем тип
        client: notification.client,
        booking: {
          ...notification.booking,
          business: notification.booking.business,
          service: notification.booking.service,
          staff: notification.booking.staff,
        },
      });

      mockPrismaService.notification.update.mockResolvedValue({
        ...notification,
        status: 'SENT',
        sentAt: new Date(),
      });

      // Мокаем приватные методы отправки - используем правильный подход
      jest
        .spyOn(NotificationsService.prototype as any, 'sendSMS')
        .mockResolvedValue(true);

      await (service as any).sendNotificationAsync(notificationId);

      // Проверяем, что метод выполнился без ошибок
      expect(mockPrismaService.notification.update).toHaveBeenCalled();
    });

    it('должен обработать ошибку отправки', async () => {
      const notification = {
        id: notificationId,
        type: 'SMS',
        message: 'Тестовое сообщение',
        client: { phone: '+7 999 123 45 67' },
        booking: {
          business: { name: 'Тестовый салон' },
          service: { title: 'Маникюр' },
          staff: { name: 'Мария' },
        },
      };

      mockPrismaService.notification.findUnique.mockResolvedValue(notification);
      mockPrismaService.notification.update.mockResolvedValue({
        ...notification,
        status: 'FAILED',
      });

      // Мокаем ошибку отправки
      jest
        .spyOn(NotificationsService.prototype as any, 'sendSMS')
        .mockRejectedValue(new Error('SMS service error'));

      await (service as any).sendNotificationAsync(notificationId);

      expect(mockPrismaService.notification.update).toHaveBeenCalledWith({
        where: { id: notificationId },
        data: { status: 'FAILED' },
      });
    });
  });

  describe('sendSMS', () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
      jest.clearAllMocks();
    });

    it('должен успешно отправить SMS', async () => {
      const notification = {
        id: 'notification-id',
        client: { phone: '+7 999 123 45 67' },
        message: 'Тестовое SMS',
      };

      // Сбрасываем все моки перед тестом
      jest.restoreAllMocks();

      // Мокаем setTimeout чтобы избежать реальной задержки
      jest.spyOn(global, 'setTimeout').mockImplementation((callback: any) => {
        // Выполняем callback синхронно
        if (typeof callback === 'function') {
          callback();
        }
        return {} as any;
      });

      const result = await (service as any).sendSMS(notification);

      expect(result).toBe(true);
    });
  });

  describe('sendEmail', () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('должен успешно отправить email', async () => {
      const notification = {
        client: { email: 'test@example.com' },
        message: 'Тестовое email',
      };

      const resultPromise = (service as any).sendEmail(notification);

      // Быстро продвигаем время вперед
      jest.advanceTimersByTime(1000);

      const result = await resultPromise;

      expect(result).toBe(true);
    });

    it('должен вернуть false если у клиента нет email', async () => {
      const notification = {
        client: { email: null },
        message: 'Тестовое email',
      };

      const result = await (service as any).sendEmail(notification);

      expect(result).toBe(false);
    });
  });

  describe('sendVK', () => {
    it('должен успешно отправить VK сообщение', async () => {
      const notification = {
        client: { vkId: '123456789' },
        message: 'Тестовое VK сообщение',
      };

      mockVkService.sendMessage.mockResolvedValue(true);

      const result = await (service as any).sendVK(notification);

      expect(mockVkService.sendMessage).toHaveBeenCalledWith(
        123456789,
        'Тестовое VK сообщение',
        expect.any(String),
      );
      expect(result).toBe(true);
    });

    it('должен вернуть false если у клиента нет VK ID', async () => {
      const notification = {
        client: { vkId: null },
        message: 'Тестовое VK сообщение',
      };

      const result = await (service as any).sendVK(notification);

      expect(result).toBe(false);
    });

    it('должен обработать ошибку VK API', async () => {
      const notification = {
        client: { vkId: '123456789' },
        message: 'Тестовое VK сообщение',
      };

      mockVkService.sendMessage.mockRejectedValue(new Error('VK API error'));

      const result = await (service as any).sendVK(notification);

      expect(result).toBe(false);
    });
  });

  describe('checkBusinessAccess', () => {
    const businessId = 'business-id';
    const userId = 'user-id';

    it('должен пройти проверку для владельца бизнеса', async () => {
      mockPrismaService.business.findUnique.mockResolvedValue({
        id: businessId,
        ownerId: userId,
      });

      await expect(
        (service as any).checkBusinessAccess(businessId, userId),
      ).resolves.not.toThrow();
    });

    it('должен выбросить NotFoundException для несуществующего бизнеса', async () => {
      mockPrismaService.business.findUnique.mockResolvedValue(null);

      await expect(
        (service as any).checkBusinessAccess(businessId, userId),
      ).rejects.toThrow(NotFoundException);
    });

    it('должен выбросить ForbiddenException для невладельца бизнеса', async () => {
      mockPrismaService.business.findUnique.mockResolvedValue({
        id: businessId,
        ownerId: 'other-user-id',
      });

      await expect(
        (service as any).checkBusinessAccess(businessId, userId),
      ).rejects.toThrow(ForbiddenException);
    });
  });
});
