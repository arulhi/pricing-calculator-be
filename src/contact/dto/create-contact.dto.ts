import { IsString, IsNotEmpty, IsEmail, IsOptional } from 'class-validator'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'

export class CreateContactDto {
  @ApiProperty({ example: 'John' })
  @IsString()
  @IsNotEmpty()
  firstName: string

  @ApiProperty({ example: 'Doe' })
  @IsString()
  @IsNotEmpty()
  lastName: string

  @ApiProperty({ example: 'john@company.com' })
  @IsEmail()
  @IsNotEmpty()
  email: string

  @ApiPropertyOptional({ example: 'Acme Inc' })
  @IsString()
  @IsOptional()
  company?: string

  @ApiPropertyOptional({ example: 'live-events' })
  @IsString()
  @IsOptional()
  service?: string

  @ApiPropertyOptional({ example: 'I am interested in live translation services...' })
  @IsString()
  @IsOptional()
  message?: string
}
