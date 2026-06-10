# AI Hotel Register & Police Intelligence Command Centre

**HMS e-Register** — Production-grade AI-powered Hotel Visitor Intelligence Management System replacing manual hotel guest registers with digital intelligence.

## Features

- **Digital Register** — Complete guest check-in/out with identity documents
- **AI OCR Digitization** — PaddleOCR, Tesseract, EasyOCR register scanning
- **Aadhaar QR Verification** — Secure QR decode with mismatch detection
- **Blacklist Matching** — Police, absconder, wanted, terror watchlists
- **Real-time Alerts** — SMS, Email, WhatsApp, Push, WebSocket
- **Police Command Centre** — Live dashboards, district stats, heatmaps
- **AI Fraud Detection** — Risk scoring, duplicate identity detection
- **Face Recognition** — Embedding-based similarity search
- **AI Search** — Natural language guest queries
- **Multi-tenant RBAC** — JWT + MFA + 6 role levels

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 15, React, TailwindCSS, TypeScript |
| Backend | NestJS, REST API, WebSocket (Socket.io) |
| Database | MySQL 8 |
| Storage | MinIO / S3 |
| OCR/AI | Python FastAPI, PaddleOCR, OpenCV |
| Auth | JWT, Refresh Tokens, TOTP MFA |

## Project Structure

```
HMS/
├── apps/
│   ├── api/          # NestJS backend
│   └── web/          # Next.js 15 frontend
├── packages/
│   └── shared/       # Shared types & constants
├── services/
│   └── ocr-service/  # Python OCR microservice
├── database/
│   └── schema.sql    # Complete MySQL schema
├── docker/           # Dockerfiles
├── docs/             # Architecture, security, deployment
└── docker-compose.yml
```

## Quick Start

```bash
# 1. Configure environment
cp .env.example .env

# 2. Initialize database
mysql -h <host> -u <user> -p <database> < database/schema.sql

# 3. Install dependencies
npm install

# 4. Start infrastructure
docker compose up -d minio redis

# 5. Run development
npm run dev
```

| Service | URL |
|---------|-----|
| Frontend | http://localhost:3000 |
| API | http://localhost:4000/api/v1 |
| Swagger | http://localhost:4000/docs |
| OCR Service | http://localhost:5000 |

**Default login:** `admin@hms.gov.in` / `Admin@123`

## Documentation

- [Architecture](docs/ARCHITECTURE.md)
- [Deployment Guide](docs/DEPLOYMENT.md)
- [Security](docs/SECURITY.md)
- [API Reference](docs/API.md)
- [Database ER Diagram](docs/ER-DIAGRAM.md)
- [Testing](docs/TESTING.md)
- [Production Checklist](docs/PRODUCTION-CHECKLIST.md)

## License

Government e-Governance Project — Proprietary
