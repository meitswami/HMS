import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('ocr_scans')
export class OcrScan {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'tenant_id' })
  tenantId: string;

  @Column({ name: 'hotel_id' })
  hotelId: string;

  @Column({ name: 'uploaded_by' })
  uploadedBy: string;

  @Column({ name: 'scan_type', type: 'enum', enum: ['register_page', 'pdf', 'photo', 'historical_book'] })
  scanType: string;

  @Column({ name: 'original_file_url' })
  originalFileUrl: string;

  @Column({ name: 'original_file_key' })
  originalFileKey: string;

  @Column({ name: 'page_count', default: 1 })
  pageCount: number;

  @Column({ type: 'enum', enum: ['pending', 'processing', 'completed', 'failed', 'approved', 'rejected'], default: 'pending' })
  status: string;

  @Column({ name: 'ocr_engine', type: 'enum', enum: ['paddle', 'tesseract', 'easyocr', 'ensemble'], default: 'paddle' })
  ocrEngine: string;

  @Column({ name: 'overall_confidence', type: 'decimal', precision: 5, scale: 2, nullable: true })
  overallConfidence: number;

  @Column({ name: 'processing_time_ms', nullable: true })
  processingTimeMs: number;

  @Column({ name: 'error_message', type: 'text', nullable: true })
  errorMessage: string;

  @Column({ name: 'approved_by', nullable: true })
  approvedBy: string;

  @Column({ name: 'approved_at', nullable: true })
  approvedAt: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
