import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OcrController } from './ocr.controller';
import { OcrService } from './ocr.service';
import { OcrScan } from '../../entities/ocr-scan.entity';

@Module({
  imports: [TypeOrmModule.forFeature([OcrScan])],
  controllers: [OcrController],
  providers: [OcrService],
  exports: [OcrService],
})
export class OcrModule {}
