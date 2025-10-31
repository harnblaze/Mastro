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
import { ClientsService } from './clients.service';
import { CreateClientDto, UpdateClientDto } from './dto/client.dto';

@Controller('api/v1/businesses/:businessId/clients')
@UseGuards(AuthGuard('jwt'))
export class ClientsController {
  constructor(private clientsService: ClientsService) {}

  @Post()
  create(
    @Request() req,
    @Param('businessId') businessId: string,
    @Body() createClientDto: CreateClientDto,
  ) {
    return this.clientsService.create(businessId, req.user.id, createClientDto);
  }

  @Get()
  findAll(@Request() req, @Param('businessId') businessId: string) {
    return this.clientsService.findAll(businessId, req.user.id);
  }

  @Get(':id')
  findOne(@Request() req, @Param('id') id: string) {
    return this.clientsService.findOne(id, req.user.id);
  }

  @Patch(':id')
  update(
    @Request() req,
    @Param('id') id: string,
    @Body() updateClientDto: UpdateClientDto,
  ) {
    return this.clientsService.update(id, req.user.id, updateClientDto);
  }

  @Delete(':id')
  remove(@Request() req, @Param('id') id: string) {
    return this.clientsService.remove(id, req.user.id);
  }
}
