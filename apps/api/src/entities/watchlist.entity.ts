import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('watchlists')
export class Watchlist {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'tenant_id', nullable: true })
  tenantId: string;

  @Column({ type: 'enum', enum: ['police', 'absconder', 'wanted', 'missing', 'terror', 'fraud', 'state', 'custom'] })
  source: string;

  @Column({ name: 'source_ref', nullable: true })
  sourceRef: string;

  @Column({ name: 'full_name' })
  fullName: string;

  @Column({ type: 'json', nullable: true })
  aliases: string[];

  @Column({ name: 'father_name', nullable: true })
  fatherName: string;

  @Column({ name: 'date_of_birth', type: 'date', nullable: true })
  dateOfBirth: Date;

  @Column({ type: 'enum', enum: ['male', 'female', 'other', 'unknown'], nullable: true })
  gender: string;

  @Column({ nullable: true })
  nationality: string;

  @Column({ name: 'aadhaar_hash', nullable: true })
  aadhaarHash: string;

  @Column({ name: 'passport_hash', nullable: true })
  passportHash: string;

  @Column({ name: 'mobile_number', nullable: true })
  mobileNumber: string;

  @Column({ name: 'photo_url', nullable: true })
  photoUrl: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ name: 'crime_type', nullable: true })
  crimeType: string;

  @Column({ name: 'fir_number', nullable: true })
  firNumber: string;

  @Column({ name: 'police_station', nullable: true })
  policeStation: string;

  @Column({ type: 'enum', enum: ['critical', 'high', 'medium', 'low'], default: 'medium' })
  severity: string;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
