import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('incidents')
export class Incident {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'tenant_id' })
  tenantId: string;

  @Column({ name: 'hotel_id' })
  hotelId: string;

  @Column({ name: 'guest_id', nullable: true })
  guestId: string;

  @Column({ name: 'watchlist_id', nullable: true })
  watchlistId: string;

  @Column({ name: 'incident_type', type: 'enum', enum: ['blacklist_match', 'face_match', 'fraud_detected', 'aadhaar_mismatch', 'duplicate_identity', 'suspicious_movement', 'manual'] })
  incidentType: string;

  @Column({ type: 'enum', enum: ['critical', 'high', 'medium', 'low'] })
  severity: string;

  @Column()
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ name: 'match_details', type: 'json', nullable: true })
  matchDetails: Record<string, unknown>;

  @Column({ name: 'risk_score', nullable: true })
  riskScore: number;

  @Column({ type: 'enum', enum: ['open', 'acknowledged', 'investigating', 'resolved', 'false_positive', 'closed'], default: 'open' })
  status: string;

  @Column({ name: 'assigned_to', nullable: true })
  assignedTo: string;

  @Column({ name: 'resolved_by', nullable: true })
  resolvedBy: string;

  @Column({ name: 'resolved_at', nullable: true })
  resolvedAt: Date;

  @Column({ name: 'resolution_notes', type: 'text', nullable: true })
  resolutionNotes: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
