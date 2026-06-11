import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, In } from 'typeorm';
import { DataAccessRequest } from '../../entities/data-access-request.entity';
import { Guest } from '../../entities/guest.entity';
import { CreateDataRequestDto } from './dto/data-request.dto';
import { AuditService } from '../audit/audit.service';

@Injectable()
export class DataRequestsService {
  constructor(
    @InjectRepository(DataAccessRequest) private requestRepo: Repository<DataAccessRequest>,
    @InjectRepository(Guest) private guestRepo: Repository<Guest>,
    private auditService: AuditService,
  ) {}

  async create(dto: CreateDataRequestDto, userId: string, tenantId: string) {
    const request = this.requestRepo.create({
      ...dto,
      requestedBy: userId,
      tenantId,
      status: 'pending',
    });
    const saved = await this.requestRepo.save(request);
    await this.auditService.log({
      tenantId, userId, action: 'CREATE', entityType: 'data_access_request', entityId: saved.id,
    });
    return saved;
  }

  async findAll(tenantId: string, status?: string, page = 1, limit = 20) {
    const where: Record<string, unknown> = { tenantId };
    if (status) where.status = status;

    const [data, total] = await this.requestRepo.findAndCount({
      where,
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
    return { data, meta: { page, limit, total } };
  }

  async findMyRequests(userId: string, page = 1, limit = 20) {
    const [data, total] = await this.requestRepo.findAndCount({
      where: { requestedBy: userId },
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
    return { data, meta: { page, limit, total } };
  }

  async approve(id: string, userId: string, reviewNotes?: string) {
    const request = await this.findOne(id);
    if (request.status !== 'pending') throw new BadRequestException('Request already reviewed');

    request.status = 'approved';
    request.reviewedBy = userId;
    request.reviewedAt = new Date();
    request.reviewNotes = reviewNotes || null as unknown as string;
    return this.requestRepo.save(request);
  }

  async reject(id: string, userId: string, reviewNotes?: string) {
    const request = await this.findOne(id);
    if (request.status !== 'pending') throw new BadRequestException('Request already reviewed');

    request.status = 'rejected';
    request.reviewedBy = userId;
    request.reviewedAt = new Date();
    request.reviewNotes = reviewNotes || null as unknown as string;
    return this.requestRepo.save(request);
  }

  async getApprovedGuestData(requestId: string, userId: string, userRole: string) {
    const request = await this.findOne(requestId);

    const isAdmin = ['super_admin', 'police_command'].includes(userRole);
    if (!isAdmin && request.requestedBy !== userId) {
      throw new ForbiddenException('Not authorized to access this data');
    }
    if (request.status !== 'approved') {
      throw new ForbiddenException('Data access not approved for this request');
    }

    const guests = await this.guestRepo.find({
      where: {
        hotelId: In(request.hotelIds),
        checkInDate: Between(new Date(request.dateFrom), new Date(request.dateTo)),
      },
      order: { checkInDate: 'DESC', checkInTime: 'DESC' },
    });

    let filtered = guests;
    if (request.timeFrom && request.timeTo) {
      filtered = guests.filter((g) => {
        const t = g.checkInTime as unknown as string;
        return t >= request.timeFrom && t <= request.timeTo;
      });
    }

    return { request, guests: filtered, count: filtered.length };
  }

  async findOne(id: string) {
    const request = await this.requestRepo.findOneBy({ id });
    if (!request) throw new NotFoundException('Data access request not found');
    return request;
  }
}
