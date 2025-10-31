import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { BookingsService } from './bookings.service';
import {
  CreateBookingDto,
  UpdateBookingDto,
  BookingQueryDto,
} from './dto/booking.dto';

@Controller('api/v1/businesses/:businessId/bookings')
@UseGuards(AuthGuard('jwt'))
export class BookingsController {
  constructor(private bookingsService: BookingsService) {}

  @Post()
  create(
    @Request() req,
    @Param('businessId') businessId: string,
    @Body() createBookingDto: CreateBookingDto,
  ) {
    return this.bookingsService.create(
      businessId,
      req.user.id,
      createBookingDto,
    );
  }

  @Get()
  findAll(
    @Request() req,
    @Param('businessId') businessId: string,
    @Query() query: BookingQueryDto,
  ) {
    return this.bookingsService.findAll(businessId, req.user.id, query);
  }

  @Get('available-slots')
  getAvailableSlots(
    @Request() req,
    @Param('businessId') businessId: string,
    @Query('serviceId') serviceId: string,
    @Query('staffId') staffId: string,
    @Query('date') date: string,
  ) {
    return this.bookingsService.getAvailableSlots(
      businessId,
      req.user.id,
      serviceId,
      staffId,
      date,
    );
  }

  @Get(':id')
  findOne(@Request() req, @Param('id') id: string) {
    return this.bookingsService.findOne(id, req.user.id);
  }

  @Patch(':id')
  update(
    @Request() req,
    @Param('id') id: string,
    @Body() updateBookingDto: UpdateBookingDto,
  ) {
    return this.bookingsService.update(id, req.user.id, updateBookingDto);
  }

  @Delete(':id')
  remove(@Request() req, @Param('id') id: string) {
    return this.bookingsService.remove(id, req.user.id);
  }
}
