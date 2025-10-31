import { IsString, IsOptional, IsEnum, IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateNotificationTemplateDto {
  @ApiProperty({
    description: 'Тип шаблона',
    enum: ['CONFIRM', 'REMINDER', 'CANCEL', 'OTHER'],
  })
  @IsEnum(['CONFIRM', 'REMINDER', 'CANCEL', 'OTHER'])
  type: 'CONFIRM' | 'REMINDER' | 'CANCEL' | 'OTHER';

  @ApiProperty({
    description: 'Канал уведомления',
    enum: ['SMS', 'EMAIL', 'VK'],
  })
  @IsEnum(['SMS', 'EMAIL', 'VK'])
  channel: 'SMS' | 'EMAIL' | 'VK';

  @ApiProperty({ description: 'Тема сообщения', required: false })
  @IsOptional()
  @IsString()
  subject?: string;

  @ApiProperty({ description: 'Текст сообщения' })
  @IsString()
  message: string;

  @ApiProperty({ description: 'Активен ли шаблон', required: false })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class UpdateNotificationTemplateDto {
  @ApiProperty({ description: 'Тема сообщения', required: false })
  @IsOptional()
  @IsString()
  subject?: string;

  @ApiProperty({ description: 'Текст сообщения', required: false })
  @IsOptional()
  @IsString()
  message?: string;

  @ApiProperty({ description: 'Активен ли шаблон', required: false })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
