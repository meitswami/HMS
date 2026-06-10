# HMS e-Register — System Architecture

## Overview

**AI Hotel Register & Police Intelligence Command Centre** is a multi-tenant, microservice-ready platform for digitizing hotel guest registers, verifying identities, matching watchlists, and providing real-time police command centre monitoring.

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         CLIENT LAYER                                     │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐                  │
│  │ Police CMD   │  │ Hotel Portal │  │ Mobile App   │                  │
│  │ (Next.js 15) │  │ (Next.js 15) │  │ (Future)     │                  │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘                  │
└─────────┼─────────────────┼─────────────────┼────────────────────────────┘
          │                 │                 │
          ▼                 ▼                 ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                      API GATEWAY / LOAD BALANCER                         │
└─────────────────────────────┬───────────────────────────────────────────┘
                              │
          ┌───────────────────┼───────────────────┐
          ▼                   ▼                   ▼
┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐
│  NestJS API     │ │  WebSocket      │ │  OCR Service    │
│  (REST + JWT)   │ │  (Socket.io)    │ │  (FastAPI/Py)   │
│  Port 4000      │ │  Real-time      │ │  Port 5000      │
└────────┬────────┘ └────────┬────────┘ └────────┬────────┘
         │                   │                   │
         ▼                   ▼                   ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                        DATA & INFRASTRUCTURE                             │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐              │
│  │ MySQL 8  │  │  Redis   │  │  MinIO   │  │ LLM API  │              │
│  │ Primary  │  │ Cache/   │  │ S3 Docs  │  │ OpenAI   │              │
│  │ Database │  │ PubSub   │  │ Storage  │  │          │              │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘              │
└─────────────────────────────────────────────────────────────────────────┘
```

## Module Map

| Module | Backend Path | Description |
|--------|-------------|-------------|
| Hotel Management | `/api/v1/hotels` | Registration, branches, users, shifts |
| Digital Register | `/api/v1/guests` | Guest check-in/out, documents |
| OCR Digitization | `/api/v1/ocr` | Register scan upload & processing |
| Aadhaar QR | OCR Service `/api/aadhaar/decode-qr` | Secure QR verification |
| Watchlist | `/api/v1/watchlist` | Blacklist CRUD & matching |
| Incidents | `/api/v1/incidents` | Alert lifecycle management |
| Command Centre | `/api/v1/dashboard` | Live stats, district views |
| AI Search | `/api/v1/ai/search` | Natural language queries |
| Analytics | `/api/v1/analytics` | Reports & exports |
| Auth | `/api/v1/auth` | JWT, MFA, refresh tokens |

## Security Architecture

- **Authentication**: JWT (15min) + Refresh Tokens (7d)
- **Authorization**: RBAC with 6 role levels
- **MFA**: TOTP (Google Authenticator compatible)
- **Encryption**: AES-256-GCM for PII at rest
- **Hashing**: SHA-256 for blacklist matching
- **Audit**: Tamper-proof checksum chain
- **Rate Limiting**: 100 req/min per IP
- **Transport**: HTTPS/TLS required in production

## Multi-Tenancy

- Tenant isolation via `tenant_id` on all core tables
- Row-level filtering in all queries
- Configurable per-tenant settings (JSON)

## Scalability

- Stateless API servers (horizontal scaling)
- Redis for session/cache/pub-sub
- OCR service independently scalable
- MinIO for distributed object storage
- WebSocket via Socket.io with Redis adapter (production)

## OCR Pipeline

```
Upload → MinIO Storage → OCR Service
  → Table Detection (OpenCV)
  → Text Extraction (PaddleOCR/Tesseract/EasyOCR)
  → Row/Column Mapping
  → Confidence Scoring
  → WebSocket Progress → Editable Grid UI
  → Operator Review → Approve/Reject → Import to Register
```

## Face Recognition Pipeline

```
Guest Photo → Face Detection (OpenCV/YOLO)
  → Embedding Generation (ArcFace)
  → Vector Storage (face_embeddings)
  → Similarity Search
  → Match Alert if threshold exceeded
```

## Alert Flow

```
Guest Registration → Identity Hash → Watchlist Match
  → Incident Created → Multi-channel Dispatch
    ├── Dashboard (WebSocket)
    ├── SMS (Twilio)
    ├── Email (SMTP)
    ├── WhatsApp (API)
    └── Push (FCM)
```
