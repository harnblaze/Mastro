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
import { StaffService } from './staff.service';
import { CreateStaffDto, UpdateStaffDto } from './dto/staff.dto';

@Controller('api/v1/businesses/:businessId/staff')
@UseGuards(AuthGuard('jwt'))
export class StaffController {
  constructor(private staffService: StaffService) {}

  @Post()
  create(
    @Request() req,
    @Param('businessId') businessId: string,
    @Body() createStaffDto: CreateStaffDto,
  ) {
    return this.staffService.create(businessId, req.user.id, createStaffDto);
  }

  @Get()
  findAll(@Request() req, @Param('businessId') businessId: string) {
    return this.staffService.findAll(businessId, req.user.id);
  }

  @Get(':id')
  findOne(@Request() req, @Param('id') id: string) {
    return this.staffService.findOne(id, req.user.id);
  }

  @Patch(':id')
  update(
    @Request() req,
    @Param('id') id: string,
    @Body() updateStaffDto: UpdateStaffDto,
  ) {
    return this.staffService.update(id, req.user.id, updateStaffDto);
  }

  @Delete(':id')
  remove(@Request() req, @Param('id') id: string) {
    return this.staffService.remove(id, req.user.id);
  }
}
