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
exports.StaffService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let StaffService = class StaffService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(businessId, userId, createStaffDto) {
        await this.checkBusinessAccess(businessId, userId);
        const { serviceIds, ...staffData } = createStaffDto;
        const staff = await this.prisma.staff.create({
            data: {
                ...staffData,
                businessId,
            },
        });
        if (serviceIds && serviceIds.length > 0) {
            await this.prisma.staffService.createMany({
                data: serviceIds.map((serviceId) => ({
                    staffId: staff.id,
                    serviceId,
                })),
            });
        }
        return this.findOne(staff.id, userId);
    }
    async findAll(businessId, userId) {
        await this.checkBusinessAccess(businessId, userId);
        return this.prisma.staff.findMany({
            where: { businessId },
            include: {
                staffServices: {
                    include: {
                        service: true,
                    },
                },
            },
            orderBy: { name: 'asc' },
        });
    }
    async findOne(id, userId) {
        const staff = await this.prisma.staff.findUnique({
            where: { id },
            include: {
                business: true,
                staffServices: {
                    include: {
                        service: true,
                    },
                },
            },
        });
        if (!staff) {
            throw new common_1.NotFoundException('Сотрудник не найден');
        }
        await this.checkBusinessAccess(staff.businessId, userId);
        return staff;
    }
    async update(id, userId, updateStaffDto) {
        const staff = await this.findOne(id, userId);
        const { serviceIds, ...staffData } = updateStaffDto;
        const updatedStaff = await this.prisma.staff.update({
            where: { id },
            data: staffData,
        });
        if (serviceIds !== undefined) {
            await this.prisma.staffService.deleteMany({
                where: { staffId: id },
            });
            if (serviceIds.length > 0) {
                await this.prisma.staffService.createMany({
                    data: serviceIds.map((serviceId) => ({
                        staffId: id,
                        serviceId,
                    })),
                });
            }
        }
        return this.findOne(id, userId);
    }
    async remove(id, userId) {
        const staff = await this.findOne(id, userId);
        return this.prisma.staff.delete({
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
exports.StaffService = StaffService;
exports.StaffService = StaffService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], StaffService);
//# sourceMappingURL=staff.service.js.map