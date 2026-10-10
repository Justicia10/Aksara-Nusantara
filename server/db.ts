import { DatabaseSync } from 'node:sqlite';
import { mkdirSync } from 'node:fs';
import { dirname } from 'node:path';

export type DB = DatabaseSync;

export const SCHEMA = `
CREATE TABLE IF NOT EXISTS regions (key TEXT PRIMARY KEY, data TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS glossary (term TEXT PRIMARY KEY, data TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS stories (
  id TEXT PRIMARY KEY, slug TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'draft',
  data TEXT NOT NULL,                       -- Story metadata (everything except scenes)
  legacy_published INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL, updated_at TEXT NOT NULL, published_at TEXT
);
CREATE TABLE IF NOT EXISTS scenes (
  story_id TEXT NOT NULL REFERENCES stories(id) ON DELETE CASCADE,
  scene_number INTEGER NOT NULL,
  data TEXT NOT NULL,                       -- Scene incl. optional Interactive 2D config
  PRIMARY KEY (story_id, scene_number)
);
CREATE TABLE IF NOT EXISTS sources (
  id TEXT PRIMARY KEY, title TEXT NOT NULL, author TEXT NOT NULL DEFAULT '', publisher TEXT NOT NULL DEFAULT '',
  publication_year INTEGER, url_or_reference TEXT NOT NULL DEFAULT '',
  rights_status TEXT NOT NULL DEFAULT 'unknown', license TEXT NOT NULL DEFAULT '',
  verification_status TEXT NOT NULL DEFAULT 'unverified',
  created_at TEXT NOT NULL, updated_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS story_sources (
  story_id TEXT NOT NULL REFERENCES stories(id) ON DELETE CASCADE,
  source_id TEXT NOT NULL REFERENCES sources(id) ON DELETE CASCADE,
  PRIMARY KEY (story_id, source_id)
);
CREATE TABLE IF NOT EXISTS cultural_content (
  id TEXT PRIMARY KEY, story_id TEXT NOT NULL REFERENCES stories(id) ON DELETE CASCADE,
  scene_number INTEGER,
  type TEXT NOT NULL DEFAULT 'Nilai Budaya', title TEXT NOT NULL, description TEXT NOT NULL,
  source_id TEXT REFERENCES sources(id) ON DELETE SET NULL,
  verification_status TEXT NOT NULL DEFAULT 'unverified',
  created_at TEXT NOT NULL, updated_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS characters (
  id TEXT PRIMARY KEY, story_id TEXT NOT NULL REFERENCES stories(id) ON DELETE CASCADE,
  name TEXT NOT NULL, description TEXT NOT NULL DEFAULT '', role TEXT NOT NULL DEFAULT '', icon TEXT NOT NULL DEFAULT '',
  archived INTEGER NOT NULL DEFAULT 0
);
CREATE TABLE IF NOT EXISTS visual_assets (
  id TEXT PRIMARY KEY, story_id TEXT NOT NULL REFERENCES stories(id) ON DELETE CASCADE,
  scene_number INTEGER NOT NULL,            -- 0 = story cover
  asset_url TEXT NOT NULL, alt TEXT NOT NULL DEFAULT '',
  generation_method TEXT NOT NULL DEFAULT 'unknown',   -- 'ai' | 'manual' | 'unknown'
  prompt TEXT NOT NULL DEFAULT '', prompt_version TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'pending',              -- pending | approved | rejected
  license_status TEXT NOT NULL DEFAULT 'unknown',
  reviewer_id TEXT, review_note TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL, updated_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS pixel_assets (id TEXT PRIMARY KEY, data TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS avatars (id TEXT PRIMARY KEY, data TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY, email TEXT NOT NULL UNIQUE, password_hash TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'admin', status TEXT NOT NULL DEFAULT 'active', created_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS analytics_events (
  id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, story_id TEXT, scene_number INTEGER,
  session_id TEXT, props TEXT, created_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_scenes_story ON scenes(story_id);
CREATE INDEX IF NOT EXISTS idx_assets_story ON visual_assets(story_id, scene_number);
CREATE INDEX IF NOT EXISTS idx_events_name ON analytics_events(name);
`;

export function openDb(path: string): DB {
  if (path !== ':memory:') mkdirSync(dirname(path), { recursive: true });
  const db = new DatabaseSync(path);
  db.exec('PRAGMA journal_mode = WAL; PRAGMA foreign_keys = ON;');
  db.exec(SCHEMA);
  return db;
}

export const now = () => new Date().toISOString();
export const uid = (prefix: string) => `${prefix}_${Math.random().toString(36).slice(2, 10)}${Date.now().toString(36).slice(-4)}`;

/** Run fn in a transaction. node:sqlite has no helper for this. */
export function tx<T>(db: DB, fn: () => T): T {
  db.exec('BEGIN');
  try {
    const out = fn();
    db.exec('COMMIT');
    return out;
  } catch (e) {
    db.exec('ROLLBACK');
    throw e;
  }
}
