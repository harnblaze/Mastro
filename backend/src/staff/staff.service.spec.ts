import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, ForbiddenException } from '@nestjs/common';
import { StaffService } from './staff.service';
import { PrismaService } from '../prisma/prisma.service';
import { CreateStaffDto, UpdateStaffDto } from './dto/staff.dto';

describe('StaffService', () => {
  let service: StaffService;
  let prismaService: PrismaService;

  const mockPrismaService = {
    business: {
      findUnique: jest.fn(),
    },
    staff: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    staffService: {
      createMany: jest.fn(),
      deleteMany: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StaffService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<StaffService>(StaffService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    const businessId = 'business-id';
    const userId = 'user-id';
    const createStaffDto: CreateStaffDto = {
      name: 'Мария Иванова',
      phone: '+7 999 123 45 67',
      serviceIds: ['service-1', 'service-2'],
    };

    beforeEach(() => {
      mockPrismaService.business.findUnique.mockResolvedValue({
        id: businessId,
        ownerId: userId,
      });
    });

    it('должен успешно создать сотрудника с услугами', async () => {
      const createdStaff = {
        id: 'staff-id',
        businessId,
        name: 'Мария Иванова',
        phone: '+7 999 123 45 67',
        createdAt: new Date(),
      };

      const staffWithServices = {
        ...createdStaff,
        business: { id: businessId, ownerId: userId },
        staffServices: [
          { service: { id: 'service-1', title: 'Маникюр' } },
          { service: { id: 'service-2', title: 'Педикюр' } },
        ],
      };

      mockPrismaService.staff.create.mockResolvedValue(createdStaff);
      mockPrismaService.staffService.createMany.mockResolvedValue({});
      mockPrismaService.staff.findUnique.mockResolvedValue(staffWithServices);

      const result = await service.create(businessId, userId, createStaffDto);

      expect(mockPrismaService.business.findUnique).toHaveBeenCalledWith({
        where: { id: businessId },
      });
      expect(mockPrismaService.staff.create).toHaveBeenCalledWith({
        data: {
          name: 'Мария Иванова',
          phone: '+7 999 123 45 67',
          businessId,
        },
      });
      expect(mockPrismaService.staffService.createMany).toHaveBeenCalledWith({
        data: [
          { staffId: 'staff-id', serviceId: 'service-1' },
          { staffId: 'staff-id', serviceId: 'service-2' },
        ],
      });
      expect(result).toEqual(staffWithServices);
    });

    it('должен создать сотрудника без услуг', async () => {
      const createStaffDtoWithoutServices: CreateStaffDto = {
        name: 'Анна Петрова',
        phone: '+7 999 987 65 43',
      };

      const createdStaff = {
        id: 'staff-id',
        businessId,
        name: 'Анна Петрова',
        phone: '+7 999 987 65 43',
        createdAt: new Date(),
      };

      const staffWithServices = {
        ...createdStaff,
        business: { id: businessId, ownerId: userId },
        staffServices: [],
      };

      mockPrismaService.staff.create.mockResolvedValue(createdStaff);
      mockPrismaService.staff.findUnique.mockResolvedValue(staffWithServices);

      await service.create(businessId, userId, createStaffDtoWithoutServices);

      expect(mockPrismaService.staffService.createMany).not.toHaveBeenCalled();
    });

    it('должен выбросить NotFoundException если бизнес не найден', async () => {
      mockPrismaService.business.findUnique.mockResolvedValue(null);

      await expect(
        service.create(businessId, userId, createStaffDto),
      ).rejects.toThrow(NotFoundException);
    });

    it('должен выбросить ForbiddenException если пользователь не владелец бизнеса', async () => {
      mockPrismaService.business.findUnique.mockResolvedValue({
        id: businessId,
        ownerId: 'other-user-id',
      });

      await expect(
        service.create(businessId, userId, createStaffDto),
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

    it('должен вернуть всех сотрудников бизнеса с услугами', async () => {
      const staffList = [
        {
          id: 'staff-1',
          businessId,
          name: 'Мария Иванова',
          phone: '+7 999 111 22 33',
          staffServices: [{ service: { id: 'service-1', title: 'Маникюр' } }],
        },
        {
          id: 'staff-2',
          businessId,
          name: 'Анна Петрова',
          phone: '+7 999 444 55 66',
          staffServices: [
            { service: { id: 'service-2', title: 'Педикюр' } },
            { service: { id: 'service-3', title: 'Массаж' } },
          ],
        },
      ];

      mockPrismaService.staff.findMany.mockResolvedValue(staffList);

      const result = await service.findAll(businessId, userId);

      expect(mockPrismaService.staff.findMany).toHaveBeenCalledWith({
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
      expect(result).toEqual(staffList);
    });

    it('должен вернуть пустой массив если сотрудников нет', async () => {
      mockPrismaService.staff.findMany.mockResolvedValue([]);

      const result = await service.findAll(businessId, userId);

      expect(result).toEqual([]);
    });
  });

  describe('findOne', () => {
    const staffId = 'staff-id';
    const userId = 'user-id';
    const businessId = 'business-id';

    it('должен вернуть сотрудника с услугами для владельца бизнеса', async () => {
      const staff = {
        id: staffId,
        businessId,
        name: 'Мария Иванова',
        phone: '+7 999 123 45 67',
        business: {
          id: businessId,
          ownerId: userId,
        },
        staffServices: [{ service: { id: 'service-1', title: 'Маникюр' } }],
      };

      mockPrismaService.staff.findUnique.mockResolvedValue(staff);
      mockPrismaService.business.findUnique.mockResolvedValue({
        id: businessId,
        ownerId: userId,
      });

      const result = await service.findOne(staffId, userId);

      expect(mockPrismaService.staff.findUnique).toHaveBeenCalledWith({
        where: { id: staffId },
        include: {
          business: true,
          staffServices: {
            include: {
              service: true,
            },
          },
        },
      });
      expect(result).toEqual(staff);
    });

    it('должен выбросить NotFoundException если сотрудник не найден', async () => {
      mockPrismaService.staff.findUnique.mockResolvedValue(null);

      await expect(service.findOne(staffId, userId)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('должен выбросить ForbiddenException если пользователь не владелец бизнеса', async () => {
      const staff = {
        id: staffId,
        businessId,
        business: {
          id: businessId,
          ownerId: 'other-user-id',
        },
      };

      mockPrismaService.staff.findUnique.mockResolvedValue(staff);
      mockPrismaService.business.findUnique.mockResolvedValue({
        id: businessId,
        ownerId: 'other-user-id',
      });

      await expect(service.findOne(staffId, userId)).rejects.toThrow(
        ForbiddenException,
      );
    });
  });

  describe('update', () => {
    const staffId = 'staff-id';
    const userId = 'user-id';
    const businessId = 'business-id';
    const updateStaffDto: UpdateStaffDto = {
      name: 'Обновленное имя',
      phone: '+7 999 999 99 99',
      serviceIds: ['service-3', 'service-4'],
    };

    it('должен успешно обновить сотрудника с услугами', async () => {
      const existingStaff = {
        id: staffId,
        businessId,
        name: 'Старое имя',
        phone: '+7 999 111 11 11',
        business: {
          id: businessId,
          ownerId: userId,
        },
        staffServices: [
          { service: { id: 'service-1', title: 'Старая услуга' } },
        ],
      };

      const updatedStaff = {
        ...existingStaff,
        name: 'Обновленное имя',
        phone: '+7 999 999 99 99',
        staffServices: [
          { service: { id: 'service-3', title: 'Новая услуга 1' } },
          { service: { id: 'service-4', title: 'Новая услуга 2' } },
        ],
      };

      mockPrismaService.staff.findUnique
        .mockResolvedValueOnce(existingStaff) // Первый вызов в findOne
        .mockResolvedValueOnce(updatedStaff); // Второй вызов в конце
      mockPrismaService.business.findUnique.mockResolvedValue({
        id: businessId,
        ownerId: userId,
      });
      mockPrismaService.staff.update.mockResolvedValue({
        id: staffId,
        name: 'Обновленное имя',
        phone: '+7 999 999 99 99',
      });
      mockPrismaService.staffService.deleteMany.mockResolvedValue({});
      mockPrismaService.staffService.createMany.mockResolvedValue({});

      const result = await service.update(staffId, userId, updateStaffDto);

      expect(mockPrismaService.staff.update).toHaveBeenCalledWith({
        where: { id: staffId },
        data: {
          name: 'Обновленное имя',
          phone: '+7 999 999 99 99',
        },
      });
      expect(mockPrismaService.staffService.deleteMany).toHaveBeenCalledWith({
        where: { staffId },
      });
      expect(mockPrismaService.staffService.createMany).toHaveBeenCalledWith({
        data: [
          { staffId, serviceId: 'service-3' },
          { staffId, serviceId: 'service-4' },
        ],
      });
      expect(result).toEqual(updatedStaff);
    });

    it('должен обновить сотрудника без изменения услуг', async () => {
      const updateDtoWithoutServices: UpdateStaffDto = {
        name: 'Только имя',
      };

      const existingStaff = {
        id: staffId,
        businessId,
        name: 'Старое имя',
        business: {
          id: businessId,
          ownerId: userId,
        },
        staffServices: [],
      };

      const updatedStaff = {
        ...existingStaff,
        name: 'Только имя',
      };

      mockPrismaService.staff.findUnique
        .mockResolvedValueOnce(existingStaff)
        .mockResolvedValueOnce(updatedStaff);
      mockPrismaService.business.findUnique.mockResolvedValue({
        id: businessId,
        ownerId: userId,
      });
      mockPrismaService.staff.update.mockResolvedValue({
        id: staffId,
        name: 'Только имя',
      });

      await service.update(staffId, userId, updateDtoWithoutServices);

      expect(mockPrismaService.staffService.deleteMany).not.toHaveBeenCalled();
      expect(mockPrismaService.staffService.createMany).not.toHaveBeenCalled();
    });

    it('должен удалить все услуги если передан пустой массив', async () => {
      const updateDtoEmptyServices: UpdateStaffDto = {
        serviceIds: [],
      };

      const existingStaff = {
        id: staffId,
        businessId,
        name: 'Имя',
        business: {
          id: businessId,
          ownerId: userId,
        },
        staffServices: [{ service: { id: 'service-1', title: 'Услуга' } }],
      };

      const updatedStaff = {
        ...existingStaff,
        staffServices: [],
      };

      mockPrismaService.staff.findUnique
        .mockResolvedValueOnce(existingStaff)
        .mockResolvedValueOnce(updatedStaff);
      mockPrismaService.business.findUnique.mockResolvedValue({
        id: businessId,
        ownerId: userId,
      });
      mockPrismaService.staff.update.mockResolvedValue({
        id: staffId,
        name: 'Имя',
      });
      mockPrismaService.staffService.deleteMany.mockResolvedValue({});

      await service.update(staffId, userId, updateDtoEmptyServices);

      expect(mockPrismaService.staffService.deleteMany).toHaveBeenCalledWith({
        where: { staffId },
      });
      expect(mockPrismaService.staffService.createMany).not.toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    const staffId = 'staff-id';
    const userId = 'user-id';
    const businessId = 'business-id';

    it('должен успешно удалить сотрудника', async () => {
      const staff = {
        id: staffId,
        businessId,
        name: 'Мария Иванова',
        business: {
          id: businessId,
          ownerId: userId,
        },
        staffServices: [],
      };

      const deletedStaff = {
        id: staffId,
        businessId,
        name: 'Мария Иванова',
      };

      mockPrismaService.staff.findUnique.mockResolvedValue(staff);
      mockPrismaService.business.findUnique.mockResolvedValue({
        id: businessId,
        ownerId: userId,
      });
      mockPrismaService.staff.delete.mockResolvedValue(deletedStaff);

      const result = await service.remove(staffId, userId);

      expect(mockPrismaService.staff.delete).toHaveBeenCalledWith({
        where: { id: staffId },
      });
      expect(result).toEqual(deletedStaff);
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

