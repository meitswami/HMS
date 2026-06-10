# HMS e-Register — Deployment Guide

## Prerequisites

- Node.js 20+
- Python 3.11+
- Docker & Docker Compose
- MySQL 8.0 (remote or local)
- MinIO or AWS S3

## Quick Start (Development)

### 1. Clone and Configure

```bash
git clone <repo-url>
cd HMS
cp .env.example .env
# Edit .env with your MySQL credentials and secrets
```

### 2. Initialize Database

```bash
mysql -h auth-db1274.hstgr.io -u u334425891_hms -p u334425891_hms < database/schema.sql
```

### 3. Start Infrastructure

```bash
docker compose up -d minio redis
```

### 4. Install Dependencies

```bash
npm install
cd services/ocr-service && pip install -r requirements.txt
```

### 5. Run Services

```bash
# Terminal 1: API
npm run dev:api

# Terminal 2: Frontend
npm run dev:web

# Terminal 3: OCR Service
cd services/ocr-service && uvicorn main:app --reload --port 5000
```

### 6. Access

| Service | URL |
|---------|-----|
| Frontend | http://localhost:3000 |
| API | http://localhost:4000/api/v1 |
| Swagger | http://localhost:4000/docs |
| MinIO Console | http://localhost:9001 |
| OCR Service | http://localhost:5000/health |

### Default Admin Login

- Email: `admin@hms.gov.in`
- Password: `Admin@123` (change after first login)

## Production Deployment (Docker)

```bash
docker compose up -d --build
```

## Environment Variables

See `.env.example` for all configuration options. Critical production settings:

| Variable | Description |
|----------|-------------|
| `JWT_SECRET` | 256-bit random string |
| `ENCRYPTION_KEY` | 32-byte AES key for PII |
| `DB_*` | MySQL connection |
| `S3_*` | Object storage |
| `OPENAI_API_KEY` | LLM for AI search |

## SSL/TLS

Place reverse proxy (Nginx/Caddy) in front with Let's Encrypt:

```nginx
server {
    listen 443 ssl;
    server_name hms.example.gov.in;

    location / {
        proxy_pass http://localhost:3000;
    }
    location /api/ {
        proxy_pass http://localhost:4000;
    }
    location /ws/ {
        proxy_pass http://localhost:4000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
```

## Database Backups

```bash
mysqldump -h $DB_HOST -u $DB_USERNAME -p $DB_DATABASE > backup_$(date +%Y%m%d).sql
```

## Health Checks

- API: `GET /api/v1/auth/me` (with token)
- OCR: `GET /health`
- MinIO: `GET /minio/health/live`

## Monitoring

Recommended stack:
- **Logs**: ELK or Loki
- **Metrics**: Prometheus + Grafana
- **APM**: Sentry for error tracking
- **Uptime**: UptimeRobot or Pingdom
