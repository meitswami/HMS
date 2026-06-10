import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Guest } from './guest.entity';

@Entity('guest_documents')
export class GuestDocument {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'guest_id' })
  guestId: string;

  @Column({ name: 'document_type', type: 'enum', enum: ['id_front', 'id_back', 'aadhaar_qr', 'passport_scan', 'guest_photo', 'selfie', 'signature', 'additional'] })
  documentType: string;

  @Column({ name: 'file_url' })
  fileUrl: string;

  @Column({ name: 'file_key' })
  fileKey: string;

  @Column({ name: 'mime_type', nullable: true })
  mimeType: string;

  @Column({ name: 'file_size', nullable: true })
  fileSize: number;

  @Column({ name: 'ocr_extracted', type: 'json', nullable: true })
  ocrExtracted: Record<string, unknown>;

  @Column({ name: 'ocr_confidence', type: 'decimal', precision: 5, scale: 2, nullable: true })
  ocrConfidence: number;

  @Column({ name: 'is_verified', default: false })
  isVerified: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ManyToOne(() => Guest, (g) => g.documents)
  @JoinColumn({ name: 'guest_id' })
  guest: Guest;
}
