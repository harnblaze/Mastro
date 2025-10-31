import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsArray,
  IsUUID,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateStaffDto {
  @ApiProperty({ description: 'Имя сотрудника' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ description: 'Телефон сотрудника', required: false })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiProperty({
    description: 'ID услуг, которые выполняет сотрудник',
    type: [String],
    required: false,
  })
  @IsOptional()
  @IsArray()
  @IsUUID(4, { each: true })
  serviceIds?: string[];
}

export class UpdateStaffDto {
  @ApiProperty({ description: 'Имя сотрудника', required: false })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ description: 'Телефон сотрудника', required: false })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiProperty({
    description: 'ID услуг, которые выполняет сотрудник',
    type: [String],
    required: false,
  })
  @IsOptional()
  @IsArray()
  @IsUUID(4, { each: true })
  serviceIds?: string[];
}
