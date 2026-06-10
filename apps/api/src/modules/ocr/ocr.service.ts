import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { OcrScan } from '../../entities/ocr-scan.entity';
import { StorageService } from '../storage/storage.service';
import { WebsocketGateway } from '../websocket/websocket.gateway';
import { WS_EVENTS } from '@hms/shared';

@Injectable()
export class OcrService {
  private readonly logger = new Logger(OcrService.name);

  constructor(
    @InjectRepository(OcrScan) private ocrRepo: Repository<OcrScan>,
    private storage: StorageService,
    private config: ConfigService,
    private wsGateway: WebsocketGateway,
  ) {}

  async uploadAndProcess(
    file: Express.Multer.File,
    hotelId: string,
    tenantId: string,
    userId: string,
    scanType: string,
    engine = 'paddle',
  ) {
    const { url, key } = await this.storage.upload(file, `ocr/${hotelId}`);

    const scan = this.ocrRepo.create({
      tenantId,
      hotelId,
      uploadedBy: userId,
      scanType,
      originalFileUrl: url,
      originalFileKey: key,
      ocrEngine: engine,
      status: 'processing',
    });
    const saved = await this.ocrRepo.save(scan);

    // Async OCR processing via Python microservice
    this.processOcr(saved.id, key, engine).catch((err) => {
      this.logger.error(`OCR failed for ${saved.id}: ${err.message}`);
    });

    return saved;
  }

  private async processOcr(scanId: string, fileKey: string, engine: string) {
    const ocrUrl = this.config.get('OCR_SERVICE_URL', 'http://localhost:5000');
    const start = Date.now();

    try {
      const response = await fetch(`${ocrUrl}/api/ocr/process`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fileKey, engine, scanId }),
      });

      const result = await response.json();

      await this.ocrRepo.update(scanId, {
        status: 'completed',
        overallConfidence: result.overallConfidence,
        processingTimeMs: Date.now() - start,
        pageCount: result.pages?.length || 1,
      });

      this.wsGateway.broadcast(WS_EVENTS.OCR_PROGRESS, {
        scanId,
        status: 'completed',
        rows: result.rows,
        pages: result.pages,
      });
    } catch (err) {
      await this.ocrRepo.update(scanId, {
        status: 'failed',
        errorMessage: (err as Error).message,
      });
      this.wsGateway.broadcast(WS_EVENTS.OCR_PROGRESS, { scanId, status: 'failed' });
    }
  }

  async findAll(hotelId: string, page = 1, limit = 20) {
    const [data, total] = await this.ocrRepo.findAndCount({
      where: { hotelId },
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
    return { data, meta: { page, limit, total } };
  }

  async approve(scanId: string, userId: string) {
    const scan = await this.ocrRepo.findOneBy({ id: scanId });
    if (!scan) throw new NotFoundException('OCR scan not found');

    scan.status = 'approved';
    scan.approvedBy = userId;
    scan.approvedAt = new Date();
    return this.ocrRepo.save(scan);
  }

  async reject(scanId: string) {
    await this.ocrRepo.update(scanId, { status: 'rejected' });
    return { message: 'OCR scan rejected' };
  }
}
