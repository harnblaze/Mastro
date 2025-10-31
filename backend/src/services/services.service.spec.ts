import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, ForbiddenException } from '@nestjs/common';
import { ServicesService } from './services.service';
import { PrismaService } from '../prisma/prisma.service';
import { CreateServiceDto, UpdateServiceDto } from './dto/service.dto';

describe('ServicesService', () => {
  let service: ServicesService;
  let prismaService: PrismaService;

  const mockPrismaService = {
    business: {
      findUnique: jest.fn(),
    },
    service: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ServicesService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<ServicesService>(ServicesService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    const businessId = 'business-id';
    const userId = 'user-id';
    const createServiceDto: CreateServiceDto = {
      title: 'Маникюр',
      durationMinutes: 60,
      price: 200000,
      bufferBefore: 5,
      bufferAfter: 10,
      color: '#FF6B6B',
    };

    beforeEach(() => {
      mockPrismaService.business.findUnique.mockResolvedValue({
        id: businessId,
        ownerId: userId,
      });
    });

    it('должен успешно создать услугу', async () => {
      const createdService = {
        id: 'service-id',
        businessId,
        ...createServiceDto,
        createdAt: new Date(),
      };

      mockPrismaService.service.create.mockResolvedValue(createdService);

      const result = await service.create(businessId, userId, createServiceDto);

      expect(mockPrismaService.business.findUnique).toHaveBeenCalledWith({
        where: { id: businessId },
      });
      expect(mockPrismaService.service.create).toHaveBeenCalledWith({
        data: {
          ...createServiceDto,
          businessId,
        },
      });
      expect(result).toEqual(createdService);
    });

    it('должен выбросить NotFoundException если бизнес не найден', async () => {
      mockPrismaService.business.findUnique.mockResolvedValue(null);

      await expect(
        service.create(businessId, userId, createServiceDto),
      ).rejects.toThrow(NotFoundException);
    });

    it('должен выбросить ForbiddenException если пользователь не владелец бизнеса', async () => {
      mockPrismaService.business.findUnique.mockResolvedValue({
        id: businessId,
        ownerId: 'other-user-id',
      });

      await expect(
        service.create(businessId, userId, createServiceDto),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('findAll', () => {
    const businessId = 'business-id';
    const userId = 'user-id';

    beforeEach(() => {
      mockPrismaService.business.findUnique.mockResolvedValue({
        id: businessId,
        ownerId: userId,
      });
    });

    it('должен вернуть все услуги бизнеса', async () => {
      const services = [
        {
          id: 'service-1',
          businessId,
          title: 'Маникюр',
          durationMinutes: 60,
          price: 200000,
        },
        {
          id: 'service-2',
          businessId,
          title: 'Педикюр',
          durationMinutes: 90,
          price: 300000,
        },
      ];

      mockPrismaService.service.findMany.mockResolvedValue(services);

      const result = await service.findAll(businessId, userId);

      expect(mockPrismaService.service.findMany).toHaveBeenCalledWith({
        where: { businessId },
        orderBy: { title: 'asc' },
      });
      expect(result).toEqual(services);
    });

    it('должен вернуть пустой массив если услуг нет', async () => {
      mockPrismaService.service.findMany.mockResolvedValue([]);

      const result = await service.findAll(businessId, userId);

      expect(result).toEqual([]);
    });
  });

  describe('findOne', () => {
    const serviceId = 'service-id';
    const userId = 'user-id';
    const businessId = 'business-id';

    it('должен вернуть услугу для владельца бизнеса', async () => {
      const serviceData = {
        id: serviceId,
        businessId,
        title: 'Маникюр',
        durationMinutes: 60,
        price: 200000,
        business: {
          id: businessId,
          ownerId: userId,
        },
      };

      mockPrismaService.service.findUnique.mockResolvedValue(serviceData);
      mockPrismaService.business.findUnique.mockResolvedValue({
        id: businessId,
        ownerId: userId,
      });

      const result = await service.findOne(serviceId, userId);

      expect(mockPrismaService.service.findUnique).toHaveBeenCalledWith({
        where: { id: serviceId },
        include: { business: true },
      });
      expect(result).toEqual(serviceData);
    });

    it('должен выбросить NotFoundException если услуга не найдена', async () => {
      mockPrismaService.service.findUnique.mockResolvedValue(null);

      await expect(service.findOne(serviceId, userId)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('должен выбросить ForbiddenException если пользователь не владелец бизнеса', async () => {
      const serviceData = {
        id: serviceId,
        businessId,
        business: {
          id: businessId,
          ownerId: 'other-user-id',
        },
      };

      mockPrismaService.service.findUnique.mockResolvedValue(serviceData);
      mockPrismaService.business.findUnique.mockResolvedValue({
        id: businessId,
        ownerId: 'other-user-id',
      });

      await expect(service.findOne(serviceId, userId)).rejects.toThrow(
        ForbiddenException,
      );
    });
  });

  describe('update', () => {
    const serviceId = 'service-id';
    const userId = 'user-id';
    const businessId = 'business-id';
    const updateServiceDto: UpdateServiceDto = {
      title: 'Обновленный маникюр',
      price: 250000,
    };

    it('должен успешно обновить услугу', async () => {
      const existingService = {
        id: serviceId,
        businessId,
        title: 'Маникюр',
        durationMinutes: 60,
        price: 200000,
        business: {
          id: businessId,
          ownerId: userId,
        },
      };

      const updatedService = {
        ...existingService,
        ...updateServiceDto,
      };

      mockPrismaService.service.findUnique.mockResolvedValue(existingService);
      mockPrismaService.business.findUnique.mockResolvedValue({
        id: businessId,
        ownerId: userId,
      });
      mockPrismaService.service.update.mockResolvedValue(updatedService);

      const result = await service.update(serviceId, userId, updateServiceDto);

      expect(mockPrismaService.service.update).toHaveBeenCalledWith({
        where: { id: serviceId },
        data: updateServiceDto,
      });
      expect(result).toEqual(updatedService);
    });

    it('должен выбросить ошибку если услуга не найдена', async () => {
      mockPrismaService.service.findUnique.mockResolvedValue(null);

      await expect(
        service.update(serviceId, userId, updateServiceDto),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    const serviceId = 'service-id';
    const userId = 'user-id';
    const businessId = 'business-id';

    it('должен успешно удалить услугу', async () => {
      const serviceData = {
        id: serviceId,
        businessId,
        title: 'Маникюр',
        business: {
          id: businessId,
          ownerId: userId,
        },
      };

      mockPrismaService.service.findUnique.mockResolvedValue(serviceData);
      mockPrismaService.business.findUnique.mockResolvedValue({
        id: businessId,
        ownerId: userId,
      });
      mockPrismaService.service.delete.mockResolvedValue(serviceData);

      const result = await service.remove(serviceId, userId);

      expect(mockPrismaService.service.delete).toHaveBeenCalledWith({
        where: { id: serviceId },
      });
      expect(result).toEqual(serviceData);
    });

    it('должен выбросить ошибку если услуга не найдена', async () => {
      mockPrismaService.service.findUnique.mockResolvedValue(null);

      await expect(service.remove(serviceId, userId)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('checkBusinessAccess', () => {
    const businessId = 'business-id';
    const userId = 'user-id';

    it('должен пройти проверку для владельца бизнеса', async () => {
      mockPrismaService.business.findUnique.mockResolvedValue({
        id: businessId,
        ownerId: userId,
      });

      // Используем приватный метод через рефлексию
      await expect(
        (service as any).checkBusinessAccess(businessId, userId),
      ).resolves.not.toThrow();
    });

    it('должен выбросить NotFoundException для несуществующего бизнеса', async () => {
      mockPrismaService.business.findUnique.mockResolvedValue(null);

      await expect(
        (service as any).checkBusinessAccess(businessId, userId),
      ).rejects.toThrow(NotFoundException);
    });

    it('должен выбросить ForbiddenException для невладельца бизнеса', async () => {
      mockPrismaService.business.findUnique.mockResolvedValue({
        id: businessId,
        ownerId: 'other-user-id',
      });

      await expect(
        (service as any).checkBusinessAccess(businessId, userId),
      ).rejects.toThrow(ForbiddenException);
    });
  });
});
