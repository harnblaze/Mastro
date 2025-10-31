import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import {
  CreateBookingDto,
  UpdateBookingDto,
  BookingQueryDto,
} from './dto/booking.dto';

@Injectable()
export class BookingsService {
  constructor(
    private prisma: PrismaService,
    private notificationsService: NotificationsService,
  ) {}

  async create(
    businessId: string,
    userId: string,
    createBookingDto: CreateBookingDto,
  ) {
    await this.checkBusinessAccess(businessId, userId);

    const { serviceId, staffId, startTs, clientId, client } = createBookingDto;

    // Получаем информацию об услуге
    const service = await this.prisma.service.findUnique({
      where: { id: serviceId },
    });

    if (!service) {
      throw new NotFoundException('Услуга не найдена');
    }

    // Проверяем, что услуга принадлежит бизнесу
    if (service.businessId !== businessId) {
      throw new ForbiddenException('Услуга не принадлежит этому бизнесу');
    }

    // Получаем информацию о сотруднике
    const staff = await this.prisma.staff.findUnique({
      where: { id: staffId },
    });

    if (!staff) {
      throw new NotFoundException('Сотрудник не найден');
    }

    // Проверяем, что сотрудник принадлежит бизнесу
    if (staff.businessId !== businessId) {
      throw new ForbiddenException('Сотрудник не принадлежит этому бизнесу');
    }

    // Рассчитываем время окончания
    const startTime = new Date(startTs);
    const endTime = new Date(
      startTime.getTime() +
        (service.durationMinutes + service.bufferAfter) * 60000,
    );

    // Проверяем конфликты времени
    await this.checkTimeConflicts(
      businessId,
      staffId,
      startTime,
      endTime,
      service.bufferBefore,
    );

    // Создаем или находим клиента
    let finalClientId = clientId;
    if (client && !clientId) {
      const existingClient = await this.prisma.client.findFirst({
        where: {
          businessId,
          phone: client.phone,
        },
      });

      if (existingClient) {
        finalClientId = existingClient.id;
      } else {
        const newClient = await this.prisma.client.create({
          data: {
            businessId,
            name: client.name,
            phone: client.phone,
            email: client.email,
          },
        });
        finalClientId = newClient.id;
      }
    }

    // Создаем запись
    const booking = await this.prisma.booking.create({
      data: {
        businessId,
        serviceId,
        staffId,
        clientId: finalClientId,
        startTs: startTime,
        endTs: endTime,
        status: 'PENDING',
        source: 'WEB',
      },
      include: {
        service: true,
        staff: true,
        client: true,
      },
    });

    // Отправляем уведомление о создании записи
    try {
      await this.notificationsService.create(businessId, userId, {
        bookingId: booking.id,
        type: 'SMS', // По умолчанию SMS, можно сделать настраиваемым
        template: 'BOOKING_CREATED',
      });
    } catch (error) {
      console.error('Failed to send notification:', error);
      // Не прерываем создание записи из-за ошибки уведомления
    }

    return booking;
  }

  async findAll(businessId: string, userId: string, query: BookingQueryDto) {
    await this.checkBusinessAccess(businessId, userId);

    const where: any = {
      businessId,
    };

    if (query.from || query.to) {
      where.startTs = {};
      if (query.from) {
        where.startTs.gte = new Date(query.from);
      }
      if (query.to) {
        where.startTs.lte = new Date(query.to);
      }
    }

    if (query.staffId) {
      where.staffId = query.staffId;
    }

    if (query.status) {
      where.status = query.status;
    }

    return this.prisma.booking.findMany({
      where,
      include: {
        service: true,
        staff: true,
        client: true,
      },
      orderBy: { startTs: 'asc' },
    });
  }

