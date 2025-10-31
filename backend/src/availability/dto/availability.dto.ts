import { IsString, IsOptional, IsEnum, IsDateString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateAvailabilityExceptionDto {
  @ApiProperty({ description: 'Дата исключения (ISO строка)' })
  @IsDateString()
  date: string;

  @ApiProperty({ description: 'Время начала (HH:mm)', required: false })
  @IsOptional()
  @IsString()
  startTime?: string;

  @ApiProperty({ description: 'Время окончания (HH:mm)', required: false })
  @IsOptional()
  @IsString()
  endTime?: string;

  @ApiProperty({
    description: 'Тип исключения',
    enum: ['CLOSED', 'OPEN_CUSTOM'],
  })
  @IsEnum(['CLOSED', 'OPEN_CUSTOM'])
  type: 'CLOSED' | 'OPEN_CUSTOM';

  @ApiProperty({ description: 'Причина исключения', required: false })
  @IsOptional()
  @IsString()
  reason?: string;
}

export class AvailabilityQueryDto {
  @ApiProperty({ description: 'Дата для проверки доступности (ISO строка)' })
  @IsDateString()
  date: string;

  @ApiProperty({ description: 'ID услуги', required: false })
  @IsOptional()
  @IsString()
  serviceId?: string;

  @ApiProperty({ description: 'ID сотрудника', required: false })
  @IsOptional()
  @IsString()
  staffId?: string;
}
