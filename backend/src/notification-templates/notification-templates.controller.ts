import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  UseGuards,
  Request,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { NotificationTemplatesService } from './notification-templates.service';
import {
  CreateNotificationTemplateDto,
  UpdateNotificationTemplateDto,
} from './dto/notification-template.dto';

@Controller('api/v1/businesses/:businessId/notification-templates')
@UseGuards(AuthGuard('jwt'))
export class NotificationTemplatesController {
  constructor(
    private notificationTemplatesService: NotificationTemplatesService,
  ) {}

  @Get()
  async getTemplates(@Request() req, @Param('businessId') businessId: string) {
    return this.notificationTemplatesService.getTemplates(
      businessId,
      req.user.id,
    );
  }

  @Get('variables')
  async getAvailableVariables() {
    return this.notificationTemplatesService.getAvailableVariables();
  }

  @Get(':templateId')
  async getTemplate(@Request() req, @Param('templateId') templateId: string) {
    return this.notificationTemplatesService.getTemplate(
      templateId,
      req.user.id,
    );
  }

  @Post()
  async createTemplate(
    @Request() req,
    @Param('businessId') businessId: string,
    @Body() data: CreateNotificationTemplateDto,
  ) {
    return this.notificationTemplatesService.createTemplate(
      businessId,
      req.user.id,
      data,
    );
  }

  @Patch(':templateId')
  async updateTemplate(
    @Request() req,
    @Param('templateId') templateId: string,
    @Body() data: UpdateNotificationTemplateDto,
  ) {
    return this.notificationTemplatesService.updateTemplate(
      templateId,
      req.user.id,
      data,
    );
  }

  @Delete(':templateId')
  async deleteTemplate(
    @Request() req,
    @Param('templateId') templateId: string,
  ) {
    await this.notificationTemplatesService.deleteTemplate(
      templateId,
      req.user.id,
    );
    return { message: 'Шаблон удален' };
  }

  @Post(':templateId/process')
  async processTemplate(
    @Param('templateId') templateId: string,
    @Body() variables: { [key: string]: string },
  ) {
    return this.notificationTemplatesService.processTemplate(
      templateId,
      variables,
    );
  }
}
