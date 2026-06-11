/**
 * HMS e-Register — Portable Windows Launcher
 * Starts embedded MariaDB, API, and Web; opens browser.
 */
const { spawn, execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const http = require('http');
const net = require('net');

const ROOT = process.env.HMS_ROOT || path.dirname(process.execPath);
const NODE = path.join(ROOT, 'runtime', 'node.exe');
const DATA_DIR = path.join(ROOT, 'data');
const MYSQL_DATA = path.join(DATA_DIR, 'mysql');
const MARIADB_DIR = path.join(ROOT, 'mariadb');
const API_DIR = path.join(ROOT, 'api');
const WEB_DIR = path.join(ROOT, 'web');
const ENV_FILE = path.join(ROOT, '.env');

const children = [];

function log(msg) {
  const ts = new Date().toLocaleTimeString();
  console.log(`[${ts}] ${msg}`);
}

function loadEnv() {
  if (!fs.existsSync(ENV_FILE)) return;
  for (const line of fs.readFileSync(ENV_FILE, 'utf8').split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const idx = trimmed.indexOf('=');
    if (idx === -1) continue;
    const key = trimmed.slice(0, idx).trim();
    const val = trimmed.slice(idx + 1).trim();
    if (!process.env[key]) process.env[key] = val;
  }
}

function waitForPort(port, host = '127.0.0.1', timeoutMs = 60000) {
  return new Promise((resolve, reject) => {
    const start = Date.now();
    const check = () => {
      const sock = net.createConnection({ port, host }, () => {
        sock.end();
        resolve();
      });
      sock.on('error', () => {
        if (Date.now() - start > timeoutMs) reject(new Error(`Port ${port} not ready`));
        else setTimeout(check, 500);
      });
    };
    check();
  });
}

function waitForHttp(url, timeoutMs = 120000) {
  return new Promise((resolve, reject) => {
    const start = Date.now();
    const check = () => {
      http.get(url, (res) => {
        res.resume();
        resolve();
      }).on('error', () => {
        if (Date.now() - start > timeoutMs) reject(new Error(`${url} not ready`));
        else setTimeout(check, 800);
      });
    };
    check();
  });
}

function spawnProc(name, cmd, args, opts = {}) {
  log(`Starting ${name}...`);
  const child = spawn(cmd, args, {
    cwd: opts.cwd || ROOT,
    env: { ...process.env, ...opts.env },
    stdio: opts.stdio || 'pipe',
    windowsHide: true,
    detached: false,
  });
  child.stdout?.on('data', (d) => process.stdout.write(`[${name}] ${d}`));
  child.stderr?.on('data', (d) => process.stderr.write(`[${name}] ${d}`));
  child.on('exit', (code) => {
    if (code !== 0 && code !== null) log(`${name} exited with code ${code}`);
  });
  children.push(child);
  return child;
}

function initMariaDB() {
  const mysqld = path.join(MARIADB_DIR, 'bin', 'mysqld.exe');
  if (!fs.existsSync(mysqld)) {
    log('MariaDB not bundled — using external DB from .env');
    return false;
  }

  fs.mkdirSync(MYSQL_DATA, { recursive: true });
  const marker = path.join(MYSQL_DATA, '.initialized');

  if (!fs.existsSync(marker)) {
    log('Initializing MariaDB (first run)...');
    const initArgs = [
      `--basedir=${MARIADB_DIR}`,
      `--datadir=${MYSQL_DATA}`,
      '--initialize-insecure',
    ];
    execSync(`"${mysqld}" ${initArgs.map((a) => `"${a}"`).join(' ')}`, {
      cwd: ROOT,
      stdio: 'inherit',
    });
    fs.writeFileSync(marker, new Date().toISOString());
  }

  const myIni = path.join(DATA_DIR, 'my.ini');
  const iniContent = [
    '[mysqld]',
    `basedir=${MARIADB_DIR.replace(/\\/g, '/')}`,
    `datadir=${MYSQL_DATA.replace(/\\/g, '/')}`,
    'port=3307',
    'bind-address=127.0.0.1',
    'skip-name-resolve',
    'character-set-server=utf8mb4',
    'collation-server=utf8mb4_unicode_ci',
    '',
  ].join('\n');
  fs.writeFileSync(myIni, iniContent);

  spawnProc('mariadb', mysqld, [`--defaults-file=${myIni}`]);
  return true;
}

async function ensureDatabase() {
  const port = parseInt(process.env.DB_PORT || '3307', 10);
  await waitForPort(port);

  const mysql = path.join(MARIADB_DIR, 'bin', 'mysql.exe');
  if (!fs.existsSync(mysql)) return;

  const db = process.env.DB_DATABASE || 'hms';
  try {
    execSync(`"${mysql}" -h 127.0.0.1 -P ${port} -u root -e "CREATE DATABASE IF NOT EXISTS \\\`${db}\\\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"`, {
      stdio: 'pipe',
      windowsHide: true,
    });
  } catch {
    // DB may already exist
  }
}

function runMigrate() {
  const migrate = path.join(ROOT, 'database', 'migrate.js');
  if (!fs.existsSync(migrate)) return;
  log('Applying database schema...');
  try {
    execSync(`"${NODE}" "${migrate}"`, {
      cwd: ROOT,
      env: process.env,
      stdio: 'inherit',
    });
  } catch (err) {
    log(`Migration warning: ${err.message}`);
  }
}

function openBrowser(url) {
  try {
    spawn('cmd', ['/c', 'start', '', url], { detached: true, stdio: 'ignore' }).unref();
  } catch {
    log(`Open manually: ${url}`);
  }
}

function shutdown() {
  log('Shutting down HMS...');
  for (const child of children) {
    try {
      child.kill();
    } catch {
      /* ignore */
    }
  }
  setTimeout(() => process.exit(0), 1000);
}

async function main() {
  console.log('');
  console.log('  HMS e-Register — Portable Edition');
  console.log('  ==================================');
  console.log('');

  if (!fs.existsSync(NODE)) {
    console.error('ERROR: runtime/node.exe not found. Re-run build-portable.ps1');
    process.exit(1);
  }

  loadEnv();
  process.env.NODE_ENV = process.env.NODE_ENV || 'production';
  process.env.HMS_ROOT = ROOT;

  const useEmbeddedDb = initMariaDB();
  if (useEmbeddedDb) {
    process.env.DB_HOST = '127.0.0.1';
    process.env.DB_PORT = '3307';
    process.env.DB_USERNAME = 'root';
    process.env.DB_PASSWORD = '';
    process.env.DB_DATABASE = process.env.DB_DATABASE || 'hms';
    process.env.DB_SSL = 'false';
    await ensureDatabase();
  }

  runMigrate();

  const apiMain = path.join(API_DIR, 'dist', 'main.js');
  const webServer = path.join(WEB_DIR, 'server.js');

  if (!fs.existsSync(apiMain)) {
    console.error('ERROR: API not built. Run scripts/build-portable.ps1');
    process.exit(1);
  }
  if (!fs.existsSync(webServer)) {
    console.error('ERROR: Web not built. Run scripts/build-portable.ps1');
    process.exit(1);
  }

  const apiPort = process.env.PORT || '4000';
  const webPort = process.env.WEB_PORT || '3000';

  spawnProc('api', NODE, [apiMain], {
    cwd: API_DIR,
    env: {
      ...process.env,
      PORT: apiPort,
      LOCAL_STORAGE_PATH: path.join(DATA_DIR, 'uploads'),
    },
  });

  spawnProc('web', NODE, [webServer], {
    cwd: WEB_DIR,
    env: {
      ...process.env,
      PORT: webPort,
      HOSTNAME: '127.0.0.1',
    },
  });

  log('Waiting for services...');
  try {
    await waitForHttp(`http://127.0.0.1:${webPort}`);
    const appUrl = process.env.APP_URL || `http://127.0.0.1:${webPort}`;
    log(`HMS is ready at ${appUrl}`);
    log(`API: http://127.0.0.1:${apiPort}/api/v1`);
    log('Default login: admin@hms.gov.in / Admin@123');
    log('Press Ctrl+C to stop.');
    openBrowser(appUrl);
  } catch (err) {
    log(`Startup issue: ${err.message}`);
  }

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
