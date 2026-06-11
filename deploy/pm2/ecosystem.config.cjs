/**
 * PM2 process manager — recommended for AWS EC2 without full Docker stack.
 * Usage (from repo root):
 *   npm run build
 *   pm2 start deploy/pm2/ecosystem.config.cjs
 *   pm2 save && pm2 startup
 */
const path = require('path');
const root = path.join(__dirname, '../..');

module.exports = {
  apps: [
    {
      name: 'hms-api',
      cwd: root,
      script: 'apps/api/dist/main.js',
      instances: 1,
      exec_mode: 'fork',
      max_memory_restart: '512M',
      env: {
        NODE_ENV: 'production',
      },
    },
    {
      name: 'hms-web',
      cwd: path.join(root, 'apps/web'),
      script: 'node_modules/next/dist/bin/next',
      args: 'start -p 3000',
      instances: 1,
      exec_mode: 'fork',
      max_memory_restart: '512M',
      env: {
        NODE_ENV: 'production',
      },
    },
    {
      name: 'hms-ocr',
      cwd: path.join(root, 'services/ocr-service'),
      script: '.venv/bin/uvicorn',
      args: 'main:app --host 0.0.0.0 --port 5000 --workers 1',
      instances: 1,
      exec_mode: 'fork',
      max_memory_restart: '1G',
      env: {
        PYTHONUNBUFFERED: '1',
      },
    },
  ],
};
