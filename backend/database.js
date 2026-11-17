const path = require("path");
const Database = require("better-sqlite3");

const databasePath = path.join(__dirname, "medimatrix.db");
const db = new Database(databasePath);

// Enable foreign keys
db.pragma("foreign_keys = ON");

// Users table
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);

// Add role column if missing
const userColumns = db.prepare("PRAGMA table_info(users)").all();

if (!userColumns.some((column) => column.name === "role")) {
  db.exec(`
    ALTER TABLE users
    ADD COLUMN role TEXT NOT NULL DEFAULT 'Patient'
  `);
}

// Patient profiles table
db.exec(`
  CREATE TABLE IF NOT EXISTS patient_profiles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL UNIQUE,
    full_name TEXT,
    health_id TEXT UNIQUE,
    date_of_birth TEXT,
    blood_group TEXT,
    phone_number TEXT,
    emergency_contact TEXT,
    allergies TEXT,
    medical_conditions TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
  );
`);

// Add missing patient profile columns
const profileColumns = db
  .prepare("PRAGMA table_info(patient_profiles)")
  .all();

const requiredColumns = {
  full_name: "TEXT",
  health_id: "TEXT",
  date_of_birth: "TEXT",
  blood_group: "TEXT",
  phone_number: "TEXT",
  emergency_contact: "TEXT",
  allergies: "TEXT",
  medical_conditions: "TEXT",
  updated_at: "DATETIME",
};

for (const [column, type] of Object.entries(requiredColumns)) {
  if (!profileColumns.some((item) => item.name === column)) {
    db.exec(
      `ALTER TABLE patient_profiles ADD COLUMN ${column} ${type}`
    );
  }
}

// Family access table
db.exec(`
  CREATE TABLE IF NOT EXISTS family_access (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    patient_user_id INTEGER NOT NULL,
    family_user_id INTEGER NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending'
      CHECK (status IN ('pending', 'approved', 'revoked')),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (patient_user_id, family_user_id),
    FOREIGN KEY (patient_user_id) REFERENCES users(id),
    FOREIGN KEY (family_user_id) REFERENCES users(id)
  );
`);

// Medicines table
db.exec(`
  CREATE TABLE IF NOT EXISTS medicines (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    dosage TEXT NOT NULL,
    time TEXT NOT NULL,
    taken INTEGER NOT NULL DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
  );
`);

// Push notification subscriptions
db.exec(`
  CREATE TABLE IF NOT EXISTS push_subscriptions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    subscription TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
  );
`);

// Prevent duplicate reminders on the same date
db.exec(`
  CREATE TABLE IF NOT EXISTS medicine_notification_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    medicine_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    notification_date TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (medicine_id, notification_date),
    FOREIGN KEY (medicine_id) REFERENCES medicines(id)
      ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id)
  );
`);
// Health Records table
db.exec(`
  CREATE TABLE IF NOT EXISTS health_records (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    title TEXT NOT NULL,
    category TEXT NOT NULL,
    record_date TEXT,
    notes TEXT,
    file_name TEXT,
    file_path TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
      ON DELETE CASCADE
  );
`);
// Appointments table
db.exec(`
  CREATE TABLE IF NOT EXISTS appointments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    doctor TEXT NOT NULL,
    specialty TEXT NOT NULL,
    appointment_date TEXT NOT NULL,
    appointment_time TEXT NOT NULL,
    notes TEXT DEFAULT '',
    status TEXT NOT NULL DEFAULT 'Scheduled',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
      ON DELETE CASCADE
  );
`);
console.log("MediMatrix database is ready!");
console.log("Database location:", databasePath);

module.exports = db;