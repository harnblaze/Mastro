import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcryptjs';
import { VkService } from './vk.service';
import { VkAuthDto, LoginDto, CreateUserDto } from './dto/auth.dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private vkService: VkService,
  ) {}

  async validateVkAuth(vkAuthDto: VkAuthDto) {
    try {
      // Проверяем VK токен через VK API
      const vkUser = await this.vkService.validateToken(vkAuthDto.vkToken);

      // Ищем существующего пользователя по VK ID
      let user = await this.prisma.user.findUnique({
        where: { vkId: vkUser.id.toString() },
      });

      // Если пользователя нет, создаем нового
      if (!user) {
        user = await this.prisma.user.create({
          data: {
            vkId: vkUser.id.toString(),
            email: vkUser.email || `${vkUser.id}@vk.local`, // Используем email из VK или создаем временный
            role: 'OWNER',
          },
        });
      }

      return this.generateTokens(user);
    } catch (error) {
      console.error('VK Auth error:', error);
      throw new UnauthorizedException('Ошибка авторизации через VK');
    }
  }

  async login(loginDto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: loginDto.email },
    });

    if (!user || !user.passwordHash) {
      throw new UnauthorizedException('Неверные учетные данные');
    }

    const isPasswordValid = await bcrypt.compare(
      loginDto.password,
      user.passwordHash,
    );
    if (!isPasswordValid) {
      throw new UnauthorizedException('Неверные учетные данные');
    }

    return this.generateTokens(user);
  }

  async register(createUserDto: CreateUserDto) {
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

    const user = await this.prisma.user.create({
      data: {
        email: createUserDto.email,
        passwordHash: hashedPassword,
        vkId: createUserDto.vkId,
        role: createUserDto.role || 'OWNER',
      },
    });

    return this.generateTokens(user);
  }

  private generateTokens(user: any) {
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      vkId: user.vkId,
    };

    const token = this.jwtService.sign(payload);

    return {
      access_token: token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        vkId: user.vkId,
      },
    };
  }

  async validateUser(payload: any) {
    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
    });

    if (!user) {
      throw new UnauthorizedException('Пользователь не найден');
    }

    return user;
  }
}