  async findOne(id: string, userId: string) {
    const booking = await this.prisma.booking.findUnique({
      where: { id },
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

    await this.checkBusinessAccess(booking.businessId, userId);

    return booking;
  }

  async update(id: string, userId: string, updateBookingDto: UpdateBookingDto) {
    const booking = await this.findOne(id, userId);

    const updatedBooking = await this.prisma.booking.update({
      where: { id },
      data: updateBookingDto,
      include: {
        service: true,
        staff: true,
        client: true,
      },
    });

    // Отправляем уведомление об изменении статуса
    if (updateBookingDto.status && updateBookingDto.status !== booking.status) {
      try {
        let template:
          | 'BOOKING_CONFIRMED'
          | 'BOOKING_CANCELLED'
          | 'BOOKING_REMINDER';

        switch (updateBookingDto.status) {
          case 'CONFIRMED':
            template = 'BOOKING_CONFIRMED';
            break;
          case 'CANCELLED':
            template = 'BOOKING_CANCELLED';
            break;
          default:
            return updatedBooking; // Не отправляем уведомления для других статусов
        }

        await this.notificationsService.create(booking.businessId, userId, {
          bookingId: id,
          type: 'SMS',
          template,
        });
      } catch (error) {
        console.error('Failed to send status notification:', error);
      }
    }

    return updatedBooking;
  }

  async remove(id: string, userId: string) {
    const booking = await this.findOne(id, userId);

    return this.prisma.booking.delete({
      where: { id },
    });
  }

  async getAvailableSlots(
    businessId: string,
    userId: string,
    serviceId: string,
    staffId: string,
    date: string,
  ) {
    await this.checkBusinessAccess(businessId, userId);

    const service = await this.prisma.service.findUnique({
      where: { id: serviceId },
    });

    if (!service) {
      throw new NotFoundException('Услуга не найдена');
    }

    const staff = await this.prisma.staff.findUnique({
      where: { id: staffId },
    });

    if (!staff) {
      throw new NotFoundException('Сотрудник не найден');
    }

    const targetDate = new Date(date);
    const startOfDay = new Date(targetDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(targetDate);
    endOfDay.setHours(23, 59, 59, 999);

    // Получаем существующие записи на этот день
    const existingBookings = await this.prisma.booking.findMany({
      where: {
        businessId,
        staffId,
        startTs: {
          gte: startOfDay,
          lte: endOfDay,
        },
        status: {
          not: 'CANCELLED',
        },
      },
      orderBy: { startTs: 'asc' },
    });

    // Получаем рабочие часы бизнеса
    const business = await this.prisma.business.findUnique({
      where: { id: businessId },
    });

    if (!business) {
      throw new NotFoundException('Бизнес не найден');
    }

    // Проверяем исключения расписания
    const exception = await this.prisma.availabilityException.findFirst({
      where: {
        businessId,
        date: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
    });

    let workStart: string;
    let workEnd: string;

    if (exception) {
      if (exception.type === 'CLOSED') {
        return []; // День закрыт
      } else if (exception.type === 'OPEN_CUSTOM') {
        workStart = exception.startTime || '09:00';
        workEnd = exception.endTime || '18:00';
      } else {
        return [];
      }
    } else {
      const workingHours = business.workingHours as any;
      const dayOfWeek = targetDate
        .toLocaleDateString('en-US', { weekday: 'long' })
        .toLowerCase();
      const daySchedule = workingHours[dayOfWeek];

      if (!daySchedule || !daySchedule.isWorking) {
        return []; // День не рабочий
      }

      workStart = daySchedule.start;
      workEnd = daySchedule.end;
    }

    // Генерируем доступные слоты
    const slots = this.generateTimeSlots(
      workStart,
      workEnd,
      service.durationMinutes,
      service.bufferBefore,
      service.bufferAfter,
      existingBookings,
      targetDate,
    );

    return slots;
  }

  private async checkTimeConflicts(
    businessId: string,
    staffId: string,
    startTime: Date,
    endTime: Date,
    bufferBefore: number,
  ) {
    const bufferStart = new Date(startTime.getTime() - bufferBefore * 60000);

    const conflictingBooking = await this.prisma.booking.findFirst({
      where: {
        businessId,
        staffId,
        status: {
          not: 'CANCELLED',
        },
        OR: [
          {
            startTs: {
              gte: bufferStart,
              lt: endTime,
            },
          },
          {
            endTs: {
              gt: bufferStart,
              lte: endTime,
            },
          },
          {
            startTs: {
              lte: bufferStart,
            },
            endTs: {
              gte: endTime,
            },
          },
        ],
      },
      include: {
        service: true,
        client: true,
      },
    });

    if (conflictingBooking) {
      throw new ConflictException({
        code: 'SLOT_CONFLICT',
        message: 'Выбранное время уже занято',
        conflictingBooking: {
          id: conflictingBooking.id,
          startTs: conflictingBooking.startTs,
          endTs: conflictingBooking.endTs,
          status: conflictingBooking.status,
          service: conflictingBooking.service.title,
          client: conflictingBooking.client?.name || 'Гость',
        },
      });
    }

    // Дополнительная проверка: убеждаемся, что время не в прошлом
    const now = new Date();
    if (startTime < now) {
      throw new ConflictException({
        code: 'PAST_TIME',
        message: 'Нельзя записаться на время в прошлом',
      });
    }

    // Проверяем, что время не слишком далеко в будущем (например, не более чем на 3 месяца)
    const maxFutureDate = new Date();
    maxFutureDate.setMonth(maxFutureDate.getMonth() + 3);
    if (startTime > maxFutureDate) {
      throw new ConflictException({
        code: 'TOO_FAR_FUTURE',
        message: 'Нельзя записаться более чем на 3 месяца вперед',
      });
    }
  }

  private generateTimeSlots(
    workStart: string,
    workEnd: string,
    duration: number,
    bufferBefore: number,
    bufferAfter: number,
    existingBookings: any[],
    targetDate: Date,
  ): string[] {
    const slots: string[] = [];
    const [startHour, startMinute] = workStart.split(':').map(Number);
    const [endHour, endMinute] = workEnd.split(':').map(Number);

    const workStartMinutes = startHour * 60 + startMinute;
    const workEndMinutes = endHour * 60 + endMinute;
    const slotDuration = duration + bufferBefore + bufferAfter;

    for (
      let time = workStartMinutes;
      time + slotDuration <= workEndMinutes;
      time += 30
    ) {
      const slotStart = new Date(targetDate);
      slotStart.setHours(Math.floor(time / 60), time % 60, 0, 0);

      const slotEnd = new Date(slotStart.getTime() + slotDuration * 60000);

      // Проверяем конфликты с существующими записями
      const hasConflict = existingBookings.some((booking) => {
        const bookingStart = new Date(booking.startTs);
        const bookingEnd = new Date(booking.endTs);
        return (
          (slotStart >= bookingStart && slotStart < bookingEnd) ||
          (slotEnd > bookingStart && slotEnd <= bookingEnd) ||
          (slotStart <= bookingStart && slotEnd >= bookingEnd)
        );
      });

      if (!hasConflict) {
        const timeString = slotStart.toTimeString().slice(0, 5); // HH:MM format
        slots.push(timeString);
      }
    }

    return slots;
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
