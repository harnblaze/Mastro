import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEnum,
  IsUUID,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateNotificationDto {
  @ApiProperty({ description: 'ID записи' })
  @IsUUID()
  @IsNotEmpty()
  bookingId: string;

  @ApiProperty({
    description: 'Тип уведомления',
    enum: ['SMS', 'EMAIL', 'VK'],
  })
  @IsEnum(['SMS', 'EMAIL', 'VK'])
  @IsNotEmpty()
  type: 'SMS' | 'EMAIL' | 'VK';

  @ApiProperty({
    description: 'Шаблон уведомления',
    enum: [
      'BOOKING_CREATED',
      'BOOKING_CONFIRMED',
      'BOOKING_CANCELLED',
      'BOOKING_REMINDER',
    ],
  })
  @IsEnum([
    'BOOKING_CREATED',
    'BOOKING_CONFIRMED',
    'BOOKING_CANCELLED',
    'BOOKING_REMINDER',
  ])
  @IsNotEmpty()
  template:
    | 'BOOKING_CREATED'
    | 'BOOKING_CONFIRMED'
    | 'BOOKING_CANCELLED'
    | 'BOOKING_REMINDER';

  @ApiProperty({ description: 'Пользовательское сообщение', required: false })
  @IsOptional()
  @IsString()
  customMessage?: string;
}

export class NotificationQueryDto {
  @ApiProperty({ description: 'ID записи', required: false })
  @IsOptional()
  @IsUUID()
  bookingId?: string;

  @ApiProperty({
    description: 'Тип уведомления',
    enum: ['SMS', 'EMAIL', 'VK'],
    required: false,
  })
  @IsOptional()
  @IsEnum(['SMS', 'EMAIL', 'VK'])
  type?: 'SMS' | 'EMAIL' | 'VK';

  @ApiProperty({
    description: 'Статус уведомления',
    enum: ['PENDING', 'SENT', 'FAILED'],
    required: false,
  })
  @IsOptional()
  @IsEnum(['PENDING', 'SENT', 'FAILED'])
  status?: 'PENDING' | 'SENT' | 'FAILED';
}
