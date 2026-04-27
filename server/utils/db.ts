import Database from 'better-sqlite3'
import { drizzle } from 'drizzle-orm/better-sqlite3'
import * as schema from '../db/schema'
import { mkdirSync } from 'node:fs'

const dbPath = process.env.DATABASE_URL ?? 'data/spool-keeper.db'
mkdirSync(dbPath.replace(/\/[^/]+$/, ''), { recursive: true })

const sqlite = new Database(dbPath)
sqlite.pragma('journal_mode = WAL')

// Ensure schema is up to date — idempotent, safe to run on every startup
sqlite.exec(`
  CREATE TABLE IF NOT EXISTS manufacturers (
    id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
    user_id TEXT NOT NULL,
    name TEXT NOT NULL,
    website TEXT,
    created_at TEXT DEFAULT (datetime('now'))
  );
  CREATE TABLE IF NOT EXISTS materials (
    id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
    user_id TEXT NOT NULL,
    name TEXT NOT NULL
  );
  CREATE TABLE IF NOT EXISTS features (
    id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
    user_id TEXT NOT NULL,
    name TEXT NOT NULL
  );
  CREATE TABLE IF NOT EXISTS colors (
    id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
    user_id TEXT NOT NULL,
    name TEXT NOT NULL,
    hex TEXT NOT NULL
  );
  CREATE TABLE IF NOT EXISTS filaments (
    id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
    user_id TEXT NOT NULL,
    name TEXT NOT NULL,
    material_id INTEGER REFERENCES materials(id),
    manufacturer_id INTEGER REFERENCES manufacturers(id),
    color_id INTEGER REFERENCES colors(id),
    diameter REAL DEFAULT 1.75,
    print_temp_min INTEGER,
    print_temp_max INTEGER,
    image_url TEXT,
    ean TEXT,
    created_at TEXT DEFAULT (datetime('now'))
  );
  CREATE TABLE IF NOT EXISTS filament_features (
    filament_id INTEGER NOT NULL REFERENCES filaments(id) ON DELETE CASCADE,
    feature_id INTEGER NOT NULL REFERENCES features(id) ON DELETE CASCADE
  );
  CREATE TABLE IF NOT EXISTS spools (
    id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
    user_id TEXT NOT NULL,
    filament_id INTEGER REFERENCES filaments(id),
    purchased_at TEXT,
    initial_weight_g REAL,
    remaining_weight_g REAL,
    status TEXT DEFAULT 'sealed',
    drying_started_at TEXT,
    drying_finished_at TEXT,
    notes TEXT
  );
`)

// Add columns that may be missing on older deployments (errors = already exists, safe to ignore)
for (const stmt of [
  `ALTER TABLE filaments ADD COLUMN material_id INTEGER`,
  `ALTER TABLE filaments ADD COLUMN color_id INTEGER`,
  `ALTER TABLE filaments ADD COLUMN ean TEXT`,
]) {
  try { sqlite.exec(stmt) } catch { /* already exists */ }
}

export const db = drizzle(sqlite, { schema })