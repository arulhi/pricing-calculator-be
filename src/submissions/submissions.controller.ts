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
import { SubmissionsService } from './submissions.service'
import { CreateSubmissionDto, UpdateSubmissionDto } from './dto/create-submission.dto'
import { AuthGuard } from '../common/guards/auth.guard'

@ApiTags('Submissions')
@Controller('api/submissions')
export class SubmissionsController {
  constructor(private service: SubmissionsService) {}

  @Post()
  @ApiOperation({ summary: 'Submit a quote request (public)' })
  create(@Body() dto: CreateSubmissionDto) {
    return this.service.create(dto)
  }

  @Get()
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List all submissions (admin)' })
  findAll() {
    return this.service.findAll()
  }

  @Get(':id')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get a single submission (admin)' })
  findOne(@Param('id') id: string) {
    return this.service.findOne(id)
  }

  @Put(':id')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a submission (admin) — supports status change' })
  update(@Param('id') id: string, @Body() dto: UpdateSubmissionDto) {
    return this.service.update(id, dto)
  }

  @Delete(':id')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a submission (admin)' })
  remove(@Param('id') id: string) {
    return this.service.remove(id)
  }
}
