import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, ForbiddenException } from '@nestjs/common';
import { BusinessService } from './business.service';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBusinessDto, UpdateBusinessDto } from './dto/business.dto';

describe('BusinessService', () => {
  let service: BusinessService;
  let prismaService: PrismaService;

  const mockPrismaService = {
    business: {
      create: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BusinessService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<BusinessService>(BusinessService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    const userId = 'user-id';
    const createBusinessDto: CreateBusinessDto = {
      name: 'Тестовый салон',
      address: 'Тестовый адрес',
      timezone: 'Europe/Moscow',
      phone: '+7 999 123 45 67',
      email: 'test@salon.com',
      website: 'https://test-salon.com',
      description: 'Описание салона',
    };

    it('должен успешно создать бизнес с переданными данными', async () => {
      const createdBusiness = {
        id: 'business-id',
        ownerId: userId,
        ...createBusinessDto,
        workingHours: {
          monday: { start: '09:00', end: '18:00', isWorking: true },
          tuesday: { start: '09:00', end: '18:00', isWorking: true },
          wednesday: { start: '09:00', end: '18:00', isWorking: true },
          thursday: { start: '09:00', end: '18:00', isWorking: true },
          friday: { start: '09:00', end: '18:00', isWorking: true },
          saturday: { start: '10:00', end: '16:00', isWorking: true },
          sunday: { start: '10:00', end: '16:00', isWorking: false },
        },
        createdAt: new Date(),
      };

      mockPrismaService.business.create.mockResolvedValue(createdBusiness);

      const result = await service.create(userId, createBusinessDto);

      expect(mockPrismaService.business.create).toHaveBeenCalledWith({
        data: {
          ...createBusinessDto,
          ownerId: userId,
          workingHours: expect.objectContaining({
            monday: { start: '09:00', end: '18:00', isWorking: true },
            sunday: { start: '10:00', end: '16:00', isWorking: false },
          }),
        },
      });
      expect(result).toEqual(createdBusiness);
    });

    it('должен использовать переданные рабочие часы', async () => {
      const customWorkingHours = {
        monday: { start: '08:00', end: '20:00', isWorking: true },
        tuesday: { start: '08:00', end: '20:00', isWorking: true },
        wednesday: { start: '08:00', end: '20:00', isWorking: true },
        thursday: { start: '08:00', end: '20:00', isWorking: true },
        friday: { start: '08:00', end: '20:00', isWorking: true },
        saturday: { isWorking: false },
        sunday: { isWorking: false },
      };

      const dtoWithWorkingHours = {
        ...createBusinessDto,
        workingHours: customWorkingHours,
      };

      const createdBusiness = {
        id: 'business-id',
        ownerId: userId,
        ...dtoWithWorkingHours,
      };

      mockPrismaService.business.create.mockResolvedValue(createdBusiness);

      await service.create(userId, dtoWithWorkingHours);

      expect(mockPrismaService.business.create).toHaveBeenCalledWith({
        data: {
          ...dtoWithWorkingHours,
          ownerId: userId,
          workingHours: customWorkingHours,
        },
      });
    });
  });

  describe('findOne', () => {
    const businessId = 'business-id';
    const userId = 'user-id';

    it('должен вернуть бизнес для владельца', async () => {
      const business = {
        id: businessId,
        ownerId: userId,
        name: 'Тестовый салон',
        owner: { id: userId, email: 'owner@example.com' },
        staff: [],
        services: [],
      };

      mockPrismaService.business.findUnique.mockResolvedValue(business);

      const result = await service.findOne(businessId, userId);

      expect(mockPrismaService.business.findUnique).toHaveBeenCalledWith({
        where: { id: businessId },
        include: {
          owner: true,
          staff: true,
          services: true,
        },
      });
      expect(result).toEqual(business);
    });

    it('должен выбросить NotFoundException если бизнес не найден', async () => {
      mockPrismaService.business.findUnique.mockResolvedValue(null);

      await expect(service.findOne(businessId, userId)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('должен выбросить ForbiddenException если пользователь не владелец', async () => {
      const business = {
        id: businessId,
        ownerId: 'other-user-id',
        name: 'Тестовый салон',
      };

      mockPrismaService.business.findUnique.mockResolvedValue(business);

      await expect(service.findOne(businessId, userId)).rejects.toThrow(
        ForbiddenException,
      );
    });
  });

  describe('update', () => {
    const businessId = 'business-id';
    const userId = 'user-id';
    const updateBusinessDto: UpdateBusinessDto = {
      name: 'Обновленное название',
      address: 'Новый адрес',
    };

    it('должен успешно обновить бизнес', async () => {
      const existingBusiness = {
        id: businessId,
        ownerId: userId,
        name: 'Старое название',
        address: 'Старый адрес',
      };

      const updatedBusiness = {
        ...existingBusiness,
        ...updateBusinessDto,
      };

      mockPrismaService.business.findUnique.mockResolvedValue(existingBusiness);
      mockPrismaService.business.update.mockResolvedValue(updatedBusiness);

      const result = await service.update(
        businessId,
        userId,
        updateBusinessDto,
      );

      expect(mockPrismaService.business.update).toHaveBeenCalledWith({
        where: { id: businessId },
        data: updateBusinessDto,
      });
      expect(result).toEqual(updatedBusiness);
    });

    it('должен выбросить ошибку если бизнес не найден', async () => {
      mockPrismaService.business.findUnique.mockResolvedValue(null);

      await expect(
        service.update(businessId, userId, updateBusinessDto),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('findAllByOwner', () => {
    const userId = 'user-id';

    it('должен вернуть все бизнесы владельца с дополнительной информацией', async () => {
      const businesses = [
        {
          id: 'business-1',
          ownerId: userId,
          name: 'Салон 1',
          staff: [],
          services: [],
          _count: {
            bookings: 5,
            clients: 3,
          },
        },
        {
          id: 'business-2',
          ownerId: userId,
          name: 'Салон 2',
          staff: [{ id: 'staff-1', name: 'Мастер' }],
          services: [{ id: 'service-1', title: 'Маникюр' }],
          _count: {
            bookings: 10,
            clients: 7,
          },
        },
      ];

      mockPrismaService.business.findMany.mockResolvedValue(businesses);

      const result = await service.findAllByOwner(userId);

      expect(mockPrismaService.business.findMany).toHaveBeenCalledWith({
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
      expect(result).toEqual(businesses);
    });

    it('должен вернуть пустой массив если у пользователя нет бизнесов', async () => {
      mockPrismaService.business.findMany.mockResolvedValue([]);

      const result = await service.findAllByOwner(userId);

      expect(result).toEqual([]);
    });
  });

  describe('getDefaultWorkingHours', () => {
    it('должен вернуть стандартные рабочие часы', () => {
      // Получаем приватный метод через рефлексию
      const defaultHours = (service as any).getDefaultWorkingHours();

      expect(defaultHours).toEqual({
        monday: { start: '09:00', end: '18:00', isWorking: true },
        tuesday: { start: '09:00', end: '18:00', isWorking: true },
        wednesday: { start: '09:00', end: '18:00', isWorking: true },
        thursday: { start: '09:00', end: '18:00', isWorking: true },
        friday: { start: '09:00', end: '18:00', isWorking: true },
        saturday: { start: '10:00', end: '16:00', isWorking: true },
        sunday: { start: '10:00', end: '16:00', isWorking: false },
      });
    });
  });
});
