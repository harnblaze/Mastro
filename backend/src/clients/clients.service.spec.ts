import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, ForbiddenException } from '@nestjs/common';
import { ClientsService } from './clients.service';
import { PrismaService } from '../prisma/prisma.service';
import { CreateClientDto, UpdateClientDto } from './dto/client.dto';

describe('ClientsService', () => {
  let service: ClientsService;
  let prismaService: PrismaService;

  const mockPrismaService = {
    business: {
      findUnique: jest.fn(),
    },
    client: {
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
        ClientsService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<ClientsService>(ClientsService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    const businessId = 'business-id';
    const userId = 'user-id';
    const createClientDto: CreateClientDto = {
      name: 'Елена Смирнова',
      phone: '+7 999 123 45 67',
      email: 'elena@example.com',
      notes: 'Предпочитает утренние записи',
    };

    beforeEach(() => {
      mockPrismaService.business.findUnique.mockResolvedValue({
        id: businessId,
        ownerId: userId,
      });
    });

    it('должен успешно создать клиента', async () => {
      const createdClient = {
        id: 'client-id',
        businessId,
        ...createClientDto,
        createdAt: new Date(),
      };

      mockPrismaService.client.create.mockResolvedValue(createdClient);

      const result = await service.create(businessId, userId, createClientDto);

      expect(mockPrismaService.business.findUnique).toHaveBeenCalledWith({
        where: { id: businessId },
      });
      expect(mockPrismaService.client.create).toHaveBeenCalledWith({
        data: {
          ...createClientDto,
          businessId,
        },
      });
      expect(result).toEqual(createdClient);
    });

    it('должен создать клиента без опциональных полей', async () => {
      const minimalClientDto: CreateClientDto = {
        name: 'Иван Петров',
        phone: '+7 999 987 65 43',
      };

      const createdClient = {
        id: 'client-id',
        businessId,
        ...minimalClientDto,
        email: null,
        notes: null,
        createdAt: new Date(),
      };

      mockPrismaService.client.create.mockResolvedValue(createdClient);

      const result = await service.create(businessId, userId, minimalClientDto);

      expect(mockPrismaService.client.create).toHaveBeenCalledWith({
        data: {
          ...minimalClientDto,
          businessId,
        },
      });
      expect(result).toEqual(createdClient);
    });

    it('должен выбросить NotFoundException если бизнес не найден', async () => {
      mockPrismaService.business.findUnique.mockResolvedValue(null);

      await expect(
        service.create(businessId, userId, createClientDto),
      ).rejects.toThrow(NotFoundException);
    });

    it('должен выбросить ForbiddenException если пользователь не владелец бизнеса', async () => {
      mockPrismaService.business.findUnique.mockResolvedValue({
        id: businessId,
        ownerId: 'other-user-id',
      });

      await expect(
        service.create(businessId, userId, createClientDto),
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

    it('должен вернуть всех клиентов бизнеса с записями', async () => {
      const clientsList = [
        {
          id: 'client-1',
          businessId,
          name: 'Елена Смирнова',
          phone: '+7 999 111 22 33',
          email: 'elena@example.com',
          notes: 'Предпочитает утренние записи',
          bookings: [
            {
              id: 'booking-1',
              startTs: new Date('2025-01-15T10:00:00Z'),
              status: 'CONFIRMED',
              service: { title: 'Маникюр' },
              staff: { name: 'Мария' },
            },
          ],
        },
        {
          id: 'client-2',
          businessId,
          name: 'Ольга Козлова',
          phone: '+7 999 444 55 66',
          email: 'olga@example.com',
          notes: 'Аллергия на лак',
          bookings: [],
        },
      ];

      mockPrismaService.client.findMany.mockResolvedValue(clientsList);

      const result = await service.findAll(businessId, userId);

      expect(mockPrismaService.client.findMany).toHaveBeenCalledWith({
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
      expect(result).toEqual(clientsList);
    });

    it('должен вернуть пустой массив если клиентов нет', async () => {
      mockPrismaService.client.findMany.mockResolvedValue([]);

      const result = await service.findAll(businessId, userId);

      expect(result).toEqual([]);
    });
  });

  describe('findOne', () => {
    const clientId = 'client-id';
    const userId = 'user-id';
    const businessId = 'business-id';

    it('должен вернуть клиента с записями для владельца бизнеса', async () => {
      const client = {
        id: clientId,
        businessId,
        name: 'Елена Смирнова',
        phone: '+7 999 123 45 67',
        email: 'elena@example.com',
        notes: 'Предпочитает утренние записи',
        business: {
          id: businessId,
          ownerId: userId,
        },
        bookings: [
          {
            id: 'booking-1',
            startTs: new Date('2025-01-15T10:00:00Z'),
            status: 'CONFIRMED',
            service: { title: 'Маникюр' },
            staff: { name: 'Мария' },
          },
        ],
      };

      mockPrismaService.client.findUnique.mockResolvedValue(client);
      mockPrismaService.business.findUnique.mockResolvedValue({
        id: businessId,
        ownerId: userId,
      });

      const result = await service.findOne(clientId, userId);

      expect(mockPrismaService.client.findUnique).toHaveBeenCalledWith({
        where: { id: clientId },
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
      expect(result).toEqual(client);
    });

    it('должен выбросить NotFoundException если клиент не найден', async () => {
      mockPrismaService.client.findUnique.mockResolvedValue(null);

      await expect(service.findOne(clientId, userId)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('должен выбросить ForbiddenException если пользователь не владелец бизнеса', async () => {
      const client = {
        id: clientId,
        businessId,
        name: 'Елена Смирнова',
        business: {
          id: businessId,
          ownerId: 'other-user-id',
        },
        bookings: [],
      };

      mockPrismaService.client.findUnique.mockResolvedValue(client);
      mockPrismaService.business.findUnique.mockResolvedValue({
        id: businessId,
        ownerId: 'other-user-id',
      });

      await expect(service.findOne(clientId, userId)).rejects.toThrow(
        ForbiddenException,
      );
    });
  });

  describe('update', () => {
    const clientId = 'client-id';
    const userId = 'user-id';
    const businessId = 'business-id';
    const updateClientDto: UpdateClientDto = {
      name: 'Обновленное имя',
      phone: '+7 999 999 99 99',
      email: 'new@example.com',
      notes: 'Обновленные заметки',
    };

    it('должен успешно обновить клиента', async () => {
      const existingClient = {
        id: clientId,
        businessId,
        name: 'Старое имя',
        phone: '+7 999 111 11 11',
        email: 'old@example.com',
        notes: 'Старые заметки',
        business: {
          id: businessId,
          ownerId: userId,
        },
        bookings: [],
      };

      const updatedClient = {
        ...existingClient,
        ...updateClientDto,
      };

      mockPrismaService.client.findUnique
        .mockResolvedValueOnce(existingClient) // Первый вызов в findOne
        .mockResolvedValueOnce(updatedClient); // Второй вызов в конце
      mockPrismaService.business.findUnique.mockResolvedValue({
        id: businessId,
        ownerId: userId,
      });
      mockPrismaService.client.update.mockResolvedValue(updatedClient);

      const result = await service.update(clientId, userId, updateClientDto);

      expect(mockPrismaService.client.update).toHaveBeenCalledWith({
        where: { id: clientId },
        data: updateClientDto,
      });
      expect(result).toEqual(updatedClient);
    });

    it('должен обновить только переданные поля', async () => {
      const partialUpdateDto: UpdateClientDto = {
        name: 'Только имя',
      };

      const existingClient = {
        id: clientId,
        businessId,
        name: 'Старое имя',
        phone: '+7 999 111 11 11',
        business: {
          id: businessId,
          ownerId: userId,
        },
        bookings: [],
      };

      const updatedClient = {
        ...existingClient,
        name: 'Только имя',
      };

      mockPrismaService.client.findUnique
        .mockResolvedValueOnce(existingClient)
        .mockResolvedValueOnce(updatedClient);
      mockPrismaService.business.findUnique.mockResolvedValue({
        id: businessId,
        ownerId: userId,
      });
      mockPrismaService.client.update.mockResolvedValue(updatedClient);

      await service.update(clientId, userId, partialUpdateDto);

      expect(mockPrismaService.client.update).toHaveBeenCalledWith({
        where: { id: clientId },
        data: partialUpdateDto,
      });
    });
  });

  describe('remove', () => {
    const clientId = 'client-id';
    const userId = 'user-id';
    const businessId = 'business-id';

    it('должен успешно удалить клиента', async () => {
      const client = {
        id: clientId,
        businessId,
        name: 'Елена Смирнова',
        phone: '+7 999 123 45 67',
        business: {
          id: businessId,
          ownerId: userId,
        },
        bookings: [],
      };

      const deletedClient = {
        id: clientId,
        businessId,
        name: 'Елена Смирнова',
        phone: '+7 999 123 45 67',
      };

      mockPrismaService.client.findUnique.mockResolvedValue(client);
      mockPrismaService.business.findUnique.mockResolvedValue({
        id: businessId,
        ownerId: userId,
      });
      mockPrismaService.client.delete.mockResolvedValue(deletedClient);

      const result = await service.remove(clientId, userId);

      expect(mockPrismaService.client.delete).toHaveBeenCalledWith({
        where: { id: clientId },
      });
      expect(result).toEqual(deletedClient);
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

