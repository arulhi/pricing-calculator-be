import { IsString } from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'

export class LoginDto {
  @ApiProperty({ example: 'admin@spf.io', description: 'Email address used as username' })
  @IsString()
  username: string

  @ApiProperty({ example: 'securepassword' })
  @IsString()
  password: string
}
