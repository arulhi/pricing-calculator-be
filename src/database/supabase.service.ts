import { Injectable, OnModuleInit, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { createClient, SupabaseClient } from '@supabase/supabase-js'
import { createMockClient } from './mock-supabase'

@Injectable()
export class SupabaseService implements OnModuleInit {
  private client: SupabaseClient
  private readonly logger = new Logger(SupabaseService.name)

  constructor(private config: ConfigService) {}

  onModuleInit() {
    const supabaseUrl = this.config.get<string>('SUPABASE_URL')
    const serviceRoleKey = this.config.get<string>('SUPABASE_SERVICE_ROLE_KEY')

    if (supabaseUrl && serviceRoleKey) {
      this.logger.log('Connecting to Supabase...')
      this.client = createClient(supabaseUrl, serviceRoleKey) as SupabaseClient
    } else {
      this.logger.warn('SUPABASE_URL not set — using in-memory mock (local dev only)')
      this.client = createMockClient() as unknown as SupabaseClient
    }
  }

  getClient(): SupabaseClient {
    return this.client
  }
}
