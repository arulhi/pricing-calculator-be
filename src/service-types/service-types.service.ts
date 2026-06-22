import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common'
import { SupabaseService } from '../database/supabase.service'
import { CreateServiceTypeDto } from './dto/create-service-type.dto'
import { UpdateServiceTypeDto } from './dto/update-service-type.dto'

@Injectable()
export class ServiceTypesService {
  constructor(private supabase: SupabaseService) {}

  async findAll() {
    const { data } = await this.supabase
      .getClient()
      .from('service_types')
      .select('*')
      .order('created_at')
    return (data || []).map((row) => this.mapServiceType(row))
  }

  async create(dto: CreateServiceTypeDto) {
    const { data } = await this.supabase
      .getClient()
      .from('service_types')
      .insert({
        id: dto.id,
        name: dto.name,
        description: dto.desc || '',
        rate: dto.rate,
        unit: dto.unit || 'hour',
      })
      .select()
      .single()

    return this.mapServiceType(data)
  }

  async update(id: string, dto: UpdateServiceTypeDto) {
    const existing = await this.supabase
      .getClient()
      .from('service_types')
      .select()
      .eq('id', id)
      .single()

    if (!existing.data) {
      throw new NotFoundException('Service type not found')
    }

    const updateData: any = {}
    if (dto.id !== undefined && dto.id !== id) {
      // ensure new id doesn't already exist
      const check = await this.supabase.getClient().from('service_types').select().eq('id', dto.id).single()
      if (check.data) {
        throw new BadRequestException('Service type ID already exists')
      }
      updateData.id = dto.id
    }
    if (dto.name !== undefined) updateData.name = dto.name
    if (dto.desc !== undefined) updateData.description = dto.desc
    if (dto.rate !== undefined) updateData.rate = dto.rate
    if (dto.unit !== undefined) updateData.unit = dto.unit
    updateData.updated_at = new Date().toISOString()

    const { data } = await this.supabase
      .getClient()
      .from('service_types')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    return this.mapServiceType(data)
  }

  private mapServiceType(row: any) {
    if (!row) return null
    return {
      id: row.id,
      name: row.name,
      desc: row.description,
      rate: row.rate,
      unit: row.unit,
    }
  }

  async remove(id: string) {
    const existing = await this.supabase
      .getClient()
      .from('service_types')
      .select()
      .eq('id', id)
      .single()

    if (!existing.data) {
      throw new NotFoundException('Service type not found')
    }

    await this.supabase.getClient().from('service_types').delete().eq('id', id)
  }
}
