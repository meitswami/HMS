-- =============================================================================
-- AI Hotel Register & Police Intelligence Command Centre
-- MySQL 8.0 Schema - Production Grade
-- =============================================================================

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;
SET SQL_MODE = 'STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION';

-- -----------------------------------------------------------------------------
-- GEOGRAPHIC REFERENCE TABLES
-- -----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS countries (
    id          CHAR(36)     NOT NULL DEFAULT (UUID()),
    name        VARCHAR(100) NOT NULL,
    iso_code_2  CHAR(2)      NOT NULL,
    iso_code_3  CHAR(3)      NOT NULL,
    phone_code  VARCHAR(10)  NULL,
    is_active   TINYINT(1)   NOT NULL DEFAULT 1,
    created_at  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uk_countries_iso2 (iso_code_2),
    UNIQUE KEY uk_countries_iso3 (iso_code_3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS states (
    id          CHAR(36)     NOT NULL DEFAULT (UUID()),
    country_id  CHAR(36)     NOT NULL,
    name        VARCHAR(100) NOT NULL,
    code        VARCHAR(10)  NOT NULL,
    is_active   TINYINT(1)   NOT NULL DEFAULT 1,
    created_at  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uk_states_code (code),
    KEY idx_states_country (country_id),
    CONSTRAINT fk_states_country FOREIGN KEY (country_id) REFERENCES countries(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS districts (
    id          CHAR(36)     NOT NULL DEFAULT (UUID()),
    state_id    CHAR(36)     NOT NULL,
    name        VARCHAR(100) NOT NULL,
    code        VARCHAR(20)  NULL,
    is_active   TINYINT(1)   NOT NULL DEFAULT 1,
    created_at  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    KEY idx_districts_state (state_id),
    KEY idx_districts_name (name),
    CONSTRAINT fk_districts_state FOREIGN KEY (state_id) REFERENCES states(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- MULTI-TENANT
-- -----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS tenants (
    id              CHAR(36)     NOT NULL DEFAULT (UUID()),
    name            VARCHAR(200) NOT NULL,
    slug            VARCHAR(100) NOT NULL,
    domain          VARCHAR(255) NULL,
    logo_url        VARCHAR(500) NULL,
    settings        JSON         NULL,
    is_active       TINYINT(1)   NOT NULL DEFAULT 1,
    created_at      TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uk_tenants_slug (slug)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- RBAC: ROLES, PERMISSIONS
-- -----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS roles (
    id          CHAR(36)     NOT NULL DEFAULT (UUID()),
    tenant_id   CHAR(36)     NULL,
    name        VARCHAR(50)  NOT NULL,
    slug        VARCHAR(50)  NOT NULL,
    description TEXT         NULL,
    level       INT          NOT NULL DEFAULT 0 COMMENT 'Higher = more privilege',
    is_system   TINYINT(1)   NOT NULL DEFAULT 0,
    created_at  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uk_roles_slug_tenant (slug, tenant_id),
    KEY idx_roles_tenant (tenant_id),
    CONSTRAINT fk_roles_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS permissions (
    id          CHAR(36)     NOT NULL DEFAULT (UUID()),
    name        VARCHAR(100) NOT NULL,
    slug        VARCHAR(100) NOT NULL,
    module      VARCHAR(50)  NOT NULL,
    description TEXT         NULL,
    created_at  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uk_permissions_slug (slug),
    KEY idx_permissions_module (module)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS role_permissions (
    role_id       CHAR(36) NOT NULL,
    permission_id CHAR(36) NOT NULL,
    PRIMARY KEY (role_id, permission_id),
    CONSTRAINT fk_rp_role FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE,
    CONSTRAINT fk_rp_permission FOREIGN KEY (permission_id) REFERENCES permissions(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- USERS & AUTHENTICATION
-- -----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS users (
    id                  CHAR(36)     NOT NULL DEFAULT (UUID()),
    tenant_id           CHAR(36)     NULL,
    role_id             CHAR(36)     NOT NULL,
    email               VARCHAR(255) NOT NULL,
    password_hash       VARCHAR(255) NOT NULL,
    first_name          VARCHAR(100) NOT NULL,
    last_name           VARCHAR(100) NOT NULL,
    phone               VARCHAR(20)  NULL,
    avatar_url          VARCHAR(500) NULL,
    mfa_secret          VARCHAR(255) NULL COMMENT 'AES encrypted TOTP secret',
    mfa_enabled         TINYINT(1)   NOT NULL DEFAULT 0,
    mfa_backup_codes    JSON         NULL,
    is_active           TINYINT(1)   NOT NULL DEFAULT 1,
    is_verified         TINYINT(1)   NOT NULL DEFAULT 0,
    last_login_at       TIMESTAMP    NULL,
    last_login_ip       VARCHAR(45)  NULL,
    failed_login_count  INT          NOT NULL DEFAULT 0,
    locked_until        TIMESTAMP    NULL,
    password_changed_at TIMESTAMP    NULL,
    created_at          TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at          TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at          TIMESTAMP    NULL,
    PRIMARY KEY (id),
    UNIQUE KEY uk_users_email_tenant (email, tenant_id),
    KEY idx_users_tenant (tenant_id),
    KEY idx_users_role (role_id),
    KEY idx_users_phone (phone),
    CONSTRAINT fk_users_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE SET NULL,
    CONSTRAINT fk_users_role FOREIGN KEY (role_id) REFERENCES roles(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS refresh_tokens (
    id          CHAR(36)     NOT NULL DEFAULT (UUID()),
    user_id     CHAR(36)     NOT NULL,
    token_hash  VARCHAR(255) NOT NULL,
    device_id   VARCHAR(100) NULL,
    device_info JSON         NULL,
    ip_address  VARCHAR(45)  NULL,
    expires_at  TIMESTAMP    NOT NULL,
    revoked_at  TIMESTAMP    NULL,
    created_at  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    KEY idx_refresh_tokens_user (user_id),
    KEY idx_refresh_tokens_hash (token_hash),
    KEY idx_refresh_tokens_expires (expires_at),
    CONSTRAINT fk_refresh_tokens_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS user_sessions (
    id              CHAR(36)     NOT NULL DEFAULT (UUID()),
    user_id         CHAR(36)     NOT NULL,
    session_token   VARCHAR(255) NOT NULL,
    ip_address      VARCHAR(45)  NULL,
    user_agent      TEXT         NULL,
    device_fingerprint VARCHAR(255) NULL,
    is_active       TINYINT(1)   NOT NULL DEFAULT 1,
    last_activity   TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    expires_at      TIMESTAMP    NOT NULL,
    created_at      TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    KEY idx_sessions_user (user_id),
    KEY idx_sessions_token (session_token),
    CONSTRAINT fk_sessions_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- HOTEL MANAGEMENT
-- -----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS hotels (
    id              CHAR(36)     NOT NULL DEFAULT (UUID()),
    tenant_id       CHAR(36)     NOT NULL,
    name            VARCHAR(255) NOT NULL,
    owner_name      VARCHAR(200) NOT NULL,
    license_number  VARCHAR(100) NOT NULL,
    gst_number      VARCHAR(20)  NULL,
    address         TEXT         NOT NULL,
    city            VARCHAR(100) NOT NULL,
    district_id     CHAR(36)     NULL,
    state_id        CHAR(36)     NULL,
    pincode         VARCHAR(10)  NULL,
    contact_number  VARCHAR(20)  NOT NULL,
    email           VARCHAR(255) NOT NULL,
    latitude        DECIMAL(10,8) NULL,
    longitude       DECIMAL(11,8) NULL,
    star_rating     TINYINT      NULL,
    total_rooms     INT          NULL,
    is_active       TINYINT(1)   NOT NULL DEFAULT 1,
    is_online       TINYINT(1)   NOT NULL DEFAULT 0,
    last_heartbeat  TIMESTAMP    NULL,
    settings        JSON         NULL,
    created_at      TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at      TIMESTAMP    NULL,
    PRIMARY KEY (id),
    UNIQUE KEY uk_hotels_license (license_number),
    KEY idx_hotels_tenant (tenant_id),
    KEY idx_hotels_district (district_id),
    KEY idx_hotels_state (state_id),
    KEY idx_hotels_city (city),
    KEY idx_hotels_online (is_online),
    CONSTRAINT fk_hotels_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id),
    CONSTRAINT fk_hotels_district FOREIGN KEY (district_id) REFERENCES districts(id),
    CONSTRAINT fk_hotels_state FOREIGN KEY (state_id) REFERENCES states(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS hotel_branches (
    id              CHAR(36)     NOT NULL DEFAULT (UUID()),
    hotel_id        CHAR(36)     NOT NULL,
    name            VARCHAR(255) NOT NULL,
    branch_code     VARCHAR(50)  NOT NULL,
    address         TEXT         NOT NULL,
    city            VARCHAR(100) NOT NULL,
    district_id     CHAR(36)     NULL,
    state_id        CHAR(36)     NULL,
    contact_number  VARCHAR(20)  NULL,
    latitude        DECIMAL(10,8) NULL,
    longitude       DECIMAL(11,8) NULL,
    is_active       TINYINT(1)   NOT NULL DEFAULT 1,
    created_at      TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uk_branch_code (hotel_id, branch_code),
    KEY idx_branches_hotel (hotel_id),
    CONSTRAINT fk_branches_hotel FOREIGN KEY (hotel_id) REFERENCES hotels(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS hotel_users (
    id          CHAR(36)     NOT NULL DEFAULT (UUID()),
    hotel_id    CHAR(36)     NOT NULL,
    branch_id   CHAR(36)     NULL,
    user_id     CHAR(36)     NOT NULL,
    designation ENUM('owner','manager','receptionist','security','other') NOT NULL DEFAULT 'receptionist',
    is_primary  TINYINT(1)   NOT NULL DEFAULT 0,
    created_at  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uk_hotel_user (hotel_id, user_id),
    KEY idx_hotel_users_branch (branch_id),
    CONSTRAINT fk_hotel_users_hotel FOREIGN KEY (hotel_id) REFERENCES hotels(id) ON DELETE CASCADE,
    CONSTRAINT fk_hotel_users_branch FOREIGN KEY (branch_id) REFERENCES hotel_branches(id) ON DELETE SET NULL,
    CONSTRAINT fk_hotel_users_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS shifts (
    id          CHAR(36)     NOT NULL DEFAULT (UUID()),
    hotel_id    CHAR(36)     NOT NULL,
    branch_id   CHAR(36)     NULL,
    user_id     CHAR(36)     NOT NULL,
    shift_date  DATE         NOT NULL,
    start_time  TIME         NOT NULL,
    end_time    TIME         NOT NULL,
    status      ENUM('scheduled','active','completed','cancelled') NOT NULL DEFAULT 'scheduled',
    notes       TEXT         NULL,
    created_at  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    KEY idx_shifts_hotel_date (hotel_id, shift_date),
    KEY idx_shifts_user (user_id),
    CONSTRAINT fk_shifts_hotel FOREIGN KEY (hotel_id) REFERENCES hotels(id) ON DELETE CASCADE,
    CONSTRAINT fk_shifts_user FOREIGN KEY (user_id) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- GUEST REGISTER
-- -----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS guests (
    id                  CHAR(36)     NOT NULL DEFAULT (UUID()),
    tenant_id           CHAR(36)     NOT NULL,
    hotel_id            CHAR(36)     NOT NULL,
    branch_id           CHAR(36)     NULL,
    serial_number       VARCHAR(50)  NULL,
    full_name           VARCHAR(255) NOT NULL,
    father_name         VARCHAR(255) NULL,
    mother_name         VARCHAR(255) NULL,
    date_of_birth       DATE         NULL,
    age                 TINYINT      NULL,
    gender              ENUM('male','female','other','unknown') NOT NULL DEFAULT 'unknown',
    nationality         VARCHAR(100) NOT NULL DEFAULT 'Indian',
    country_id          CHAR(36)     NULL,
    mobile_number       VARCHAR(20)  NULL,
    email               VARCHAR(255) NULL,
    permanent_address   TEXT         NULL,
    temporary_address   TEXT         NULL,
    city                VARCHAR(100) NULL,
    state_id            CHAR(36)     NULL,
    -- Identity documents (AES encrypted at application layer)
    aadhaar_number      VARCHAR(255) NULL COMMENT 'AES encrypted',
    aadhaar_hash        VARCHAR(64)  NULL COMMENT 'SHA-256 for matching',
    passport_number     VARCHAR(255) NULL COMMENT 'AES encrypted',
    passport_hash       VARCHAR(64)  NULL,
    driving_license     VARCHAR(255) NULL COMMENT 'AES encrypted',
    driving_license_hash VARCHAR(64) NULL,
    voter_id            VARCHAR(255) NULL COMMENT 'AES encrypted',
    voter_id_hash       VARCHAR(64)  NULL,
    pan_number          VARCHAR(255) NULL COMMENT 'AES encrypted',
    pan_hash            VARCHAR(64)  NULL,
    -- Stay details
    room_number         VARCHAR(20)  NULL,
    check_in_date       DATE         NOT NULL,
    check_in_time       TIME         NOT NULL,
    check_out_date      DATE         NULL,
    check_out_time      TIME         NULL,
    purpose_of_visit    VARCHAR(255) NULL,
    -- Verification & risk
    aadhaar_verified    ENUM('verified','partial','mismatch','not_checked') DEFAULT 'not_checked',
    identity_verified   TINYINT(1)   NOT NULL DEFAULT 0,
    risk_score          TINYINT      NOT NULL DEFAULT 0 COMMENT '0-100',
    risk_level          ENUM('normal','medium','high','critical') NOT NULL DEFAULT 'normal',
    is_foreign_national TINYINT(1)   NOT NULL DEFAULT 0,
    status              ENUM('checked_in','checked_out','no_show','cancelled') NOT NULL DEFAULT 'checked_in',
    registered_by       CHAR(36)     NULL,
    created_at          TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at          TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    KEY idx_guests_hotel (hotel_id),
    KEY idx_guests_tenant (tenant_id),
    KEY idx_guests_check_in (check_in_date),
    KEY idx_guests_mobile (mobile_number),
    KEY idx_guests_aadhaar_hash (aadhaar_hash),
    KEY idx_guests_passport_hash (passport_hash),
    KEY idx_guests_risk (risk_level, risk_score),
    KEY idx_guests_foreign (is_foreign_national),
    KEY idx_guests_status (status),
    FULLTEXT KEY ft_guests_name (full_name, father_name),
    CONSTRAINT fk_guests_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id),
    CONSTRAINT fk_guests_hotel FOREIGN KEY (hotel_id) REFERENCES hotels(id),
    CONSTRAINT fk_guests_branch FOREIGN KEY (branch_id) REFERENCES hotel_branches(id) ON DELETE SET NULL,
    CONSTRAINT fk_guests_registered_by FOREIGN KEY (registered_by) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS guest_documents (
    id              CHAR(36)     NOT NULL DEFAULT (UUID()),
    guest_id        CHAR(36)     NOT NULL,
    document_type   ENUM('id_front','id_back','aadhaar_qr','passport_scan','guest_photo','selfie','signature','additional') NOT NULL,
    file_url        VARCHAR(500) NOT NULL,
    file_key        VARCHAR(500) NOT NULL COMMENT 'S3/MinIO object key',
    mime_type       VARCHAR(100) NULL,
    file_size       INT          NULL,
    ocr_extracted   JSON         NULL,
    ocr_confidence  DECIMAL(5,2) NULL,
    is_verified     TINYINT(1)   NOT NULL DEFAULT 0,
    created_at      TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    KEY idx_guest_docs_guest (guest_id),
    KEY idx_guest_docs_type (document_type),
    CONSTRAINT fk_guest_docs_guest FOREIGN KEY (guest_id) REFERENCES guests(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS guest_photos (
    id              CHAR(36)     NOT NULL DEFAULT (UUID()),
    guest_id        CHAR(36)     NOT NULL,
    photo_type      ENUM('profile','selfie','cctv','other') NOT NULL DEFAULT 'profile',
    file_url        VARCHAR(500) NOT NULL,
    file_key        VARCHAR(500) NOT NULL,
    face_detected   TINYINT(1)   NOT NULL DEFAULT 0,
    face_quality    DECIMAL(5,2) NULL,
    created_at      TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    KEY idx_guest_photos_guest (guest_id),
    CONSTRAINT fk_guest_photos_guest FOREIGN KEY (guest_id) REFERENCES guests(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS vehicles (
    id              CHAR(36)     NOT NULL DEFAULT (UUID()),
    guest_id        CHAR(36)     NOT NULL,
    vehicle_number  VARCHAR(20)  NOT NULL,
    vehicle_type    ENUM('car','bike','truck','bus','other') NOT NULL DEFAULT 'car',
    make            VARCHAR(100) NULL,
    model           VARCHAR(100) NULL,
    color           VARCHAR(50)  NULL,
    photo_url       VARCHAR(500) NULL,
    photo_key       VARCHAR(500) NULL,
    created_at      TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    KEY idx_vehicles_guest (guest_id),
    KEY idx_vehicles_number (vehicle_number),
    CONSTRAINT fk_vehicles_guest FOREIGN KEY (guest_id) REFERENCES guests(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS foreign_national_records (
    id              CHAR(36)     NOT NULL DEFAULT (UUID()),
    guest_id        CHAR(36)     NOT NULL,
    passport_number VARCHAR(255) NOT NULL,
    passport_country CHAR(36)    NULL,
    visa_number     VARCHAR(100) NULL,
    visa_type       VARCHAR(50)  NULL,
    visa_expiry     DATE         NULL,
    arrival_date    DATE         NULL,
    departure_date  DATE         NULL,
    frro_reported   TINYINT(1)   NOT NULL DEFAULT 0,
    frro_report_date TIMESTAMP   NULL,
    created_at      TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uk_fn_guest (guest_id),
    KEY idx_fn_passport (passport_number),
    CONSTRAINT fk_fn_guest FOREIGN KEY (guest_id) REFERENCES guests(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- OCR REGISTER DIGITIZATION
-- -----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS ocr_scans (
    id              CHAR(36)     NOT NULL DEFAULT (UUID()),
    tenant_id       CHAR(36)     NOT NULL,
    hotel_id        CHAR(36)     NOT NULL,
    uploaded_by     CHAR(36)     NOT NULL,
    scan_type       ENUM('register_page','pdf','photo','historical_book') NOT NULL,
    original_file_url VARCHAR(500) NOT NULL,
    original_file_key VARCHAR(500) NOT NULL,
    page_count      INT          NOT NULL DEFAULT 1,
    status          ENUM('pending','processing','completed','failed','approved','rejected') NOT NULL DEFAULT 'pending',
    ocr_engine      ENUM('paddle','tesseract','easyocr','ensemble') NOT NULL DEFAULT 'paddle',
    overall_confidence DECIMAL(5,2) NULL,
    processing_time_ms INT       NULL,
    error_message   TEXT         NULL,
    approved_by     CHAR(36)     NULL,
    approved_at     TIMESTAMP    NULL,
    created_at      TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    KEY idx_ocr_scans_hotel (hotel_id),
    KEY idx_ocr_scans_status (status),
    CONSTRAINT fk_ocr_scans_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id),
    CONSTRAINT fk_ocr_scans_hotel FOREIGN KEY (hotel_id) REFERENCES hotels(id),
    CONSTRAINT fk_ocr_scans_uploader FOREIGN KEY (uploaded_by) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS ocr_pages (
    id              CHAR(36)     NOT NULL DEFAULT (UUID()),
    scan_id         CHAR(36)     NOT NULL,
    page_number     INT          NOT NULL,
    image_url       VARCHAR(500) NOT NULL,
    image_key       VARCHAR(500) NOT NULL,
    table_detected  TINYINT(1)   NOT NULL DEFAULT 0,
    row_count       INT          NULL,
    column_count    INT          NULL,
    confidence      DECIMAL(5,2) NULL,
    raw_ocr_data    JSON         NULL,
    created_at      TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    KEY idx_ocr_pages_scan (scan_id),
    CONSTRAINT fk_ocr_pages_scan FOREIGN KEY (scan_id) REFERENCES ocr_scans(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS ocr_rows (
    id              CHAR(36)     NOT NULL DEFAULT (UUID()),
    page_id         CHAR(36)     NOT NULL,
    row_number      INT          NOT NULL,
    guest_id        CHAR(36)     NULL COMMENT 'Linked after approval',
    status          ENUM('extracted','edited','approved','rejected','imported') NOT NULL DEFAULT 'extracted',
    created_at      TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    KEY idx_ocr_rows_page (page_id),
    KEY idx_ocr_rows_guest (guest_id),
    CONSTRAINT fk_ocr_rows_page FOREIGN KEY (page_id) REFERENCES ocr_pages(id) ON DELETE CASCADE,
    CONSTRAINT fk_ocr_rows_guest FOREIGN KEY (guest_id) REFERENCES guests(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS ocr_fields (
    id              CHAR(36)     NOT NULL DEFAULT (UUID()),
    row_id          CHAR(36)     NOT NULL,
    field_name      VARCHAR(100) NOT NULL,
    field_value     TEXT         NULL,
    original_value  TEXT         NULL COMMENT 'OCR extracted before edit',
    confidence      DECIMAL(5,2) NULL,
    is_edited       TINYINT(1)   NOT NULL DEFAULT 0,
    bbox            JSON         NULL COMMENT 'Bounding box coordinates',
    created_at      TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    KEY idx_ocr_fields_row (row_id),
    KEY idx_ocr_fields_name (field_name),
    CONSTRAINT fk_ocr_fields_row FOREIGN KEY (row_id) REFERENCES ocr_rows(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- WATCHLIST & BLACKLIST
-- -----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS watchlists (
    id              CHAR(36)     NOT NULL DEFAULT (UUID()),
    tenant_id       CHAR(36)     NULL,
    source          ENUM('police','absconder','wanted','missing','terror','fraud','state','custom') NOT NULL,
    source_ref      VARCHAR(100) NULL,
    full_name       VARCHAR(255) NOT NULL,
    aliases         JSON         NULL,
    father_name     VARCHAR(255) NULL,
    date_of_birth   DATE         NULL,
    gender          ENUM('male','female','other','unknown') NULL,
    nationality     VARCHAR(100) NULL,
    aadhaar_hash    VARCHAR(64)  NULL,
    passport_hash   VARCHAR(64)  NULL,
    driving_license_hash VARCHAR(64) NULL,
    voter_id_hash   VARCHAR(64)  NULL,
    pan_hash        VARCHAR(64)  NULL,
    mobile_number   VARCHAR(20)  NULL,
    photo_url       VARCHAR(500) NULL,
    description     TEXT         NULL,
    crime_type      VARCHAR(255) NULL,
    fir_number      VARCHAR(100) NULL,
    police_station  VARCHAR(255) NULL,
    district_id     CHAR(36)     NULL,
    state_id        CHAR(36)     NULL,
    severity        ENUM('critical','high','medium','low') NOT NULL DEFAULT 'medium',
    is_active       TINYINT(1)   NOT NULL DEFAULT 1,
    valid_from      DATE         NULL,
    valid_until     DATE         NULL,
    created_by      CHAR(36)     NULL,
    created_at      TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    KEY idx_watchlists_source (source),
    KEY idx_watchlists_aadhaar (aadhaar_hash),
    KEY idx_watchlists_passport (passport_hash),
    KEY idx_watchlists_mobile (mobile_number),
    KEY idx_watchlists_severity (severity),
    KEY idx_watchlists_active (is_active),
    FULLTEXT KEY ft_watchlists_name (full_name, father_name),
    CONSTRAINT fk_watchlists_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS blacklists (
    id              CHAR(36)     NOT NULL DEFAULT (UUID()),
    watchlist_id    CHAR(36)     NULL,
    tenant_id       CHAR(36)     NULL,
    entity_type     ENUM('person','organization','vehicle') NOT NULL DEFAULT 'person',
    identifier_type ENUM('aadhaar','passport','dl','voter_id','pan','mobile','face','vehicle') NOT NULL,
    identifier_hash VARCHAR(64)  NOT NULL,
    identifier_masked VARCHAR(50) NULL,
    reason          TEXT         NOT NULL,
    severity        ENUM('critical','high','medium','low') NOT NULL DEFAULT 'high',
    source          VARCHAR(100) NOT NULL,
    is_active       TINYINT(1)   NOT NULL DEFAULT 1,
    expires_at      TIMESTAMP    NULL,
    created_by      CHAR(36)     NULL,
    created_at      TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    KEY idx_blacklists_hash (identifier_hash),
    KEY idx_blacklists_type (identifier_type),
    KEY idx_blacklists_severity (severity),
    KEY idx_blacklists_active (is_active),
    CONSTRAINT fk_blacklists_watchlist FOREIGN KEY (watchlist_id) REFERENCES watchlists(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- ALERTS & INCIDENTS
-- -----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS incidents (
    id              CHAR(36)     NOT NULL DEFAULT (UUID()),
    tenant_id       CHAR(36)     NOT NULL,
    hotel_id        CHAR(36)     NOT NULL,
    guest_id        CHAR(36)     NULL,
    watchlist_id    CHAR(36)     NULL,
    incident_type   ENUM('blacklist_match','face_match','fraud_detected','aadhaar_mismatch','duplicate_identity','suspicious_movement','manual') NOT NULL,
    severity        ENUM('critical','high','medium','low') NOT NULL,
    title           VARCHAR(255) NOT NULL,
    description     TEXT         NULL,
    match_details   JSON         NULL,
    risk_score      TINYINT      NULL,
    status          ENUM('open','acknowledged','investigating','resolved','false_positive','closed') NOT NULL DEFAULT 'open',
    assigned_to     CHAR(36)     NULL,
    resolved_by     CHAR(36)     NULL,
    resolved_at     TIMESTAMP    NULL,
    resolution_notes TEXT        NULL,
    created_at      TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    KEY idx_incidents_hotel (hotel_id),
    KEY idx_incidents_guest (guest_id),
    KEY idx_incidents_severity (severity),
    KEY idx_incidents_status (status),
    KEY idx_incidents_created (created_at),
    CONSTRAINT fk_incidents_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id),
    CONSTRAINT fk_incidents_hotel FOREIGN KEY (hotel_id) REFERENCES hotels(id),
    CONSTRAINT fk_incidents_guest FOREIGN KEY (guest_id) REFERENCES guests(id) ON DELETE SET NULL,
    CONSTRAINT fk_incidents_watchlist FOREIGN KEY (watchlist_id) REFERENCES watchlists(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS alerts (
    id              CHAR(36)     NOT NULL DEFAULT (UUID()),
    incident_id     CHAR(36)     NOT NULL,
    alert_type      ENUM('dashboard','sms','email','whatsapp','push','sound') NOT NULL,
    recipient       VARCHAR(255) NOT NULL,
    recipient_type  ENUM('user','role','hotel','police','system') NOT NULL,
    message         TEXT         NOT NULL,
    severity        ENUM('critical','high','medium','low') NOT NULL,
    status          ENUM('pending','sent','delivered','failed','read') NOT NULL DEFAULT 'pending',
    sent_at         TIMESTAMP    NULL,
    delivered_at    TIMESTAMP    NULL,
    read_at         TIMESTAMP    NULL,
    error_message   TEXT         NULL,
    metadata        JSON         NULL,
    created_at      TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    KEY idx_alerts_incident (incident_id),
    KEY idx_alerts_status (status),
    KEY idx_alerts_severity (severity),
    KEY idx_alerts_created (created_at),
    CONSTRAINT fk_alerts_incident FOREIGN KEY (incident_id) REFERENCES incidents(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- FACE RECOGNITION
-- -----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS face_embeddings (
    id              CHAR(36)     NOT NULL DEFAULT (UUID()),
    guest_id        CHAR(36)     NULL,
    watchlist_id    CHAR(36)     NULL,
    photo_id        CHAR(36)     NULL,
    embedding       BLOB         NOT NULL COMMENT '512-dim float vector',
    model_version   VARCHAR(50)  NOT NULL DEFAULT 'arcface_v1',
    quality_score   DECIMAL(5,2) NULL,
    created_at      TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    KEY idx_face_guest (guest_id),
    KEY idx_face_watchlist (watchlist_id),
    CONSTRAINT fk_face_guest FOREIGN KEY (guest_id) REFERENCES guests(id) ON DELETE CASCADE,
    CONSTRAINT fk_face_watchlist FOREIGN KEY (watchlist_id) REFERENCES watchlists(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS face_matches (
    id              CHAR(36)     NOT NULL DEFAULT (UUID()),
    source_embedding_id CHAR(36) NOT NULL,
    target_embedding_id CHAR(36) NOT NULL,
    similarity_score DECIMAL(5,4) NOT NULL,
    match_type      ENUM('same_person','different_identity','watchlist_hit') NOT NULL,
    incident_id     CHAR(36)     NULL,
    created_at      TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    KEY idx_face_matches_source (source_embedding_id),
    KEY idx_face_matches_score (similarity_score),
    CONSTRAINT fk_face_matches_source FOREIGN KEY (source_embedding_id) REFERENCES face_embeddings(id),
    CONSTRAINT fk_face_matches_target FOREIGN KEY (target_embedding_id) REFERENCES face_embeddings(id),
    CONSTRAINT fk_face_matches_incident FOREIGN KEY (incident_id) REFERENCES incidents(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- AADHAAR VERIFICATION
-- -----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS aadhaar_verifications (
    id              CHAR(36)     NOT NULL DEFAULT (UUID()),
    guest_id        CHAR(36)     NOT NULL,
    qr_data         JSON         NOT NULL,
    extracted_name  VARCHAR(255) NULL,
    extracted_dob   DATE         NULL,
    extracted_gender ENUM('male','female','other') NULL,
    extracted_address TEXT       NULL,
    manual_name     VARCHAR(255) NULL,
    manual_dob      DATE         NULL,
    manual_gender   ENUM('male','female','other','unknown') NULL,
    name_match      ENUM('match','partial','mismatch') NULL,
    dob_match       ENUM('match','mismatch') NULL,
    gender_match    ENUM('match','mismatch') NULL,
    overall_status  ENUM('verified','partial','mismatch','fake_suspected') NOT NULL,
    confidence      DECIMAL(5,2) NULL,
    verified_by     CHAR(36)     NULL,
    created_at      TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    KEY idx_aadhaar_guest (guest_id),
    CONSTRAINT fk_aadhaar_guest FOREIGN KEY (guest_id) REFERENCES guests(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- NOTIFICATIONS
-- -----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS notifications (
    id              CHAR(36)     NOT NULL DEFAULT (UUID()),
    user_id         CHAR(36)     NOT NULL,
    type            VARCHAR(50)  NOT NULL,
    title           VARCHAR(255) NOT NULL,
    message         TEXT         NOT NULL,
    severity        ENUM('critical','high','medium','low','info') NOT NULL DEFAULT 'info',
    data            JSON         NULL,
    is_read         TINYINT(1)   NOT NULL DEFAULT 0,
    read_at         TIMESTAMP    NULL,
    created_at      TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    KEY idx_notifications_user (user_id),
    KEY idx_notifications_read (is_read),
    KEY idx_notifications_created (created_at),
    CONSTRAINT fk_notifications_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- AUDIT LOG (Tamper-proof)
-- -----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS audit_logs (
    id              CHAR(36)     NOT NULL DEFAULT (UUID()),
    tenant_id       CHAR(36)     NULL,
    user_id         CHAR(36)     NULL,
    action          VARCHAR(100) NOT NULL,
    entity_type     VARCHAR(100) NOT NULL,
    entity_id       CHAR(36)     NULL,
    old_values      JSON         NULL,
    new_values      JSON         NULL,
    ip_address      VARCHAR(45)  NULL,
    user_agent      TEXT         NULL,
    device_id       VARCHAR(100) NULL,
    request_id      VARCHAR(100) NULL,
    checksum        VARCHAR(64)  NOT NULL COMMENT 'SHA-256 chain hash',
    previous_checksum VARCHAR(64) NULL,
    created_at      TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    KEY idx_audit_tenant (tenant_id),
    KEY idx_audit_user (user_id),
    KEY idx_audit_action (action),
    KEY idx_audit_entity (entity_type, entity_id),
    KEY idx_audit_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- REPORTS
-- -----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS reports (
    id              CHAR(36)     NOT NULL DEFAULT (UUID()),
    tenant_id       CHAR(36)     NOT NULL,
    generated_by    CHAR(36)     NOT NULL,
    report_type     ENUM('daily','weekly','monthly','yearly','custom','frro') NOT NULL,
    title           VARCHAR(255) NOT NULL,
    filters         JSON         NULL,
    file_url        VARCHAR(500) NULL,
    file_key        VARCHAR(500) NULL,
    format          ENUM('pdf','excel','csv') NOT NULL,
    status          ENUM('pending','generating','completed','failed') NOT NULL DEFAULT 'pending',
    record_count    INT          NULL,
    error_message   TEXT         NULL,
    created_at      TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    completed_at    TIMESTAMP    NULL,
    PRIMARY KEY (id),
    KEY idx_reports_tenant (tenant_id),
    KEY idx_reports_type (report_type),
    CONSTRAINT fk_reports_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id),
    CONSTRAINT fk_reports_user FOREIGN KEY (generated_by) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- FRAUD DETECTION
-- -----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS fraud_signals (
    id              CHAR(36)     NOT NULL DEFAULT (UUID()),
    guest_id        CHAR(36)     NOT NULL,
    signal_type     ENUM('duplicate_aadhaar','same_face_diff_name','fake_identity','suspicious_movement','repeated_night_checkin','high_risk_traveler') NOT NULL,
    description     TEXT         NOT NULL,
    evidence        JSON         NULL,
    risk_contribution TINYINT    NOT NULL DEFAULT 10 COMMENT 'Points added to risk score',
    is_resolved     TINYINT(1)   NOT NULL DEFAULT 0,
    created_at      TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    KEY idx_fraud_guest (guest_id),
    KEY idx_fraud_type (signal_type),
    CONSTRAINT fk_fraud_guest FOREIGN KEY (guest_id) REFERENCES guests(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- VIEWS
-- -----------------------------------------------------------------------------

CREATE OR REPLACE VIEW v_active_guests AS
SELECT
    g.id, g.full_name, g.mobile_number, g.room_number,
    g.check_in_date, g.check_in_time, g.nationality,
    g.is_foreign_national, g.risk_level, g.risk_score,
    h.name AS hotel_name, h.city, d.name AS district_name, s.name AS state_name
FROM guests g
JOIN hotels h ON g.hotel_id = h.id
LEFT JOIN districts d ON h.district_id = d.id
LEFT JOIN states s ON h.state_id = s.id
WHERE g.status = 'checked_in';

CREATE OR REPLACE VIEW v_dashboard_stats AS
SELECT
    (SELECT COUNT(*) FROM hotels WHERE is_active = 1) AS total_hotels,
    (SELECT COUNT(*) FROM hotels WHERE is_online = 1) AS hotels_online,
    (SELECT COUNT(*) FROM guests WHERE status = 'checked_in') AS active_guests,
    (SELECT COUNT(*) FROM guests WHERE check_in_date = CURDATE()) AS checkins_today,
    (SELECT COUNT(*) FROM guests WHERE is_foreign_national = 1 AND status = 'checked_in') AS foreign_nationals,
    (SELECT COUNT(*) FROM incidents WHERE DATE(created_at) = CURDATE()) AS incidents_today,
    (SELECT COUNT(*) FROM incidents WHERE status = 'open') AS open_incidents;

CREATE OR REPLACE VIEW v_district_stats AS
SELECT
    d.id AS district_id, d.name AS district_name,
    s.name AS state_name,
    COUNT(DISTINCT h.id) AS hotel_count,
    COUNT(DISTINCT CASE WHEN h.is_online = 1 THEN h.id END) AS hotels_online,
    COUNT(DISTINCT CASE WHEN g.status = 'checked_in' THEN g.id END) AS active_guests,
    COUNT(DISTINCT CASE WHEN g.check_in_date = CURDATE() THEN g.id END) AS checkins_today
FROM districts d
JOIN states s ON d.state_id = s.id
LEFT JOIN hotels h ON h.district_id = d.id AND h.is_active = 1
LEFT JOIN guests g ON g.hotel_id = h.id
GROUP BY d.id, d.name, s.name;

-- -----------------------------------------------------------------------------
-- STORED PROCEDURES
-- -----------------------------------------------------------------------------

DELIMITER //

CREATE PROCEDURE sp_match_blacklist(
    IN p_aadhaar_hash VARCHAR(64),
    IN p_passport_hash VARCHAR(64),
    IN p_mobile VARCHAR(20),
    IN p_full_name VARCHAR(255)
)
BEGIN
    SELECT b.*, w.full_name, w.source, w.severity AS watchlist_severity, w.crime_type
    FROM blacklists b
    LEFT JOIN watchlists w ON b.watchlist_id = w.id
    WHERE b.is_active = 1
      AND (b.expires_at IS NULL OR b.expires_at > NOW())
      AND (
          (p_aadhaar_hash IS NOT NULL AND b.identifier_hash = p_aadhaar_hash AND b.identifier_type = 'aadhaar')
          OR (p_passport_hash IS NOT NULL AND b.identifier_hash = p_passport_hash AND b.identifier_type = 'passport')
          OR (p_mobile IS NOT NULL AND b.identifier_hash = SHA2(p_mobile, 256) AND b.identifier_type = 'mobile')
      )
    ORDER BY b.severity DESC
    LIMIT 10;
END //

CREATE PROCEDURE sp_calculate_risk_score(IN p_guest_id CHAR(36))
BEGIN
    DECLARE v_score INT DEFAULT 0;
    DECLARE v_level VARCHAR(20) DEFAULT 'normal';

    SELECT COALESCE(SUM(risk_contribution), 0) INTO v_score
    FROM fraud_signals WHERE guest_id = p_guest_id AND is_resolved = 0;

    IF v_score >= 81 THEN SET v_level = 'critical';
    ELSEIF v_score >= 61 THEN SET v_level = 'high';
    ELSEIF v_score >= 31 THEN SET v_level = 'medium';
    ELSE SET v_level = 'normal';
    END IF;

    UPDATE guests SET risk_score = LEAST(v_score, 100), risk_level = v_level WHERE id = p_guest_id;

    SELECT v_score AS risk_score, v_level AS risk_level;
END //

CREATE PROCEDURE sp_hotel_heartbeat(IN p_hotel_id CHAR(36))
BEGIN
    UPDATE hotels SET is_online = 1, last_heartbeat = NOW() WHERE id = p_hotel_id;
END //

DELIMITER ;

-- -----------------------------------------------------------------------------
-- SEED DATA
-- -----------------------------------------------------------------------------

INSERT INTO tenants (id, name, slug) VALUES
('00000000-0000-0000-0000-000000000001', 'Default Tenant', 'default');

INSERT INTO countries (id, name, iso_code_2, iso_code_3, phone_code) VALUES
('00000000-0000-0000-0000-000000000101', 'India', 'IN', 'IND', '+91');

INSERT INTO states (id, country_id, name, code) VALUES
('00000000-0000-0000-0000-000000000201', '00000000-0000-0000-0000-000000000101', 'Rajasthan', 'RJ'),
('00000000-0000-0000-0000-000000000202', '00000000-0000-0000-0000-000000000101', 'Delhi', 'DL'),
('00000000-0000-0000-0000-000000000203', '00000000-0000-0000-0000-000000000101', 'Maharashtra', 'MH');

INSERT INTO roles (id, tenant_id, name, slug, level, is_system) VALUES
('00000000-0000-0000-0000-000000000301', NULL, 'Super Admin', 'super_admin', 100, 1),
('00000000-0000-0000-0000-000000000302', NULL, 'Police Command', 'police_command', 90, 1),
('00000000-0000-0000-0000-000000000303', NULL, 'Police Officer', 'police_officer', 80, 1),
('00000000-0000-0000-0000-000000000304', NULL, 'Hotel Owner', 'hotel_owner', 50, 1),
('00000000-0000-0000-0000-000000000305', NULL, 'Hotel Manager', 'hotel_manager', 40, 1),
('00000000-0000-0000-0000-000000000306', NULL, 'Receptionist', 'receptionist', 30, 1);

INSERT INTO permissions (id, name, slug, module) VALUES
(UUID(), 'View Dashboard', 'dashboard.view', 'dashboard'),
(UUID(), 'Manage Hotels', 'hotels.manage', 'hotels'),
(UUID(), 'View Hotels', 'hotels.view', 'hotels'),
(UUID(), 'Register Guest', 'guests.create', 'guests'),
(UUID(), 'View Guests', 'guests.view', 'guests'),
(UUID(), 'Edit Guests', 'guests.edit', 'guests'),
(UUID(), 'OCR Upload', 'ocr.upload', 'ocr'),
(UUID(), 'OCR Approve', 'ocr.approve', 'ocr'),
(UUID(), 'View Watchlist', 'watchlist.view', 'watchlist'),
(UUID(), 'Manage Watchlist', 'watchlist.manage', 'watchlist'),
(UUID(), 'View Incidents', 'incidents.view', 'incidents'),
(UUID(), 'Manage Incidents', 'incidents.manage', 'incidents'),
(UUID(), 'View Analytics', 'analytics.view', 'analytics'),
(UUID(), 'Export Reports', 'reports.export', 'reports'),
(UUID(), 'Manage Users', 'users.manage', 'users'),
(UUID(), 'View Audit Logs', 'audit.view', 'audit'),
(UUID(), 'AI Search', 'ai.search', 'ai'),
(UUID(), 'Command Centre', 'command.view', 'command');

-- Super admin user (password: Admin@123 - bcrypt hash)
INSERT INTO users (id, tenant_id, role_id, email, password_hash, first_name, last_name, is_active, is_verified) VALUES
('00000000-0000-0000-0000-000000000401', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000301',
 'admin@hms.gov.in', '$2b$12$cJv/LBxW1ZboMtoGgIyDXOi8eNRgPAtNRQSEDTzAZl0z.cZ78UJFO', 'System', 'Administrator', 1, 1);

SET FOREIGN_KEY_CHECKS = 1;
