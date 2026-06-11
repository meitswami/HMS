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
  await conn.end();

  console.log('Database schema applied successfully.');
  console.log('Note: seed data uses INSERT IGNORE — existing rows are kept.');
}

migrate().catch((err) => {
  console.error('Migration failed:', err.message);
  process.exit(1);
});
