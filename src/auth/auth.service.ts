import {
  Injectable,
  ConflictException,
  UnauthorizedException,
} from '@nestjs/common'
import { SupabaseService } from '../database/supabase.service'
import { RegisterDto } from './dto/register.dto'
import { LoginDto } from './dto/login.dto'

@Injectable()
export class AuthService {
  constructor(private supabase: SupabaseService) {}

  async register(dto: RegisterDto) {
    const authSb = this.supabase.createAuthClient()
    const sb = this.supabase.getClient()

    const { data, error } = await authSb.auth.admin.createUser({
      email: dto.email,
      password: dto.password,
    })

    if (error) {
      if (error.message.includes('already')) {
        throw new ConflictException('User already exists')
      }
      throw error
    }

    await sb.from('admin_users').insert({
      id: data.user.id,
      email: dto.email,
    })

    return { id: data.user.id, email: data.user.email }
  }

  async login(dto: LoginDto) {
    const authSb = this.supabase.createAuthClient()

    const { data, error } = await authSb.auth.signInWithPassword({
      email: dto.username,
      password: dto.password,
    })

    if (error || !data.session) {
      throw new UnauthorizedException('Invalid credentials')
    }

    return { token: data.session.access_token }
  }

  async getMe(token: string) {
    const authSb = this.supabase.createAuthClient()

    const { data, error } = await authSb.auth.getUser(token)

    if (error || !data.user) {
      throw new UnauthorizedException('Invalid token')
    }

    return {
      id: data.user.id,
      email: data.user.email,
    }
  }
}
