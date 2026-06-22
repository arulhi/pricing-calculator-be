import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common'
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger'
import { ServiceTypesService } from './service-types.service'
import { CreateServiceTypeDto } from './dto/create-service-type.dto'
import { UpdateServiceTypeDto } from './dto/update-service-type.dto'
import { AuthGuard } from '../common/guards/auth.guard'

@ApiTags('Service Types')
@Controller('api/service-types')
export class ServiceTypesController {
  constructor(private service: ServiceTypesService) {}

  @Get()
  @ApiOperation({ summary: 'List all service types (public)' })
  findAll() {
    return this.service.findAll()
  }

  @Post()
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a service type (admin)' })
  create(@Body() dto: CreateServiceTypeDto) {
    return this.service.create(dto)
  }

  @Put(':id')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a service type (admin)' })
  update(@Param('id') id: string, @Body() dto: UpdateServiceTypeDto) {
    return this.service.update(id, dto)
  }

  @Delete(':id')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a service type (admin)' })
  remove(@Param('id') id: string) {
    return this.service.remove(id)
  }
}
