import 'dotenv/config';
import express from 'express';
import { randomBytes } from 'node:crypto';
import { existsSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { openDb } from './db';
import { createApp } from './app';
import { ensureAdmin, seedContent } from './seed';

const isProd = process.env.NODE_ENV === 'production';
const port = Number(process.env.PORT || 3000);
const root = resolve(process.cwd());
const dbPath = process.env.DATABASE_PATH || join(root, 'data', 'ngm.db');

let secret = process.env.SESSION_SECRET;
if (!secret || secret.length < 16) {
  if (isProd) {
    console.error('FATAL: SESSION_SECRET (>= 16 chars) must be set in production.');
    process.exit(1);
  }
  secret = randomBytes(32).toString('hex');
  console.warn('[ngm] SESSION_SECRET not set - using a random one; admin sessions reset on every restart.');
}

const db = openDb(dbPath);
const seeded = seedContent(db);
if (seeded.seeded) console.log('[ngm] database seeded from src/data');
if (process.env.ADMIN_EMAIL && process.env.ADMIN_PASSWORD) {
  const r = ensureAdmin(db, process.env.ADMIN_EMAIL, process.env.ADMIN_PASSWORD);
  if (r.created) console.log(`[ngm] admin user created: ${process.env.ADMIN_EMAIL}`);
} else {
  console.warn('[ngm] ADMIN_EMAIL/ADMIN_PASSWORD not set: no admin can sign in until you set them (see README).');
}

const generatedDir = join(root, 'data', 'generated');
const app = createApp({
  db,
  sessionSecret: secret,
  secureCookies: isProd && process.env.COOKIE_SECURE !== 'false',
  generatedDir,
  ai: { apiKey: process.env.GEMINI_API_KEY, model: process.env.GEMINI_IMAGE_MODEL, outDir: generatedDir },
});

async function start() {
  if (!isProd) {
    const { createServer } = await import('vite');
    const vite = await createServer({ server: { middlewareMode: true }, appType: 'spa' });
    app.use(vite.middlewares);
  } else {
    const dist = join(root, 'dist');
    if (!existsSync(dist)) {
      console.error('FATAL: dist/ not found. Run "npm run build" first.');
      process.exit(1);
    }
    app.use(express.static(dist));
    app.get('*', (_req, res) => res.sendFile(join(dist, 'index.html')));
  }
  app.listen(port, '0.0.0.0', () => console.log(`[ngm] ${isProd ? 'production' : 'development'} server on http://localhost:${port}`));
}
start();
