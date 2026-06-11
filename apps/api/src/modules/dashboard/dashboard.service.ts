import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Hotel } from '../../entities/hotel.entity';
import { Guest } from '../../entities/guest.entity';
import { Incident } from '../../entities/incident.entity';

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(Hotel) private hotelRepo: Repository<Hotel>,
    @InjectRepository(Guest) private guestRepo: Repository<Guest>,
    @InjectRepository(Incident) private incidentRepo: Repository<Incident>,
  ) {}

  async getCommandCentreStats(tenantId?: string) {
    const today = new Date().toISOString().split('T')[0];

    const hotelWhere: Record<string, unknown> = { isActive: true };
    const guestWhere: Record<string, unknown> = { status: 'checked_in' };
    if (tenantId) {
      hotelWhere.tenantId = tenantId;
      guestWhere.tenantId = tenantId;
    }

    const [
      totalHotels,
      hotelsOnline,
      activeGuests,
      checkinsToday,
      foreignNationals,
      blacklistHits,
      openIncidents,
    ] = await Promise.all([
      this.hotelRepo.count({ where: hotelWhere }),
      this.hotelRepo.count({ where: { ...hotelWhere, isOnline: true } }),
      this.guestRepo.count({ where: guestWhere }),
      this.guestRepo.createQueryBuilder('g')
        .where('g.checkInDate = :today', { today })
        .andWhere(tenantId ? 'g.tenantId = :tenantId' : '1=1', { tenantId })
        .getCount(),
      this.guestRepo.count({ where: { ...guestWhere, isForeignNational: true } }),
      this.incidentRepo.createQueryBuilder('i')
        .where('i.incidentType = :type', { type: 'blacklist_match' })
        .andWhere('DATE(i.createdAt) = :today', { today })
        .getCount(),
      this.incidentRepo.count({ where: { status: 'open' } }),
    ]);

    return {
      totalHotels,
      hotelsOnline,
      activeGuests,
      checkinsToday,
      foreignNationals,
      blacklistHits,
      openIncidents,
    };
  }

  async getDistrictStats() {
    return this.hotelRepo.query(`
      SELECT d.name AS district, s.name AS state,
        COUNT(DISTINCT h.id) AS hotels,
        COUNT(DISTINCT CASE WHEN h.is_online = 1 THEN h.id END) AS online,
        COUNT(DISTINCT CASE WHEN g.status = 'checked_in' THEN g.id END) AS active_guests
      FROM districts d
      JOIN states s ON d.state_id = s.id
      LEFT JOIN hotels h ON h.district_id = d.id AND h.is_active = 1
      LEFT JOIN guests g ON g.hotel_id = h.id
      GROUP BY d.id, d.name, s.name
      ORDER BY active_guests DESC
    `);
  }

  async getRecentIncidents(limit?: number | string) {
    const parsed = Number(limit);
    const take = Number.isFinite(parsed) && parsed > 0 ? parsed : 10;
    return this.incidentRepo.find({
      order: { createdAt: 'DESC' },
      take,
    });
  }
}
