-- Portal separation: hotel registration approval + police data access requests

ALTER TABLE hotels
  ADD COLUMN IF NOT EXISTS registration_status ENUM('pending','approved','rejected') NOT NULL DEFAULT 'approved' AFTER is_active,
  ADD COLUMN IF NOT EXISTS approved_by CHAR(36) NULL AFTER registration_status,
  ADD COLUMN IF NOT EXISTS approved_at TIMESTAMP NULL AFTER approved_by,
  ADD COLUMN IF NOT EXISTS rejection_reason TEXT NULL AFTER approved_at,
  ADD COLUMN IF NOT EXISTS registered_by_user_id CHAR(36) NULL AFTER rejection_reason;

CREATE TABLE IF NOT EXISTS data_access_requests (
    id              CHAR(36)     NOT NULL DEFAULT (UUID()),
    tenant_id       CHAR(36)     NOT NULL,
    requested_by    CHAR(36)     NOT NULL,
    hotel_ids       JSON         NOT NULL,
    date_from       DATE         NOT NULL,
    date_to         DATE         NOT NULL,
    time_from       TIME         NULL,
    time_to         TIME         NULL,
    reason          TEXT         NOT NULL,
    status          ENUM('pending','approved','rejected','expired') NOT NULL DEFAULT 'pending',
    reviewed_by     CHAR(36)     NULL,
    reviewed_at     TIMESTAMP    NULL,
    review_notes    TEXT         NULL,
    created_at      TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    KEY idx_data_requests_status (status),
    KEY idx_data_requests_requester (requested_by),
    CONSTRAINT fk_data_requests_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
