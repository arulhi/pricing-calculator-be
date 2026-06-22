import { IsEmail, IsString, MinLength } from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'

export class RegisterDto {
  @ApiProperty({ example: 'admin@spf.io' })
  @IsEmail()
  email: string

  @ApiProperty({ example: 'securepassword', minLength: 6 })
  @IsString()
  @MinLength(6)
  password: string
}
