import express, { NextFunction, Request, Response } from 'express';
import { join } from 'node:path';
import { DB, now, tx, uid } from './db';
import { LoginThrottle, parseCookies, readSession, signSession, verifyPassword } from './security';
import {
  WORKFLOW, canTransition, loadStoryRaw, pixelAssets, publicContent, publicationGate, regions, setStatus, validate2DReport,
} from './content';
import { AiConfig, AiNotConfiguredError, AiVendorError, PROMPT_VERSION, PromptBlockedError, buildPrompt, checkPrompt, generateImage } from './ai';
import { PublicationStatus, Scene, StoryTheme } from '../src/types';

export interface AppOptions {
  db: DB;
  sessionSecret: string;
  secureCookies?: boolean;
  ai?: Partial<AiConfig>;
  generatedDir?: string;
}

const THEMES: StoryTheme[] = ['kepahlawanan', 'kebijaksanaan', 'asal-usul', 'kesetiaan', 'satwa', 'epos', 'moral', 'arsitektur', 'alam'];
const ANALYTICS_EVENTS = new Set([
  'story_open', 'story_complete', 'scene_complete', 'cultural_open', 'search', 'map_select',
  '2d_start', '2d_interaction', '2d_too_far', '2d_failure', '2d_fallback', '2d_story_complete', '2d_cultural_open', '2d_mobile_control',
]);
const SESSION_COOKIE = 'ngm_session';
const SESSION_MS = 8 * 60 * 60 * 1000;

type Body = Record<string, unknown>;
class HttpError extends Error {
  constructor(public status: number, message: string, public extra?: Record<string, unknown>) {
    super(message);
  }
}
const str = (v: unknown, max = 5000): string => (typeof v === 'string' ? v.trim().slice(0, max) : '');
const slugify = (s: string) => s.toLowerCase().normalize('NFKD').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 60) || 'cerita';
const row = <T = Record<string, any>>(db: DB, sql: string, ...p: any[]) => db.prepare(sql).get(...p) as T | undefined;
const rows = <T = Record<string, any>>(db: DB, sql: string, ...p: any[]) => db.prepare(sql).all(...p) as T[];

