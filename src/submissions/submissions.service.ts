import { Injectable, NotFoundException } from '@nestjs/common'
import { SupabaseService } from '../database/supabase.service'
import { CreateSubmissionDto, UpdateSubmissionDto } from './dto/create-submission.dto'

@Injectable()
export class SubmissionsService {
  constructor(private supabase: SupabaseService) {}

  async create(dto: CreateSubmissionDto) {
    const { data } = await this.supabase
      .getClient()
      .from('submissions')
      .insert({
        service_type: dto.serviceType,
        service_name: dto.serviceName,
        hours: dto.hours,
        languages: dto.languages,
        attendees: dto.attendees,
        premium_languages: dto.premiumLanguages ?? false,
        selected_addons: dto.selectedAddons ?? [],
        total_estimate: dto.totalEstimate,
        status: dto.status ?? 'PENDING',
        first_name: dto.formData.firstName,
        last_name: dto.formData.lastName,
        email: dto.formData.email,
        company: dto.formData.company ?? '',
        message: dto.formData.message ?? '',
      })
      .select()
      .single()

    return this.mapSubmission(data)
  }

  async findAll() {
    const { data } = await this.supabase
      .getClient()
      .from('submissions')
      .select('*')
      .order('created_at', { ascending: false })

    return (data || []).map((row) => this.mapSubmission(row))
  }

  async findOne(id: string) {
    const { data } = await this.supabase
      .getClient()
      .from('submissions')
      .select()
      .eq('id', id)
      .single()

    if (!data) {
      throw new NotFoundException('Submission not found')
    }

    return this.mapSubmission(data)
  }

  async update(id: string, dto: UpdateSubmissionDto) {
    const existing = await this.supabase
      .getClient()
      .from('submissions')
      .select()
      .eq('id', id)
      .single()

    if (!existing.data) {
      throw new NotFoundException('Submission not found')
    }

    const updateData: any = {}
    if (dto.serviceType !== undefined) updateData.service_type = dto.serviceType
    if (dto.serviceName !== undefined) updateData.service_name = dto.serviceName
    if (dto.hours !== undefined) updateData.hours = dto.hours
    if (dto.languages !== undefined) updateData.languages = dto.languages
    if (dto.attendees !== undefined) updateData.attendees = dto.attendees
    if (dto.premiumLanguages !== undefined) updateData.premium_languages = dto.premiumLanguages
    if (dto.selectedAddons !== undefined) updateData.selected_addons = dto.selectedAddons
    if (dto.totalEstimate !== undefined) updateData.total_estimate = dto.totalEstimate
    if (dto.status !== undefined) updateData.status = dto.status
    if (dto.formData !== undefined) {
      if (dto.formData.firstName !== undefined) updateData.first_name = dto.formData.firstName
      if (dto.formData.lastName !== undefined) updateData.last_name = dto.formData.lastName
      if (dto.formData.email !== undefined) updateData.email = dto.formData.email
      if (dto.formData.company !== undefined) updateData.company = dto.formData.company
      if (dto.formData.message !== undefined) updateData.message = dto.formData.message
    }

    const { data } = await this.supabase
      .getClient()
      .from('submissions')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    return this.mapSubmission(data)
  }

  async remove(id: string) {
    const existing = await this.supabase
      .getClient()
      .from('submissions')
      .select()
      .eq('id', id)
      .single()

    if (!existing.data) {
      throw new NotFoundException('Submission not found')
    }

    await this.supabase.getClient().from('submissions').delete().eq('id', id)
  }

  private mapSubmission(row: any) {
    if (!row) return null
    return {
      id: row.id,
      timestamp: new Date(row.created_at).getTime(),
      serviceType: row.service_type,
      serviceName: row.service_name,
      hours: row.hours,
      languages: row.languages,
      attendees: row.attendees,
      premiumLanguages: row.premium_languages,
      selectedAddons: row.selected_addons || [],
      totalEstimate: row.total_estimate,
      status: row.status || 'PENDING',
      formData: {
        firstName: row.first_name,
        lastName: row.last_name,
        email: row.email,
        company: row.company || '',
        message: row.message || '',
      },
    }
  }
}
