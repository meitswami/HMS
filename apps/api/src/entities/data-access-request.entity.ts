import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn,
} from 'typeorm';

@Entity('data_access_requests')
export class DataAccessRequest {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'tenant_id' })
  tenantId: string;

  @Column({ name: 'requested_by' })
  requestedBy: string;

  @Column({ name: 'hotel_ids', type: 'json' })
  hotelIds: string[];

  @Column({ name: 'date_from', type: 'date' })
  dateFrom: string;

  @Column({ name: 'date_to', type: 'date' })
  dateTo: string;

  @Column({ name: 'time_from', type: 'time', nullable: true })
  timeFrom: string;

  @Column({ name: 'time_to', type: 'time', nullable: true })
  timeTo: string;

  @Column({ type: 'text' })
  reason: string;

  @Column({
    type: 'enum',
    enum: ['pending', 'approved', 'rejected', 'expired'],
    default: 'pending',
  })
  status: string;

  @Column({ name: 'reviewed_by', nullable: true })
  reviewedBy: string;

  @Column({ name: 'reviewed_at', nullable: true })
  reviewedAt: Date;

  @Column({ name: 'review_notes', type: 'text', nullable: true })
  reviewNotes: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
