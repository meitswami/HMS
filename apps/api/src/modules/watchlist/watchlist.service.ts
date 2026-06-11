import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Watchlist } from '../../entities/watchlist.entity';
import { CryptoUtil } from '../../common/utils/crypto.util';
import { CreateWatchlistDto, ImportWatchlistDto } from './dto/watchlist.dto';

export interface MatchInput {
  aadhaarHash?: string;
  passportHash?: string;
  mobileNumber?: string;
  fullName?: string;
}

@Injectable()
export class WatchlistService {
  private readonly logger = new Logger(WatchlistService.name);

  constructor(
    @InjectRepository(Watchlist) private watchlistRepo: Repository<Watchlist>,
  ) {}

  async create(dto: CreateWatchlistDto, userId: string) {
    const entry = this.watchlistRepo.create({
      fullName: dto.fullName,
      source: dto.source,
      fatherName: dto.fatherName,
      dateOfBirth: dto.dateOfBirth ? new Date(dto.dateOfBirth) : undefined,
      gender: dto.gender,
      nationality: dto.nationality,
      mobileNumber: dto.mobileNumber,
      crimeType: dto.crimeType,
      firNumber: dto.firNumber,
      policeStation: dto.policeStation,
      severity: dto.severity || 'medium',
      description: dto.description,
      sourceRef: dto.sourceRef,
      aadhaarHash: dto.aadhaarNumber ? CryptoUtil.hash(CryptoUtil.normalizeAadhaar(dto.aadhaarNumber)) : undefined,
      passportHash: dto.passportNumber ? CryptoUtil.hash(dto.passportNumber) : undefined,
      createdBy: userId,
    });
    return this.watchlistRepo.save(entry);
  }

  async importFromApi(dto: ImportWatchlistDto, userId: string) {
    const headers: Record<string, string> = { Accept: 'application/json' };
    if (dto.apiKey) headers.Authorization = `Bearer ${dto.apiKey}`;

    let response: Response;
    try {
      response = await fetch(dto.apiUrl, { headers });
    } catch (err) {
      throw new BadRequestException(`Failed to reach external API: ${(err as Error).message}`);
    }

    if (!response.ok) {
      throw new BadRequestException(`External API returned ${response.status}`);
    }

    const payload = await response.json();
    const records: Record<string, unknown>[] = Array.isArray(payload)
      ? payload
      : (payload.data as Record<string, unknown>[]) || (payload.records as Record<string, unknown>[]) || [];

    if (!records.length) {
      throw new BadRequestException('No records found in external API response');
    }

    const imported: Watchlist[] = [];
    for (const rec of records.slice(0, 100)) {
      const entry = this.watchlistRepo.create({
        source: (rec.source as string) || dto.defaultSource || 'custom',
        sourceRef: rec.id as string || rec.ref as string,
        fullName: (rec.fullName || rec.full_name || rec.name) as string,
        fatherName: (rec.fatherName || rec.father_name) as string,
        mobileNumber: (rec.mobileNumber || rec.mobile || rec.phone) as string,
        crimeType: (rec.crimeType || rec.crime_type || rec.type) as string,
        firNumber: rec.firNumber as string || rec.fir_number as string,
        policeStation: rec.policeStation as string || rec.police_station as string,
        description: rec.description as string,
        severity: (rec.severity as string) || 'medium',
        nationality: rec.nationality as string,
        gender: rec.gender as string,
        aadhaarHash: rec.aadhaarNumber ? CryptoUtil.hash(CryptoUtil.normalizeAadhaar(rec.aadhaarNumber as string)) : undefined,
        passportHash: rec.passportNumber ? CryptoUtil.hash(rec.passportNumber as string) : undefined,
        createdBy: userId,
      });
      if (entry.fullName) {
        imported.push(await this.watchlistRepo.save(entry));
      }
    }

    this.logger.log(`Imported ${imported.length} watchlist records from ${dto.apiUrl}`);
    return { imported: imported.length, records: imported };
  }

  async findAll(page = 1, limit = 20, source?: string) {
    const where: Record<string, unknown> = { isActive: true };
    if (source) where.source = source;

    const [data, total] = await this.watchlistRepo.findAndCount({
      where,
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
    return { data, meta: { page, limit, total } };
  }

  /** Multi-strategy matching: exact hash, mobile, fuzzy name */
  async matchGuest(input: MatchInput): Promise<Watchlist[]> {
    const matches: Watchlist[] = [];

    if (input.aadhaarHash) {
      const exact = await this.watchlistRepo.find({
        where: { aadhaarHash: input.aadhaarHash, isActive: true },
      });
      matches.push(...exact);
    }

    if (input.passportHash) {
      const exact = await this.watchlistRepo.find({
        where: { passportHash: input.passportHash, isActive: true },
      });
      matches.push(...exact);
    }

    if (input.mobileNumber) {
      const mobile = await this.watchlistRepo.find({
        where: { mobileNumber: input.mobileNumber, isActive: true },
      });
      matches.push(...mobile);
    }

    if (input.fullName && matches.length === 0) {
      const fuzzy = await this.watchlistRepo
        .createQueryBuilder('w')
        .where('w.isActive = 1')
        .andWhere('SOUNDEX(w.fullName) = SOUNDEX(:name)', { name: input.fullName })
        .limit(5)
        .getMany();
      matches.push(...fuzzy);
    }

    const seen = new Set<string>();
    return matches.filter((m) => {
      if (seen.has(m.id)) return false;
      seen.add(m.id);
      return true;
    });
  }
}
