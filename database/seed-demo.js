/**
 * Demo users, hotels, and guests for live testing.
 * Usage: node database/seed-demo.js
 * Safe to re-run — upserts fixed demo records by id.
 */
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');

function hashValue(value) {
  return crypto.createHash('sha256').update(value.trim().toLowerCase()).digest('hex');
}

function normalizeAadhaar(value) {
  return value.replace(/\D/g, '').slice(0, 12);
}

const DEMO_PASSWORD = 'Admin@123';

const IDS = {
  tenant: '00000000-0000-0000-0000-000000000001',
  stateRJ: '00000000-0000-0000-0000-000000000201',
  roles: {
    super_admin: '00000000-0000-0000-0000-000000000301',
    police_command: '00000000-0000-0000-0000-000000000302',
    police_officer: '00000000-0000-0000-0000-000000000303',
    hotel_owner: '00000000-0000-0000-0000-000000000304',
    hotel_manager: '00000000-0000-0000-0000-000000000305',
    receptionist: '00000000-0000-0000-0000-000000000306',
  },
  users: {
    super_admin: '00000000-0000-0000-0000-000000000401',
    police_command: '00000000-0000-0000-0000-000000000402',
    police_officer: '00000000-0000-0000-0000-000000000403',
    hotel_owner: '00000000-0000-0000-0000-000000000404',
    hotel_manager: '00000000-0000-0000-0000-000000000405',
    receptionist: '00000000-0000-0000-0000-000000000406',
  },
  hotels: {
    approved: '00000000-0000-0000-0000-000000000501',
    pending: '00000000-0000-0000-0000-000000000502',
  },
  guests: {
    guest1: '00000000-0000-0000-0000-000000000601',
    guest2: '00000000-0000-0000-0000-000000000602',
    guest3: '00000000-0000-0000-0000-000000000603',
  },
  watchlist: {
    entry1: '00000000-0000-0000-0000-000000000701',
    entry2: '00000000-0000-0000-0000-000000000702',
  },
};

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

async function upsertUser(conn, { id, roleId, email, firstName, lastName, passwordHash }) {
  await conn.query(
    `INSERT INTO users (id, tenant_id, role_id, email, password_hash, first_name, last_name, is_active, is_verified)
     VALUES (?, ?, ?, ?, ?, ?, ?, 1, 1)
     ON DUPLICATE KEY UPDATE
       role_id = VALUES(role_id),
       password_hash = VALUES(password_hash),
       first_name = VALUES(first_name),
       last_name = VALUES(last_name),
       is_active = 1,
       is_verified = 1`,
    [id, IDS.tenant, roleId, email, passwordHash, firstName, lastName],
  );
}

