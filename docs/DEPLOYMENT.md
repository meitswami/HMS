# HMS e-Register — Deployment Guide

This project supports **three deployment modes**. Docker is **optional**.

| Mode | Environment | Docker | Best for |
|------|-------------|--------|----------|
| **A** | Windows 11 offline | Optional | Local development |
| **B** | AWS EC2 Linux online | No | **Limited RAM** (t2.small / t3.small) |
| **C** | AWS EC2 Linux online | Yes | Full isolated stack |

## Feature availability by mode

| Feature | Windows (no Docker) | EC2 native | EC2 Docker |
|---------|---------------------|------------|------------|
| Login, RBAC, MFA | Yes | Yes | Yes |
| Guest register | Yes | Yes | Yes |
| Dashboard, alerts | Yes | Yes | Yes |
| Watchlist matching | Yes | Yes | Yes |
| File uploads / OCR storage | Needs MinIO or S3 | AWS S3 or MinIO | MinIO container |
| OCR service | Run locally (Python) | PM2 / systemd | Container |
| Redis | Optional (not used yet) | Optional | Container |

---

## Mode A — Windows 11 (Offline / Local)

### Prerequisites
- Node.js 20+
- Python 3.11+ (for OCR)
- MySQL access (remote Hostinger or local)
- Docker Desktop — **optional** (only for MinIO/Redis)

### Quick start (no Docker)

```powershell
cd C:\Users\PC-2\Documents\GitHub\HMS
copy deploy\env\windows.env.example .env
# Edit .env with DB password

node database\migrate.js
npm install
npm run dev
```

Or use the helper script:

```powershell
.\scripts\start-windows.ps1
```

### With Docker (full local storage)

Requires **Docker Desktop running**:

```powershell
.\scripts\start-windows.ps1 -WithDocker
```

This starts MinIO + Redis, then API + Web.

### OCR on Windows (separate terminal)

```powershell
cd services\ocr-service
python -m venv .venv
.\.venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload --port 5000
```

| URL | Address |
|-----|---------|
| Frontend | http://localhost:3000 |
| API | http://localhost:4000/api/v1 |
| Swagger | http://localhost:4000/docs |

---

## Mode B — AWS EC2 Linux (Online, **without Docker**) — Recommended for limited resources

Runs Node.js + Python directly via **PM2**. Uses **AWS S3** for file storage (no MinIO container).

### Recommended EC2 size
- **Minimum:** t3.small (2 GB RAM) — API + Web + lightweight OCR
- **Better:** t3.medium (4 GB RAM) — if using PaddleOCR

### One-time setup

```bash
git clone <repo-url> && cd HMS
cp deploy/env/ec2-native.env.example .env
nano .env   # set DB, JWT secrets, AWS S3 credentials, domain

chmod +x deploy/ec2-native/install.sh scripts/start-ec2-native.sh
./deploy/ec2-native/install.sh
```

### Configure `.env` for AWS S3 (no MinIO)

```env
S3_PROVIDER=aws
S3_REGION=ap-south-1
S3_BUCKET=hms-documents-prod
S3_ACCESS_KEY=AKIA...
S3_SECRET_KEY=...
```

Create the S3 bucket in AWS Console and attach an IAM policy with `s3:PutObject`, `s3:GetObject`, `s3:DeleteObject`.

### Start / restart

```bash
npm run start:ec2
# or
./scripts/start-ec2-native.sh
pm2 status
pm2 logs
```

### Nginx + HTTPS

```bash
sudo cp deploy/ec2-native/nginx-hms.conf /etc/nginx/sites-available/hms
sudo ln -s /etc/nginx/sites-available/hms /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
sudo certbot --nginx -d your-domain.gov.in
```

### Memory tips (low-resource EC2)
- Use `tesseract` instead of `paddle` for OCR: `OCR_DEFAULT_ENGINE=tesseract`
- Run only API + Web if OCR not needed immediately
- Use RDS/external MySQL — don't run MySQL on same small instance
- Enable swap: `sudo fallocate -l 2G /swapfile && sudo chmod 600 /swapfile && sudo mkswap /swapfile && sudo swapon /swapfile`

---

## Mode C — AWS EC2 Linux (Online, **with Docker**)

Full stack in containers. Needs **more RAM** (t3.medium+ recommended).

### Prerequisites on EC2

```bash
sudo apt update && sudo apt install -y docker.io docker-compose-plugin
sudo usermod -aG docker $USER
# Log out and back in
```

### Deploy

```bash
git clone <repo-url> && cd HMS
cp deploy/env/ec2-docker.env.example .env
nano .env

node database/migrate.js
docker compose up -d --build
```

### Infrastructure only (hybrid)

Run MinIO + Redis in Docker, apps natively (saves RAM vs full Docker):

```bash
docker compose -f docker-compose.infra.yml up -d
npm run build
npm run start:ec2
```

---

## Database migration (all modes)

```bash
# Linux / macOS
node database/migrate.js

# Windows PowerShell
node database\migrate.js
```

Safe to re-run — seed data uses `INSERT IGNORE`.

---

## NPM scripts reference

| Script | Description |
|--------|-------------|
| `npm run dev` | Windows/local dev (API + Web) |
| `npm run build` | Build API + Web for production |
| `npm run db:migrate` | Apply database schema |
| `npm run infra:docker` | Start MinIO + Redis only |
| `npm run start:ec2` | Production start via PM2 (EC2 native) |
| `npm run docker:up` | Full Docker stack |
| `npm run docker:down` | Stop Docker stack |

---

## Environment templates

| File | Use case |
|------|----------|
| `deploy/env/windows.env.example` | Windows 11 local |
| `deploy/env/ec2-native.env.example` | EC2 without Docker |
| `deploy/env/ec2-docker.env.example` | EC2 with Docker |
| `.env.example` | General reference |

---

## Default admin login

- Email: `admin@hms.gov.in`
- Password: `Admin@123` — **change immediately in production**

---

## Health checks

```bash
curl http://localhost:4000/api/v1/auth/login   # POST with credentials
curl http://localhost:5000/health               # OCR service
pm2 status                                    # EC2 native
docker compose ps                             # Docker mode
```
