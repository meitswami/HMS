#!/usr/bin/env bash
# HMS e-Register — pull latest code and restart (used by GitHub Actions or manual deploy)
set -euo pipefail

cd "$(dirname "$0")/.."

BRANCH="${DEPLOY_BRANCH:-main}"

echo "=== HMS deploy: branch ${BRANCH} ==="

git fetch origin
git checkout "$BRANCH"
git pull origin "$BRANCH"

npm ci
npm run build

# Refresh OCR venv if present
if [ -d services/ocr-service/.venv ]; then
  source services/ocr-service/.venv/bin/activate
  pip install -r services/ocr-service/requirements-lite.txt -q
  deactivate
fi

# Apply DB migrations (safe to re-run)
if [ -f .env ]; then
  node database/migrate.js
fi

pm2 reload deploy/pm2/ecosystem.config.cjs --update-env || npm run start:ec2
pm2 save

echo "=== Deploy complete ==="
pm2 status
