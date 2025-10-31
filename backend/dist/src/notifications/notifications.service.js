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
exports.NotificationsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const vk_service_1 = require("../auth/vk.service");
let NotificationsService = class NotificationsService {
    prisma;
    vkService;
    constructor(prisma, vkService) {
        this.prisma = prisma;
        this.vkService = vkService;
    }
    async create(businessId, userId, createNotificationDto) {
        await this.checkBusinessAccess(businessId, userId);
        const { bookingId, type, template, customMessage } = createNotificationDto;
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
            throw new common_1.NotFoundException('Запись не найдена');
        }
        if (booking.businessId !== businessId) {
            throw new common_1.ForbiddenException('Запись не принадлежит этому бизнесу');
        }
        if (!booking.client) {
            throw new common_1.BadRequestException('У записи нет клиента для отправки уведомления');
        }
        const message = this.generateMessage(template, booking, customMessage);
        const notification = await this.prisma.notification.create({
            data: {
                businessId,
                bookingId,
                clientId: booking.clientId,
                type,
                template,
                message,
                status: 'PENDING',
                scheduledFor: this.calculateScheduledTime(template, booking.startTs.toISOString()),
            },
        });
        this.sendNotificationAsync(notification.id);
        return notification;
    }
    async findAll(businessId, userId, query) {
        await this.checkBusinessAccess(businessId, userId);
        const where = {
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
    async findOne(id, userId) {
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
            throw new common_1.NotFoundException('Уведомление не найдено');
        }
        await this.checkBusinessAccess(notification.businessId, userId);
        return notification;
    }
    async resend(id, userId) {
        const notification = await this.findOne(id, userId);
        if (notification.status === 'SENT') {
            throw new common_1.BadRequestException('Уведомление уже отправлено');
        }
        await this.prisma.notification.update({
            where: { id },
            data: { status: 'PENDING' },
        });
        this.sendNotificationAsync(id);
        return { message: 'Уведомление поставлено в очередь на отправку' };
    }
    generateMessage(template, booking, customMessage) {
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
    calculateScheduledTime(template, bookingStartTs) {
        const bookingTime = new Date(bookingStartTs);
        const now = new Date();
        switch (template) {
            case 'BOOKING_REMINDER':
                const reminderTime = new Date(bookingTime);
                reminderTime.setDate(reminderTime.getDate() - 1);
                reminderTime.setHours(18, 0, 0, 0);
                return reminderTime > now ? reminderTime : now;
            default:
                return now;
        }
    }
    async sendNotificationAsync(notificationId) {
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
            await this.prisma.notification.update({
                where: { id: notificationId },
                data: {
                    status: success ? 'SENT' : 'FAILED',
                    sentAt: success ? new Date() : null,
                },
            });
        }
        catch (error) {
            console.error('Error sending notification:', error);
            await this.prisma.notification.update({
                where: { id: notificationId },
                data: { status: 'FAILED' },
            });
        }
    }
    async sendSMS(notification) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        return true;
    }
    async sendEmail(notification) {
        if (!notification.client.email) {
            return false;
        }
        await new Promise((resolve) => setTimeout(resolve, 1000));
        return true;
    }
    async sendVK(notification) {
        try {
            const vkToken = process.env.VK_ACCESS_TOKEN || 'mock-token';
            const clientVkId = notification.client.vkId;
            if (!clientVkId) {
                return false;
            }
            const success = await this.vkService.sendMessage(parseInt(clientVkId), notification.message, vkToken);
            return success;
        }
        catch (error) {
            console.error('VK notification error:', error);
            return false;
        }
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
exports.NotificationsService = NotificationsService;
exports.NotificationsService = NotificationsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        vk_service_1.VkService])
], NotificationsService);
//# sourceMappingURL=notifications.service.js.map