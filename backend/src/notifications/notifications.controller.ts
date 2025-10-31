import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { NotificationsService } from './notifications.service';
import {
  CreateNotificationDto,
  NotificationQueryDto,
} from './dto/notification.dto';

@Controller('api/v1/businesses/:businessId/notifications')
@UseGuards(AuthGuard('jwt'))
export class NotificationsController {
  constructor(private notificationsService: NotificationsService) {}

  @Post()
  create(
    @Request() req,
    @Param('businessId') businessId: string,
    @Body() createNotificationDto: CreateNotificationDto,
  ) {
    return this.notificationsService.create(
      businessId,
      req.user.id,
      createNotificationDto,
    );
  }

  @Get()
  findAll(
    @Request() req,
    @Param('businessId') businessId: string,
    @Query() query: NotificationQueryDto,
  ) {
    return this.notificationsService.findAll(businessId, req.user.id, query);
  }

  @Get(':id')
  findOne(@Request() req, @Param('id') id: string) {
    return this.notificationsService.findOne(id, req.user.id);
  }

  @Post(':id/resend')
  resend(@Request() req, @Param('id') id: string) {
    return this.notificationsService.resend(id, req.user.id);
  }
}
