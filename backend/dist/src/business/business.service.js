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
exports.BusinessService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let BusinessService = class BusinessService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(userId, createBusinessDto) {
        try {
            const result = await this.prisma.business.create({
                data: {
                    ...createBusinessDto,
                    ownerId: userId,
                    workingHours: createBusinessDto.workingHours || this.getDefaultWorkingHours(),
                },
            });
            return result;
        }
        catch (error) {
            throw error;
        }
    }
    async findOne(id, userId) {
        const business = await this.prisma.business.findUnique({
            where: { id },
            include: {
                owner: true,
                staff: true,
                services: true,
            },
        });
        if (!business) {
            throw new common_1.NotFoundException('Бизнес не найден');
        }
        if (business.ownerId !== userId) {
            throw new common_1.ForbiddenException('Нет доступа к этому бизнесу');
        }
        return business;
    }
    async update(id, userId, updateBusinessDto) {
        const business = await this.findOne(id, userId);
        return this.prisma.business.update({
            where: { id },
            data: updateBusinessDto,
        });
    }
    async findAllByOwner(userId) {
        return this.prisma.business.findMany({
            where: { ownerId: userId },
            include: {
                staff: true,
                services: true,
                _count: {
                    select: {
                        bookings: true,
                        clients: true,
                    },
                },
            },
        });
    }
    getDefaultWorkingHours() {
        return {
            monday: { start: '09:00', end: '18:00', isWorking: true },
            tuesday: { start: '09:00', end: '18:00', isWorking: true },
            wednesday: { start: '09:00', end: '18:00', isWorking: true },
            thursday: { start: '09:00', end: '18:00', isWorking: true },
            friday: { start: '09:00', end: '18:00', isWorking: true },
            saturday: { start: '10:00', end: '16:00', isWorking: true },
            sunday: { start: '10:00', end: '16:00', isWorking: false },
        };
    }
};
exports.BusinessService = BusinessService;
exports.BusinessService = BusinessService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], BusinessService);
//# sourceMappingURL=business.service.js.map