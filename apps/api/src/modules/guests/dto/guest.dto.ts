import {
  IsString, IsOptional, IsEmail, IsEnum, IsDateString, IsBoolean, IsNumber, ValidateNested, IsArray,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class VehicleDto {
  @ApiProperty()
  @IsString()
  vehicleNumber: string;

  @ApiPropertyOptional({ enum: ['car', 'bike', 'truck', 'bus', 'other'] })
  @IsOptional()
  @IsEnum(['car', 'bike', 'truck', 'bus', 'other'])
  vehicleType?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  make?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  color?: string;
}

export class CreateGuestDto {
  @ApiProperty()
  @IsString()
  hotelId: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  branchId?: string;

  @ApiProperty()
  @IsString()
  fullName: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  fatherName?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  motherName?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  dateOfBirth?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  age?: number;

  @ApiPropertyOptional({ enum: ['male', 'female', 'other', 'unknown'] })
  @IsOptional()
  @IsEnum(['male', 'female', 'other', 'unknown'])
  gender?: string;

  @ApiPropertyOptional({ default: 'Indian' })
  @IsOptional()
  @IsString()
  nationality?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  mobileNumber?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  permanentAddress?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  temporaryAddress?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  city?: string;

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
  roomNumber?: string;

  @ApiProperty()
  @IsDateString()
  checkInDate: string;

  @ApiProperty()
  @IsString()
  checkInTime: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  purposeOfVisit?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isForeignNational?: boolean;

  @ApiPropertyOptional({ type: [VehicleDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => VehicleDto)
  vehicles?: VehicleDto[];

  @ApiPropertyOptional({ description: 'Raw Aadhaar QR XML/JSON for verification' })
  @IsOptional()
  aadhaarQrData?: Record<string, unknown>;
}

export class CheckoutGuestDto {
  @ApiProperty()
  @IsDateString()
  checkOutDate: string;

  @ApiProperty()
  @IsString()
  checkOutTime: string;
}

export class GuestQueryDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  hotelId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  status?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  page?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  limit?: number;
}

export class UpdateGuestDto extends PartialType(CreateGuestDto) {}
