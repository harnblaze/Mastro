import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsObject,
  MaxLength,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateBusinessDto {
  @ApiProperty({ description: 'Название бизнеса', maxLength: 100 })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;

  @ApiProperty({
    description: 'Адрес бизнеса',
    maxLength: 500,
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  address?: string;

  @ApiProperty({ description: 'Часовой пояс', required: false })
  @IsOptional()
  @IsString()
  timezone?: string;

  @ApiProperty({ description: 'Телефон', required: false })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiProperty({ description: 'Email', required: false })
  @IsOptional()
  @IsString()
  email?: string;

  @ApiProperty({ description: 'Веб-сайт', required: false })
  @IsOptional()
  @IsString()
  website?: string;

  @ApiProperty({ description: 'Описание бизнеса', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: 'Рабочие часы', required: false })
  @IsOptional()
  @IsObject()
  workingHours?: any;
}

export class UpdateBusinessDto {
  @ApiProperty({ description: 'Название бизнеса', required: false })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({
    description: 'Адрес бизнеса',
    maxLength: 500,
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  address?: string;

  @ApiProperty({ description: 'Часовой пояс', required: false })
  @IsOptional()
  @IsString()
  timezone?: string;

  @ApiProperty({ description: 'Телефон', required: false })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiProperty({ description: 'Email', required: false })
  @IsOptional()
  @IsString()
  email?: string;

  @ApiProperty({ description: 'Веб-сайт', required: false })
  @IsOptional()
  @IsString()
  website?: string;

  @ApiProperty({ description: 'Описание бизнеса', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: 'Рабочие часы', required: false })
  @IsOptional()
  @IsObject()
  workingHours?: any;
}
