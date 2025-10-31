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
exports.BookingsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const notifications_service_1 = require("../notifications/notifications.service");
let BookingsService = class BookingsService {
    prisma;
    notificationsService;
    constructor(prisma, notificationsService) {
        this.prisma = prisma;
        this.notificationsService = notificationsService;
    }
    async create(businessId, userId, createBookingDto) {
        await this.checkBusinessAccess(businessId, userId);
        const { serviceId, staffId, startTs, clientId, client } = createBookingDto;
        const service = await this.prisma.service.findUnique({
            where: { id: serviceId },
        });
        if (!service) {
            throw new common_1.NotFoundException('Услуга не найдена');
        }
        if (service.businessId !== businessId) {
            throw new common_1.ForbiddenException('Услуга не принадлежит этому бизнесу');
        }
        const staff = await this.prisma.staff.findUnique({
            where: { id: staffId },
        });
        if (!staff) {
            throw new common_1.NotFoundException('Сотрудник не найден');
        }
        if (staff.businessId !== businessId) {
            throw new common_1.ForbiddenException('Сотрудник не принадлежит этому бизнесу');
        }
        const startTime = new Date(startTs);
        const endTime = new Date(startTime.getTime() +
            (service.durationMinutes + service.bufferAfter) * 60000);
        await this.checkTimeConflicts(businessId, staffId, startTime, endTime, service.bufferBefore);
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
            }
            else {
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
        try {
            await this.notificationsService.create(businessId, userId, {
                bookingId: booking.id,
                type: 'SMS',
                template: 'BOOKING_CREATED',
            });
        }
        catch (error) {
            console.error('Failed to send notification:', error);
        }
        return booking;
    }
    async findAll(businessId, userId, query) {
        await this.checkBusinessAccess(businessId, userId);
        const where = {
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
    async findOne(id, userId) {
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
            throw new common_1.NotFoundException('Запись не найдена');
        }
        await this.checkBusinessAccess(booking.businessId, userId);
        return booking;
    }
    async update(id, userId, updateBookingDto) {
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
        if (updateBookingDto.status && updateBookingDto.status !== booking.status) {
            try {
                let template;
                switch (updateBookingDto.status) {
                    case 'CONFIRMED':
                        template = 'BOOKING_CONFIRMED';
                        break;
                    case 'CANCELLED':
                        template = 'BOOKING_CANCELLED';
                        break;
                    default:
                        return updatedBooking;
                }
                await this.notificationsService.create(booking.businessId, userId, {
                    bookingId: id,
                    type: 'SMS',
                    template,
                });
            }
            catch (error) {
                console.error('Failed to send status notification:', error);
            }
        }
        return updatedBooking;
    }
    async remove(id, userId) {
        const booking = await this.findOne(id, userId);
        return this.prisma.booking.delete({
            where: { id },
        });
    }
    async getAvailableSlots(businessId, userId, serviceId, staffId, date) {
        await this.checkBusinessAccess(businessId, userId);
        const service = await this.prisma.service.findUnique({
            where: { id: serviceId },
        });
        if (!service) {
            throw new common_1.NotFoundException('Услуга не найдена');
        }
        const staff = await this.prisma.staff.findUnique({
            where: { id: staffId },
        });
        if (!staff) {
            throw new common_1.NotFoundException('Сотрудник не найден');
        }
        const targetDate = new Date(date);
        const startOfDay = new Date(targetDate);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(targetDate);
        endOfDay.setHours(23, 59, 59, 999);
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
        const business = await this.prisma.business.findUnique({
            where: { id: businessId },
        });
        if (!business) {
            throw new common_1.NotFoundException('Бизнес не найден');
        }
        const exception = await this.prisma.availabilityException.findFirst({
            where: {
                businessId,
                date: {
                    gte: startOfDay,
                    lte: endOfDay,
                },
            },
        });
        let workStart;
        let workEnd;
        if (exception) {
            if (exception.type === 'CLOSED') {
                return [];
            }
            else if (exception.type === 'OPEN_CUSTOM') {
                workStart = exception.startTime || '09:00';
                workEnd = exception.endTime || '18:00';
            }
            else {
                return [];
            }
        }
        else {
            const workingHours = business.workingHours;
            const dayOfWeek = targetDate
                .toLocaleDateString('en-US', { weekday: 'long' })
                .toLowerCase();
            const daySchedule = workingHours[dayOfWeek];
            if (!daySchedule || !daySchedule.isWorking) {
                return [];
            }
            workStart = daySchedule.start;
            workEnd = daySchedule.end;
        }
        const slots = this.generateTimeSlots(workStart, workEnd, service.durationMinutes, service.bufferBefore, service.bufferAfter, existingBookings, targetDate);
        return slots;
    }
    async checkTimeConflicts(businessId, staffId, startTime, endTime, bufferBefore) {
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
            throw new common_1.ConflictException({
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
        const now = new Date();
        if (startTime < now) {
            throw new common_1.ConflictException({
                code: 'PAST_TIME',
                message: 'Нельзя записаться на время в прошлом',
            });
        }
        const maxFutureDate = new Date();
        maxFutureDate.setMonth(maxFutureDate.getMonth() + 3);
        if (startTime > maxFutureDate) {
            throw new common_1.ConflictException({
                code: 'TOO_FAR_FUTURE',
                message: 'Нельзя записаться более чем на 3 месяца вперед',
            });
        }
    }
    generateTimeSlots(workStart, workEnd, duration, bufferBefore, bufferAfter, existingBookings, targetDate) {
        const slots = [];
        const [startHour, startMinute] = workStart.split(':').map(Number);
        const [endHour, endMinute] = workEnd.split(':').map(Number);
        const workStartMinutes = startHour * 60 + startMinute;
        const workEndMinutes = endHour * 60 + endMinute;
        const slotDuration = duration + bufferBefore + bufferAfter;
        for (let time = workStartMinutes; time + slotDuration <= workEndMinutes; time += 30) {
            const slotStart = new Date(targetDate);
            slotStart.setHours(Math.floor(time / 60), time % 60, 0, 0);
            const slotEnd = new Date(slotStart.getTime() + slotDuration * 60000);
            const hasConflict = existingBookings.some((booking) => {
                const bookingStart = new Date(booking.startTs);
                const bookingEnd = new Date(booking.endTs);
                return ((slotStart >= bookingStart && slotStart < bookingEnd) ||
                    (slotEnd > bookingStart && slotEnd <= bookingEnd) ||
                    (slotStart <= bookingStart && slotEnd >= bookingEnd));
            });
            if (!hasConflict) {
                const timeString = slotStart.toTimeString().slice(0, 5);
                slots.push(timeString);
            }
        }
        return slots;
    }
    async checkBusinessAccess(businessId, userId) {
        const business = await this.prisma.business.findUnique({
            where: { id: businessId },
        });
        if (!business) {
            throw new common_1.NotFoundException('Бизнес не найден');
        }
        if (business.ownerId !== userId) {
            throw new common_1.ForbiddenException('Нет доступа к этому бизнесу');
        }
    }
};
exports.BookingsService = BookingsService;
exports.BookingsService = BookingsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        notifications_service_1.NotificationsService])
], BookingsService);
//# sourceMappingURL=bookings.service.js.map