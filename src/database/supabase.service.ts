import { Injectable, OnModuleInit, Logger } from '@nestjs/common'
import { createClient, SupabaseClient } from '@supabase/supabase-js'
import { createMockClient } from './mock-supabase'

let mockClient: SupabaseClient | null = null

function getMockClient() {
  if (!mockClient) {
    mockClient = createMockClient() as unknown as SupabaseClient
  }
  return mockClient
}

@Injectable()
export class SupabaseService implements OnModuleInit {
  private client: SupabaseClient
  private readonly logger = new Logger(SupabaseService.name)

  onModuleInit() {
    const supabaseUrl = process.env.SUPABASE_URL
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (supabaseUrl && serviceRoleKey) {
      this.client = createClient(supabaseUrl, serviceRoleKey) as SupabaseClient
    } else {
      this.logger.warn('SUPABASE_URL not set — using in-memory mock (local dev only)')
      this.client = getMockClient()
    }
  }

  getClient(): SupabaseClient {
    return this.client
  }

  createAuthClient(): SupabaseClient {
    const supabaseUrl = process.env.SUPABASE_URL
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    if (supabaseUrl && serviceRoleKey) {
      return createClient(supabaseUrl, serviceRoleKey) as SupabaseClient
    }
    return getMockClient()
  }
}
