import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class VkAuthDto {
  @ApiProperty({ description: 'VK токен для авторизации' })
  @IsString()
  @IsNotEmpty()
  vkToken: string;
}

export class LoginDto {
  @ApiProperty({ description: 'Email пользователя' })
  @IsEmail()
  email: string;

  @ApiProperty({ description: 'Пароль пользователя' })
  @IsString()
  @IsNotEmpty()
  password: string;
}

export class CreateUserDto {
  @ApiProperty({ description: 'Email пользователя' })
  @IsEmail()
  email: string;

  @ApiProperty({ description: 'Пароль пользователя' })
  @IsString()
  @IsNotEmpty()
  password: string;

  @ApiProperty({ description: 'VK ID пользователя', required: false })
  @IsOptional()
  @IsString()
  vkId?: string;

  @ApiProperty({
    description: 'Роль пользователя',
    enum: ['OWNER', 'STAFF'],
    required: false,
  })
  @IsOptional()
  @IsString()
  role?: 'OWNER' | 'STAFF';
}
