import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ServicesService } from './services.service';
import { CreateServiceDto, UpdateServiceDto } from './dto/service.dto';

@Controller('api/v1/businesses/:businessId/services')
@UseGuards(AuthGuard('jwt'))
export class ServicesController {
  constructor(private servicesService: ServicesService) {}

  @Post()
  create(
    @Request() req,
    @Param('businessId') businessId: string,
    @Body() createServiceDto: CreateServiceDto,
  ) {
    return this.servicesService.create(
      businessId,
      req.user.id,
      createServiceDto,
    );
  }

  @Get()
  findAll(@Request() req, @Param('businessId') businessId: string) {
    return this.servicesService.findAll(businessId, req.user.id);
  }

  @Get(':id')
  findOne(@Request() req, @Param('id') id: string) {
    return this.servicesService.findOne(id, req.user.id);
  }

  @Patch(':id')
  update(
    @Request() req,
    @Param('id') id: string,
    @Body() updateServiceDto: UpdateServiceDto,
  ) {
    return this.servicesService.update(id, req.user.id, updateServiceDto);
  }

  @Delete(':id')
  remove(@Request() req, @Param('id') id: string) {
    return this.servicesService.remove(id, req.user.id);
  }
}
