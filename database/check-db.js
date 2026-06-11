/**
 * Verify required HMS tables exist. Usage: node database/check-db.js
 */
const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');

const REQUIRED_TABLES = [
  'users',
  'roles',
  'hotels',
  'guests',
  'watchlists',
  'data_access_requests',
  'incidents',
];

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
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || '3306', 10),
    user: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : undefined,
  });

  console.log(`Database: ${process.env.DB_DATABASE} @ ${process.env.DB_HOST}\n`);
  let missing = 0;

  for (const table of REQUIRED_TABLES) {
    const [rows] = await conn.query('SHOW TABLES LIKE ?', [table]);
    if (rows.length) {
      const [[{ c }]] = await conn.query(`SELECT COUNT(*) AS c FROM \`${table}\``);
      console.log(`OK   ${table} (${c} rows)`);
    } else {
      console.log(`MISSING  ${table}`);
      missing += 1;
    }
  }

  const [hotelCols] = await conn.query(
    "SHOW COLUMNS FROM hotels LIKE 'registration_status'",
  );
  if (!hotelCols.length) {
    console.log('MISSING  hotels.registration_status column — run: node database/migrate-portals.js');
    missing += 1;
  }

  await conn.end();

  if (missing) {
    console.log('\nFix: node database/migrate.js && node database/seed-demo.js');
    process.exit(1);
  }
  console.log('\nAll required tables present.');
}

main().catch((err) => {
  console.error('Check failed:', err.message);
  process.exit(1);
});
