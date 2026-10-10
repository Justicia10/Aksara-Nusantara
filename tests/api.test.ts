import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import type { AddressInfo } from 'node:net';
import type { Server } from 'node:http';
import { openDb } from '../server/db';
import { createApp } from '../server/app';
import { ensureAdmin, seedContent } from '../server/seed';
import { PublicContent } from '../src/types';

let server: Server;
let base: string;
let cookie = '';
const db = openDb(':memory:');

const api = async (path: string, init: RequestInit & { json?: unknown; auth?: boolean } = {}) => {
  const headers: Record<string, string> = { ...(init.headers as Record<string, string>) };
  if (init.json !== undefined) headers['Content-Type'] = 'application/json';
  if (init.auth !== false && cookie) headers.Cookie = cookie;
  const res = await fetch(base + path, { ...init, headers, body: init.json !== undefined ? JSON.stringify(init.json) : init.body });
  let body: any = null;
  try { body = await res.json(); } catch { /* empty */ }
  return { status: res.status, body, res };
};

beforeAll(async () => {
  seedContent(db);
  ensureAdmin(db, 'admin@test.local', 'correct-horse-battery');
  const app = createApp({ db, sessionSecret: 'test-secret-test-secret', ai: {} });
  await new Promise<void>((r) => { server = app.listen(0, r); });
  base = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
});
afterAll(() => new Promise<void>((r) => server.close(() => r())));

describe('public API', () => {
  it('serves published content without login (FR-CAT-01, FR-READ-07)', async () => {
    const { status, body } = await api('/api/content', { auth: false });
    expect(status).toBe(200);
    const c = body as PublicContent;
    expect(c.stories).toHaveLength(10);
    expect(Object.keys(c.regions).length).toBeGreaterThan(3);
    expect(c.glossary.length).toBeGreaterThan(0);
  });
  it('seed keeps scene metadata consistent with real data (sceneCount = scenes.length)', async () => {
    const c = (await api('/api/content', { auth: false })).body as PublicContent;
    for (const s of c.stories) expect(s.sceneCount).toBe(s.scenes.length);
    const roro = c.stories.find((s) => s.id === 'roro-jonggrang')!;
    expect(roro.scenes).toHaveLength(4);
    expect(roro.scenes.every((x) => x.totalScenes === 4)).toBe(true);
    expect(c.stories.filter((s) => s.metadataOnly)).toHaveLength(9);
  });
  it('exposes 2D only for the ready, valid story and ships only the assets it needs', async () => {
    const c = (await api('/api/content', { auth: false })).body as PublicContent;
    const ready = c.stories.filter((s) => s.interactive2DStatus === 'ready');
    expect(ready.map((s) => s.id)).toEqual(['roro-jonggrang']);
    expect(c.avatars.map((a) => a.id)).toEqual(['pemandu-nusa']);
    expect(c.pixelAssets.length).toBeGreaterThan(5);
  });
  it('does not label imported visuals as AI (provenance unknown, FR-2D-AST-04)', async () => {
    const c = (await api('/api/content', { auth: false })).body as PublicContent;
    const sc = c.stories[0].scenes[0];
    expect(sc.imageUrl).toMatch(/^https?:/);
    expect(sc.visual?.generationMethod).toBe('unknown');
  });
  it('analytics accepts known events only', async () => {
    expect((await api('/api/analytics', { method: 'POST', json: { name: 'story_open', storyId: 'x', sessionId: 's1' }, auth: false })).status).toBe(202);
    expect((await api('/api/analytics', { method: 'POST', json: { name: 'drop table' }, auth: false })).status).toBe(400);
  });
});

