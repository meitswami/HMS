import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('audit_logs')
export class AuditLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'tenant_id', nullable: true })
  tenantId: string;

  @Column({ name: 'user_id', nullable: true })
  userId: string;

  @Column()
  action: string;

  @Column({ name: 'entity_type' })
  entityType: string;

  @Column({ name: 'entity_id', nullable: true })
  entityId: string;

  @Column({ name: 'old_values', type: 'json', nullable: true })
  oldValues: Record<string, unknown>;

  @Column({ name: 'new_values', type: 'json', nullable: true })
  newValues: Record<string, unknown>;

  @Column({ name: 'ip_address', nullable: true })
  ipAddress: string;

  @Column({ name: 'user_agent', type: 'text', nullable: true })
  userAgent: string;

  @Column({ name: 'device_id', nullable: true })
  deviceId: string;

  @Column({ name: 'request_id', nullable: true })
  requestId: string;

  @Column()
  checksum: string;

  @Column({ name: 'previous_checksum', nullable: true })
  previousChecksum: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
