/**
 * Run database/schema.sql against MySQL/MariaDB (Windows-friendly, no mysql CLI needed).
 * Usage: node database/migrate.js
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

function prepareSql(raw) {
  return raw
    // MariaDB: expression defaults may fail on older hosts
    .replace(/DEFAULT \(UUID\(\)\)/gi, '')
    // Reserved keyword fix (already renamed in schema, safety net)
    .replace(/\brow_number\b/g, 'row_num')
    // mysql CLI DELIMITER is not valid SQL — strip for node mysql2
    .replace(/^DELIMITER .+$/gm, '')
    .replace(/END \/\//g, 'END;')
    // Idempotent procedure deploy
    .replace(/CREATE PROCEDURE/g, 'DROP PROCEDURE IF EXISTS sp_placeholder;\nCREATE PROCEDURE');
}

// Fix procedure drops individually (placeholder approach is wrong)
function prepareSqlFixed(raw) {
  let sql = raw
    .replace(/DEFAULT \(UUID\(\)\)/gi, '')
    .replace(/^DELIMITER .+$/gm, '')
    .replace(/END \/\//g, 'END;');

  const procs = ['sp_match_blacklist', 'sp_calculate_risk_score', 'sp_hotel_heartbeat'];
  for (const proc of procs) {
    sql = sql.replace(
      new RegExp(`CREATE PROCEDURE ${proc}`, 'g'),
      `DROP PROCEDURE IF EXISTS ${proc};\nCREATE PROCEDURE ${proc}`,
    );
  }
  return sql;
}

async function runPortalMigrations(conn) {
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
      console.log('OK:', stmt.slice(0, 55) + '...');
    } catch (e) {
      if (e.code === 'ER_DUP_FIELDNAME') {
        console.log('SKIP (exists):', stmt.slice(0, 45) + '...');
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
}

async function migrate() {
  loadEnv();

  const config = {
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || '3306', 10),
    user: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    multipleStatements: true,
    ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : undefined,
  };

  console.log(`Connecting to ${config.host}...`);
  const conn = await mysql.createConnection(config);

  const sql = prepareSqlFixed(fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8'));
  console.log('Running schema.sql (safe to re-run)...');
  await conn.query(sql);
  console.log('Running portal migrations (hotels approval + data_access_requests)...');
  await runPortalMigrations(conn);
  await conn.end();

  console.log('Database schema applied successfully.');
  console.log('Note: seed data uses INSERT IGNORE — existing rows are kept.');
}

migrate().catch((err) => {
  console.error('Migration failed:', err.message);
  process.exit(1);
});