describe('admin auth', () => {
  it('rejects unauthenticated admin calls', async () => {
    expect((await api('/api/admin/stories', { auth: false })).status).toBe(401);
    expect((await api('/api/admin/stories/roro-jonggrang/status', { method: 'POST', json: { to: 'draft' }, auth: false })).status).toBe(401);
  });
  it('rejects wrong credentials, accepts right ones, cookie is HttpOnly+SameSite', async () => {
    expect((await api('/api/admin/login', { method: 'POST', json: { email: 'admin@test.local', password: 'nope' }, auth: false })).status).toBe(401);
    const r = await api('/api/admin/login', { method: 'POST', json: { email: 'admin@test.local', password: 'correct-horse-battery' }, auth: false });
    expect(r.status).toBe(200);
    const set = r.res.headers.get('set-cookie')!;
    expect(set).toMatch(/HttpOnly/);
    expect(set).toMatch(/SameSite=Strict/);
    cookie = set.split(';')[0];
    expect((await api('/api/admin/me')).status).toBe(200);
  });
  it('rejects a forged session token', async () => {
    const r = await api('/api/admin/me', { headers: { Cookie: 'ngm_session=eyJ1aWQiOiJ4IiwiZXhwIjo5OTk5OTk5OTk5OTk5fQ.AAAA' }, auth: false });
    expect(r.status).toBe(401);
  });
  it('rejects cross-origin writes', async () => {
    const r = await api('/api/admin/stories', { method: 'POST', json: { title: 'x', regionKey: 'jawa' }, headers: { Origin: 'https://evil.example' } });
    expect(r.status).toBe(403);
  });
  it('throttles repeated failed logins', async () => {
    let last = 0;
    for (let i = 0; i < 7; i++) last = (await api('/api/admin/login', { method: 'POST', json: { email: 'victim@test.local', password: 'x' }, auth: false })).status;
    expect(last).toBe(429);
  });
});

