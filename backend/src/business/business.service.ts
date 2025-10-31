import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBusinessDto, UpdateBusinessDto } from './dto/business.dto';

@Injectable()
export class BusinessService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, createBusinessDto: CreateBusinessDto) {
    try {
      const result = await this.prisma.business.create({
        data: {
          ...createBusinessDto,
          ownerId: userId,
          workingHours:
            createBusinessDto.workingHours || this.getDefaultWorkingHours(),
        },
      });
      return result;
    } catch (error) {
      throw error;
    }
  }

  async findOne(id: string, userId: string) {
    const business = await this.prisma.business.findUnique({
      where: { id },
      include: {
        owner: true,
        staff: true,
        services: true,
      },
    });

    if (!business) {
      throw new NotFoundException('Бизнес не найден');
    }

    // Проверяем права доступа
    if (business.ownerId !== userId) {
      throw new ForbiddenException('Нет доступа к этому бизнесу');
    }

    return business;
  }

  async update(
    id: string,
    userId: string,
    updateBusinessDto: UpdateBusinessDto,
  ) {
    const business = await this.findOne(id, userId);

    return this.prisma.business.update({
      where: { id },
      data: updateBusinessDto,
    });
  }

  async findAllByOwner(userId: string) {
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

  private getDefaultWorkingHours() {
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
}
