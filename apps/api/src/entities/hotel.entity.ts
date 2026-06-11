import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn,
  UpdateDateColumn, DeleteDateColumn,
} from 'typeorm';

@Entity('hotels')
export class Hotel {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'tenant_id' })
  tenantId: string;

  @Column()
  name: string;

  @Column({ name: 'owner_name' })
  ownerName: string;

  @Column({ name: 'license_number', unique: true })
  licenseNumber: string;

  @Column({ name: 'gst_number', nullable: true })
  gstNumber: string;

  @Column({ type: 'text' })
  address: string;

  @Column()
  city: string;

  @Column({ name: 'district_id', nullable: true })
  districtId: string;

  @Column({ name: 'state_id', nullable: true })
  stateId: string;

  @Column({ nullable: true })
  pincode: string;

  @Column({ name: 'contact_number' })
  contactNumber: string;

  @Column()
  email: string;

  @Column({ type: 'decimal', precision: 10, scale: 8, nullable: true })
  latitude: number;

  @Column({ type: 'decimal', precision: 11, scale: 8, nullable: true })
  longitude: number;

  @Column({ name: 'star_rating', nullable: true })
  starRating: number;

  @Column({ name: 'total_rooms', nullable: true })
  totalRooms: number;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @Column({
    name: 'registration_status',
    type: 'enum',
    enum: ['pending', 'approved', 'rejected'],
    default: 'approved',
  })
  registrationStatus: string;

  @Column({ name: 'approved_by', nullable: true })
  approvedBy: string;

  @Column({ name: 'approved_at', nullable: true })
  approvedAt: Date;

  @Column({ name: 'rejection_reason', type: 'text', nullable: true })
  rejectionReason: string;

  @Column({ name: 'registered_by_user_id', nullable: true })
  registeredByUserId: string;

  @Column({ name: 'is_online', default: false })
  isOnline: boolean;

  @Column({ name: 'last_heartbeat', nullable: true })
  lastHeartbeat: Date;

  @Column({ type: 'json', nullable: true })
  settings: Record<string, unknown>;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at' })
  deletedAt: Date;
}