describe('CMS workflow & publication rules', () => {
  let id = '';
  it('creates a draft that is invisible to the public (FR-CAT-05)', async () => {
    const r = await api('/api/admin/stories', { method: 'POST', json: { title: 'Cerita Uji Coba', regionKey: 'jawa', summary: 'Ringkasan uji.' } });
    expect(r.status).toBe(201);
    id = r.body.story.id;
    const c = (await api('/api/content', { auth: false })).body as PublicContent;
    expect(c.stories.find((s) => s.id === id)).toBeUndefined();
  });
  it('cannot skip workflow steps or publish an empty story', async () => {
    expect((await api(`/api/admin/stories/${id}/status`, { method: 'POST', json: { to: 'published' } })).status).toBe(409);
    const r = await api(`/api/admin/stories/${id}/status`, { method: 'POST', json: { to: 'content-review' } });
    expect(r.status).toBe(422);
    expect(r.body.blockers.map((b: any) => b.code)).toContain('no-scenes');
  });
  it('blocks scenes with no text', async () => {
    await api(`/api/admin/stories/${id}/scenes`, { method: 'POST', json: { actTitle: 'Kosong' } });
    const r = await api(`/api/admin/stories/${id}/status`, { method: 'POST', json: { to: 'content-review' } });
    expect(r.status).toBe(422);
    expect(r.body.blockers.map((b: any) => b.code)).toContain('empty-scene');
  });
  it('walks the workflow, but publishing is blocked by unverified sources / cultural info', async () => {
    await api(`/api/admin/stories/${id}/scenes/1`, { method: 'PUT', json: { paragraphs: ['Alkisah di sebuah desa.'], culturalAnnotation: { title: 'Adat', description: 'Deskripsi adat.', source: 'Buku X' } } });
    for (const to of ['content-review', 'visual-review', 'approved']) expect((await api(`/api/admin/stories/${id}/status`, { method: 'POST', json: { to } })).status).toBe(200);
    const sc = (await api('/api/admin/sources', { method: 'POST', json: { title: 'Buku Cerita Rakyat', author: 'A. Penulis' } })).body;
    await api(`/api/admin/stories/${id}/sources`, { method: 'POST', json: { sourceId: sc.id } });
    const cc = (await api(`/api/admin/stories/${id}/cultural`, { method: 'POST', json: { title: 'Tradisi uji', description: 'Isi', sourceId: sc.id } })).body.cultural[0];
    let r = await api(`/api/admin/stories/${id}/status`, { method: 'POST', json: { to: 'published' } });
    expect(r.status).toBe(422);
    const codes = r.body.blockers.map((b: any) => b.code);
    expect(codes).toEqual(expect.arrayContaining(['source-unverified', 'source-rights', 'cultural-unverified']));
    // verify everything as an editor would
    await api(`/api/admin/sources/${sc.id}`, { method: 'PATCH', json: { verificationStatus: 'verified', rightsStatus: 'public-domain' } });
    await api(`/api/admin/cultural/${cc.id}`, { method: 'PATCH', json: { verificationStatus: 'verified' } });
    r = await api(`/api/admin/stories/${id}/status`, { method: 'POST', json: { to: 'published' } });
    expect(r.status).toBe(200);
    expect(r.body.story.status).toBe('published');
    const c = (await api('/api/content', { auth: false })).body as PublicContent;
    const pub = c.stories.find((s) => s.id === id)!;
    expect(pub).toBeTruthy();
    expect(pub.imageUrl).toBe(''); // no approved visual -> no image, text still readable (FR-READ-06)
    expect(pub.scenes[0].paragraphs[0]).toMatch(/Alkisah/);
  });
  it('published content cannot be edited until unpublished; unpublish hides it', async () => {
    expect((await api(`/api/admin/stories/${id}`, { method: 'PATCH', json: { title: 'Baru' } })).status).toBe(409);
    expect((await api(`/api/admin/stories/${id}/status`, { method: 'POST', json: { to: 'draft' } })).status).toBe(200);
    const c = (await api('/api/content', { auth: false })).body as PublicContent;
    expect(c.stories.find((s) => s.id === id)).toBeUndefined();
    expect((await api(`/api/admin/stories/${id}`, { method: 'PATCH', json: { title: 'Cerita Uji Baru', keywords: ['uji'] } })).status).toBe(200);
  });
  it('cultural info without a source cannot be marked verified (FR-CULT-02)', async () => {
    const d = (await api(`/api/admin/stories/${id}/cultural`, { method: 'POST', json: { title: 'Tanpa sumber', description: 'x' } })).body;
    const c = d.cultural.find((x: any) => x.title === 'Tanpa sumber');
    const r = await api(`/api/admin/cultural/${c.id}`, { method: 'PATCH', json: { verificationStatus: 'verified' } });
    expect(r.status).toBe(422);
  });
});

describe('visual review (FR-AI-03..06)', () => {
  const id = 'putri-hijau';
  it('only approved visuals appear publicly; rejected/pending do not', async () => {
    const before = ((await api('/api/content', { auth: false })).body as PublicContent).stories.find((s) => s.id === id)!;
    expect(before.imageUrl).toMatch(/^https?:/); // imported cover
    const v = (await api(`/api/admin/stories/${id}`)).body.visuals.find((x: any) => x.scene_number === 0);
    const rej = await api(`/api/admin/visuals/${v.id}/review`, { method: 'POST', json: { status: 'rejected', note: 'tidak sesuai tokoh' } });
    expect(rej.status).toBe(200);
    const after = ((await api('/api/content', { auth: false })).body as PublicContent).stories.find((s) => s.id === id)!;
    expect(after.imageUrl).toBe('');
  });
  it('approval requires a clear licence; replacement supersedes the previous approved visual', async () => {
    const add = await api(`/api/admin/stories/${id}/visuals`, { method: 'POST', json: { sceneNumber: 0, assetUrl: '/assets/2d/bg-scene1-keraton.png', alt: 'tes', licenseStatus: 'unknown' } });
    const vid = add.body.visuals.find((x: any) => x.asset_url.includes('keraton')).id;
    expect((await api(`/api/admin/visuals/${vid}/review`, { method: 'POST', json: { status: 'approved' } })).status).toBe(422);
    const ok = await api(`/api/admin/visuals/${vid}/review`, { method: 'POST', json: { status: 'approved', licenseStatus: 'project-original' } });
    expect(ok.status).toBe(200);
    const pub = ((await api('/api/content', { auth: false })).body as PublicContent).stories.find((s) => s.id === id)!;
    expect(pub.imageUrl).toContain('keraton');
  });
  it('AI generation without an API key fails clearly and creates nothing (no simulated success)', async () => {
    const before = (await api(`/api/admin/stories/roro-jonggrang`)).body.visuals.length;
    const r = await api('/api/admin/stories/roro-jonggrang/scenes/1/visuals/generate', { method: 'POST', json: {} });
    expect(r.status).toBe(503);
    expect(r.body.code).toBe('AI_NOT_CONFIGURED');
    expect((await api(`/api/admin/stories/roro-jonggrang`)).body.visuals.length).toBe(before);
  });
  it('blocks sensitive prompts before calling any vendor', async () => {
    const r = await api('/api/admin/stories/roro-jonggrang/scenes/1/visuals/generate', { method: 'POST', json: { note: 'hubungi saya di a@b.com' } });
    expect(r.status).toBe(422);
    expect(r.body.code).toBe('PROMPT_BLOCKED');
  });
});

