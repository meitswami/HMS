import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Hotel } from '../../entities/hotel.entity';
import { CreateHotelDto, UpdateHotelDto } from './dto/hotel.dto';
import { AuditService } from '../audit/audit.service';

@Injectable()
export class HotelsService {
  constructor(
    @InjectRepository(Hotel) private hotelRepo: Repository<Hotel>,
    private auditService: AuditService,
  ) {}

  async create(dto: CreateHotelDto, tenantId: string, userId: string) {
    const hotel = this.hotelRepo.create({ ...dto, tenantId });
    const saved = await this.hotelRepo.save(hotel);
    await this.auditService.log({
      tenantId, userId, action: 'CREATE', entityType: 'hotel', entityId: saved.id,
      newValues: dto as unknown as Record<string, unknown>,
    });
    return saved;
  }

  async findAll(tenantId: string, page = 1, limit = 20) {
    const [data, total] = await this.hotelRepo.findAndCount({
      where: { tenantId, isActive: true },
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
    return { data, meta: { page, limit, total } };
  }

  async findOne(id: string) {
    const hotel = await this.hotelRepo.findOneBy({ id });
    if (!hotel) throw new NotFoundException('Hotel not found');
    return hotel;
  }

  async update(id: string, dto: UpdateHotelDto, userId: string) {
    const hotel = await this.findOne(id);
    Object.assign(hotel, dto);
    const saved = await this.hotelRepo.save(hotel);
    await this.auditService.log({
      tenantId: hotel.tenantId, userId, action: 'UPDATE', entityType: 'hotel', entityId: id,
      newValues: dto as unknown as Record<string, unknown>,
    });
    return saved;
  }

  async heartbeat(hotelId: string) {
    await this.hotelRepo.update(hotelId, { isOnline: true, lastHeartbeat: new Date() });
    return { status: 'online' };
  }

  async getOnlineCount(tenantId?: string) {
    const where: Record<string, unknown> = { isOnline: true, isActive: true };
    if (tenantId) where.tenantId = tenantId;
    return this.hotelRepo.count({ where });
  }
}
