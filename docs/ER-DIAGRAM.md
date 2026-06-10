# HMS e-Register — Database ER Diagram

## Entity Relationship Diagram

```mermaid
erDiagram
    tenants ||--o{ users : has
    tenants ||--o{ hotels : has
    roles ||--o{ users : assigns
    roles ||--o{ role_permissions : has
    permissions ||--o{ role_permissions : grants

    hotels ||--o{ hotel_branches : has
    hotels ||--o{ hotel_users : employs
    hotels ||--o{ guests : registers
    hotels ||--o{ ocr_scans : uploads
    hotels ||--o{ incidents : triggers

    users ||--o{ refresh_tokens : owns
    users ||--o{ hotel_users : works_at
    users ||--o{ audit_logs : performs

    guests ||--o{ guest_documents : has
    guests ||--o{ guest_photos : has
    guests ||--o{ vehicles : owns
    guests ||--o{ fraud_signals : generates
    guests ||--o{ aadhaar_verifications : verified_by
    guests ||--o{ face_embeddings : has
    guests ||--o{ foreign_national_records : tracks

    ocr_scans ||--o{ ocr_pages : contains
    ocr_pages ||--o{ ocr_rows : contains
    ocr_rows ||--o{ ocr_fields : has

    watchlists ||--o{ blacklists : indexes
    watchlists ||--o{ face_embeddings : has
    watchlists ||--o{ incidents : matches

    incidents ||--o{ alerts : dispatches

    states ||--o{ districts : contains
    countries ||--o{ states : contains
    districts ||--o{ hotels : located_in

    tenants {
        uuid id PK
        string name
        string slug UK
        json settings
    }

    users {
        uuid id PK
        uuid tenant_id FK
        uuid role_id FK
        string email UK
        string password_hash
        boolean mfa_enabled
    }

    hotels {
        uuid id PK
        uuid tenant_id FK
        string name
        string license_number UK
        decimal latitude
        decimal longitude
        boolean is_online
    }

    guests {
        uuid id PK
        uuid hotel_id FK
        string full_name
        string aadhaar_hash
        enum risk_level
        enum status
        enum aadhaar_verified
    }

    watchlists {
        uuid id PK
        enum source
        string full_name
        string aadhaar_hash
        enum severity
    }

    incidents {
        uuid id PK
        uuid guest_id FK
        uuid watchlist_id FK
        enum incident_type
        enum severity
        enum status
    }

    ocr_scans {
        uuid id PK
        uuid hotel_id FK
        enum status
        enum ocr_engine
        decimal overall_confidence
    }

    audit_logs {
        uuid id PK
        string action
        string checksum
        string previous_checksum
    }

    face_embeddings {
        uuid id PK
        blob embedding
        string model_version
    }
```

## Key Indexes

- `guests.aadhaar_hash` — Blacklist matching
- `guests.mobile_number` — Duplicate detection
- `guests.check_in_date` — Analytics queries
- `blacklists.identifier_hash` — Fast exact match
- `audit_logs.created_at` — Audit trail queries
- `hotels.is_online` — Dashboard live count

## Stored Procedures

- `sp_match_blacklist` — Multi-identifier watchlist matching
- `sp_calculate_risk_score` — Aggregate fraud signals into risk score
- `sp_hotel_heartbeat` — Update hotel online status

## Views

- `v_active_guests` — Currently checked-in guests with location
- `v_dashboard_stats` — Real-time command centre metrics
- `v_district_stats` — District-wise hotel and guest counts
