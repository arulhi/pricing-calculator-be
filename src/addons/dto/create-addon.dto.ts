import { IsString, IsNotEmpty, IsNumber, IsOptional } from 'class-validator'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'

export class CreateAddonDto {
  @ApiProperty({ example: 'text-to-speech' })
  @IsString()
  @IsNotEmpty()
  id: string

  @ApiProperty({ example: 'Text-to-Speech' })
  @IsString()
  @IsNotEmpty()
  name: string

  @ApiPropertyOptional({ example: 'AI voice output for translations' })
  @IsString()
  @IsOptional()
  desc?: string

  @ApiProperty({ example: 50 })
  @IsNumber()
  price: number

  @ApiPropertyOptional({ example: 'event' })
  @IsString()
  @IsOptional()
  unit?: string
}
