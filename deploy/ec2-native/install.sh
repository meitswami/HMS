#!/usr/bin/env bash
# HMS e-Register — AWS EC2 native install (no Docker for app services)
# Tested on: Ubuntu 22.04 / Amazon Linux 2023
# Usage: chmod +x deploy/ec2-native/install.sh && ./deploy/ec2-native/install.sh

set -euo pipefail

echo "=== HMS e-Register EC2 Native Installer ==="

# Node.js 20
if ! command -v node &>/dev/null; then
  curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
  sudo apt-get install -y nodejs
fi

# Python 3.11 + venv
sudo apt-get update
sudo apt-get install -y python3 python3-pip python3-venv nginx

# PM2
sudo npm install -g pm2

# App dependencies
npm ci
npm run build

# Python OCR service
python3 -m venv services/ocr-service/.venv
source services/ocr-service/.venv/bin/activate
pip install -r services/ocr-service/requirements.txt
deactivate

# Database (requires .env configured)
if [ -f .env ]; then
  node database/migrate.js
fi

echo ""
echo "=== Install complete ==="
echo "1. Edit .env (see deploy/env/ec2-native.env.example)"
echo "2. Start: npm run start:ec2"
echo "3. Nginx: sudo cp deploy/ec2-native/nginx-hms.conf /etc/nginx/sites-available/hms"
echo "4. SSL:   sudo certbot --nginx -d your-domain.gov.in"
