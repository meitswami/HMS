import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Guest } from './guest.entity';

@Entity('vehicles')
export class Vehicle {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'guest_id' })
  guestId: string;

  @Column({ name: 'vehicle_number' })
  vehicleNumber: string;

  @Column({ name: 'vehicle_type', type: 'enum', enum: ['car', 'bike', 'truck', 'bus', 'other'], default: 'car' })
  vehicleType: string;

  @Column({ nullable: true })
  make: string;

  @Column({ nullable: true })
  model: string;

  @Column({ nullable: true })
  color: string;

  @Column({ name: 'photo_url', nullable: true })
  photoUrl: string;

  @Column({ name: 'photo_key', nullable: true })
  photoKey: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ManyToOne(() => Guest, (g) => g.vehicles)
  @JoinColumn({ name: 'guest_id' })
  guest: Guest;
}