describe('Interactive 2D governance (FR-CMS2D-11/12, AC-2D-19)', () => {
  it('reports the vertical slice as valid with pending cultural review warnings', async () => {
    const r = await api('/api/admin/stories/roro-jonggrang/interactive2d');
    expect(r.body.ok).toBe(true);
    expect(r.body.warnings.some((w: any) => w.code === 'asset-review-pending')).toBe(true);
  });
  it('an asset with unknown licence makes the story fall back to the standard reader automatically', async () => {
    await api('/api/admin/pixel-assets/bg-s2', { method: 'PATCH', json: { licenseStatus: 'unknown' } });
    const c = (await api('/api/content', { auth: false })).body as PublicContent;
    const roro = c.stories.find((s) => s.id === 'roro-jonggrang')!;
    expect(roro.interactive2DStatus).toBe('not-ready');
    expect(roro.defaultReaderMode).toBe('standard');
    expect(roro.scenes).toHaveLength(4); // text intact
    const gate = (await api('/api/admin/stories/roro-jonggrang')).body.gate;
    expect(gate.blockers.some((b: any) => b.code === '2d:asset-license')).toBe(true);
    await api('/api/admin/pixel-assets/bg-s2', { method: 'PATCH', json: { licenseStatus: 'project-original' } });
    const c2 = (await api('/api/content', { auth: false })).body as PublicContent;
    expect(c2.stories.find((s) => s.id === 'roro-jonggrang')!.interactive2DStatus).toBe('ready');
  });
  it('cannot mark a story without 2D config as ready', async () => {
    await api('/api/admin/stories/putri-hijau/status', { method: 'POST', json: { to: 'draft' } });
    const r = await api('/api/admin/stories/putri-hijau/interactive2d', { method: 'PATCH', json: { status: 'ready' } });
    expect(r.status).toBe(422);
  });
  it('legacy-published seed stories cannot be re-published until sources/rights/licences are resolved', async () => {
    const r = await api('/api/admin/stories/roro-jonggrang/status', { method: 'POST', json: { to: 'draft' } });
    expect(r.status).toBe(200);
    for (const to of ['content-review', 'visual-review', 'approved']) await api(`/api/admin/stories/roro-jonggrang/status`, { method: 'POST', json: { to } });
    const p = await api('/api/admin/stories/roro-jonggrang/status', { method: 'POST', json: { to: 'published' } });
    expect(p.status).toBe(422);
    expect(p.body.blockers.map((b: any) => b.code)).toEqual(expect.arrayContaining(['source-unverified', 'visual-license']));
  });
});
