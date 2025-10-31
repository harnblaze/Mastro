import { IsString, IsNotEmpty, IsOptional, IsEmail } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateClientDto {
  @ApiProperty({ description: 'Имя клиента' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ description: 'Телефон клиента' })
  @IsString()
  @IsNotEmpty()
  phone: string;

  @ApiProperty({ description: 'Email клиента', required: false })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiProperty({ description: 'Заметки о клиенте', required: false })
  @IsOptional()
  @IsString()
  notes?: string;
}

export class UpdateClientDto {
  @ApiProperty({ description: 'Имя клиента', required: false })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ description: 'Телефон клиента', required: false })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiProperty({ description: 'Email клиента', required: false })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiProperty({ description: 'Заметки о клиенте', required: false })
  @IsOptional()
  @IsString()
  notes?: string;
}
