import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as Minio from 'minio';
import * as fs from 'fs';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class StorageService implements OnModuleInit {
  private readonly logger = new Logger(StorageService.name);
  private client: Minio.Client | null = null;
  private bucket: string;
  private provider: string;
  private localRoot: string;
  private apiUrl: string;

  constructor(private config: ConfigService) {
    this.bucket = config.get('S3_BUCKET', 'hms-documents');
    this.provider = config.get('S3_PROVIDER', 'minio');
    this.localRoot = config.get('LOCAL_STORAGE_PATH', path.join(process.cwd(), 'data', 'uploads'));
    this.apiUrl = config.get('API_URL', 'http://localhost:4000');

    if (this.provider === 'aws') {
      const region = config.get('S3_REGION', 'ap-south-1');
      this.client = new Minio.Client({
        endPoint: `s3.${region}.amazonaws.com`,
        port: 443,
        useSSL: true,
        accessKey: config.get('S3_ACCESS_KEY')!,
        secretKey: config.get('S3_SECRET_KEY')!,
        region,
      });
    } else if (this.provider === 'local') {
      fs.mkdirSync(this.localRoot, { recursive: true });
    } else {
      this.client = new Minio.Client({
        endPoint: config.get('S3_ENDPOINT', 'localhost'),
        port: config.get<number>('S3_PORT', 9000),
        useSSL: config.get('S3_USE_SSL', 'false') === 'true',
        accessKey: config.get('S3_ACCESS_KEY', 'minioadmin'),
        secretKey: config.get('S3_SECRET_KEY', 'minioadmin'),
        region: config.get('S3_REGION', 'us-east-1'),
      });
    }
  }

  async onModuleInit() {
    if (this.provider === 'local') {
      this.logger.log(`Local storage: ${this.localRoot}`);
      return;
    }
    if (!this.client) return;
    try {
      const exists = await this.client.bucketExists(this.bucket);
      if (!exists && this.provider !== 'aws') {
        await this.client.makeBucket(this.bucket, this.config.get('S3_REGION', 'us-east-1'));
        this.logger.log(`Created bucket: ${this.bucket}`);
      }
    } catch (err) {
      this.logger.warn(`Object storage not available: ${(err as Error).message}`);
    }
  }

  async upload(
    file: Express.Multer.File,
    folder: string,
  ): Promise<{ url: string; key: string }> {
    const ext = file.originalname.split('.').pop();
    const key = `${folder}/${uuidv4()}.${ext}`;

    if (this.provider === 'local') {
      const dest = path.join(this.localRoot, key);
      fs.mkdirSync(path.dirname(dest), { recursive: true });
      fs.writeFileSync(dest, file.buffer);
      const url = `${this.apiUrl}/api/v1/storage/files/${encodeURIComponent(key)}`;
      return { url, key };
    }

    await this.client!.putObject(this.bucket, key, file.buffer, file.size, {
      'Content-Type': file.mimetype,
    });

    const url = await this.client!.presignedGetObject(this.bucket, key, 7 * 24 * 3600);
    return { url, key };
  }

  async getPresignedUrl(key: string, expirySeconds = 3600): Promise<string> {
    if (this.provider === 'local') {
      return `${this.apiUrl}/api/v1/storage/files/${encodeURIComponent(key)}`;
    }
    return this.client!.presignedGetObject(this.bucket, key, expirySeconds);
  }

  async delete(key: string): Promise<void> {
    if (this.provider === 'local') {
      const dest = path.join(this.localRoot, key);
      if (fs.existsSync(dest)) fs.unlinkSync(dest);
      return;
    }
    await this.client!.removeObject(this.bucket, key);
  }

  getLocalFilePath(key: string): string | null {
    if (this.provider !== 'local') return null;
    const resolved = path.resolve(this.localRoot, key);
    if (!resolved.startsWith(path.resolve(this.localRoot))) return null;
    return resolved;
  }
}
