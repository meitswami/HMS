import { IsString, IsArray, IsDateString, IsOptional, ArrayMinSize } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateDataRequestDto {
  @ApiProperty({ type: [String] })
  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  hotelIds: string[];

  @ApiProperty()
  @IsDateString()
  dateFrom: string;

  @ApiProperty()
  @IsDateString()
  dateTo: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  timeFrom?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  timeTo?: string;

  @ApiProperty()
  @IsString()
  reason: string;
}

export class ReviewDataRequestDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  reviewNotes?: string;
}
