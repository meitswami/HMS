import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Incident } from '../../entities/incident.entity';
import { Guest } from '../../entities/guest.entity';
import { Watchlist } from '../../entities/watchlist.entity';
import { NotificationsService } from '../notifications/notifications.service';
import { WebsocketGateway } from '../websocket/websocket.gateway';
import { getPagination } from '../../common/utils/pagination.util';
import { WS_EVENTS } from '@hms/shared';

@Injectable()
export class IncidentsService {
  constructor(
    @InjectRepository(Incident) private incidentRepo: Repository<Incident>,
    private notificationsService: NotificationsService,
    private wsGateway: WebsocketGateway,
  ) {}

  async createFromMatch(guest: Guest, watchlist: Watchlist): Promise<Incident> {
    const incident = this.incidentRepo.create({
      tenantId: guest.tenantId,
      hotelId: guest.hotelId,
      guestId: guest.id,
      watchlistId: watchlist.id,
      incidentType: 'blacklist_match',
      severity: watchlist.severity,
      title: `Blacklist Match: ${guest.fullName}`,
      description: `Guest matched watchlist entry: ${watchlist.fullName} (${watchlist.source})`,
      matchDetails: {
        guestName: guest.fullName,
        watchlistName: watchlist.fullName,
        source: watchlist.source,
        crimeType: watchlist.crimeType,
        firNumber: watchlist.firNumber,
      },
      riskScore: guest.riskScore,
    });

    const saved = await this.incidentRepo.save(incident);

    // Dispatch multi-channel alerts
    await this.notificationsService.dispatchAlert(saved);

    this.wsGateway.broadcastToRole('police_command', WS_EVENTS.ALERT_NEW, {
      incidentId: saved.id,
      severity: saved.severity,
      title: saved.title,
      hotelId: guest.hotelId,
    });

    return saved;
  }

  async findAll(filters: { status?: string; severity?: string; page?: number; limit?: number }) {
    const { status, severity, page, limit } = filters;
    const { page: safePage, limit: safeLimit, skip } = getPagination(page, limit);
    const where: Record<string, unknown> = {};
    if (status) where.status = status;
    if (severity) where.severity = severity;

    const [data, total] = await this.incidentRepo.findAndCount({
      where,
      order: { createdAt: 'DESC' },
      skip,
      take: safeLimit,
    });
    return { data, meta: { page: safePage, limit: safeLimit, total } };
  }

  async updateStatus(id: string, status: string, userId: string, notes?: string) {
    const incident = await this.incidentRepo.findOneBy({ id });
    if (!incident) throw new NotFoundException('Incident not found');

    incident.status = status;
    if (status === 'resolved' || status === 'closed') {
      incident.resolvedBy = userId;
      incident.resolvedAt = new Date();
      incident.resolutionNotes = notes ?? '';
    }
    return this.incidentRepo.save(incident);
  }
}
