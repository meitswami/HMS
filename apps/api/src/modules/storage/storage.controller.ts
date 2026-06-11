import {
  Controller,
  Get,
  NotFoundException,
  Param,
  Res,
  StreamableFile,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { createReadStream, existsSync } from 'fs';
import { Response } from 'express';
import { Public } from '../../common/decorators/public.decorator';
import { StorageService } from './storage.service';

@ApiTags('storage')
@Controller('storage')
export class StorageController {
  constructor(private readonly storage: StorageService) {}

  @Public()
  @Get('files/*path')
  serveFile(@Param('path') key: string, @Res({ passthrough: true }) res: Response) {
    if (!key) throw new NotFoundException();

    const filePath = this.storage.getLocalFilePath(key);
    if (!filePath || !existsSync(filePath)) throw new NotFoundException();

    const ext = key.split('.').pop()?.toLowerCase();
    const mime: Record<string, string> = {
      jpg: 'image/jpeg',
      jpeg: 'image/jpeg',
      png: 'image/png',
      pdf: 'application/pdf',
      webp: 'image/webp',
    };
    res.set('Content-Type', mime[ext ?? ''] ?? 'application/octet-stream');
    return new StreamableFile(createReadStream(filePath));
  }
}
