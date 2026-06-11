export declare enum UserRole {
    SUPER_ADMIN = "super_admin",
    POLICE_COMMAND = "police_command",
    POLICE_OFFICER = "police_officer",
    HOTEL_OWNER = "hotel_owner",
    HOTEL_MANAGER = "hotel_manager",
    RECEPTIONIST = "receptionist"
}
export declare enum HotelRegistrationStatus {
    PENDING = "pending",
    APPROVED = "approved",
    REJECTED = "rejected"
}
export declare enum DataRequestStatus {
    PENDING = "pending",
    APPROVED = "approved",
    REJECTED = "rejected",
    EXPIRED = "expired"
}
export declare enum PortalType {
    SUPER_ADMIN = "superadmin",
    ADMIN = "admin",
    HOTEL = "hotel",
    POLICE = "police"
}
export declare const PORTAL_LOGIN_PATHS: Record<PortalType, string>;
export declare const ROLE_PORTAL_MAP: Record<string, PortalType>;
export declare const PORTAL_HOME_PATHS: Record<PortalType, string>;
export declare const HOTEL_ROLES: readonly ["hotel_owner", "hotel_manager", "receptionist"];
export declare const POLICE_ROLES: readonly ["police_command", "police_officer"];
export declare const ADMIN_ROLES: readonly ["super_admin", "police_command"];
export declare enum AlertSeverity {
    CRITICAL = "critical",
    HIGH = "high",
    MEDIUM = "medium",
    LOW = "low"
}
export declare enum RiskLevel {
    NORMAL = "normal",
    MEDIUM = "medium",
    HIGH = "high",
    CRITICAL = "critical"
}
export declare enum GuestStatus {
    CHECKED_IN = "checked_in",
    CHECKED_OUT = "checked_out",
    NO_SHOW = "no_show",
    CANCELLED = "cancelled"
}
export declare enum VerificationStatus {
    VERIFIED = "verified",
    PARTIAL = "partial",
    MISMATCH = "mismatch",
    NOT_CHECKED = "not_checked"
}
export declare enum IncidentType {
    BLACKLIST_MATCH = "blacklist_match",
    FACE_MATCH = "face_match",
    FRAUD_DETECTED = "fraud_detected",
    AADHAAR_MISMATCH = "aadhaar_mismatch",
    DUPLICATE_IDENTITY = "duplicate_identity",
    SUSPICIOUS_MOVEMENT = "suspicious_movement",
    MANUAL = "manual"
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
export declare const RISK_THRESHOLDS: {
    readonly NORMAL: {
        readonly min: 0;
        readonly max: 30;
    };
    readonly MEDIUM: {
        readonly min: 31;
        readonly max: 60;
    };
    readonly HIGH: {
        readonly min: 61;
        readonly max: 80;
    };
    readonly CRITICAL: {
        readonly min: 81;
        readonly max: 100;
    };
};
export declare const WS_EVENTS: {
    readonly ALERT_NEW: "alert:new";
    readonly INCIDENT_CREATED: "incident:created";
    readonly GUEST_CHECKIN: "guest:checkin";
    readonly GUEST_CHECKOUT: "guest:checkout";
    readonly HOTEL_HEARTBEAT: "hotel:heartbeat";
    readonly DASHBOARD_UPDATE: "dashboard:update";
    readonly OCR_PROGRESS: "ocr:progress";
};
