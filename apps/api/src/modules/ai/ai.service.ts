import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { Guest } from '../../entities/guest.entity';
import { Incident } from '../../entities/incident.entity';

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);

  constructor(
    @InjectRepository(Guest) private guestRepo: Repository<Guest>,
    @InjectRepository(Incident) private incidentRepo: Repository<Incident>,
    private config: ConfigService,
  ) {}

  /** Natural language search - parses query and executes against DB */
  async naturalLanguageSearch(query: string, tenantId: string) {
    const lower = query.toLowerCase();
    const qb = this.guestRepo.createQueryBuilder('g')
      .leftJoinAndSelect('g.hotel', 'hotel')
      .where('g.tenantId = :tenantId', { tenantId });

    // Pattern matching for common NL queries
    if (lower.includes('foreign national')) {
      qb.andWhere('g.isForeignNational = 1');
    }
    if (lower.includes('blacklist')) {
      const guestIds = await this.incidentRepo
        .createQueryBuilder('i')
        .select('i.guestId')
        .where('i.incidentType = :type', { type: 'blacklist_match' })
        .getRawMany();
      const ids = guestIds.map((r) => r.i_guest_id).filter(Boolean);
      if (ids.length) qb.andWhere('g.id IN (:...ids)', { ids });
    }
    if (lower.includes('last 30 days') || lower.includes('last month')) {
      qb.andWhere('g.checkInDate >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)');
    }
    if (lower.includes('last 7 days') || lower.includes('this week')) {
      qb.andWhere('g.checkInDate >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)');
    }

    // City extraction
    const cityMatch = lower.match(/(?:from|in)\s+(\w+)/);
    if (cityMatch) {
      qb.andWhere('(g.city LIKE :city OR hotel.city LIKE :city)', { city: `%${cityMatch[1]}%` });
    }

    // Mobile number search
    const mobileMatch = lower.match(/mobile\s*(?:number)?\s*(\d+)/);
    if (mobileMatch) {
      qb.andWhere('g.mobileNumber = :mobile', { mobile: mobileMatch[1] });
    }

    const results = await qb.orderBy('g.createdAt', 'DESC').limit(100).getMany();

    return {
      query,
      interpretation: this.interpretQuery(lower),
      count: results.length,
      results,
    };
  }

  private interpretQuery(query: string): string {
    const parts: string[] = [];
    if (query.includes('foreign')) parts.push('Foreign nationals filter');
    if (query.includes('blacklist')) parts.push('Blacklist matches filter');
    if (query.includes('30 days')) parts.push('Last 30 days date range');
    if (query.includes('mobile')) parts.push('Mobile number filter');
    return parts.join(', ') || 'General guest search';
  }

  /** LLM-enhanced query parsing (when API key available) */
  async llmParseQuery(query: string): Promise<Record<string, unknown>> {
    const apiKey = this.config.get('OPENAI_API_KEY');
    if (!apiKey) return { raw: query };

    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: this.config.get('LLM_MODEL', 'gpt-4o-mini'),
          messages: [{
            role: 'system',
            content: 'Parse hotel guest search queries into JSON filters: {city, state, nationality, dateFrom, dateTo, gender, isForeign, riskLevel, mobile}',
          }, { role: 'user', content: query }],
          temperature: 0,
        }),
      });
      const data = await response.json();
      return JSON.parse(data.choices?.[0]?.message?.content || '{}');
    } catch {
      return { raw: query };
    }
  }
}
