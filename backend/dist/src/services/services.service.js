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
exports.ServicesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let ServicesService = class ServicesService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(businessId, userId, createServiceDto) {
        await this.checkBusinessAccess(businessId, userId);
        return this.prisma.service.create({
            data: {
                ...createServiceDto,
                businessId,
            },
        });
    }
    async findAll(businessId, userId) {
        await this.checkBusinessAccess(businessId, userId);
        return this.prisma.service.findMany({
            where: { businessId },
            orderBy: { title: 'asc' },
        });
    }
    async findOne(id, userId) {
        const service = await this.prisma.service.findUnique({
            where: { id },
            include: { business: true },
        });
        if (!service) {
            throw new common_1.NotFoundException('Услуга не найдена');
        }
        await this.checkBusinessAccess(service.businessId, userId);
        return service;
    }
    async update(id, userId, updateServiceDto) {
        const service = await this.findOne(id, userId);
        return this.prisma.service.update({
            where: { id },
            data: updateServiceDto,
        });
    }
    async remove(id, userId) {
        const service = await this.findOne(id, userId);
        return this.prisma.service.delete({
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
exports.ServicesService = ServicesService;
exports.ServicesService = ServicesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ServicesService);
//# sourceMappingURL=services.service.js.map