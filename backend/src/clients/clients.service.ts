import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateClientDto, UpdateClientDto } from './dto/client.dto';

@Injectable()
export class ClientsService {
  constructor(private prisma: PrismaService) {}

  async create(
    businessId: string,
    userId: string,
    createClientDto: CreateClientDto,
  ) {
    await this.checkBusinessAccess(businessId, userId);

    return this.prisma.client.create({
      data: {
        ...createClientDto,
        businessId,
      },
    });
  }

  async findAll(businessId: string, userId: string) {
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

  async findOne(id: string, userId: string) {
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
      throw new NotFoundException('Клиент не найден');
    }

    await this.checkBusinessAccess(client.businessId, userId);

    return client;
  }

  async update(id: string, userId: string, updateClientDto: UpdateClientDto) {
    const client = await this.findOne(id, userId);

    return this.prisma.client.update({
      where: { id },
      data: updateClientDto,
    });
  }

  async remove(id: string, userId: string) {
    const client = await this.findOne(id, userId);

    return this.prisma.client.delete({
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
