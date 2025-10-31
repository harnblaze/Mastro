import {
  IsString,
  IsNotEmpty,
  IsInt,
  IsOptional,
  IsArray,
  Min,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateServiceDto {
  @ApiProperty({ description: 'Название услуги' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ description: 'Длительность услуги в минутах', minimum: 1 })
  @IsInt()
  @Min(1)
  durationMinutes: number;

  @ApiProperty({ description: 'Цена услуги', minimum: 0 })
  @IsInt()
  @Min(0)
  price: number;

  @ApiProperty({
    description: 'Буферное время до услуги в минутах',
    minimum: 0,
    required: false,
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  bufferBefore?: number;

  @ApiProperty({
    description: 'Буферное время после услуги в минутах',
    minimum: 0,
    required: false,
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  bufferAfter?: number;

  @ApiProperty({ description: 'Цвет услуги', required: false })
  @IsOptional()
  @IsString()
  color?: string;
}

export class UpdateServiceDto {
  @ApiProperty({ description: 'Название услуги', required: false })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiProperty({
    description: 'Длительность услуги в минутах',
    minimum: 1,
    required: false,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  durationMinutes?: number;

  @ApiProperty({ description: 'Цена услуги', minimum: 0, required: false })
  @IsOptional()
  @IsInt()
  @Min(0)
  price?: number;

  @ApiProperty({
    description: 'Буферное время до услуги в минутах',
    minimum: 0,
    required: false,
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  bufferBefore?: number;

  @ApiProperty({
    description: 'Буферное время после услуги в минутах',
    minimum: 0,
    required: false,
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  bufferAfter?: number;

  @ApiProperty({ description: 'Цвет услуги', required: false })
  @IsOptional()
  @IsString()
  color?: string;
}
