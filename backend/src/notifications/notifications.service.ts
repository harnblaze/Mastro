import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { VkService } from '../auth/vk.service';
import {
  CreateNotificationDto,
  NotificationQueryDto,
} from './dto/notification.dto';

@Injectable()
export class NotificationsService {
  constructor(
    private prisma: PrismaService,
    private vkService: VkService,
  ) {}

  async create(
    businessId: string,
    userId: string,
    createNotificationDto: CreateNotificationDto,
  ) {
    await this.checkBusinessAccess(businessId, userId);

    const { bookingId, type, template, customMessage } = createNotificationDto;

    // Получаем информацию о записи
    const booking = await this.prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        business: true,
        service: true,
        staff: true,
        client: true,
      },
    });

    if (!booking) {
      throw new NotFoundException('Запись не найдена');
    }

    if (booking.businessId !== businessId) {
      throw new ForbiddenException('Запись не принадлежит этому бизнесу');
    }

    if (!booking.client) {
      throw new BadRequestException(
        'У записи нет клиента для отправки уведомления',
      );
    }

    // Генерируем сообщение
    const message = this.generateMessage(template, booking, customMessage);

    // Создаем уведомление
    const notification = await this.prisma.notification.create({
      data: {
        businessId,
        bookingId,
        clientId: booking.clientId!,
        type,
        template,
        message,
        status: 'PENDING',
        scheduledFor: this.calculateScheduledTime(
          template,
          booking.startTs.toISOString(),
        ),
      },
    });

    // Отправляем уведомление асинхронно
    this.sendNotificationAsync(notification.id);

    return notification;
  }

  async findAll(
    businessId: string,
    userId: string,
    query: NotificationQueryDto,
  ) {
    await this.checkBusinessAccess(businessId, userId);

    const where: any = {
      businessId,
    };

    if (query.bookingId) {
      where.bookingId = query.bookingId;
    }

    if (query.type) {
      where.type = query.type;
    }

    if (query.status) {
      where.status = query.status;
    }

    return this.prisma.notification.findMany({
      where,
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
  }

  async findOne(id: string, userId: string) {
    const notification = await this.prisma.notification.findUnique({
      where: { id },
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

    if (!notification) {
      throw new NotFoundException('Уведомление не найдено');
    }

    await this.checkBusinessAccess(notification.businessId, userId);

    return notification;
  }

  async resend(id: string, userId: string) {
    const notification = await this.findOne(id, userId);

    if (notification.status === 'SENT') {
      throw new BadRequestException('Уведомление уже отправлено');
    }

    // Обновляем статус и отправляем заново
    await this.prisma.notification.update({
      where: { id },
      data: { status: 'PENDING' },
    });

    this.sendNotificationAsync(id);

    return { message: 'Уведомление поставлено в очередь на отправку' };
  }

  private generateMessage(
    template: string,
    booking: any,
    customMessage?: string,
  ): string {
    if (customMessage) {
      return customMessage;
    }

    const businessName = booking.business.name;
    const serviceName = booking.service.title;
    const staffName = booking.staff.name;
    const clientName = booking.client.name;
    const date = new Date(booking.startTs).toLocaleDateString('ru-RU');
    const time = new Date(booking.startTs).toLocaleTimeString('ru-RU', {
      hour: '2-digit',
      minute: '2-digit',
    });

    switch (template) {
      case 'BOOKING_CREATED':
        return `Привет, ${clientName}! Ваша запись в ${businessName} создана: ${serviceName} с ${staffName} на ${date} в ${time}. Ожидаем подтверждения.`;

      case 'BOOKING_CONFIRMED':
        return `Привет, ${clientName}! Ваша запись в ${businessName} подтверждена: ${serviceName} с ${staffName} на ${date} в ${time}. Ждем вас!`;

      case 'BOOKING_CANCELLED':
        return `Привет, ${clientName}! Ваша запись в ${businessName} отменена: ${serviceName} с ${staffName} на ${date} в ${time}. Свяжитесь с нами для переноса.`;

      case 'BOOKING_REMINDER':
        return `Привет, ${clientName}! Напоминаем о записи в ${businessName}: ${serviceName} с ${staffName} завтра в ${time}. До встречи!`;

      default:
        return `Уведомление от ${businessName}`;
    }
  }

  private calculateScheduledTime(
    template: string,
    bookingStartTs: string,
  ): Date {
    const bookingTime = new Date(bookingStartTs);
    const now = new Date();

    switch (template) {
      case 'BOOKING_REMINDER':
        // Напоминание за день до записи
        const reminderTime = new Date(bookingTime);
        reminderTime.setDate(reminderTime.getDate() - 1);
        reminderTime.setHours(18, 0, 0, 0); // 18:00
        return reminderTime > now ? reminderTime : now;

      default:
        // Остальные уведомления отправляем сразу
        return now;
    }
  }

  private async sendNotificationAsync(notificationId: string) {
    try {
      const notification = await this.prisma.notification.findUnique({
        where: { id: notificationId },
        include: {
          client: true,
          booking: {
            include: {
              business: true,
              service: true,
              staff: true,
            },
          },
        },
      });

      if (!notification) {
        return;
      }

      let success = false;

      switch (notification.type) {
        case 'SMS':
          success = await this.sendSMS(notification);
          break;
        case 'EMAIL':
          success = await this.sendEmail(notification);
          break;
        case 'VK':
          success = await this.sendVK(notification);
          break;
      }

      // Обновляем статус уведомления
      await this.prisma.notification.update({
        where: { id: notificationId },
        data: {
          status: success ? 'SENT' : 'FAILED',
          sentAt: success ? new Date() : null,
        },
      });
    } catch (error) {
      console.error('Error sending notification:', error);

      await this.prisma.notification.update({
        where: { id: notificationId },
        data: { status: 'FAILED' },
      });
    }
  }

  private async sendSMS(notification: any): Promise<boolean> {
    // Заглушка для SMS - в реальном проекте здесь будет интеграция с SMS-провайдером

    // Имитируем задержку отправки
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // В реальном проекте здесь будет проверка успешности отправки
    return true;
  }

  private async sendEmail(notification: any): Promise<boolean> {
    // Заглушка для Email - в реальном проекте здесь будет интеграция с email-провайдером
    if (!notification.client.email) {
      return false;
    }

    // Имитируем задержку отправки
    await new Promise((resolve) => setTimeout(resolve, 1000));

    return true;
  }

  private async sendVK(notification: any): Promise<boolean> {
    try {
      // В реальном проекте здесь будет получение VK токена бизнеса
      // Пока что используем заглушку
      const vkToken = process.env.VK_ACCESS_TOKEN || 'mock-token';

      // Получаем VK ID клиента (если есть)
      const clientVkId = notification.client.vkId;
      if (!clientVkId) {
        return false;
      }

      const success = await this.vkService.sendMessage(
        parseInt(clientVkId),
        notification.message,
        vkToken,
      );

      return success;
    } catch (error) {
      console.error('VK notification error:', error);
      return false;
    }
  }

  private async checkBusinessAccess(businessId: string, userId: string) {
    const business = await this.prisma.business.findUnique({
      where: { id: businessId },
    });

    if (!business) {
      throw new NotFoundException('Бизнес не найден');
    }

    if (business.ownerId !== userId) {
      throw new ForbiddenException('Нет доступа к этому бизнесу');
    }
  }
}
