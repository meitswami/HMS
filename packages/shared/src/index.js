"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WS_EVENTS = exports.RISK_THRESHOLDS = exports.IncidentType = exports.VerificationStatus = exports.GuestStatus = exports.RiskLevel = exports.AlertSeverity = exports.ADMIN_ROLES = exports.POLICE_ROLES = exports.HOTEL_ROLES = exports.PORTAL_HOME_PATHS = exports.ROLE_PORTAL_MAP = exports.PORTAL_LOGIN_PATHS = exports.PortalType = exports.DataRequestStatus = exports.HotelRegistrationStatus = exports.UserRole = void 0;
var UserRole;
(function (UserRole) {
    UserRole["SUPER_ADMIN"] = "super_admin";
    UserRole["POLICE_COMMAND"] = "police_command";
    UserRole["POLICE_OFFICER"] = "police_officer";
    UserRole["HOTEL_OWNER"] = "hotel_owner";
    UserRole["HOTEL_MANAGER"] = "hotel_manager";
    UserRole["RECEPTIONIST"] = "receptionist";
})(UserRole || (exports.UserRole = UserRole = {}));
var HotelRegistrationStatus;
(function (HotelRegistrationStatus) {
    HotelRegistrationStatus["PENDING"] = "pending";
    HotelRegistrationStatus["APPROVED"] = "approved";
    HotelRegistrationStatus["REJECTED"] = "rejected";
})(HotelRegistrationStatus || (exports.HotelRegistrationStatus = HotelRegistrationStatus = {}));
var DataRequestStatus;
(function (DataRequestStatus) {
    DataRequestStatus["PENDING"] = "pending";
    DataRequestStatus["APPROVED"] = "approved";
    DataRequestStatus["REJECTED"] = "rejected";
    DataRequestStatus["EXPIRED"] = "expired";
})(DataRequestStatus || (exports.DataRequestStatus = DataRequestStatus = {}));
var PortalType;
(function (PortalType) {
    PortalType["SUPER_ADMIN"] = "superadmin";
    PortalType["ADMIN"] = "admin";
    PortalType["HOTEL"] = "hotel";
    PortalType["POLICE"] = "police";
})(PortalType || (exports.PortalType = PortalType = {}));
exports.PORTAL_LOGIN_PATHS = {
    [PortalType.SUPER_ADMIN]: '/login/superadmin',
    [PortalType.ADMIN]: '/login/admin',
    [PortalType.HOTEL]: '/login/hotel',
    [PortalType.POLICE]: '/login/police',
};
exports.ROLE_PORTAL_MAP = {
    super_admin: PortalType.SUPER_ADMIN,
    police_command: PortalType.ADMIN,
    police_officer: PortalType.POLICE,
    hotel_owner: PortalType.HOTEL,
    hotel_manager: PortalType.HOTEL,
    receptionist: PortalType.HOTEL,
};
exports.PORTAL_HOME_PATHS = {
    [PortalType.SUPER_ADMIN]: '/admin/dashboard',
    [PortalType.ADMIN]: '/admin/dashboard',
    [PortalType.HOTEL]: '/hotel/dashboard',
    [PortalType.POLICE]: '/dashboard',
};
exports.HOTEL_ROLES = ['hotel_owner', 'hotel_manager', 'receptionist'];
exports.POLICE_ROLES = ['police_command', 'police_officer'];
exports.ADMIN_ROLES = ['super_admin', 'police_command'];
var AlertSeverity;
(function (AlertSeverity) {
    AlertSeverity["CRITICAL"] = "critical";
    AlertSeverity["HIGH"] = "high";
    AlertSeverity["MEDIUM"] = "medium";
    AlertSeverity["LOW"] = "low";
})(AlertSeverity || (exports.AlertSeverity = AlertSeverity = {}));
var RiskLevel;
(function (RiskLevel) {
    RiskLevel["NORMAL"] = "normal";
    RiskLevel["MEDIUM"] = "medium";
    RiskLevel["HIGH"] = "high";
    RiskLevel["CRITICAL"] = "critical";
})(RiskLevel || (exports.RiskLevel = RiskLevel = {}));
var GuestStatus;
(function (GuestStatus) {
    GuestStatus["CHECKED_IN"] = "checked_in";
    GuestStatus["CHECKED_OUT"] = "checked_out";
    GuestStatus["NO_SHOW"] = "no_show";
    GuestStatus["CANCELLED"] = "cancelled";
})(GuestStatus || (exports.GuestStatus = GuestStatus = {}));
var VerificationStatus;
(function (VerificationStatus) {
    VerificationStatus["VERIFIED"] = "verified";
    VerificationStatus["PARTIAL"] = "partial";
    VerificationStatus["MISMATCH"] = "mismatch";
    VerificationStatus["NOT_CHECKED"] = "not_checked";
})(VerificationStatus || (exports.VerificationStatus = VerificationStatus = {}));
var IncidentType;
(function (IncidentType) {
    IncidentType["BLACKLIST_MATCH"] = "blacklist_match";
    IncidentType["FACE_MATCH"] = "face_match";
    IncidentType["FRAUD_DETECTED"] = "fraud_detected";
    IncidentType["AADHAAR_MISMATCH"] = "aadhaar_mismatch";
    IncidentType["DUPLICATE_IDENTITY"] = "duplicate_identity";
    IncidentType["SUSPICIOUS_MOVEMENT"] = "suspicious_movement";
    IncidentType["MANUAL"] = "manual";
})(IncidentType || (exports.IncidentType = IncidentType = {}));
exports.RISK_THRESHOLDS = {
    NORMAL: { min: 0, max: 30 },
    MEDIUM: { min: 31, max: 60 },
    HIGH: { min: 61, max: 80 },
    CRITICAL: { min: 81, max: 100 },
};
exports.WS_EVENTS = {
    ALERT_NEW: 'alert:new',
    INCIDENT_CREATED: 'incident:created',
    GUEST_CHECKIN: 'guest:checkin',
    GUEST_CHECKOUT: 'guest:checkout',
    HOTEL_HEARTBEAT: 'hotel:heartbeat',
    DASHBOARD_UPDATE: 'dashboard:update',
    OCR_PROGRESS: 'ocr:progress',
};
//# sourceMappingURL=index.js.map