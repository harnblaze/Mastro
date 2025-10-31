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
exports.NotificationTemplatesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let NotificationTemplatesService = class NotificationTemplatesService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getTemplates(businessId, userId) {
        const business = await this.prisma.business.findFirst({
            where: {
                id: businessId,
                OR: [{ ownerId: userId }, { staff: { some: { userId } } }],
            },
        });
        if (!business) {
            throw new common_1.ForbiddenException('Нет доступа к этому бизнесу');
        }
        const templates = await this.prisma.notificationTemplate.findMany({
            where: { businessId },
            orderBy: [{ type: 'asc' }, { channel: 'asc' }],
        });
        return templates.map((template) => ({
            id: template.id,
            businessId: template.businessId,
            type: template.type,
            channel: template.channel,
            subject: template.subject || undefined,
            message: template.message,
            variables: this.extractVariables(template.message),
            isActive: template.isActive,
            createdAt: template.createdAt.toISOString(),
            updatedAt: template.updatedAt.toISOString(),
        }));
    }
    async getTemplate(templateId, userId) {
        const template = await this.prisma.notificationTemplate.findFirst({
            where: { id: templateId },
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
        if (!template) {
            throw new common_1.NotFoundException('Шаблон не найден');
        }
        const hasAccess = template.business.ownerId === userId ||
            template.business.staff.some((staff) => staff.userId === userId);
        if (!hasAccess) {
            throw new common_1.ForbiddenException('Нет доступа к этому шаблону');
        }
        return {
            id: template.id,
            businessId: template.businessId,
            type: template.type,
            channel: template.channel,
            subject: template.subject || undefined,
            message: template.message,
            variables: this.extractVariables(template.message),
            isActive: template.isActive,
            createdAt: template.createdAt.toISOString(),
            updatedAt: template.updatedAt.toISOString(),
        };
    }
    async createTemplate(businessId, userId, data) {
        const business = await this.prisma.business.findFirst({
            where: {
                id: businessId,
                OR: [{ ownerId: userId }, { staff: { some: { userId } } }],
            },
        });
        if (!business) {
            throw new common_1.ForbiddenException('Нет доступа к этому бизнесу');
        }
        const existingTemplate = await this.prisma.notificationTemplate.findFirst({
            where: {
                businessId,
                type: data.type,
                channel: data.channel,
            },
        });
        if (existingTemplate) {
            throw new common_1.ForbiddenException('Шаблон для этого типа и канала уже существует');
        }
        const template = await this.prisma.notificationTemplate.create({
            data: {
                businessId,
                type: data.type,
                channel: data.channel,
                subject: data.subject,
                message: data.message,
                isActive: data.isActive ?? true,
            },
        });
        return {
            id: template.id,
            businessId: template.businessId,
            type: template.type,
            channel: template.channel,
            subject: template.subject || undefined,
            message: template.message,
            variables: this.extractVariables(template.message),
            isActive: template.isActive,
            createdAt: template.createdAt.toISOString(),
            updatedAt: template.updatedAt.toISOString(),
        };
    }
    async updateTemplate(templateId, userId, data) {
        const template = await this.prisma.notificationTemplate.findFirst({
            where: { id: templateId },
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
        if (!template) {
            throw new common_1.NotFoundException('Шаблон не найден');
        }
        const hasAccess = template.business.ownerId === userId ||
            template.business.staff.some((staff) => staff.userId === userId);
        if (!hasAccess) {
            throw new common_1.ForbiddenException('Нет доступа к этому шаблону');
        }
        const updatedTemplate = await this.prisma.notificationTemplate.update({
            where: { id: templateId },
            data: {
                subject: data.subject,
                message: data.message,
                isActive: data.isActive,
            },
        });
        return {
            id: updatedTemplate.id,
            businessId: updatedTemplate.businessId,
            type: updatedTemplate.type,
            channel: updatedTemplate.channel,
            subject: updatedTemplate.subject || undefined,
            message: updatedTemplate.message,
            variables: this.extractVariables(updatedTemplate.message),
            isActive: updatedTemplate.isActive,
            createdAt: updatedTemplate.createdAt.toISOString(),
            updatedAt: updatedTemplate.updatedAt.toISOString(),
        };
    }
    async deleteTemplate(templateId, userId) {
        const template = await this.prisma.notificationTemplate.findFirst({
            where: { id: templateId },
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
        if (!template) {
            throw new common_1.NotFoundException('Шаблон не найден');
        }
        const hasAccess = template.business.ownerId === userId ||
            template.business.staff.some((staff) => staff.userId === userId);
        if (!hasAccess) {
            throw new common_1.ForbiddenException('Нет доступа к этому шаблону');
        }
        await this.prisma.notificationTemplate.delete({
            where: { id: templateId },
        });
    }
    async getAvailableVariables() {
        return {
            '{business_name}': 'Название бизнеса',
            '{client_name}': 'Имя клиента',
            '{client_phone}': 'Телефон клиента',
            '{service_name}': 'Название услуги',
            '{service_price}': 'Цена услуги',
            '{staff_name}': 'Имя мастера',
            '{date}': 'Дата записи',
            '{time}': 'Время записи',
            '{duration}': 'Длительность услуги',
            '{address}': 'Адрес бизнеса',
            '{phone}': 'Телефон бизнеса',
        };
    }
    async processTemplate(templateId, variables) {
        const template = await this.prisma.notificationTemplate.findUnique({
            where: { id: templateId },
        });
        if (!template) {
            throw new common_1.NotFoundException('Шаблон не найден');
        }
        let processedMessage = template.message;
        let processedSubject = template.subject;
        Object.entries(variables).forEach(([key, value]) => {
            const placeholder = `{${key}}`;
            processedMessage = processedMessage.replace(new RegExp(placeholder, 'g'), value);
            if (processedSubject) {
                processedSubject = processedSubject.replace(new RegExp(placeholder, 'g'), value);
            }
        });
        return {
            subject: processedSubject || undefined,
            message: processedMessage,
        };
    }
    extractVariables(message) {
        const variableRegex = /\{([^}]+)\}/g;
        const variables = [];
        let match;
        while ((match = variableRegex.exec(message)) !== null) {
            if (!variables.includes(match[1])) {
                variables.push(match[1]);
            }
        }
        return variables;
    }
};
exports.NotificationTemplatesService = NotificationTemplatesService;
exports.NotificationTemplatesService = NotificationTemplatesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], NotificationTemplatesService);
//# sourceMappingURL=notification-templates.service.js.map