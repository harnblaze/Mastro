import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { VkService } from './vk.service';
import { PrismaService } from '../prisma/prisma.service';
import { VkAuthDto, LoginDto, CreateUserDto } from './dto/auth.dto';
import * as bcrypt from 'bcryptjs';

describe('AuthService', () => {
  let service: AuthService;
  let prismaService: PrismaService;
  let vkService: VkService;
  let jwtService: JwtService;

  const mockPrismaService = {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
  };

  const mockVkService = {
    validateToken: jest.fn(),
  };

  const mockJwtService = {
    sign: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: VkService,
          useValue: mockVkService,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    prismaService = module.get<PrismaService>(PrismaService);
    vkService = module.get<VkService>(VkService);
    jwtService = module.get<JwtService>(JwtService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('validateVkAuth', () => {
    const vkAuthDto: VkAuthDto = {
      vkToken: 'test-vk-token',
    };

    const mockVkUser = {
      id: 123456789,
      first_name: 'Иван',
      last_name: 'Петров',
      email: 'ivan@example.com',
    };

    it('должен успешно авторизовать существующего пользователя через VK', async () => {
      const existingUser = {
        id: 'user-id',
        email: 'ivan@example.com',
        vkId: '123456789',
        role: 'OWNER',
      };

      mockVkService.validateToken.mockResolvedValue(mockVkUser);
      mockPrismaService.user.findUnique.mockResolvedValue(existingUser);
      mockJwtService.sign.mockReturnValue('jwt-token');

      const result = await service.validateVkAuth(vkAuthDto);

      expect(mockVkService.validateToken).toHaveBeenCalledWith('test-vk-token');
      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
        where: { vkId: '123456789' },
      });
      expect(result).toEqual({
        access_token: 'jwt-token',
        user: {
          id: 'user-id',
          email: 'ivan@example.com',
          role: 'OWNER',
          vkId: '123456789',
        },
      });
    });

    it('должен создать нового пользователя при первом входе через VK', async () => {
      const newUser = {
        id: 'new-user-id',
        email: 'ivan@example.com',
        vkId: '123456789',
        role: 'OWNER',
      };

      mockVkService.validateToken.mockResolvedValue(mockVkUser);
      mockPrismaService.user.findUnique.mockResolvedValue(null);
      mockPrismaService.user.create.mockResolvedValue(newUser);
      mockJwtService.sign.mockReturnValue('jwt-token');

      const result = await service.validateVkAuth(vkAuthDto);

      expect(mockPrismaService.user.create).toHaveBeenCalledWith({
        data: {
          vkId: '123456789',
          email: 'ivan@example.com',
          role: 'OWNER',
        },
      });
      expect(result.access_token).toBe('jwt-token');
    });

    it('должен создать временный email если VK не предоставил email', async () => {
      const vkUserWithoutEmail = { ...mockVkUser, email: undefined };
      const newUser = {
        id: 'new-user-id',
        email: '123456789@vk.local',
        vkId: '123456789',
        role: 'OWNER',
      };

      mockVkService.validateToken.mockResolvedValue(vkUserWithoutEmail);
      mockPrismaService.user.findUnique.mockResolvedValue(null);
      mockPrismaService.user.create.mockResolvedValue(newUser);
      mockJwtService.sign.mockReturnValue('jwt-token');

      await service.validateVkAuth(vkAuthDto);

      expect(mockPrismaService.user.create).toHaveBeenCalledWith({
        data: {
          vkId: '123456789',
          email: '123456789@vk.local',
          role: 'OWNER',
        },
      });
    });

    it('должен выбросить UnauthorizedException при неверном VK токене', async () => {
      mockVkService.validateToken.mockRejectedValue(new Error('Invalid token'));

      await expect(service.validateVkAuth(vkAuthDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('login', () => {
    const loginDto: LoginDto = {
      email: 'test@example.com',
      password: 'password123',
    };

    it('должен успешно авторизовать пользователя с правильными данными', async () => {
      const user = {
        id: 'user-id',
        email: 'test@example.com',
        passwordHash: 'hashed-password',
        role: 'OWNER',
      };

      mockPrismaService.user.findUnique.mockResolvedValue(user);
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(true as never);
      mockJwtService.sign.mockReturnValue('jwt-token');

      const result = await service.login(loginDto);

      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
        where: { email: 'test@example.com' },
      });
      expect(result.access_token).toBe('jwt-token');
    });

    it('должен выбросить UnauthorizedException для несуществующего пользователя', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      await expect(service.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('должен выбросить UnauthorizedException для пользователя без пароля', async () => {
      const user = {
        id: 'user-id',
        email: 'test@example.com',
        passwordHash: null,
        role: 'OWNER',
      };

      mockPrismaService.user.findUnique.mockResolvedValue(user);

      await expect(service.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('должен выбросить UnauthorizedException при неверном пароле', async () => {
      const user = {
        id: 'user-id',
        email: 'test@example.com',
        passwordHash: 'hashed-password',
        role: 'OWNER',
      };

      mockPrismaService.user.findUnique.mockResolvedValue(user);
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(false as never);

      await expect(service.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('register', () => {
    const createUserDto: CreateUserDto = {
      email: 'new@example.com',
      password: 'password123',
      role: 'OWNER',
    };

    it('должен успешно зарегистрировать нового пользователя', async () => {
      const hashedPassword = 'hashed-password';
      const newUser = {
        id: 'new-user-id',
        email: 'new@example.com',
        passwordHash: hashedPassword,
        role: 'OWNER',
      };

      jest.spyOn(bcrypt, 'hash').mockResolvedValue(hashedPassword as never);
      mockPrismaService.user.create.mockResolvedValue(newUser);
      mockJwtService.sign.mockReturnValue('jwt-token');

      const result = await service.register(createUserDto);

      expect(bcrypt.hash).toHaveBeenCalledWith('password123', 10);
      expect(mockPrismaService.user.create).toHaveBeenCalledWith({
        data: {
          email: 'new@example.com',
          passwordHash: hashedPassword,
          vkId: undefined,
          role: 'OWNER',
        },
      });
      expect(result.access_token).toBe('jwt-token');
    });
  });

  describe('validateUser', () => {
    it('должен вернуть пользователя по payload', async () => {
      const user = {
        id: 'user-id',
        email: 'test@example.com',
        role: 'OWNER',
      };

      const payload = { sub: 'user-id' };

      mockPrismaService.user.findUnique.mockResolvedValue(user);

      const result = await service.validateUser(payload);

      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
        where: { id: 'user-id' },
      });
      expect(result).toEqual(user);
    });

    it('должен выбросить UnauthorizedException если пользователь не найден', async () => {
      const payload = { sub: 'non-existent-id' };

      mockPrismaService.user.findUnique.mockResolvedValue(null);

      await expect(service.validateUser(payload)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });
});
