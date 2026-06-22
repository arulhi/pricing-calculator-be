import { Controller, Post, Body } from '@nestjs/common'
import { ApiTags, ApiOperation } from '@nestjs/swagger'
import { ContactService } from './contact.service'
import { CreateContactDto } from './dto/create-contact.dto'

@ApiTags('Contact')
@Controller('api/contact')
export class ContactController {
  constructor(private service: ContactService) {}

  @Post()
  @ApiOperation({ summary: 'Submit the request-a-quote form' })
  create(@Body() dto: CreateContactDto) {
    return this.service.create(dto)
  }
}
