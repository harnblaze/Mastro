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
exports.ClientsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let ClientsService = class ClientsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(businessId, userId, createClientDto) {
        await this.checkBusinessAccess(businessId, userId);
        return this.prisma.client.create({
            data: {
                ...createClientDto,
                businessId,
            },
        });
    }
    async findAll(businessId, userId) {
        await this.checkBusinessAccess(businessId, userId);
        return this.prisma.client.findMany({
            where: { businessId },
            include: {
                bookings: {
                    include: {
                        service: true,
                        staff: true,
                    },
                    orderBy: { startTs: 'desc' },
                },
            },
            orderBy: { name: 'asc' },
        });
    }
    async findOne(id, userId) {
        const client = await this.prisma.client.findUnique({
            where: { id },
            include: {
                business: true,
                bookings: {
                    include: {
                        service: true,
                        staff: true,
                    },
                    orderBy: { startTs: 'desc' },
                },
            },
        });
        if (!client) {
            throw new common_1.NotFoundException('Клиент не найден');
        }
        await this.checkBusinessAccess(client.businessId, userId);
        return client;
    }
    async update(id, userId, updateClientDto) {
        const client = await this.findOne(id, userId);
        return this.prisma.client.update({
            where: { id },
            data: updateClientDto,
        });
    }
    async remove(id, userId) {
        const client = await this.findOne(id, userId);
        return this.prisma.client.delete({
            where: { id },
        });
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
exports.ClientsService = ClientsService;
exports.ClientsService = ClientsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ClientsService);
//# sourceMappingURL=clients.service.js.map