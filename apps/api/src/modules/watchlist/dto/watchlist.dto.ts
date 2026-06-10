import { IsString, IsOptional, IsEnum, IsDateString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateWatchlistDto {
  @ApiProperty({ enum: ['police', 'absconder', 'wanted', 'missing', 'terror', 'fraud', 'state', 'custom'] })
  @IsEnum(['police', 'absconder', 'wanted', 'missing', 'terror', 'fraud', 'state', 'custom'])
  source: string;

  @ApiProperty()
  @IsString()
  fullName: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  fatherName?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  dateOfBirth?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  aadhaarNumber?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  passportNumber?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  mobileNumber?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  crimeType?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  firNumber?: string;

  @ApiPropertyOptional({ enum: ['critical', 'high', 'medium', 'low'] })
  @IsOptional()
  @IsEnum(['critical', 'high', 'medium', 'low'])
  severity?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;
}
