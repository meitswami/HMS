import {
  Injectable, NotFoundException, ConflictException, BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { ConfigService } from '@nestjs/config';
import { Hotel } from '../../entities/hotel.entity';
import { User } from '../../entities/user.entity';
import { Role } from '../../entities/role.entity';
import { CreateHotelDto, UpdateHotelDto, RegisterHotelDto } from './dto/hotel.dto';
import { AuditService } from '../audit/audit.service';

@Injectable()
export class HotelsService {
  constructor(
    @InjectRepository(Hotel) private hotelRepo: Repository<Hotel>,
    @InjectRepository(User) private userRepo: Repository<User>,
    @InjectRepository(Role) private roleRepo: Repository<Role>,
    private auditService: AuditService,
    private config: ConfigService,
  ) {}

  async register(dto: RegisterHotelDto) {
    const existingUser = await this.userRepo.findOneBy({ email: dto.ownerEmail });
    if (existingUser) throw new ConflictException('Email already registered');

    const existingLicense = await this.hotelRepo.findOneBy({ licenseNumber: dto.licenseNumber });
    if (existingLicense) throw new ConflictException('License number already registered');

    const tenantId = this.config.get('DEFAULT_TENANT_ID', '00000000-0000-0000-0000-000000000001');
    const ownerRole = await this.roleRepo.findOneBy({ slug: 'hotel_owner' });
    if (!ownerRole) throw new BadRequestException('Hotel owner role not configured');

    const { ownerFirstName, ownerLastName, ownerEmail, ownerPassword, ownerPhone, starRating, ...hotelFields } = dto;

    const hotel = this.hotelRepo.create({
      ...hotelFields,
      tenantId,
      starRating,
      isActive: false,
      registrationStatus: 'pending',
    });
    const savedHotel = await this.hotelRepo.save(hotel);

    const owner = this.userRepo.create({
      tenantId,
      roleId: ownerRole.id,
      email: ownerEmail,
      passwordHash: await bcrypt.hash(ownerPassword, 12),
      firstName: ownerFirstName,
      lastName: ownerLastName,
      phone: ownerPhone,
      isActive: false,
      isVerified: false,
    });
    const savedOwner = await this.userRepo.save(owner);

    savedHotel.registeredByUserId = savedOwner.id;
    await this.hotelRepo.save(savedHotel);

    return {
      message: 'Registration submitted successfully. You will receive access once approved by the administrator.',
      hotelId: savedHotel.id,
      status: 'pending',
    };
  }

  async create(dto: CreateHotelDto, tenantId: string, userId: string) {
    const hotel = this.hotelRepo.create({
      ...dto,
      tenantId,
      registrationStatus: 'approved',
      isActive: true,
    });
    const saved = await this.hotelRepo.save(hotel);
    await this.auditService.log({
      tenantId, userId, action: 'CREATE', entityType: 'hotel', entityId: saved.id,
      newValues: dto as unknown as Record<string, unknown>,
    });
    return saved;
  }

  async findPending(tenantId?: string, page = 1, limit = 20) {
    const where: Record<string, unknown> = { registrationStatus: 'pending' };
    if (tenantId) where.tenantId = tenantId;

    const [data, total] = await this.hotelRepo.findAndCount({
      where,
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
    return { data, meta: { page, limit, total } };
  }

  async findAll(tenantId: string, page = 1, limit = 20, includeInactive = false) {
    const where: Record<string, unknown> = { tenantId };
    if (!includeInactive) {
      where.isActive = true;
      where.registrationStatus = 'approved';
    }

    const [data, total] = await this.hotelRepo.findAndCount({
      where,
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
    return { data, meta: { page, limit, total } };
  }

  async findAllAdmin(page = 1, limit = 50) {
    const [data, total] = await this.hotelRepo.findAndCount({
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

  async approve(id: string, userId: string) {
    const hotel = await this.findOne(id);
    if (hotel.registrationStatus !== 'pending') {
      throw new BadRequestException('Hotel is not pending approval');
    }

    hotel.registrationStatus = 'approved';
    hotel.isActive = true;
    hotel.approvedBy = userId;
    hotel.approvedAt = new Date();
    hotel.rejectionReason = null as unknown as string;
    await this.hotelRepo.save(hotel);

    if (hotel.registeredByUserId) {
      await this.userRepo.update(hotel.registeredByUserId, {
        isActive: true,
        isVerified: true,
      });
    }

    await this.auditService.log({
      tenantId: hotel.tenantId,
      userId,
      action: 'APPROVE',
      entityType: 'hotel',
      entityId: id,
    });

    return { message: 'Hotel approved successfully', hotel };
  }

  async reject(id: string, userId: string, reason: string) {
    const hotel = await this.findOne(id);
    if (hotel.registrationStatus !== 'pending') {
      throw new BadRequestException('Hotel is not pending approval');
    }

    hotel.registrationStatus = 'rejected';
    hotel.isActive = false;
    hotel.rejectionReason = reason;
    await this.hotelRepo.save(hotel);

    await this.auditService.log({
      tenantId: hotel.tenantId,
      userId,
      action: 'REJECT',
      entityType: 'hotel',
      entityId: id,
      newValues: { reason },
    });

    return { message: 'Hotel registration rejected', hotel };
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
    const where: Record<string, unknown> = { isOnline: true, isActive: true, registrationStatus: 'approved' };
    if (tenantId) where.tenantId = tenantId;
    return this.hotelRepo.count({ where });
  }
}
