#!/usr/bin/env bash
# HMS e-Register — AWS EC2 production start (no Docker for apps)
set -euo pipefail
cd "$(dirname "$0")/.."

if [ ! -f .env ]; then
  echo "Copy deploy/env/ec2-native.env.example to .env and configure first."
  exit 1
fi

# Next.js bakes NEXT_PUBLIC_* at build time
if [ -f apps/web/.env.production ]; then
  echo "Using apps/web/.env.production for frontend build"
elif [ ! -f apps/web/.env.production ]; then
  echo "Tip: copy apps/web/.env.production.example to apps/web/.env.production"
fi

npm run build

# Activate Python venv if present
if [ -d services/ocr-service/.venv ]; then
  export PATH="$(pwd)/services/ocr-service/.venv/bin:$PATH"
fi

pm2 delete ecosystem 2>/dev/null || true
pm2 start deploy/pm2/ecosystem.config.cjs
pm2 save

echo "HMS running via PM2. Check: pm2 status"
