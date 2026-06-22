import { Injectable, NotFoundException } from '@nestjs/common'
import { SupabaseService } from '../database/supabase.service'
import { CreateAddonDto } from './dto/create-addon.dto'
import { UpdateAddonDto } from './dto/update-addon.dto'

@Injectable()
export class AddonsService {
  constructor(private supabase: SupabaseService) {}

  async findAll() {
    const { data } = await this.supabase
      .getClient()
      .from('addons')
      .select('*')
      .order('created_at')
    return (data || []).map((row) => this.mapAddon(row))
  }

  async create(dto: CreateAddonDto) {
    const { data } = await this.supabase
      .getClient()
      .from('addons')
      .insert({
        id: dto.id,
        name: dto.name,
        description: dto.desc || '',
        price: dto.price,
        unit: dto.unit || 'event',
      })
      .select()
      .single()

    return this.mapAddon(data)
  }

  async update(id: string, dto: UpdateAddonDto) {
    const existing = await this.supabase
      .getClient()
      .from('addons')
      .select()
      .eq('id', id)
      .single()

    if (!existing.data) {
      throw new NotFoundException('Add-on not found')
    }

    const updateData: any = {}
    if (dto.name !== undefined) updateData.name = dto.name
    if (dto.desc !== undefined) updateData.description = dto.desc
    if (dto.price !== undefined) updateData.price = dto.price
    if (dto.unit !== undefined) updateData.unit = dto.unit
    updateData.updated_at = new Date().toISOString()

    const { data } = await this.supabase
      .getClient()
      .from('addons')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    return this.mapAddon(data)
  }

  async remove(id: string) {
    const existing = await this.supabase
      .getClient()
      .from('addons')
      .select()
      .eq('id', id)
      .single()

    if (!existing.data) {
      throw new NotFoundException('Add-on not found')
    }

    await this.supabase.getClient().from('addons').delete().eq('id', id)
  }

  private mapAddon(row: any) {
    if (!row) return null
    return {
      id: row.id,
      name: row.name,
      desc: row.description,
      price: row.price,
      unit: row.unit,
    }
  }
}
