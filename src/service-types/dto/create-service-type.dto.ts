import { IsString, IsNotEmpty, IsNumber, IsOptional } from 'class-validator'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'

export class CreateServiceTypeDto {
  @ApiProperty({ example: 'live-events' })
  @IsString()
  @IsNotEmpty()
  id: string

  @ApiProperty({ example: 'Live Events' })
  @IsString()
  @IsNotEmpty()
  name: string

  @ApiPropertyOptional({ example: 'Real-time captions, translations & streaming' })
  @IsString()
  @IsOptional()
  desc?: string

  @ApiProperty({ example: 150 })
  @IsNumber()
  rate: number

  @ApiPropertyOptional({ example: 'hour' })
  @IsString()
  @IsOptional()
  unit?: string
}
