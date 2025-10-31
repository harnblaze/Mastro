"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AvailabilityService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let AvailabilityService = class AvailabilityService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getBusinessAvailability(businessId, userId, date, serviceId, staffId) {
        const business = await this.prisma.business.findFirst({
            where: {
                id: businessId,
                OR: [{ ownerId: userId }, { staff: { some: { userId } } }],
            },
        });
        if (!business) {
            throw new common_1.ForbiddenException('Нет доступа к этому бизнесу');
        }
        const targetDate = new Date(date);
        const dayOfWeek = this.getDayOfWeek(targetDate);
        const workingHours = business.workingHours;
        const daySchedule = workingHours?.[dayOfWeek];
        if (daySchedule?.closed ||
            daySchedule?.isWorking === false ||
            !daySchedule?.start ||
            !daySchedule?.end) {
            return {
                date,
                slots: [],
                isWorkingDay: false,
            };
        }
        const exceptions = await this.prisma.availabilityException.findMany({
            where: {
                businessId,
                date: targetDate,
            },
        });
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
        let serviceDuration = 60;
        if (serviceId) {
            const service = await this.prisma.service.findFirst({
                where: { id: serviceId, businessId },
            });
            if (service) {
                serviceDuration = service.durationMinutes;
            }
        }
        const slots = this.generateTimeSlots(daySchedule.start, daySchedule.end, serviceDuration, existingBookings, exceptions);
        const isClosedDay = exceptions.some((ex) => ex.type === 'CLOSED');
        const hasCustomHours = exceptions.some((ex) => ex.type === 'OPEN_CUSTOM');
        return {
            date,
            slots,
            isWorkingDay: !isClosedDay,
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
    async createAvailabilityException(businessId, userId, data) {
        const business = await this.prisma.business.findFirst({
            where: {
                id: businessId,
                OR: [{ ownerId: userId }, { staff: { some: { userId } } }],
            },
        });
        if (!business) {
            throw new common_1.ForbiddenException('Нет доступа к этому бизнесу');
        }
        if (!data.date) {
            throw new common_1.BadRequestException('Поле date обязательно');
        }
        const date = new Date(data.date);
        if (isNaN(date.getTime())) {
            throw new common_1.BadRequestException('Неверный формат даты');
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
    async getAvailabilityExceptions(businessId, userId, from, to) {
        const business = await this.prisma.business.findFirst({
            where: {
                id: businessId,
                OR: [{ ownerId: userId }, { staff: { some: { userId } } }],
            },
        });
        if (!business) {
            throw new common_1.ForbiddenException('Нет доступа к этому бизнесу');
        }
        const where = { businessId };
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
    async deleteAvailabilityException(exceptionId, userId) {
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
            throw new common_1.NotFoundException('Исключение не найдено');
        }
        const hasAccess = exception.business.ownerId === userId ||
            exception.business.staff.some((staff) => staff.userId === userId);
        if (!hasAccess) {
            throw new common_1.ForbiddenException('Нет доступа к этому исключению');
        }
        return this.prisma.availabilityException.delete({
            where: { id: exceptionId },
        });
    }
    getDayOfWeek(date) {
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
    generateTimeSlots(startTime, endTime, serviceDuration, existingBookings, exceptions) {
        const slots = [];
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
        const customException = exceptions.find((ex) => ex.type === 'OPEN_CUSTOM');
        if (customException) {
            startTime = customException.startTime;
            endTime = customException.endTime;
        }
        const [startHour, startMinute] = startTime.split(':').map(Number);
        const [endHour, endMinute] = endTime.split(':').map(Number);
        const startMinutes = startHour * 60 + startMinute;
        const endMinutes = endHour * 60 + endMinute;
        for (let minutes = startMinutes; minutes + serviceDuration <= endMinutes; minutes += serviceDuration) {
            const slotStart = this.minutesToTimeString(minutes);
            const slotEnd = this.minutesToTimeString(minutes + serviceDuration);
            const isBooked = existingBookings.some((booking) => {
                if (booking.status === 'CANCELLED')
                    return false;
                const bookingStart = new Date(booking.startTs);
                const bookingEnd = new Date(booking.endTs);
                const slotStartTime = new Date(bookingStart);
                slotStartTime.setHours(Math.floor(minutes / 60), minutes % 60, 0, 0);
                const slotEndTime = new Date(bookingStart);
                slotEndTime.setHours(Math.floor((minutes + serviceDuration) / 60), (minutes + serviceDuration) % 60, 0, 0);
                return slotStartTime < bookingEnd && slotEndTime > bookingStart;
            });
            const hasTimeException = exceptions.some((ex) => {
                if (!ex.startTime || !ex.endTime)
                    return false;
                const [exStartHour, exStartMinute] = ex.startTime
                    .split(':')
                    .map(Number);
                const [exEndHour, exEndMinute] = ex.endTime.split(':').map(Number);
                const exStartMinutes = exStartHour * 60 + exStartMinute;
                const exEndMinutes = exEndHour * 60 + exEndMinute;
                return (minutes >= exStartMinutes && minutes + serviceDuration <= exEndMinutes);
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
    minutesToTimeString(minutes) {
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
    }
};
exports.AvailabilityService = AvailabilityService;
exports.AvailabilityService = AvailabilityService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AvailabilityService);
//# sourceMappingURL=availability.service.js.map