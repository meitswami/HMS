// Shared types and constants for HMS e-Register

export enum UserRole {
  SUPER_ADMIN = 'super_admin',
  POLICE_COMMAND = 'police_command',
  POLICE_OFFICER = 'police_officer',
  HOTEL_OWNER = 'hotel_owner',
  HOTEL_MANAGER = 'hotel_manager',
  RECEPTIONIST = 'receptionist',
}

export enum HotelRegistrationStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}

export enum DataRequestStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  EXPIRED = 'expired',
}

export enum PortalType {
  SUPER_ADMIN = 'superadmin',
  ADMIN = 'admin',
  HOTEL = 'hotel',
  POLICE = 'police',
}

export const PORTAL_LOGIN_PATHS: Record<PortalType, string> = {
  [PortalType.SUPER_ADMIN]: '/login/superadmin',
  [PortalType.ADMIN]: '/login/admin',
  [PortalType.HOTEL]: '/login/hotel',
  [PortalType.POLICE]: '/login/police',
};

export const ROLE_PORTAL_MAP: Record<string, PortalType> = {
  super_admin: PortalType.SUPER_ADMIN,
  police_command: PortalType.ADMIN,
  police_officer: PortalType.POLICE,
  hotel_owner: PortalType.HOTEL,
  hotel_manager: PortalType.HOTEL,
  receptionist: PortalType.HOTEL,
};

export const PORTAL_HOME_PATHS: Record<PortalType, string> = {
  [PortalType.SUPER_ADMIN]: '/admin/dashboard',
  [PortalType.ADMIN]: '/admin/dashboard',
  [PortalType.HOTEL]: '/hotel/dashboard',
  [PortalType.POLICE]: '/dashboard',
};

export const HOTEL_ROLES = ['hotel_owner', 'hotel_manager', 'receptionist'] as const;
export const POLICE_ROLES = ['police_command', 'police_officer'] as const;
export const ADMIN_ROLES = ['super_admin', 'police_command'] as const;

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
