/**
 * Apply portal/approval migration. Usage: node database/migrate-portals.js
 */
const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');

function loadEnv() {
  const envPath = path.join(__dirname, '..', '.env');
  if (!fs.existsSync(envPath)) return;
  for (const line of fs.readFileSync(envPath, 'utf8').split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const idx = trimmed.indexOf('=');
    if (idx === -1) continue;
    const key = trimmed.slice(0, idx).trim();
    const val = trimmed.slice(idx + 1).trim();
    if (!process.env[key]) process.env[key] = val;
  }
}

async function main() {
  loadEnv();
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306', 10),
    user: process.env.DB_USERNAME || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_DATABASE || 'hms',
    multipleStatements: true,
  });

  const alterStatements = [
    `ALTER TABLE hotels ADD COLUMN registration_status ENUM('pending','approved','rejected') NOT NULL DEFAULT 'approved' AFTER is_active`,
    `ALTER TABLE hotels ADD COLUMN approved_by CHAR(36) NULL AFTER registration_status`,
    `ALTER TABLE hotels ADD COLUMN approved_at TIMESTAMP NULL AFTER approved_by`,
    `ALTER TABLE hotels ADD COLUMN rejection_reason TEXT NULL AFTER approved_at`,
    `ALTER TABLE hotels ADD COLUMN registered_by_user_id CHAR(36) NULL AFTER rejection_reason`,
  ];

  for (const stmt of alterStatements) {
    try {
      await conn.query(stmt);
      console.log('OK:', stmt.slice(0, 60) + '...');
    } catch (e) {
      if (e.code === 'ER_DUP_FIELDNAME') {
        console.log('SKIP (exists):', stmt.slice(0, 50) + '...');
      } else {
        throw e;
      }
    }
  }

  const tableSql = fs.readFileSync(path.join(__dirname, 'migrations', '001_portals_and_approval.sql'), 'utf8');
  const createPart = tableSql.split('CREATE TABLE IF NOT EXISTS data_access_requests')[1];
  if (createPart) {
    const createStmt = 'CREATE TABLE IF NOT EXISTS data_access_requests' + createPart.replace(/DEFAULT \(UUID\(\)\)/gi, '');
    await conn.query(createStmt);
    console.log('OK: data_access_requests table');
  }

  await conn.end();
  console.log('Portal migration complete.');
}

main().catch((e) => {
  console.error(e.message);
  process.exit(1);
});
