import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Query,
  Body,
  UseGuards,
  Request,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AvailabilityService } from './availability.service';

@Controller('api/v1/businesses/:businessId/availability')
@UseGuards(AuthGuard('jwt'))
export class AvailabilityController {
  constructor(private availabilityService: AvailabilityService) {}

  @Get()
  async getAvailability(
    @Request() req,
    @Param('businessId') businessId: string,
    @Query('date') date: string,
    @Query('serviceId') serviceId?: string,
    @Query('staffId') staffId?: string,
  ) {
    return this.availabilityService.getBusinessAvailability(
      businessId,
      req.user.id,
      date,
      serviceId,
      staffId,
    );
  }

  @Get('exceptions')
  async getExceptions(
    @Request() req,
    @Param('businessId') businessId: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    return this.availabilityService.getAvailabilityExceptions(
      businessId,
      req.user.id,
      from,
      to,
    );
  }

  @Post('exceptions')
  async createException(
    @Request() req,
    @Param('businessId') businessId: string,
    @Body()
    data: {
      date: string;
      startTime?: string;
      endTime?: string;
      type: 'CLOSED' | 'OPEN_CUSTOM';
      reason?: string;
    },
  ) {
    return this.availabilityService.createAvailabilityException(
      businessId,
      req.user.id,
      data,
    );
  }

  @Delete('exceptions/:exceptionId')
  async deleteException(
    @Request() req,
    @Param('exceptionId') exceptionId: string,
  ) {
    return this.availabilityService.deleteAvailabilityException(
      exceptionId,
      req.user.id,
    );
  }
}
