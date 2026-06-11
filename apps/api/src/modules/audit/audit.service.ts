import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuditLog } from '../../entities/audit-log.entity';
import { getPagination } from '../../common/utils/pagination.util';
import { CryptoUtil } from '../../common/utils/crypto.util';

export interface AuditLogInput {
  tenantId?: string;
  userId?: string;
  action: string;
  entityType: string;
  entityId?: string;
  oldValues?: Record<string, unknown>;
  newValues?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
  deviceId?: string;
  requestId?: string;
}

@Injectable()
export class AuditService {
  private lastChecksum: string | null = null;

  constructor(
    @InjectRepository(AuditLog) private auditRepo: Repository<AuditLog>,
  ) {}

  async log(input: AuditLogInput): Promise<AuditLog> {
    const payload = JSON.stringify({
      action: input.action,
      entityType: input.entityType,
      entityId: input.entityId,
      userId: input.userId,
      timestamp: new Date().toISOString(),
    });

    const checksum = CryptoUtil.auditChecksum(payload, this.lastChecksum || undefined);
    this.lastChecksum = checksum;

    const entry = this.auditRepo.create({
      ...input,
      checksum,
      previousChecksum: this.lastChecksum,
    });

    return this.auditRepo.save(entry);
  }

  async findAll(filters: {
    tenantId?: string;
    userId?: string;
    action?: string;
    entityType?: string;
    page?: number;
    limit?: number;
  }) {
    const { page, limit, ...where } = filters;
    const { page: safePage, limit: safeLimit, skip } = getPagination(page, limit, 50);
    const [data, total] = await this.auditRepo.findAndCount({
      where,
      order: { createdAt: 'DESC' },
      skip,
      take: safeLimit,
    });
    return { data, meta: { page: safePage, limit: safeLimit, total } };
  }
}
