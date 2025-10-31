import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateStaffDto, UpdateStaffDto } from './dto/staff.dto';

@Injectable()
export class StaffService {
  constructor(private prisma: PrismaService) {}

  async create(
    businessId: string,
    userId: string,
    createStaffDto: CreateStaffDto,
  ) {
    await this.checkBusinessAccess(businessId, userId);

    const { serviceIds, ...staffData } = createStaffDto;

    const staff = await this.prisma.staff.create({
      data: {
        ...staffData,
        businessId,
      },
    });

    // Если указаны услуги, создаем связи
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

  async findAll(businessId: string, userId: string) {
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

  async findOne(id: string, userId: string) {
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
      throw new NotFoundException('Сотрудник не найден');
    }

    await this.checkBusinessAccess(staff.businessId, userId);

    return staff;
  }

  async update(id: string, userId: string, updateStaffDto: UpdateStaffDto) {
    const staff = await this.findOne(id, userId);
    const { serviceIds, ...staffData } = updateStaffDto;

    // Обновляем данные сотрудника
    const updatedStaff = await this.prisma.staff.update({
      where: { id },
      data: staffData,
    });

    // Если указаны услуги, обновляем связи
    if (serviceIds !== undefined) {
      // Удаляем старые связи
      await this.prisma.staffService.deleteMany({
        where: { staffId: id },
      });

      // Создаем новые связи
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

  async remove(id: string, userId: string) {
    const staff = await this.findOne(id, userId);

    return this.prisma.staff.delete({
      where: { id },
    });
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