export function createApp(opts: AppOptions) {
  const { db } = opts;
  const app = express();
  app.disable('x-powered-by');
  app.use(express.json({ limit: '1mb' }));
  app.use((_req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    next();
  });
  if (opts.generatedDir) app.use('/generated', express.static(opts.generatedDir, { maxAge: '1h' }));

  const throttle = new LoginThrottle();
  const aiCfg: AiConfig = {
    apiKey: opts.ai?.apiKey,
    model: opts.ai?.model || 'gemini-2.5-flash-image',
    outDir: opts.ai?.outDir || opts.generatedDir || join(process.cwd(), 'data', 'generated'),
  };

  // ---------- helpers ----------
  const wrap = (fn: (req: Request, res: Response) => unknown) => async (req: Request, res: Response, next: NextFunction) => {
    try {
      await fn(req, res);
    } catch (e) {
      next(e);
    }
  };
  const need = <T,>(v: T, msg = 'Data tidak ditemukan.'): NonNullable<T> => {
    if (v == null) throw new HttpError(404, msg);
    return v as NonNullable<T>;
  };

  // CSRF defence in depth: cookie is SameSite=Strict; additionally reject cross-origin browser writes.
  app.use((req, _res, next) => {
    if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method)) {
      const origin = req.headers.origin;
      if (origin) {
        try {
          if (new URL(origin).host !== req.headers.host) return next(new HttpError(403, 'Origin tidak diizinkan.'));
        } catch {
          return next(new HttpError(403, 'Origin tidak valid.'));
        }
      }
    }
    next();
  });

  const currentUser = (req: Request) => {
    const s = readSession(parseCookies(req.headers.cookie)[SESSION_COOKIE], opts.sessionSecret);
    if (!s) return null;
    const u = row<{ id: string; email: string; role: string; status: string }>(db, 'SELECT id, email, role, status FROM users WHERE id = ?', s.uid);
    return u && u.status === 'active' && u.role === 'admin' ? u : null;
  };
  const requireAdmin = (req: Request, _res: Response, next: NextFunction) => {
    const u = currentUser(req);
    if (!u) return next(new HttpError(401, 'Anda harus masuk sebagai admin.'));
    (req as any).user = u;
    next();
  };
  const adminId = (req: Request): string => (req as any).user.id;

  // ---------- public ----------
  app.get('/api/health', (_req, res) => res.json({ ok: true, time: now() }));
  app.get('/api/content', wrap((_req, res) => {
    res.setHeader('Cache-Control', 'no-cache');
    res.json(publicContent(db));
  }));
  app.post('/api/analytics', wrap((req, res) => {
    const b = req.body as Body;
    const name = str(b.name, 40);
    if (!ANALYTICS_EVENTS.has(name)) throw new HttpError(400, 'Nama event tidak dikenal.');
    const props = b.props && typeof b.props === 'object' ? JSON.stringify(b.props).slice(0, 1000) : null;
    db.prepare('INSERT INTO analytics_events (name, story_id, scene_number, session_id, props, created_at) VALUES (?, ?, ?, ?, ?, ?)')
      .run(name, str(b.storyId, 80) || null, Number.isInteger(b.sceneNumber) ? (b.sceneNumber as number) : null, str(b.sessionId, 64) || null, props, now());
    res.status(202).json({ ok: true });
  }));

  // ---------- auth ----------
  app.post('/api/admin/login', wrap((req, res) => {
    const email = str((req.body as Body).email, 200).toLowerCase();
    const password = typeof (req.body as Body).password === 'string' ? ((req.body as Body).password as string) : '';
    const key = `${req.ip}|${email}`;
    if (throttle.blocked(key)) throw new HttpError(429, 'Terlalu banyak percobaan masuk. Coba lagi beberapa menit lagi.');
    const u = row<{ id: string; password_hash: string; role: string; status: string }>(db, 'SELECT * FROM users WHERE email = ?', email);
    const ok = !!u && u.status === 'active' && u.role === 'admin' && verifyPassword(password, u.password_hash);
    if (!ok) {
      throttle.fail(key);
      throw new HttpError(401, 'Email atau kata sandi salah.');
    }
    throttle.clear(key);
    const token = signSession({ uid: u!.id, exp: Date.now() + SESSION_MS }, opts.sessionSecret);
    res.setHeader('Set-Cookie', `${SESSION_COOKIE}=${token}; HttpOnly; SameSite=Strict; Path=/; Max-Age=${SESSION_MS / 1000}${opts.secureCookies ? '; Secure' : ''}`);
    res.json({ ok: true, email });
  }));
  app.post('/api/admin/logout', (_req, res) => {
    res.setHeader('Set-Cookie', `${SESSION_COOKIE}=; HttpOnly; SameSite=Strict; Path=/; Max-Age=0`);
    res.json({ ok: true });
  });
  app.get('/api/admin/me', (req, res) => {
    const u = currentUser(req);
    if (!u) return res.status(401).json({ error: 'Belum masuk.' });
    res.json({ email: u.email, role: u.role, aiConfigured: !!aiCfg.apiKey });
  });

  const admin = express.Router();
  admin.use(requireAdmin);
  app.use('/api/admin', admin);

  // ---------- stories ----------
  const storySummary = (id: string) => {
    const raw = loadStoryRaw(db, id)!;
    const gate = publicationGate(db, id);
    return {
      id: raw.id, title: raw.title, region: raw.region, status: raw.status, legacyPublished: raw.legacyPublished,
      sceneCount: raw.scenes.length, interactive2DStatus: raw.interactive2DStatus ?? 'not-ready',
      publishable: gate.ok, blockers: gate.blockers.length, updatedAt: row<{ updated_at: string }>(db, 'SELECT updated_at FROM stories WHERE id = ?', id)!.updated_at,
    };
  };
  admin.get('/stories', wrap((_req, res) => {
    res.json(rows<{ id: string }>(db, 'SELECT id FROM stories ORDER BY rowid').map((r) => storySummary(r.id)));
  }));

  const storyDetail = (id: string) => {
    const raw = need(loadStoryRaw(db, id), 'Cerita tidak ditemukan.');
    return {
      story: raw,
      sources: rows(db, 'SELECT so.* FROM sources so JOIN story_sources ss ON ss.source_id = so.id WHERE ss.story_id = ? ORDER BY so.title', id),
      cultural: rows(db, 'SELECT * FROM cultural_content WHERE story_id = ? ORDER BY scene_number, rowid', id),
      characters: rows(db, 'SELECT * FROM characters WHERE story_id = ? ORDER BY rowid', id),
      visuals: rows(db, 'SELECT * FROM visual_assets WHERE story_id = ? ORDER BY scene_number, created_at DESC', id),
      gate: publicationGate(db, id),
      report2D: validate2DReport(db, id),
      regions: Object.keys(regions(db)),
    };
  };
  admin.get('/stories/:id', wrap((req, res) => res.json(storyDetail(req.params.id))));

  const assertEditable = (id: string) => {
    const r = need(row<{ status: string }>(db, 'SELECT status FROM stories WHERE id = ?', id), 'Cerita tidak ditemukan.');
    if (r.status === 'published') throw new HttpError(409, 'Cerita sedang published. Batalkan publikasi (kembalikan ke draft) sebelum mengubah konten.');
  };
  const touch = (id: string) => db.prepare('UPDATE stories SET updated_at = ? WHERE id = ?').run(now(), id);
  const saveMeta = (id: string, patch: Body) => {
    const r = need(row<{ data: string }>(db, 'SELECT data FROM stories WHERE id = ?', id));
    const meta = { ...JSON.parse(r.data), ...patch };
    db.prepare('UPDATE stories SET data = ?, updated_at = ? WHERE id = ?').run(JSON.stringify(meta), now(), id);
  };

  admin.post('/stories', wrap((req, res) => {
    const b = req.body as Body;
    const title = str(b.title, 160);
    if (!title) throw new HttpError(400, 'Judul wajib diisi.');
    const regionKey = str(b.regionKey, 40);
    const regs = regions(db);
    if (!regs[regionKey]) throw new HttpError(400, 'Wilayah tidak valid.');
    let slug = slugify(title);
    for (let i = 2; row(db, 'SELECT 1 FROM stories WHERE slug = ? OR id = ?', slug, slug); i++) slug = `${slugify(title)}-${i}`;
    const theme = THEMES.includes(b.theme as StoryTheme) ? (b.theme as StoryTheme) : 'moral';
    const meta = {
      id: slug, title, slug, region: str(b.region, 120) || regs[regionKey].name, regionKey, locationDetail: str(b.locationDetail, 200),
      category: str(b.category, 80), theme, themeLabel: str(b.themeLabel, 80) || str(b.category, 80),
      readingTimeMinutes: 5, sceneCount: 0, targetReader: ['smp', 'sma', 'all'].includes(b.targetReader as string) ? b.targetReader : 'all',
      summary: str(b.summary, 1000), imageUrl: '', imageAlt: '', tradition: str(b.tradition, 120), verifiedSource: '', scenes: [], keywords: [],
    };
    const t = now();
    const { scenes: _s, ...stored } = meta;
    db.prepare(`INSERT INTO stories (id, slug, status, data, created_at, updated_at) VALUES (?, ?, 'draft', ?, ?, ?)`).run(slug, slug, JSON.stringify(stored), t, t);
    res.status(201).json(storyDetail(slug));
  }));

  admin.patch('/stories/:id', wrap((req, res) => {
    assertEditable(req.params.id);
    const b = req.body as Body;
    const patch: Body = {};
    for (const [k, max] of [['title', 160], ['summary', 1000], ['locationDetail', 200], ['category', 80], ['themeLabel', 80], ['tradition', 120], ['region', 120], ['imageAlt', 400]] as const)
      if (k in b) patch[k] = str(b[k], max);
    if (patch.title === '') throw new HttpError(400, 'Judul tidak boleh kosong.');
    if ('regionKey' in b) {
      if (!regions(db)[str(b.regionKey, 40)]) throw new HttpError(400, 'Wilayah tidak valid.');
      patch.regionKey = str(b.regionKey, 40);
    }
    if ('theme' in b) {
      if (!THEMES.includes(b.theme as StoryTheme)) throw new HttpError(400, 'Tema tidak valid.');
      patch.theme = b.theme;
    }
    if ('targetReader' in b) {
      if (!['smp', 'sma', 'all'].includes(b.targetReader as string)) throw new HttpError(400, 'Target pembaca tidak valid.');
      patch.targetReader = b.targetReader;
    }
    if ('readingTimeMinutes' in b) patch.readingTimeMinutes = Math.min(180, Math.max(1, Math.round(Number(b.readingTimeMinutes)) || 5));
    if (Array.isArray(b.keywords)) patch.keywords = (b.keywords as unknown[]).map((k) => str(k, 40)).filter(Boolean).slice(0, 20);
    saveMeta(req.params.id, patch);
    res.json(storyDetail(req.params.id));
  }));

  admin.delete('/stories/:id', wrap((req, res) => {
    const r = need(row<{ status: string }>(db, 'SELECT status FROM stories WHERE id = ?', req.params.id));
    if (r.status === 'published') throw new HttpError(409, 'Batalkan publikasi terlebih dahulu.');
    if (req.query.hard === '1') {
      if (r.status !== 'draft') throw new HttpError(409, 'Hanya cerita draft yang dapat dihapus permanen; gunakan arsip.');
      db.prepare('DELETE FROM stories WHERE id = ?').run(req.params.id);
      return res.json({ deleted: true });
    }
    setStatus(db, req.params.id, 'archived');
    res.json({ archived: true });
  }));

  admin.post('/stories/:id/status', wrap((req, res) => {
    const id = req.params.id;
    const to = str((req.body as Body).to, 20) as PublicationStatus;
    const cur = need(row<{ status: PublicationStatus }>(db, 'SELECT status FROM stories WHERE id = ?', id)).status;
    if (![...WORKFLOW, 'archived'].includes(to)) throw new HttpError(400, 'Status tidak dikenal.');
    if (!canTransition(cur, to)) throw new HttpError(409, `Transisi ${cur} -> ${to} tidak diizinkan. Alur: ${WORKFLOW.join(' -> ')}.`);
    if (to === 'content-review' || to === 'visual-review' || to === 'approved' || to === 'published') {
      const gate = publicationGate(db, id);
      // Gate on the way to "published" is enforced in full; earlier stages only need the basics.
      const basic = gate.blockers.filter((b) => ['title', 'summary', 'no-scenes', 'empty-scene', 'scene-order'].includes(b.code));
      const list = to === 'published' ? gate.blockers : basic;
      if (list.length) throw new HttpError(422, 'Cerita belum memenuhi syarat.', { blockers: list });
    }
    tx(db, () => {
      if (to === 'published') {
        const raw = loadStoryRaw(db, id)!;
        saveMeta(id, { sceneCount: raw.scenes.length });
        // keep per-scene totals consistent with the real number of scenes
        for (const s of raw.scenes) db.prepare('UPDATE scenes SET data = ? WHERE story_id = ? AND scene_number = ?').run(JSON.stringify({ ...s, totalScenes: raw.scenes.length }), id, s.sceneNumber);
      }
      setStatus(db, id, to);
    });
    res.json(storyDetail(id));
  }));

  // ---------- scenes ----------
  const sceneFields = (b: Body, base: Partial<Scene> = {}): Partial<Scene> => {
    const out: Partial<Scene> = { ...base };
    for (const k of ['partTitle', 'timeContext', 'actTitle', 'actSubtitle', 'imageAlt'] as const) if (k in b) out[k] = str(b[k], 300);
    if (Array.isArray(b.paragraphs)) out.paragraphs = (b.paragraphs as unknown[]).map((p) => str(p, 4000)).filter(Boolean);
    if (b.culturalAnnotation && typeof b.culturalAnnotation === 'object') {
      const c = b.culturalAnnotation as Body;
      out.culturalAnnotation = { title: str(c.title, 300), description: str(c.description, 2000), source: str(c.source, 400), ...(str(c.sourceUrl, 500) ? { sourceUrl: str(c.sourceUrl, 500) } : {}) };
    }
    if (Array.isArray(b.characters))
      out.characters = (b.characters as Body[]).map((c) => ({ name: str(c.name, 120), role: str(c.role, 160), icon: str(c.icon, 8) || '👤' })).filter((c) => c.name);
    return out;
  };
  const writeScene = (storyId: string, s: Scene) =>
    db.prepare('INSERT OR REPLACE INTO scenes (story_id, scene_number, data) VALUES (?, ?, ?)').run(storyId, s.sceneNumber, JSON.stringify(s));

  admin.post('/stories/:id/scenes', wrap((req, res) => {
    const id = req.params.id;
    assertEditable(id);
    const raw = need(loadStoryRaw(db, id));
    const n = raw.scenes.length + 1;
    const f = sceneFields(req.body as Body);
    const scene: Scene = {
      sceneNumber: n, totalScenes: n, partTitle: f.partTitle || `Bagian ${n}`, timeContext: f.timeContext || '', actTitle: f.actTitle || `Adegan ${n}`, actSubtitle: f.actSubtitle || '',
      imageUrl: '', imageAlt: f.imageAlt || '', characters: f.characters || [], paragraphs: f.paragraphs || [],
      culturalAnnotation: f.culturalAnnotation || { title: '', description: '', source: '' },
    };
    tx(db, () => {
      writeScene(id, scene);
      for (const s of raw.scenes) writeScene(id, { ...s, totalScenes: n });
      saveMeta(id, { sceneCount: n });
    });
    res.status(201).json(storyDetail(id));
  }));
  admin.put('/stories/:id/scenes/:n', wrap((req, res) => {
    const id = req.params.id;
    assertEditable(id);
    const n = Number(req.params.n);
    const cur = need(row<{ data: string }>(db, 'SELECT data FROM scenes WHERE story_id = ? AND scene_number = ?', id, n), 'Adegan tidak ditemukan.');
    const next = sceneFields(req.body as Body, JSON.parse(cur.data)) as Scene;
    writeScene(id, next);
    touch(id);
    res.json(storyDetail(id));
  }));
  admin.delete('/stories/:id/scenes/:n', wrap((req, res) => {
    const id = req.params.id;
    assertEditable(id);
    const n = Number(req.params.n);
    const raw = need(loadStoryRaw(db, id));
    if (raw.interactive2DStatus === 'ready') throw new HttpError(409, 'Cerita ini bertanda siap 2D. Ubah status 2D menjadi not-ready sebelum menghapus adegan.');
    tx(db, () => {
      db.prepare('DELETE FROM scenes WHERE story_id = ? AND scene_number = ?').run(id, n);
      db.prepare('DELETE FROM visual_assets WHERE story_id = ? AND scene_number = ?').run(id, n);
      const rest = raw.scenes.filter((s) => s.sceneNumber !== n);
      db.prepare('DELETE FROM scenes WHERE story_id = ?').run(id);
      rest.forEach((s, i) => writeScene(id, { ...s, sceneNumber: i + 1, totalScenes: rest.length }));
      saveMeta(id, { sceneCount: rest.length });
    });
    res.json(storyDetail(id));
  }));

  // ---------- sources ----------
  const sourceBody = (b: Body) => ({
    title: str(b.title, 300), author: str(b.author, 200), publisher: str(b.publisher, 200),
    year: Number.isInteger(b.publicationYear) ? (b.publicationYear as number) : null,
    url: str(b.urlOrReference, 500), rights: ['unknown', 'public-domain', 'licensed', 'permission-granted', 'restricted'].includes(b.rightsStatus as string) ? (b.rightsStatus as string) : 'unknown',
    license: str(b.license, 200), verification: ['unverified', 'verified', 'rejected'].includes(b.verificationStatus as string) ? (b.verificationStatus as string) : 'unverified',
  });
  admin.get('/sources', wrap((_req, res) => res.json(rows(db, 'SELECT * FROM sources ORDER BY title'))));
  admin.post('/sources', wrap((req, res) => {
    const s = sourceBody(req.body as Body);
    if (!s.title) throw new HttpError(400, 'Judul sumber wajib diisi.');
    const id = uid('src');
    const t = now();
    db.prepare(`INSERT INTO sources (id, title, author, publisher, publication_year, url_or_reference, rights_status, license, verification_status, created_at, updated_at) VALUES (?,?,?,?,?,?,?,?,?,?,?)`)
      .run(id, s.title, s.author, s.publisher, s.year, s.url, s.rights, s.license, 'unverified', t, t);
    res.status(201).json(row(db, 'SELECT * FROM sources WHERE id = ?', id));
  }));
  admin.patch('/sources/:id', wrap((req, res) => {
    const cur = need(row(db, 'SELECT * FROM sources WHERE id = ?', req.params.id));
    const b = req.body as Body;
    const s = sourceBody({ title: cur.title, author: cur.author, publisher: cur.publisher, publicationYear: cur.publication_year, urlOrReference: cur.url_or_reference, rightsStatus: cur.rights_status, license: cur.license, verificationStatus: cur.verification_status, ...b });
    if (!s.title) throw new HttpError(400, 'Judul sumber wajib diisi.');
    db.prepare(`UPDATE sources SET title=?, author=?, publisher=?, publication_year=?, url_or_reference=?, rights_status=?, license=?, verification_status=?, updated_at=? WHERE id=?`)
      .run(s.title, s.author, s.publisher, s.year, s.url, s.rights, s.license, s.verification, now(), req.params.id);
    res.json(row(db, 'SELECT * FROM sources WHERE id = ?', req.params.id));
  }));
  admin.post('/stories/:id/sources', wrap((req, res) => {
    need(row(db, 'SELECT 1 FROM stories WHERE id = ?', req.params.id), 'Cerita tidak ditemukan.');
    const sourceId = str((req.body as Body).sourceId, 80);
    need(row(db, 'SELECT 1 FROM sources WHERE id = ?', sourceId), 'Sumber tidak ditemukan.');
    db.prepare('INSERT OR IGNORE INTO story_sources (story_id, source_id) VALUES (?, ?)').run(req.params.id, sourceId);
    res.json(storyDetail(req.params.id));
  }));
  admin.delete('/stories/:id/sources/:sourceId', wrap((req, res) => {
    db.prepare('DELETE FROM story_sources WHERE story_id = ? AND source_id = ?').run(req.params.id, req.params.sourceId);
    res.json(storyDetail(req.params.id));
  }));

  // ---------- cultural content ----------
  admin.post('/stories/:id/cultural', wrap((req, res) => {
    const b = req.body as Body;
    need(row(db, 'SELECT 1 FROM stories WHERE id = ?', req.params.id), 'Cerita tidak ditemukan.');
    const title = str(b.title, 300), description = str(b.description, 3000);
    if (!title || !description) throw new HttpError(400, 'Judul dan deskripsi wajib diisi.');
    const sourceId = str(b.sourceId, 80) || null;
    if (sourceId) need(row(db, 'SELECT 1 FROM sources WHERE id = ?', sourceId), 'Sumber tidak ditemukan.');
    const t = now();
    db.prepare(`INSERT INTO cultural_content (id, story_id, scene_number, type, title, description, source_id, verification_status, created_at, updated_at) VALUES (?,?,?,?,?,?,?, 'unverified', ?, ?)`)
      .run(uid('cc'), req.params.id, Number.isInteger(b.sceneNumber) ? (b.sceneNumber as number) : null, str(b.type, 60) || 'Nilai Budaya', title, description, sourceId, t, t);
    res.status(201).json(storyDetail(req.params.id));
  }));
  admin.patch('/cultural/:id', wrap((req, res) => {
    const cur = need(row(db, 'SELECT * FROM cultural_content WHERE id = ?', req.params.id));
    const b = req.body as Body;
    const sourceId = 'sourceId' in b ? str(b.sourceId, 80) || null : cur.source_id;
    if (sourceId) need(row(db, 'SELECT 1 FROM sources WHERE id = ?', sourceId), 'Sumber tidak ditemukan.');
    const verification = 'verificationStatus' in b ? str(b.verificationStatus, 20) : cur.verification_status;
    if (!['unverified', 'verified', 'rejected'].includes(verification)) throw new HttpError(400, 'Status verifikasi tidak valid.');
    if (verification === 'verified' && !sourceId) throw new HttpError(422, 'Informasi budaya tanpa sumber tidak dapat ditandai terverifikasi (FR-CULT-02).');
    db.prepare('UPDATE cultural_content SET type=?, title=?, description=?, source_id=?, verification_status=?, updated_at=? WHERE id=?')
      .run('type' in b ? str(b.type, 60) : cur.type, 'title' in b ? str(b.title, 300) || cur.title : cur.title, 'description' in b ? str(b.description, 3000) || cur.description : cur.description, sourceId, verification, now(), req.params.id);
    res.json(storyDetail(cur.story_id));
  }));
  admin.delete('/cultural/:id', wrap((req, res) => {
    const cur = need(row(db, 'SELECT story_id FROM cultural_content WHERE id = ?', req.params.id));
    db.prepare('DELETE FROM cultural_content WHERE id = ?').run(req.params.id);
    res.json(storyDetail(cur.story_id));
  }));

  // ---------- characters ----------
  admin.post('/stories/:id/characters', wrap((req, res) => {
    const b = req.body as Body;
    need(row(db, 'SELECT 1 FROM stories WHERE id = ?', req.params.id), 'Cerita tidak ditemukan.');
    const name = str(b.name, 120);
    if (!name) throw new HttpError(400, 'Nama tokoh wajib diisi.');
    db.prepare('INSERT INTO characters (id, story_id, name, description, role, icon) VALUES (?,?,?,?,?,?)')
      .run(uid('ch'), req.params.id, name, str(b.description, 1500), str(b.role, 160), str(b.icon, 8) || '👤');
    res.status(201).json(storyDetail(req.params.id));
  }));
  admin.patch('/characters/:id', wrap((req, res) => {
    const cur = need(row(db, 'SELECT * FROM characters WHERE id = ?', req.params.id));
    const b = req.body as Body;
    db.prepare('UPDATE characters SET name=?, description=?, role=?, icon=?, archived=? WHERE id=?').run(
      'name' in b ? str(b.name, 120) || cur.name : cur.name, 'description' in b ? str(b.description, 1500) : cur.description,
      'role' in b ? str(b.role, 160) : cur.role, 'icon' in b ? str(b.icon, 8) : cur.icon, 'archived' in b ? (b.archived ? 1 : 0) : cur.archived, req.params.id);
    res.json(storyDetail(cur.story_id));
  }));

  // ---------- visuals (AI + manual) ----------
  const reviewable = ['pending', 'approved', 'rejected'];
  admin.post('/stories/:id/visuals', wrap((req, res) => {
    const b = req.body as Body;
    const id = req.params.id;
    const raw = need(loadStoryRaw(db, id), 'Cerita tidak ditemukan.');
    const sceneNumber = Number(b.sceneNumber);
    if (!Number.isInteger(sceneNumber) || sceneNumber < 0 || sceneNumber > raw.scenes.length) throw new HttpError(400, 'Nomor adegan tidak valid (0 = sampul).');
    const url = str(b.assetUrl, 800);
    if (!/^(https?:\/\/|\/)/.test(url)) throw new HttpError(400, 'URL gambar harus diawali http(s):// atau /.');
    const t = now();
    const vid = uid('va');
    db.prepare(`INSERT INTO visual_assets (id, story_id, scene_number, asset_url, alt, generation_method, status, license_status, created_at, updated_at) VALUES (?,?,?,?,?,'manual','pending',?,?,?)`)
      .run(vid, id, sceneNumber, url, str(b.alt, 400), str(b.licenseStatus, 40) || 'unknown', t, t);
    res.status(201).json(storyDetail(id));
  }));
  admin.post('/stories/:id/scenes/:n/visuals/generate', wrap(async (req, res) => {
    const id = req.params.id;
    const raw = need(loadStoryRaw(db, id), 'Cerita tidak ditemukan.');
    const n = Number(req.params.n);
    const scene = need(raw.scenes.find((s) => s.sceneNumber === n), 'Adegan tidak ditemukan.');
    try {
      const prompt = buildPrompt(raw, scene, str((req.body as Body).note, 500));
      const out = await generateImage(aiCfg, prompt);
      const t = now();
      db.prepare(`INSERT INTO visual_assets (id, story_id, scene_number, asset_url, alt, generation_method, prompt, prompt_version, status, license_status, created_at, updated_at) VALUES (?,?,?,?,?, 'ai', ?, ?, 'pending', 'unknown', ?, ?)`)
        .run(uid('va'), id, n, out.url, `Interpretasi visual AI: ${scene.actTitle}`, prompt, PROMPT_VERSION, t, t);
      res.status(201).json(storyDetail(id));
    } catch (e) {
      if (e instanceof AiNotConfiguredError) throw new HttpError(503, e.message, { code: 'AI_NOT_CONFIGURED' });
      if (e instanceof PromptBlockedError) throw new HttpError(422, e.message, { code: 'PROMPT_BLOCKED' });
      if (e instanceof AiVendorError) throw new HttpError(502, e.message, { code: 'AI_VENDOR_ERROR' });
      throw e;
    }
  }));
  admin.post('/visuals/:id/review', wrap((req, res) => {
    const cur = need(row(db, 'SELECT * FROM visual_assets WHERE id = ?', req.params.id));
    const b = req.body as Body;
    const status = str(b.status, 20);
    if (!reviewable.includes(status)) throw new HttpError(400, 'Status tinjauan tidak valid.');
    const license = 'licenseStatus' in b ? str(b.licenseStatus, 40) || 'unknown' : cur.license_status;
    if (status === 'approved' && license === 'unknown' && b.acceptUnknownLicense !== true)
      throw new HttpError(422, 'Visual tidak boleh disetujui tanpa status lisensi/hak yang jelas. Isi licenseStatus.', { code: 'LICENSE_REQUIRED' });
    tx(db, () => {
      db.prepare('UPDATE visual_assets SET status=?, license_status=?, review_note=?, reviewer_id=?, updated_at=? WHERE id=?')
        .run(status, license, str(b.note, 500), adminId(req), now(), req.params.id);
      // approving a visual replaces the previously approved one for the same scene
      if (status === 'approved')
        db.prepare(`UPDATE visual_assets SET status='rejected', review_note='Digantikan oleh visual yang lebih baru.', updated_at=? WHERE story_id=? AND scene_number=? AND id<>? AND status='approved'`)
          .run(now(), cur.story_id, cur.scene_number, req.params.id);
      db.prepare('UPDATE stories SET updated_at = ? WHERE id = ?').run(now(), cur.story_id);
    });
    res.json(storyDetail(cur.story_id));
  }));

  // ---------- interactive 2D ----------
  admin.get('/stories/:id/interactive2d', wrap((req, res) => res.json(need(validate2DReport(db, req.params.id), 'Cerita tidak ditemukan.'))));
  admin.patch('/stories/:id/interactive2d', wrap((req, res) => {
    const id = req.params.id;
    assertEditable(id);
    const status = str((req.body as Body).status, 20);
    if (!['ready', 'not-ready'].includes(status)) throw new HttpError(400, 'Status harus "ready" atau "not-ready".');
    if (status === 'ready') {
      const raw = need(loadStoryRaw(db, id));
      const probe = { ...raw, interactive2DStatus: 'ready' as const, defaultReaderMode: 'interactive-2d' as const };
      const report = validate2DReport(db, id)!;
      // re-run with the requested status applied
      void probe;
      const errors = report.errors.filter((e) => e.code !== 'status-not-ready');
      if (errors.length) throw new HttpError(422, 'Konfigurasi 2D belum valid; tidak dapat ditandai siap.', { errors });
      saveMeta(id, { interactive2DStatus: 'ready', defaultReaderMode: 'interactive-2d' });
    } else saveMeta(id, { interactive2DStatus: 'not-ready', defaultReaderMode: 'standard' });
    res.json(storyDetail(id));
  }));
  admin.get('/pixel-assets', wrap((_req, res) => res.json(pixelAssets(db))));
  admin.patch('/pixel-assets/:id', wrap((req, res) => {
    const cur = need(row<{ data: string }>(db, 'SELECT data FROM pixel_assets WHERE id = ?', req.params.id));
    const a = JSON.parse(cur.data);
    const b = req.body as Body;
    if ('licenseStatus' in b) {
      if (!['project-original', 'licensed', 'cc-by', 'public-domain', 'unknown'].includes(b.licenseStatus as string)) throw new HttpError(400, 'Status lisensi tidak valid.');
      a.licenseStatus = b.licenseStatus;
    }
    if ('culturalReviewStatus' in b) {
      if (!['pending', 'approved', 'rejected'].includes(b.culturalReviewStatus as string)) throw new HttpError(400, 'Status tinjauan tidak valid.');
      a.culturalReviewStatus = b.culturalReviewStatus;
    }
    if ('reviewNote' in b) a.reviewNote = str(b.reviewNote, 500);
    db.prepare('UPDATE pixel_assets SET data = ? WHERE id = ?').run(JSON.stringify(a), req.params.id);
    res.json(a);
  }));

  admin.get('/analytics/summary', wrap((_req, res) => {
    res.json(rows(db, 'SELECT name, COUNT(*) AS count FROM analytics_events GROUP BY name ORDER BY count DESC'));
  }));

  // ---------- errors ----------
  app.use('/api', (_req, _res, next) => next(new HttpError(404, 'Endpoint tidak ditemukan.')));
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
    if (err instanceof HttpError) return res.status(err.status).json({ error: err.message, ...err.extra });
    if ((err as any)?.type === 'entity.parse.failed') return res.status(400).json({ error: 'JSON tidak valid.' });
    console.error('[server error]', err);
    res.status(500).json({ error: 'Terjadi kesalahan pada server.' });
  });

  void checkPrompt;
  return app;
}
