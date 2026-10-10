import { DB, now } from './db';
import {
  GlossaryTerm, PixelAsset, PlayerAvatar, PublicContent, PublicationStatus, RegionDetail, Scene, SceneVisual, Story,
} from '../src/types';
import { Issue, validateStory2D } from '../src/engine2d/validate';

type Row = Record<string, any>;
const all = (db: DB, sql: string, ...p: any[]): Row[] => db.prepare(sql).all(...p) as Row[];
const one = (db: DB, sql: string, ...p: any[]): Row | undefined => db.prepare(sql).get(...p) as Row | undefined;

export const WORKFLOW: PublicationStatus[] = ['draft', 'content-review', 'visual-review', 'approved', 'published'];

// ---------- readers ----------
export function pixelAssets(db: DB): PixelAsset[] {
  return all(db, 'SELECT data FROM pixel_assets ORDER BY id').map((r) => JSON.parse(r.data));
}
export function avatars(db: DB): PlayerAvatar[] {
  return all(db, 'SELECT data FROM avatars ORDER BY id').map((r) => JSON.parse(r.data));
}
export function glossary(db: DB): GlossaryTerm[] {
  return all(db, 'SELECT data FROM glossary ORDER BY rowid').map((r) => JSON.parse(r.data));
}
export function regions(db: DB): Record<string, RegionDetail> {
  const out: Record<string, RegionDetail> = {};
  for (const r of all(db, 'SELECT key, data FROM regions ORDER BY rowid')) out[r.key] = JSON.parse(r.data);
  return out;
}
export const validationContext = (db: DB) => ({ assets: pixelAssets(db), avatars: avatars(db), glossary: glossary(db) });

const visualOf = (a?: Row): SceneVisual | undefined =>
  a ? { assetId: a.id, generationMethod: a.generation_method === 'ai' ? 'ai' : a.generation_method === 'manual' ? 'manual' : 'unknown', licenseStatus: a.license_status } : undefined;

/** Raw story with scenes, regardless of status (admin & internal use). Images are NOT filtered here. */
export function loadStoryRaw(db: DB, id: string): (Story & { status: PublicationStatus; legacyPublished: boolean; publishedAt: string | null }) | null {
  const r = one(db, 'SELECT * FROM stories WHERE id = ?', id);
  if (!r) return null;
  const meta = JSON.parse(r.data) as Story;
  const scenes = all(db, 'SELECT data FROM scenes WHERE story_id = ? ORDER BY scene_number', id).map((x) => JSON.parse(x.data) as Scene);
  return { ...meta, scenes, id: r.id, slug: r.slug, status: r.status, legacyPublished: !!r.legacy_published, publishedAt: r.published_at };
}

/** Only `approved` visuals reach the public reader (FR-AI-05, AC of 6.4). */
function approvedVisuals(db: DB, storyId: string): Map<number, Row> {
  const m = new Map<number, Row>();
  for (const a of all(db, `SELECT * FROM visual_assets WHERE story_id = ? AND status = 'approved' ORDER BY created_at DESC, rowid DESC`, storyId))
    if (!m.has(a.scene_number)) m.set(a.scene_number, a);
  return m;
}

export function toPublicStory(db: DB, raw: NonNullable<ReturnType<typeof loadStoryRaw>>, ctx = validationContext(db)): Story {
  const vis = approvedVisuals(db, raw.id);
  const { status: _s, legacyPublished: _l, publishedAt: _p, ...story } = raw;
  const cover = vis.get(0);
  story.imageUrl = cover?.asset_url ?? '';
  story.coverVisual = visualOf(cover);
  story.scenes = raw.scenes.map((sc) => {
    const a = vis.get(sc.sceneNumber);
    return { ...sc, imageUrl: a?.asset_url ?? '', imageAlt: a?.alt || sc.imageAlt, visual: visualOf(a) };
  });
  story.metadataOnly = story.scenes.length === 0;
  // FR-CMS2D-12: invalid / unready 2D config silently falls back to the standard reader
  const wants2D = raw.interactive2DStatus === 'ready' && raw.defaultReaderMode === 'interactive-2d';
  if (wants2D && !validateStory2D(story, ctx).ok) {
    story.interactive2DStatus = 'not-ready';
    story.defaultReaderMode = 'standard';
  }
  return story;
}

export function publicContent(db: DB): PublicContent {
  const ctx = validationContext(db);
  const ids = all(db, `SELECT id FROM stories WHERE status = 'published' ORDER BY rowid`).map((r) => r.id as string);
  const stories = ids.map((id) => toPublicStory(db, loadStoryRaw(db, id)!, ctx));
  const used = new Set<string>();
  const ready = stories.filter((s) => s.interactive2DStatus === 'ready');
  for (const s of ready) {
    const av = ctx.avatars.find((a) => a.id === s.playerAvatarId);
    if (av) used.add(av.spriteAssetId);
    for (const sc of s.scenes) {
      if (sc.backgroundAssetId) used.add(sc.backgroundAssetId);
      sc.interactiveTargets?.forEach((t) => used.add(t.spriteAssetId));
      sc.decorSprites?.forEach((d) => used.add(d.spriteAssetId));
    }
  }
  const sources = all(
    db,
    `SELECT DISTINCT so.* FROM sources so JOIN story_sources ss ON ss.source_id = so.id JOIN stories st ON st.id = ss.story_id
     WHERE st.status = 'published' ORDER BY so.title`,
  ).map((s) => ({
    id: s.id, title: s.title, author: s.author, publisher: s.publisher, publicationYear: s.publication_year,
    urlOrReference: s.url_or_reference, verificationStatus: s.verification_status,
  }));
  return {
    stories,
    regions: regions(db),
    glossary: glossary(db),
    pixelAssets: ctx.assets.filter((a) => used.has(a.id)),
    avatars: ctx.avatars.filter((a) => ready.some((s) => s.playerAvatarId === a.id)),
    sources,
  };
}

