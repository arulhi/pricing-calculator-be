import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common'
import { SupabaseService } from '../../database/supabase.service'

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private supabase: SupabaseService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest()
    const authHeader = request.headers.authorization

    if (!authHeader) {
      throw new UnauthorizedException('Missing authorization header')
    }

    const [scheme, token] = authHeader.split(' ')
    if (scheme !== 'Bearer' || !token) {
      throw new UnauthorizedException('Invalid authorization format')
    }

    const authClient = this.supabase.createAuthClient()
    const { data, error } = await authClient.auth.getUser(token)

    if (error || !data.user) {
      throw new UnauthorizedException('Invalid or expired token')
    }

    request.user = data.user
    return true
  }
}
