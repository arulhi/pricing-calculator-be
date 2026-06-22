import { Injectable } from '@nestjs/common'
import { SupabaseService } from '../database/supabase.service'
import { CreateContactDto } from './dto/create-contact.dto'

@Injectable()
export class ContactService {
  constructor(private supabase: SupabaseService) {}

  async create(dto: CreateContactDto) {
    const { data } = await this.supabase
      .getClient()
      .from('contacts')
      .insert({
        first_name: dto.firstName,
        last_name: dto.lastName,
        email: dto.email,
        company: dto.company || '',
        service: dto.service || '',
        message: dto.message || '',
      })
      .select()
      .single()

    return data
  }
}
