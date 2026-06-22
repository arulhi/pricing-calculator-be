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
import { AddonsService } from './addons.service'
import { CreateAddonDto } from './dto/create-addon.dto'
import { UpdateAddonDto } from './dto/update-addon.dto'
import { AuthGuard } from '../common/guards/auth.guard'

@ApiTags('Add-ons')
@Controller('api/addons')
export class AddonsController {
  constructor(private service: AddonsService) {}

  @Get()
  @ApiOperation({ summary: 'List all add-ons (public)' })
  findAll() {
    return this.service.findAll()
  }

  @Post()
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create an add-on (admin)' })
  create(@Body() dto: CreateAddonDto) {
    return this.service.create(dto)
  }

  @Put(':id')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update an add-on (admin)' })
  update(@Param('id') id: string, @Body() dto: UpdateAddonDto) {
    return this.service.update(id, dto)
  }

  @Delete(':id')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete an add-on (admin)' })
  remove(@Param('id') id: string) {
    return this.service.remove(id)
  }
}
