import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsBoolean,
  IsArray,
  IsOptional,
  ValidateNested,
  IsEmail,
  IsIn,
} from 'class-validator'
import { Type } from 'class-transformer'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'

const SUBMISSION_STATUSES = ['PENDING', 'APPROVE', 'PROCCESS', 'REJECT'] as const

class FormDataDto {
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

  @ApiPropertyOptional({ example: 'I need translation services for my conference' })
  @IsString()
  @IsOptional()
  message?: string
}

export class CreateSubmissionDto {
  @ApiProperty({ example: 'live-events' })
  @IsString()
  @IsNotEmpty()
  serviceType: string

  @ApiProperty({ example: 'Live Events' })
  @IsString()
  @IsNotEmpty()
  serviceName: string

  @ApiProperty({ example: 4 })
  @IsNumber()
  hours: number

  @ApiProperty({ example: 3 })
  @IsNumber()
  languages: number

  @ApiProperty({ example: 500 })
  @IsNumber()
  attendees: number

  @ApiPropertyOptional({ example: false })
  @IsBoolean()
  @IsOptional()
  premiumLanguages?: boolean

  @ApiPropertyOptional({ example: ['text-to-speech', 'polls'] })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  selectedAddons?: string[]

  @ApiProperty({ example: 2450 })
  @IsNumber()
  totalEstimate: number

  @ApiPropertyOptional({ enum: SUBMISSION_STATUSES, example: 'PENDING' })
  @IsString()
  @IsOptional()
  @IsIn(SUBMISSION_STATUSES)
  status?: string

  @ApiProperty({ type: FormDataDto })
  @ValidateNested()
  @Type(() => FormDataDto)
  @IsNotEmpty()
  formData: FormDataDto
}

export class UpdateSubmissionDto {
  @ApiPropertyOptional({ example: 'live-events' })
  @IsString()
  @IsOptional()
  serviceType?: string

  @ApiPropertyOptional({ example: 'Live Events' })
  @IsString()
  @IsOptional()
  serviceName?: string

  @ApiPropertyOptional({ example: 4 })
  @IsNumber()
  @IsOptional()
  hours?: number

  @ApiPropertyOptional({ example: 3 })
  @IsNumber()
  @IsOptional()
  languages?: number

  @ApiPropertyOptional({ example: 500 })
  @IsNumber()
  @IsOptional()
  attendees?: number

  @ApiPropertyOptional({ example: false })
  @IsBoolean()
  @IsOptional()
  premiumLanguages?: boolean

  @ApiPropertyOptional({ example: ['text-to-speech', 'polls'] })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  selectedAddons?: string[]

  @ApiPropertyOptional({ example: 2450 })
  @IsNumber()
  @IsOptional()
  totalEstimate?: number

  @ApiPropertyOptional({ enum: SUBMISSION_STATUSES, example: 'APPROVE' })
  @IsString()
  @IsOptional()
  @IsIn(SUBMISSION_STATUSES)
  status?: string

  @ApiPropertyOptional({ type: FormDataDto })
  @ValidateNested()
  @Type(() => FormDataDto)
  @IsOptional()
  formData?: FormDataDto
}
