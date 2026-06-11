#!/usr/bin/env bash
# HMS e-Register — AWS EC2 native install for Amazon Linux 2023
# Usage: chmod +x deploy/ec2-native/install-amazon-linux.sh && ./deploy/ec2-native/install-amazon-linux.sh

set -euo pipefail

echo "=== HMS e-Register EC2 Native Installer (Amazon Linux 2023) ==="

# System packages
sudo dnf update -y
sudo dnf install -y git nginx python3 python3-pip python3-devel gcc gcc-c++ make

# Node.js 20 (NodeSource)
if ! command -v node &>/dev/null || [[ "$(node -v | cut -d. -f1 | tr -d v)" -lt 20 ]]; then
  curl -fsSL https://rpm.nodesource.com/setup_20.x | sudo bash -
  sudo dnf install -y nodejs
fi

# PM2
sudo npm install -g pm2

# Tesseract (lightweight OCR — optional but recommended on small instances)
sudo dnf install -y tesseract tesseract-langpack-eng || true

# App dependencies
npm ci
npm run build

# Python OCR service
python3 -m venv services/ocr-service/.venv
source services/ocr-service/.venv/bin/activate
pip install --upgrade pip
pip install -r services/ocr-service/requirements-lite.txt
deactivate

# Database (requires .env configured)
if [ -f .env ]; then
  node database/migrate.js
fi

# PM2 startup on reboot
pm2 startup systemd -u "$USER" --hp "$HOME" | tail -1 | bash || true

echo ""
echo "=== Install complete ==="
echo "1. Edit .env (see deploy/env/ec2-native.env.example)"
echo "2. Start: npm run start:ec2"
echo "3. Nginx: see docs/DEPLOYMENT.md (Amazon Linux uses conf.d, not sites-available)"
echo "4. SSL:   sudo dnf install -y certbot python3-certbot-nginx && sudo certbot --nginx -d your-domain.gov.in"
