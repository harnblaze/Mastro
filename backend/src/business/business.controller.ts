import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { BusinessService } from './business.service';
import { CreateBusinessDto, UpdateBusinessDto } from './dto/business.dto';

@ApiTags('Business')
@ApiBearerAuth()
@Controller('api/v1/businesses')
@UseGuards(AuthGuard('jwt'))
export class BusinessController {
  constructor(private businessService: BusinessService) {}

  @ApiOperation({ summary: 'Создать бизнес' })
  @ApiResponse({ status: 201, description: 'Бизнес создан' })
  @ApiResponse({ status: 400, description: 'Неверные данные' })
  @Post()
  create(@Request() req, @Body() createBusinessDto: CreateBusinessDto) {
    return this.businessService.create(req.user.id, createBusinessDto);
  }

  @ApiOperation({ summary: 'Получить все бизнесы владельца' })
  @ApiResponse({ status: 200, description: 'Список бизнесов' })
  @Get()
  findAllByOwner(@Request() req) {
    return this.businessService.findAllByOwner(req.user.id);
  }

  @ApiOperation({ summary: 'Получить бизнес по ID' })
  @ApiParam({ name: 'id', description: 'ID бизнеса' })
  @ApiResponse({ status: 200, description: 'Бизнес найден' })
  @ApiResponse({ status: 404, description: 'Бизнес не найден' })
  @Get(':id')
  findOne(@Request() req, @Param('id') id: string) {
    return this.businessService.findOne(id, req.user.id);
  }

  @ApiOperation({ summary: 'Обновить бизнес' })
  @ApiParam({ name: 'id', description: 'ID бизнеса' })
  @ApiResponse({ status: 200, description: 'Бизнес обновлен' })
  @ApiResponse({ status: 404, description: 'Бизнес не найден' })
  @Patch(':id')
  update(
    @Request() req,
    @Param('id') id: string,
    @Body() updateBusinessDto: UpdateBusinessDto,
  ) {
    return this.businessService.update(id, req.user.id, updateBusinessDto);
  }
}
