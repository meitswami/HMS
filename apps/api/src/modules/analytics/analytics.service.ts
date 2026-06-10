import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Guest } from '../../entities/guest.entity';

@Injectable()
export class AnalyticsService {
  constructor(
    @InjectRepository(Guest) private guestRepo: Repository<Guest>,
  ) {}

  async getReport(filters: {
    period: 'daily' | 'weekly' | 'monthly' | 'yearly';
    hotelId?: string;
    districtId?: string;
    stateId?: string;
    nationality?: string;
    gender?: string;
    tenantId: string;
  }) {
    const { period, tenantId, ...rest } = filters;
    const dateFilter = this.getDateFilter(period);

    const qb = this.guestRepo.createQueryBuilder('g')
      .leftJoin('g.hotel', 'h')
      .where('g.tenantId = :tenantId', { tenantId })
      .andWhere(`g.checkInDate >= ${dateFilter}`);

    if (rest.hotelId) qb.andWhere('g.hotelId = :hotelId', { hotelId: rest.hotelId });
    if (rest.nationality) qb.andWhere('g.nationality = :nationality', { nationality: rest.nationality });
    if (rest.gender) qb.andWhere('g.gender = :gender', { gender: rest.gender });

    const total = await qb.getCount();

    const byGender = await this.guestRepo.createQueryBuilder('g')
      .select('g.gender', 'gender')
      .addSelect('COUNT(*)', 'count')
      .where('g.tenantId = :tenantId', { tenantId })
      .andWhere(`g.checkInDate >= ${dateFilter}`)
      .groupBy('g.gender')
      .getRawMany();

    const byNationality = await this.guestRepo.createQueryBuilder('g')
      .select('g.nationality', 'nationality')
      .addSelect('COUNT(*)', 'count')
      .where('g.tenantId = :tenantId', { tenantId })
      .andWhere(`g.checkInDate >= ${dateFilter}`)
      .groupBy('g.nationality')
      .orderBy('count', 'DESC')
      .limit(10)
      .getRawMany();

    const dailyTrend = await this.guestRepo.createQueryBuilder('g')
      .select('g.checkInDate', 'date')
      .addSelect('COUNT(*)', 'count')
      .where('g.tenantId = :tenantId', { tenantId })
      .andWhere(`g.checkInDate >= ${dateFilter}`)
      .groupBy('g.checkInDate')
      .orderBy('date', 'ASC')
      .getRawMany();

    return { period, total, byGender, byNationality, dailyTrend };
  }

  private getDateFilter(period: string): string {
    switch (period) {
      case 'daily': return 'CURDATE()';
      case 'weekly': return 'DATE_SUB(CURDATE(), INTERVAL 7 DAY)';
      case 'monthly': return 'DATE_SUB(CURDATE(), INTERVAL 30 DAY)';
      case 'yearly': return 'DATE_SUB(CURDATE(), INTERVAL 365 DAY)';
      default: return 'DATE_SUB(CURDATE(), INTERVAL 30 DAY)';
    }
  }
}
