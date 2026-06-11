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

  @ApiPropertyOptional({ description: 'Aadhar Number — 12 digits, formatted as XXXX-XXXX-XXXX' })
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

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  email?: string;

  @ApiPropertyOptional({ enum: ['male', 'female', 'other', 'unknown'] })
  @IsOptional()
  @IsEnum(['male', 'female', 'other', 'unknown'])
  gender?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  nationality?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  policeStation?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  drivingLicense?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  voterId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  panNumber?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  sourceRef?: string;
}

export class ImportWatchlistDto {
  @ApiProperty({ description: 'URL of third-party API endpoint' })
  @IsString()
  apiUrl: string;

  @ApiPropertyOptional({ description: 'Bearer token or API key for the external service' })
  @IsOptional()
  @IsString()
  apiKey?: string;

  @ApiPropertyOptional({ enum: ['police', 'absconder', 'wanted', 'missing', 'terror', 'fraud', 'state', 'custom'] })
  @IsOptional()
  @IsEnum(['police', 'absconder', 'wanted', 'missing', 'terror', 'fraud', 'state', 'custom'])
  defaultSource?: string;
}
