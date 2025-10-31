import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateServiceDto, UpdateServiceDto } from './dto/service.dto';

@Injectable()
export class ServicesService {
  constructor(private prisma: PrismaService) {}

  async create(
    businessId: string,
    userId: string,
    createServiceDto: CreateServiceDto,
  ) {
    // Проверяем права доступа к бизнесу
    await this.checkBusinessAccess(businessId, userId);

    return this.prisma.service.create({
      data: {
        ...createServiceDto,
        businessId,
      },
    });
  }

  async findAll(businessId: string, userId: string) {
    await this.checkBusinessAccess(businessId, userId);

    return this.prisma.service.findMany({
      where: { businessId },
      orderBy: { title: 'asc' },
    });
  }

  async findOne(id: string, userId: string) {
    const service = await this.prisma.service.findUnique({
      where: { id },
      include: { business: true },
    });

    if (!service) {
      throw new NotFoundException('Услуга не найдена');
    }

    await this.checkBusinessAccess(service.businessId, userId);

    return service;
  }

  async update(id: string, userId: string, updateServiceDto: UpdateServiceDto) {
    const service = await this.findOne(id, userId);

    return this.prisma.service.update({
      where: { id },
      data: updateServiceDto,
    });
  }

  async remove(id: string, userId: string) {
    const service = await this.findOne(id, userId);

    return this.prisma.service.delete({
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
