import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { Guest } from '../../entities/guest.entity';
import { Vehicle } from '../../entities/vehicle.entity';
import { CryptoUtil } from '../../common/utils/crypto.util';
import { WatchlistService } from '../watchlist/watchlist.service';
import { IncidentsService } from '../incidents/incidents.service';
import { WebsocketGateway } from '../websocket/websocket.gateway';
import { AuditService } from '../audit/audit.service';
import { CreateGuestDto, CheckoutGuestDto, GuestQueryDto } from './dto/guest.dto';
import { WS_EVENTS } from '@hms/shared';

@Injectable()
export class GuestsService {
  private readonly logger = new Logger(GuestsService.name);

  constructor(
    @InjectRepository(Guest) private guestRepo: Repository<Guest>,
    @InjectRepository(Vehicle) private vehicleRepo: Repository<Vehicle>,
    private config: ConfigService,
    private watchlistService: WatchlistService,
    private incidentsService: IncidentsService,
    private wsGateway: WebsocketGateway,
    private auditService: AuditService,
  ) {}

  async register(dto: CreateGuestDto, tenantId: string, userId: string) {
    const encKey = this.config.get('ENCRYPTION_KEY')!;

    const guest = this.guestRepo.create({
      tenantId,
      hotelId: dto.hotelId,
      branchId: dto.branchId,
      fullName: dto.fullName,
      fatherName: dto.fatherName,
      motherName: dto.motherName,
      dateOfBirth: dto.dateOfBirth ? new Date(dto.dateOfBirth) : undefined,
      age: dto.age,
      gender: dto.gender || 'unknown',
      nationality: dto.nationality || 'Indian',
      mobileNumber: dto.mobileNumber,
      email: dto.email,
      permanentAddress: dto.permanentAddress,
      temporaryAddress: dto.temporaryAddress,
      city: dto.city,
      roomNumber: dto.roomNumber,
      checkInDate: new Date(dto.checkInDate),
      checkInTime: dto.checkInTime,
      purposeOfVisit: dto.purposeOfVisit,
      isForeignNational: dto.isForeignNational || false,
      registeredBy: userId,
      aadhaarNumber: dto.aadhaarNumber ? CryptoUtil.encrypt(CryptoUtil.normalizeAadhaar(dto.aadhaarNumber), encKey) : undefined,
      aadhaarHash: dto.aadhaarNumber ? CryptoUtil.hash(CryptoUtil.normalizeAadhaar(dto.aadhaarNumber)) : undefined,
      passportNumber: dto.passportNumber ? CryptoUtil.encrypt(dto.passportNumber, encKey) : undefined,
      passportHash: dto.passportNumber ? CryptoUtil.hash(dto.passportNumber) : undefined,
      drivingLicense: dto.drivingLicense ? CryptoUtil.encrypt(dto.drivingLicense, encKey) : undefined,
      voterId: dto.voterId ? CryptoUtil.encrypt(dto.voterId, encKey) : undefined,
      panNumber: dto.panNumber ? CryptoUtil.encrypt(dto.panNumber, encKey) : undefined,
    });

    const saved = await this.guestRepo.save(guest);

    if (dto.vehicles?.length) {
      const vehicles = dto.vehicles.map((v) =>
        this.vehicleRepo.create({ ...v, guestId: saved.id }),
      );
      await this.vehicleRepo.save(vehicles);
    }

    // Aadhaar QR verification
    if (dto.aadhaarQrData) {
      await this.verifyAadhaarQr(saved.id, dto.aadhaarQrData, dto);
    }

    // Blacklist matching
    const matches = await this.watchlistService.matchGuest({
      aadhaarHash: saved.aadhaarHash,
      passportHash: saved.passportHash,
      mobileNumber: saved.mobileNumber,
      fullName: saved.fullName,
    });

    if (matches.length > 0) {
      const incident = await this.incidentsService.createFromMatch(saved, matches[0]);
      this.wsGateway.broadcast(WS_EVENTS.INCIDENT_CREATED, incident);
      this.wsGateway.broadcast(WS_EVENTS.ALERT_NEW, {
        severity: incident.severity,
        title: incident.title,
        hotelId: saved.hotelId,
      });
    }

    // Fraud detection: duplicate Aadhaar
    if (saved.aadhaarHash) {
      const dupes = await this.guestRepo.count({
        where: { aadhaarHash: saved.aadhaarHash, status: 'checked_in' },
      });
      if (dupes > 1) {
        saved.riskScore = Math.min(saved.riskScore + 30, 100);
        saved.riskLevel = saved.riskScore >= 61 ? 'high' : 'medium';
        await this.guestRepo.save(saved);
      }
    }

    this.wsGateway.broadcast(WS_EVENTS.GUEST_CHECKIN, {
      guestId: saved.id,
      hotelId: saved.hotelId,
      fullName: saved.fullName,
    });

    await this.auditService.log({
      tenantId, userId, action: 'GUEST_REGISTER', entityType: 'guest', entityId: saved.id,
      newValues: { fullName: saved.fullName, hotelId: saved.hotelId },
    });

    return this.findOne(saved.id);
  }

  async findAll(query: GuestQueryDto, tenantId: string) {
    const { page = 1, limit = 20, hotelId, status, search } = query;
    const qb = this.guestRepo.createQueryBuilder('g')
      .leftJoinAndSelect('g.hotel', 'hotel')
      .leftJoinAndSelect('g.vehicles', 'vehicles')
      .where('g.tenantId = :tenantId', { tenantId });

    if (hotelId) qb.andWhere('g.hotelId = :hotelId', { hotelId });
    if (status) qb.andWhere('g.status = :status', { status });
    if (search) {
      qb.andWhere('(g.fullName LIKE :s OR g.mobileNumber LIKE :s)', { s: `%${search}%` });
    }

    const [data, total] = await qb
      .orderBy('g.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return { data, meta: { page, limit, total } };
  }

  async findOne(id: string) {
    const guest = await this.guestRepo.findOne({
      where: { id },
      relations: ['hotel', 'documents', 'vehicles'],
    });
    if (!guest) throw new NotFoundException('Guest not found');
    return guest;
  }

  async checkout(id: string, dto: CheckoutGuestDto, userId: string) {
    const guest = await this.findOne(id);
    guest.checkOutDate = new Date(dto.checkOutDate);
    guest.checkOutTime = dto.checkOutTime;
    guest.status = 'checked_out';
    const saved = await this.guestRepo.save(guest);

    this.wsGateway.broadcast(WS_EVENTS.GUEST_CHECKOUT, { guestId: id, hotelId: guest.hotelId });
    await this.auditService.log({
      userId, action: 'GUEST_CHECKOUT', entityType: 'guest', entityId: id,
    });
    return saved;
  }

  private async verifyAadhaarQr(
    guestId: string,
    qrData: Record<string, unknown>,
    manual: CreateGuestDto,
  ) {
    const extractedName = (qrData.name as string) || '';
    const extractedDob = qrData.dob as string;
    const extractedGender = qrData.gender as string;

    let nameMatch: 'match' | 'partial' | 'mismatch' = 'mismatch';
    if (extractedName.toLowerCase() === manual.fullName.toLowerCase()) {
      nameMatch = 'match';
    } else if (extractedName.toLowerCase().includes(manual.fullName.split(' ')[0].toLowerCase())) {
      nameMatch = 'partial';
    }

    const overall = nameMatch === 'match' ? 'verified' : nameMatch === 'partial' ? 'partial' : 'mismatch';

    await this.guestRepo.update(guestId, {
      aadhaarVerified: overall,
      identityVerified: overall === 'verified',
    });
  }
}