async function seed() {
  loadEnv();

  const conn = await mysql.createConnection({
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || '3306', 10),
    user: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : undefined,
  });

  console.log(`Seeding demo data on ${process.env.DB_HOST}...`);
  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 12);

  const demoUsers = [
    { id: IDS.users.super_admin, roleId: IDS.roles.super_admin, email: 'admin@hms.gov.in', firstName: 'System', lastName: 'Administrator' },
    { id: IDS.users.police_command, roleId: IDS.roles.police_command, email: 'command@hms.gov.in', firstName: 'Rajesh', lastName: 'Sharma' },
    { id: IDS.users.police_officer, roleId: IDS.roles.police_officer, email: 'officer@hms.gov.in', firstName: 'Amit', lastName: 'Verma' },
    { id: IDS.users.hotel_owner, roleId: IDS.roles.hotel_owner, email: 'owner@grandudaipur.demo', firstName: 'Vikram', lastName: 'Singh' },
    { id: IDS.users.hotel_manager, roleId: IDS.roles.hotel_manager, email: 'manager@grandudaipur.demo', firstName: 'Priya', lastName: 'Mehta' },
    { id: IDS.users.receptionist, roleId: IDS.roles.receptionist, email: 'reception@grandudaipur.demo', firstName: 'Sneha', lastName: 'Patel' },
  ];

  for (const user of demoUsers) {
    await upsertUser(conn, { ...user, passwordHash });
    console.log(`  user: ${user.email}`);
  }

  await conn.query(
    `INSERT INTO hotels (id, tenant_id, name, owner_name, license_number, address, city, state_id, pincode, contact_number, email, total_rooms, is_active, registration_status, approved_by, approved_at, registered_by_user_id, is_online)
     VALUES (?, ?, 'Grand Udaipur Palace', 'Vikram Singh', 'RJ-HOTEL-2024-001',
             'Lake Palace Road, Near City Palace', 'Udaipur', ?, '313001', '9876543210', 'info@grandudaipur.demo', 48, 1, 'approved', ?, NOW(), ?, 1)
     ON DUPLICATE KEY UPDATE
       name = VALUES(name),
       registration_status = 'approved',
       is_active = 1,
       is_online = 1`,
    [IDS.hotels.approved, IDS.tenant, IDS.stateRJ, IDS.users.super_admin, IDS.users.hotel_owner],
  );
  console.log('  hotel: Grand Udaipur Palace (approved)');

  await conn.query(
    `INSERT INTO hotels (id, tenant_id, name, owner_name, license_number, address, city, state_id, pincode, contact_number, email, total_rooms, is_active, registration_status, registered_by_user_id)
     VALUES (?, ?, 'Sunrise Guest House', 'Ravi Kumar', 'RJ-HOTEL-2024-PENDING',
             'Station Road, Sector 4', 'Jaipur', ?, '302001', '9123456780', 'pending@sunrise.demo', 12, 1, 'pending', ?)
     ON DUPLICATE KEY UPDATE
       name = VALUES(name),
       registration_status = 'pending'`,
    [IDS.hotels.pending, IDS.tenant, IDS.stateRJ, IDS.users.hotel_owner],
  );
  console.log('  hotel: Sunrise Guest House (pending approval)');

  const hotelStaff = [
    { userId: IDS.users.hotel_owner, designation: 'owner', isPrimary: 1 },
    { userId: IDS.users.hotel_manager, designation: 'manager', isPrimary: 0 },
    { userId: IDS.users.receptionist, designation: 'receptionist', isPrimary: 0 },
  ];

  for (const staff of hotelStaff) {
    await conn.query(
      `INSERT INTO hotel_users (id, hotel_id, user_id, designation, is_primary)
       VALUES (UUID(), ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE designation = VALUES(designation)`,
      [IDS.hotels.approved, staff.userId, staff.designation, staff.isPrimary],
    );
  }
  console.log('  hotel_users: owner, manager, receptionist linked');

  const today = new Date().toISOString().slice(0, 10);
  const demoGuests = [
    { id: IDS.guests.guest1, fullName: 'Rahul Gupta', gender: 'male', mobile: '9811111111', room: '101', registeredBy: IDS.users.receptionist },
    { id: IDS.guests.guest2, fullName: 'Anita Desai', gender: 'female', mobile: '9822222222', room: '205', registeredBy: IDS.users.receptionist },
    { id: IDS.guests.guest3, fullName: 'John Smith', gender: 'male', mobile: '9833333333', room: '302', registeredBy: IDS.users.receptionist, foreign: 1 },
  ];

  for (const g of demoGuests) {
    await conn.query(
      `INSERT INTO guests (id, tenant_id, hotel_id, full_name, gender, nationality, mobile_number, room_number, check_in_date, check_in_time, purpose_of_visit, is_foreign_national, status, registered_by)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, '14:30:00', 'Tourism', ?, 'checked_in', ?)
       ON DUPLICATE KEY UPDATE
         full_name = VALUES(full_name),
         room_number = VALUES(room_number),
         status = 'checked_in'`,
      [
        g.id,
        IDS.tenant,
        IDS.hotels.approved,
        g.fullName,
        g.gender,
        g.foreign ? 'American' : 'Indian',
        g.mobile,
        g.room,
        today,
        g.foreign ? 1 : 0,
        g.registeredBy,
      ],
    );
  }
  console.log('  guests: 3 sample check-ins');

  const demoWatchlist = [
    {
      id: IDS.watchlist.entry1,
      source: 'wanted',
      fullName: 'Demo Suspect Ali',
      fatherName: 'Mohammed Ali',
      mobile: '9876500001',
      aadhaar: '123456789012',
      crimeType: 'Theft',
      firNumber: 'FIR/UDA/2024/101',
      policeStation: 'Udaipur City PS',
      severity: 'high',
      description: 'Demo watchlist entry for live testing',
    },
    {
      id: IDS.watchlist.entry2,
      source: 'absconder',
      fullName: 'Ravi Kumar Demo',
      fatherName: 'Suresh Kumar',
      mobile: '9876500002',
      aadhaar: '998877665544',
      crimeType: 'Fraud',
      firNumber: 'FIR/JAI/2024/55',
      policeStation: 'Jaipur East PS',
      severity: 'medium',
      description: 'Second demo watchlist entry',
    },
  ];

  for (const w of demoWatchlist) {
    await conn.query(
      `INSERT INTO watchlists (id, tenant_id, source, full_name, father_name, mobile_number, aadhaar_hash, crime_type, fir_number, police_station, severity, description, is_active, created_by)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?)
       ON DUPLICATE KEY UPDATE
         full_name = VALUES(full_name),
         aadhaar_hash = VALUES(aadhaar_hash),
         is_active = 1`,
      [
        w.id,
        IDS.tenant,
        w.source,
        w.fullName,
        w.fatherName,
        w.mobile,
        hashValue(normalizeAadhaar(w.aadhaar)),
        w.crimeType,
        w.firNumber,
        w.policeStation,
        w.severity,
        w.description,
        IDS.users.police_command,
      ],
    );
  }
  console.log('  watchlist: 2 demo entries (Aadhaar test: 123456789012)');

  await conn.end();

  console.log('\n=== Demo seed complete ===');
  console.log(`Password for ALL demo users: ${DEMO_PASSWORD}\n`);
  console.log('Login URLs (replace host with your server IP):');
  console.log('  Super Admin  → /login/superadmin   admin@hms.gov.in');
  console.log('  Police Admin → /login/admin         command@hms.gov.in');
  console.log('  Police       → /login/police        officer@hms.gov.in');
  console.log('  Hotel        → /login/hotel         owner@grandudaipur.demo');
  console.log('                 (also)                manager@grandudaipur.demo');
  console.log('                 (also)                reception@grandudaipur.demo');
}

seed().catch((err) => {
  console.error('Seed failed:', err.message);
  process.exit(1);
});
