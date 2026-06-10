import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as Minio from 'minio';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class StorageService implements OnModuleInit {
  private readonly logger = new Logger(StorageService.name);
  private client: Minio.Client;
  private bucket: string;

  constructor(private config: ConfigService) {
    this.bucket = config.get('S3_BUCKET', 'hms-documents');
    this.client = new Minio.Client({
      endPoint: config.get('S3_ENDPOINT', 'localhost'),
      port: config.get<number>('S3_PORT', 9000),
      useSSL: config.get('S3_USE_SSL', 'false') === 'true',
      accessKey: config.get('S3_ACCESS_KEY', 'minioadmin'),
      secretKey: config.get('S3_SECRET_KEY', 'minioadmin'),
    });
  }

  async onModuleInit() {
    try {
      const exists = await this.client.bucketExists(this.bucket);
      if (!exists) {
        await this.client.makeBucket(this.bucket);
        this.logger.log(`Created bucket: ${this.bucket}`);
      }
    } catch (err) {
      this.logger.warn(`MinIO not available: ${(err as Error).message}`);
    }
  }

  async upload(
    file: Express.Multer.File,
    folder: string,
  ): Promise<{ url: string; key: string }> {
    const ext = file.originalname.split('.').pop();
    const key = `${folder}/${uuidv4()}.${ext}`;

    await this.client.putObject(this.bucket, key, file.buffer, file.size, {
      'Content-Type': file.mimetype,
    });

    const url = await this.client.presignedGetObject(this.bucket, key, 7 * 24 * 3600);
    return { url, key };
  }

  async getPresignedUrl(key: string, expirySeconds = 3600): Promise<string> {
    return this.client.presignedGetObject(this.bucket, key, expirySeconds);
  }

  async delete(key: string): Promise<void> {
    await this.client.removeObject(this.bucket, key);
  }
}
