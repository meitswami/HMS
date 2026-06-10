import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn,
  UpdateDateColumn, ManyToOne, JoinColumn, OneToMany,
} from 'typeorm';
import { Hotel } from './hotel.entity';
import { GuestDocument } from './guest-document.entity';
import { Vehicle } from './vehicle.entity';

@Entity('guests')
export class Guest {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'tenant_id' })
  tenantId: string;

  @Column({ name: 'hotel_id' })
  hotelId: string;

  @Column({ name: 'branch_id', nullable: true })
  branchId: string;

  @Column({ name: 'serial_number', nullable: true })
  serialNumber: string;

  @Column({ name: 'full_name' })
  fullName: string;

  @Column({ name: 'father_name', nullable: true })
  fatherName: string;

  @Column({ name: 'mother_name', nullable: true })
  motherName: string;

  @Column({ name: 'date_of_birth', type: 'date', nullable: true })
  dateOfBirth: Date;

  @Column({ nullable: true })
  age: number;

  @Column({ type: 'enum', enum: ['male', 'female', 'other', 'unknown'], default: 'unknown' })
  gender: string;

  @Column({ default: 'Indian' })
  nationality: string;

  @Column({ name: 'mobile_number', nullable: true })
  mobileNumber: string;

  @Column({ nullable: true })
  email: string;

  @Column({ name: 'permanent_address', type: 'text', nullable: true })
  permanentAddress: string;

  @Column({ name: 'temporary_address', type: 'text', nullable: true })
  temporaryAddress: string;

  @Column({ nullable: true })
  city: string;

  @Column({ name: 'aadhaar_number', nullable: true })
  aadhaarNumber: string;

  @Column({ name: 'aadhaar_hash', nullable: true })
  aadhaarHash: string;

  @Column({ name: 'passport_number', nullable: true })
  passportNumber: string;

  @Column({ name: 'passport_hash', nullable: true })
  passportHash: string;

  @Column({ name: 'driving_license', nullable: true })
  drivingLicense: string;

  @Column({ name: 'voter_id', nullable: true })
  voterId: string;

  @Column({ name: 'pan_number', nullable: true })
  panNumber: string;

  @Column({ name: 'room_number', nullable: true })
  roomNumber: string;

  @Column({ name: 'check_in_date', type: 'date' })
  checkInDate: Date;

  @Column({ name: 'check_in_time', type: 'time' })
  checkInTime: string;

  @Column({ name: 'check_out_date', type: 'date', nullable: true })
  checkOutDate: Date;

  @Column({ name: 'check_out_time', type: 'time', nullable: true })
  checkOutTime: string;

  @Column({ name: 'purpose_of_visit', nullable: true })
  purposeOfVisit: string;

  @Column({
    name: 'aadhaar_verified',
    type: 'enum',
    enum: ['verified', 'partial', 'mismatch', 'not_checked'],
    default: 'not_checked',
  })
  aadhaarVerified: string;

  @Column({ name: 'identity_verified', default: false })
  identityVerified: boolean;

  @Column({ name: 'risk_score', default: 0 })
  riskScore: number;

  @Column({
    name: 'risk_level',
    type: 'enum',
    enum: ['normal', 'medium', 'high', 'critical'],
    default: 'normal',
  })
  riskLevel: string;

  @Column({ name: 'is_foreign_national', default: false })
  isForeignNational: boolean;

  @Column({
    type: 'enum',
    enum: ['checked_in', 'checked_out', 'no_show', 'cancelled'],
    default: 'checked_in',
  })
  status: string;

  @Column({ name: 'registered_by', nullable: true })
  registeredBy: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne(() => Hotel)
  @JoinColumn({ name: 'hotel_id' })
  hotel: Hotel;

  @OneToMany(() => GuestDocument, (doc) => doc.guest)
  documents: GuestDocument[];

  @OneToMany(() => Vehicle, (v) => v.guest)
  vehicles: Vehicle[];
}