// ---------- publication gate (FR-CMS-01, section 8, FR-CMS2D-11) ----------
export interface GateResult {
  ok: boolean;
  blockers: Issue[];
  warnings: Issue[];
}

export function publicationGate(db: DB, storyId: string): GateResult {
  const blockers: Issue[] = [];
  const warnings: Issue[] = [];
  const raw = loadStoryRaw(db, storyId);
  if (!raw) return { ok: false, blockers: [{ code: 'not-found', message: 'Cerita tidak ditemukan.' }], warnings };
  const block = (code: string, message: string, ref?: string, sceneNumber?: number) => blockers.push({ code, message, ref, sceneNumber });

  if (!raw.title?.trim()) block('title', 'Judul cerita kosong.');
  if (!raw.summary?.trim()) block('summary', 'Ringkasan cerita kosong.');
  if (raw.scenes.length === 0) block('no-scenes', 'Cerita belum memiliki adegan.');
  raw.scenes.forEach((s, i) => {
    if (s.sceneNumber !== i + 1) block('scene-order', `Nomor adegan tidak berurutan pada posisi ${i + 1}.`, undefined, s.sceneNumber);
    if (!s.paragraphs?.length || s.paragraphs.every((p) => !p.trim())) block('empty-scene', `Adegan ${s.sceneNumber} kosong (tidak ada teks narasi).`, undefined, s.sceneNumber);
  });
  if (raw.sceneCount !== raw.scenes.length) warnings.push({ code: 'scene-count', message: `sceneCount (${raw.sceneCount}) berbeda dari jumlah adegan (${raw.scenes.length}); akan diselaraskan.` });

  // sources: at least one, all verified, rights known
  const srcs = all(db, 'SELECT so.* FROM sources so JOIN story_sources ss ON ss.source_id = so.id WHERE ss.story_id = ?', storyId);
  if (srcs.length === 0) block('no-source', 'Cerita belum memiliki sumber.');
  for (const s of srcs) {
    if (s.verification_status !== 'verified') block('source-unverified', `Sumber "${s.title}" belum diverifikasi.`, s.id);
    if (s.rights_status === 'unknown') block('source-rights', `Status hak sumber "${s.title}" belum jelas.`, s.id);
  }
  // cultural content: sourced + verified
  for (const c of all(db, 'SELECT * FROM cultural_content WHERE story_id = ?', storyId)) {
    if (!c.source_id) block('cultural-no-source', `Informasi budaya "${c.title}" belum memiliki sumber.`, c.id);
    else if (c.verification_status !== 'verified') block('cultural-unverified', `Informasi budaya "${c.title}" belum diverifikasi.`, c.id);
  }
  // visuals shown publicly must have a clear licence (asset w/o licence cannot be published)
  for (const a of approvedVisuals(db, storyId).values())
    if (a.license_status === 'unknown') block('visual-license', `Visual ${a.scene_number === 0 ? 'sampul' : `adegan ${a.scene_number}`} berstatus approved tetapi lisensi/hak belum jelas.`, a.id, a.scene_number || undefined);
  const pending = all(db, `SELECT COUNT(*) n FROM visual_assets WHERE story_id = ? AND status = 'pending'`, storyId)[0].n as number;
  if (pending > 0) warnings.push({ code: 'visual-pending', message: `${pending} visual masih menunggu tinjauan dan tidak akan tampil di publik.` });

  // Interactive 2D
  if (raw.interactive2DStatus === 'ready') {
    const pub = toPublicStoryForValidation(db, raw);
    const v = validateStory2D(pub, validationContext(db));
    for (const e of v.errors) block(`2d:${e.code}`, `[2D] ${e.message}`, e.ref, e.sceneNumber);
    for (const w of v.warnings) warnings.push({ ...w, code: `2d:${w.code}`, message: `[2D] ${w.message}` });
  }
  return { ok: blockers.length === 0, blockers, warnings };
}

function toPublicStoryForValidation(db: DB, raw: NonNullable<ReturnType<typeof loadStoryRaw>>): Story {
  return { ...raw, sceneCount: raw.scenes.length };
}

export function validate2DReport(db: DB, storyId: string) {
  const raw = loadStoryRaw(db, storyId);
  if (!raw) return null;
  const report = validateStory2D({ ...raw, interactive2DStatus: raw.interactive2DStatus ?? 'not-ready' }, validationContext(db));
  return { configured: raw.scenes.some((s) => s.mode === 'interactive-2d'), status: raw.interactive2DStatus ?? 'not-ready', ...report };
}

export function canTransition(from: PublicationStatus, to: PublicationStatus): boolean {
  if (to === from) return false;
  if (to === 'archived') return true;
  if (to === 'draft') return true; // unpublish / send back
  const i = WORKFLOW.indexOf(from);
  const j = WORKFLOW.indexOf(to);
  return i >= 0 && j === i + 1; // strictly forward one step at a time
}

export function setStatus(db: DB, storyId: string, to: PublicationStatus) {
  const t = now();
  db.prepare(`UPDATE stories SET status = ?, updated_at = ?, published_at = CASE WHEN ? = 'published' THEN COALESCE(published_at, ?) ELSE published_at END, legacy_published = CASE WHEN ? = 'published' THEN 0 ELSE legacy_published END WHERE id = ?`)
    .run(to, t, to, t, to, storyId);
}
