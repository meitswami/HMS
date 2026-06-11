import {
  Injectable, UnauthorizedException, BadRequestException, Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { authenticator } from 'otplib';
import * as QRCode from 'qrcode';
import { v4 as uuidv4 } from 'uuid';
import { User } from '../../entities/user.entity';
import { RefreshToken } from '../../entities/refresh-token.entity';
import { CryptoUtil } from '../../common/utils/crypto.util';
import { AuditService } from '../audit/audit.service';
import { LoginDto, ChangePasswordDto } from './dto/auth.dto';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    @InjectRepository(User) private userRepo: Repository<User>,
    @InjectRepository(RefreshToken) private refreshRepo: Repository<RefreshToken>,
    private jwtService: JwtService,
    private config: ConfigService,
    private auditService: AuditService,
  ) {}

  async login(dto: LoginDto, ip: string, userAgent?: string) {
    const user = await this.userRepo.findOne({
      where: { email: dto.email, deletedAt: IsNull() },
      relations: ['role'],
    });

    if (!user || !user.isActive) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const roleSlug = user.role?.slug;
    if (['hotel_owner', 'hotel_manager', 'receptionist'].includes(roleSlug) && !user.isVerified) {
      throw new UnauthorizedException('Your hotel registration is pending approval. Please wait for administrator confirmation.');
    }

    if (user.lockedUntil && user.lockedUntil > new Date()) {
      throw new UnauthorizedException('Account temporarily locked. Try again later.');
    }

    const valid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!valid) {
      user.failedLoginCount += 1;
      if (user.failedLoginCount >= 5) {
        user.lockedUntil = new Date(Date.now() + 30 * 60 * 1000);
      }
      await this.userRepo.save(user);
      throw new UnauthorizedException('Invalid credentials');
    }

    if (user.mfaEnabled) {
      if (!dto.mfaCode) {
        return { requiresMfa: true, message: 'MFA code required' };
      }
      const secret = CryptoUtil.decrypt(user.mfaSecret!, this.config.get('ENCRYPTION_KEY')!);
      const validMfa = authenticator.verify({ token: dto.mfaCode, secret });
      if (!validMfa) {
        const backupValid = user.mfaBackupCodes?.includes(dto.mfaCode);
        if (!backupValid) throw new UnauthorizedException('Invalid MFA code');
      }
    }

    user.failedLoginCount = 0;
    user.lockedUntil = null as unknown as Date;
    user.lastLoginAt = new Date();
    user.lastLoginIp = ip;
    await this.userRepo.save(user);

    const tokens = await this.generateTokens(user);
    await this.auditService.log({
      userId: user.id,
      tenantId: user.tenantId,
      action: 'LOGIN',
      entityType: 'user',
      entityId: user.id,
      ipAddress: ip,
      userAgent,
    });

    return {
      ...tokens,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role.slug,
        mfaEnabled: user.mfaEnabled,
      },
    };
  }

  async refresh(refreshToken: string) {
    const hash = CryptoUtil.hash(refreshToken);
    const stored = await this.refreshRepo.findOne({
      where: { tokenHash: hash, revokedAt: IsNull() },
      relations: ['user', 'user.role'],
    });

    if (!stored || stored.expiresAt < new Date()) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    const user = stored.user;
    stored.revokedAt = new Date();
    await this.refreshRepo.save(stored);

    return this.generateTokens(user);
  }

  async logout(userId: string, refreshToken?: string) {
    if (refreshToken) {
      const hash = CryptoUtil.hash(refreshToken);
      await this.refreshRepo.update({ tokenHash: hash }, { revokedAt: new Date() });
    } else {
      await this.refreshRepo.update({ userId, revokedAt: IsNull() }, { revokedAt: new Date() });
    }
    await this.auditService.log({
      userId,
      action: 'LOGOUT',
      entityType: 'user',
      entityId: userId,
    });
    return { message: 'Logged out successfully' };
  }

  async setupMfa(userId: string) {
    const user = await this.userRepo.findOneBy({ id: userId });
    if (!user) throw new BadRequestException('User not found');

    const secret = authenticator.generateSecret();
    const encrypted = CryptoUtil.encrypt(secret, this.config.get('ENCRYPTION_KEY')!);
    const backupCodes = Array.from({ length: 8 }, () =>
      Math.random().toString(36).substring(2, 8).toUpperCase(),
    );

    user.mfaSecret = encrypted;
    user.mfaBackupCodes = backupCodes;
    await this.userRepo.save(user);

    const otpauth = authenticator.keyuri(user.email, this.config.get('MFA_ISSUER', 'HMS'), secret);
    const qrCodeUrl = await QRCode.toDataURL(otpauth);

    return { secret, qrCodeUrl, backupCodes };
  }

  async enableMfa(userId: string, code: string) {
    const user = await this.userRepo.findOneBy({ id: userId });
    if (!user?.mfaSecret) throw new BadRequestException('MFA not set up');

    const secret = CryptoUtil.decrypt(user.mfaSecret, this.config.get('ENCRYPTION_KEY')!);
    if (!authenticator.verify({ token: code, secret })) {
      throw new BadRequestException('Invalid MFA code');
    }

    user.mfaEnabled = true;
    await this.userRepo.save(user);
    return { message: 'MFA enabled successfully' };
  }

  async changePassword(userId: string, dto: ChangePasswordDto) {
    const user = await this.userRepo.findOneBy({ id: userId });
    if (!user) throw new BadRequestException('User not found');

    const valid = await bcrypt.compare(dto.currentPassword, user.passwordHash);
    if (!valid) throw new BadRequestException('Current password is incorrect');

    user.passwordHash = await bcrypt.hash(dto.newPassword, 12);
    user.passwordChangedAt = new Date();
    await this.userRepo.save(user);

    await this.refreshRepo.update({ userId, revokedAt: IsNull() }, { revokedAt: new Date() });
    return { message: 'Password changed successfully' };
  }

  private async generateTokens(user: User) {
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role?.slug,
      tenantId: user.tenantId,
    };

    const accessToken = this.jwtService.sign(payload);
    const refreshToken = uuidv4();
    const expiresIn = this.config.get('JWT_REFRESH_EXPIRES_IN', '7d');
    const days = parseInt(expiresIn) || 7;

    await this.refreshRepo.save({
      userId: user.id,
      tokenHash: CryptoUtil.hash(refreshToken),
      expiresAt: new Date(Date.now() + days * 24 * 60 * 60 * 1000),
    });

    return {
      accessToken,
      refreshToken,
      expiresIn: this.config.get('JWT_EXPIRES_IN', '15m'),
    };
  }
}
