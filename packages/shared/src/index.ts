// Shared types and constants for HMS e-Register

export enum UserRole {
  SUPER_ADMIN = 'super_admin',
  POLICE_COMMAND = 'police_command',
  POLICE_OFFICER = 'police_officer',
  HOTEL_OWNER = 'hotel_owner',
  HOTEL_MANAGER = 'hotel_manager',
  RECEPTIONIST = 'receptionist',
}

export enum AlertSeverity {
  CRITICAL = 'critical',
  HIGH = 'high',
  MEDIUM = 'medium',
  LOW = 'low',
}

export enum RiskLevel {
  NORMAL = 'normal',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

export enum GuestStatus {
  CHECKED_IN = 'checked_in',
  CHECKED_OUT = 'checked_out',
  NO_SHOW = 'no_show',
  CANCELLED = 'cancelled',
}

export enum VerificationStatus {
  VERIFIED = 'verified',
  PARTIAL = 'partial',
  MISMATCH = 'mismatch',
  NOT_CHECKED = 'not_checked',
}

export enum IncidentType {
  BLACKLIST_MATCH = 'blacklist_match',
  FACE_MATCH = 'face_match',
  FRAUD_DETECTED = 'fraud_detected',
  AADHAAR_MISMATCH = 'aadhaar_mismatch',
  DUPLICATE_IDENTITY = 'duplicate_identity',
  SUSPICIOUS_MOVEMENT = 'suspicious_movement',
  MANUAL = 'manual',
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
  };
}

export interface PaginationQuery {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

export const RISK_THRESHOLDS = {
  NORMAL: { min: 0, max: 30 },
  MEDIUM: { min: 31, max: 60 },
  HIGH: { min: 61, max: 80 },
  CRITICAL: { min: 81, max: 100 },
} as const;

export const WS_EVENTS = {
  ALERT_NEW: 'alert:new',
  INCIDENT_CREATED: 'incident:created',
  GUEST_CHECKIN: 'guest:checkin',
  GUEST_CHECKOUT: 'guest:checkout',
  HOTEL_HEARTBEAT: 'hotel:heartbeat',
  DASHBOARD_UPDATE: 'dashboard:update',
  OCR_PROGRESS: 'ocr:progress',
} as const;
