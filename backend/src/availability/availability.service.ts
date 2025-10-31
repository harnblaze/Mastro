import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface AvailabilitySlot {
  startTime: string;
  endTime: string;
  isAvailable: boolean;
  reason?: string;
}

export interface DayAvailability {
  date: string;
  slots: AvailabilitySlot[];
  isWorkingDay: boolean;
  workingHours?: {
    start: string;
    end: string;
  };
}

@Injectable()
export class AvailabilityService {
  constructor(private prisma: PrismaService) {}

  async getBusinessAvailability(
    businessId: string,
    userId: string,
    date: string,
    serviceId?: string,
    staffId?: string,
  ): Promise<DayAvailability> {
    // Проверяем права доступа к бизнесу
    const business = await this.prisma.business.findFirst({
      where: {
        id: businessId,
        OR: [{ ownerId: userId }, { staff: { some: { userId } } }],
      },
    });

    if (!business) {
      throw new ForbiddenException('Нет доступа к этому бизнесу');
    }

    const targetDate = new Date(date);
    const dayOfWeek = this.getDayOfWeek(targetDate);

    // Получаем рабочие часы бизнеса
    const workingHours = business.workingHours as any;
    const daySchedule = workingHours?.[dayOfWeek];

    // Проверяем, является ли день рабочим
    // День нерабочий если: closed: true, isWorking: false или нет start/end времени
    if (
      daySchedule?.closed ||
      daySchedule?.isWorking === false ||
      !daySchedule?.start ||
      !daySchedule?.end
    ) {
      return {
        date,
        slots: [],
        isWorkingDay: false,
      };
    }

    // Получаем исключения для этой даты
    const exceptions = await this.prisma.availabilityException.findMany({
      where: {
        businessId,
        date: targetDate,
      },
    });

    // Получаем существующие записи
    const startOfDay = new Date(targetDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(targetDate);
    endOfDay.setHours(23, 59, 59, 999);

    const existingBookings = await this.prisma.booking.findMany({
      where: {
        businessId,
        startTs: {
          gte: startOfDay,
          lte: endOfDay,
        },
        status: {
          not: 'CANCELLED',
        },
        ...(staffId && { staffId }),
      },
      include: {
        service: true,
        staff: true,
      },
    });

    // Получаем услугу для расчета длительности
    let serviceDuration = 60; // по умолчанию 60 минут
    if (serviceId) {
      const service = await this.prisma.service.findFirst({
        where: { id: serviceId, businessId },
      });
      if (service) {
        serviceDuration = service.durationMinutes;
      }
    }

    // Генерируем временные слоты
    const slots = this.generateTimeSlots(
      daySchedule.start,
      daySchedule.end,
      serviceDuration,
      existingBookings,
      exceptions,
    );

    // Проверяем, есть ли исключение CLOSED
    const isClosedDay = exceptions.some((ex) => ex.type === 'CLOSED');
    const hasCustomHours = exceptions.some((ex) => ex.type === 'OPEN_CUSTOM');

    return {
      date,
      slots,
      isWorkingDay: !isClosedDay, // Рабочий день, если нет исключения CLOSED
      workingHours: {
        start: hasCustomHours
          ? exceptions.find((ex) => ex.type === 'OPEN_CUSTOM')?.startTime ||
            daySchedule.start
          : daySchedule.start,
        end: hasCustomHours
          ? exceptions.find((ex) => ex.type === 'OPEN_CUSTOM')?.endTime ||
            daySchedule.end
          : daySchedule.end,
      },
    };
  }

  async createAvailabilityException(
    businessId: string,
    userId: string,
    data: {
      date: string;
      startTime?: string;
      endTime?: string;
      type: 'CLOSED' | 'OPEN_CUSTOM';
      reason?: string;
    },
  ) {
    // Проверяем права доступа
    const business = await this.prisma.business.findFirst({
      where: {
        id: businessId,
        OR: [{ ownerId: userId }, { staff: { some: { userId } } }],
      },
    });

    if (!business) {
      throw new ForbiddenException('Нет доступа к этому бизнесу');
    }

    // Валидация обязательных полей
    if (!data.date) {
      throw new BadRequestException('Поле date обязательно');
    }

    const date = new Date(data.date);
    if (isNaN(date.getTime())) {
      throw new BadRequestException('Неверный формат даты');
    }

    return this.prisma.availabilityException.create({
      data: {
        businessId,
        date,
        startTime: data.startTime,
        endTime: data.endTime,
        type: data.type,
        reason: data.reason,
      },
    });
  }

  async getAvailabilityExceptions(
    businessId: string,
    userId: string,
    from?: string,
    to?: string,
  ) {
    // Проверяем права доступа
    const business = await this.prisma.business.findFirst({
      where: {
        id: businessId,
        OR: [{ ownerId: userId }, { staff: { some: { userId } } }],
      },
    });

    if (!business) {
      throw new ForbiddenException('Нет доступа к этому бизнесу');
    }

    const where: any = { businessId };

    if (from && to) {
      where.date = {
        gte: new Date(from),
        lte: new Date(to),
      };
    }

    return this.prisma.availabilityException.findMany({
      where,
      orderBy: { date: 'asc' },
    });
  }

  async deleteAvailabilityException(exceptionId: string, userId: string) {
    const exception = await this.prisma.availabilityException.findFirst({
      where: { id: exceptionId },
      include: {
        business: {
          select: {
            ownerId: true,
            staff: {
              select: { userId: true },
            },
          },
        },
      },
    });

    if (!exception) {
      throw new NotFoundException('Исключение не найдено');
    }

    const hasAccess =
      exception.business.ownerId === userId ||
      exception.business.staff.some((staff) => staff.userId === userId);

    if (!hasAccess) {
      throw new ForbiddenException('Нет доступа к этому исключению');
    }

    return this.prisma.availabilityException.delete({
      where: { id: exceptionId },
    });
  }

  private getDayOfWeek(date: Date): string {
    const days = [
      'sunday',
      'monday',
      'tuesday',
      'wednesday',
      'thursday',
      'friday',
      'saturday',
    ];
    return days[date.getDay()];
  }

  private generateTimeSlots(
    startTime: string,
    endTime: string,
    serviceDuration: number,
    existingBookings: any[],
    exceptions: any[],
  ): AvailabilitySlot[] {
    const slots: AvailabilitySlot[] = [];

    // Проверяем исключения
    const closedException = exceptions.find((ex) => ex.type === 'CLOSED');
    if (closedException) {
      return [
        {
          startTime: '00:00',
          endTime: '23:59',
          isAvailable: false,
          reason: closedException.reason || 'Выходной день',
        },
      ];
    }

    // Проверяем, есть ли исключение OPEN_CUSTOM для этого дня
    const customException = exceptions.find((ex) => ex.type === 'OPEN_CUSTOM');
    if (customException) {
      // Используем кастомное время работы
      startTime = customException.startTime;
      endTime = customException.endTime;
    }

    // Парсим время начала и конца
    const [startHour, startMinute] = startTime.split(':').map(Number);
    const [endHour, endMinute] = endTime.split(':').map(Number);

    const startMinutes = startHour * 60 + startMinute;
    const endMinutes = endHour * 60 + endMinute;

    // Генерируем слоты с интервалом в длительность услуги
    for (
      let minutes = startMinutes;
      minutes + serviceDuration <= endMinutes;
      minutes += serviceDuration
    ) {
      const slotStart = this.minutesToTimeString(minutes);
      const slotEnd = this.minutesToTimeString(minutes + serviceDuration);

      // Проверяем, занят ли слот (только активные записи)
      const isBooked = existingBookings.some((booking) => {
        // Игнорируем отмененные записи
        if (booking.status === 'CANCELLED') return false;

        const bookingStart = new Date(booking.startTs);
        const bookingEnd = new Date(booking.endTs);
        const slotStartTime = new Date(bookingStart);
        slotStartTime.setHours(Math.floor(minutes / 60), minutes % 60, 0, 0);
        const slotEndTime = new Date(bookingStart);
        slotEndTime.setHours(
          Math.floor((minutes + serviceDuration) / 60),
          (minutes + serviceDuration) % 60,
          0,
          0,
        );

        return slotStartTime < bookingEnd && slotEndTime > bookingStart;
      });

      // Проверяем исключения времени
      const hasTimeException = exceptions.some((ex) => {
        if (!ex.startTime || !ex.endTime) return false;
        const [exStartHour, exStartMinute] = ex.startTime
          .split(':')
          .map(Number);
        const [exEndHour, exEndMinute] = ex.endTime.split(':').map(Number);
        const exStartMinutes = exStartHour * 60 + exStartMinute;
        const exEndMinutes = exEndHour * 60 + exEndMinute;

        return (
          minutes >= exStartMinutes && minutes + serviceDuration <= exEndMinutes
        );
      });

      slots.push({
        startTime: slotStart,
        endTime: slotEnd,
        isAvailable: !isBooked && !hasTimeException,
        reason: isBooked
          ? 'Занято'
          : hasTimeException
            ? 'Исключение'
            : undefined,
      });
    }

    return slots;
  }

  private minutesToTimeString(minutes: number): string {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
  }
}
