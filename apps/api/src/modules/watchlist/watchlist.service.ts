import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Watchlist } from '../../entities/watchlist.entity';
import { CryptoUtil } from '../../common/utils/crypto.util';
import { CreateWatchlistDto } from './dto/watchlist.dto';

export interface MatchInput {
  aadhaarHash?: string;
  passportHash?: string;
  mobileNumber?: string;
  fullName?: string;
}

@Injectable()
export class WatchlistService {
  constructor(
    @InjectRepository(Watchlist) private watchlistRepo: Repository<Watchlist>,
  ) {}

  async create(dto: CreateWatchlistDto, userId: string) {
    const entry = this.watchlistRepo.create({
      ...dto,
      aadhaarHash: dto.aadhaarNumber ? CryptoUtil.hash(dto.aadhaarNumber) : undefined,
      passportHash: dto.passportNumber ? CryptoUtil.hash(dto.passportNumber) : undefined,
      createdBy: userId,
    });
    return this.watchlistRepo.save(entry);
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
