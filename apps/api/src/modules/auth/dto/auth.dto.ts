import { IsEmail, IsString, MinLength, IsOptional, Length } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({ example: 'admin@hms.gov.in' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'Admin@123' })
  @IsString()
  @MinLength(8)
  password: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  deviceId?: string;

  @ApiPropertyOptional({ description: 'MFA TOTP code if MFA enabled' })
  @IsOptional()
  @IsString()
  @Length(6, 6)
  mfaCode?: string;
}

export class RefreshTokenDto {
  @ApiProperty()
  @IsString()
  refreshToken: string;
}

export class MfaSetupResponseDto {
  secret: string;
  qrCodeUrl: string;
  backupCodes: string[];
}

export class MfaVerifyDto {
  @ApiProperty()
  @IsString()
  @Length(6, 6)
  code: string;
}

export class ChangePasswordDto {
  @ApiProperty()
  @IsString()
  currentPassword: string;

  @ApiProperty()
  @IsString()
  @MinLength(8)
  newPassword: string;
}
