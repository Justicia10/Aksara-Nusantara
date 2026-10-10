import { createHash } from 'node:crypto';
import { DB, now, tx } from './db';
import { hashPassword } from './security';
import { STORIES } from '../src/data/stories';
import { REGIONS } from '../src/data/regions';
import { GLOSSARY_TERMS } from '../src/data/glossary';
import { PIXEL_ASSETS } from '../src/data/interactive/assets';
import { PLAYER_AVATARS } from '../src/data/interactive/avatars';
import { applyRoroJonggrang2D, RORO_JONGGRANG_STORY_ID } from '../src/data/interactive/roro-jonggrang';
import { Story } from '../src/types';

const sid = (text: string) => 'src_' + createHash('sha1').update(text).digest('hex').slice(0, 10);

export interface SeedOptions {
  reset?: boolean;
}

/**
 * Seeds content from the prototype data files (src/data/*).
 *
 * Honesty notes (also in README):
 *  - Source records are derived from the free-text source strings in the prototype. We do not know
 *    their rights status or verification, so they are seeded as 'unverified' / rights 'unknown'.
 *  - Scene/cover images from the prototype are imported as 'approved' visuals so the existing
 *    experience keeps working, but with generation_method 'unknown' and license 'unknown'
 *    (provenance NOT verified). The reader therefore does not label them as AI-generated.
 *  - All seeded stories are marked legacy_published (they were visible in the prototype). The publication
 *    gate still blocks re-publishing them until sources/rights/visual licences are resolved.
 */
export function seedContent(db: DB, opts: SeedOptions = {}) {
  const existing = (db.prepare('SELECT COUNT(*) n FROM stories').get() as { n: number }).n;
  if (existing > 0 && !opts.reset) return { seeded: false };
  tx(db, () => {
    if (opts.reset) {
      for (const t of ['analytics_events', 'visual_assets', 'characters', 'cultural_content', 'story_sources', 'sources', 'scenes', 'stories', 'regions', 'glossary', 'pixel_assets', 'avatars'])
        db.exec(`DELETE FROM ${t}`);
    }
    const t = now();
    for (const r of Object.values(REGIONS)) db.prepare('INSERT INTO regions (key, data) VALUES (?, ?)').run(r.key, JSON.stringify(r));
    for (const g of GLOSSARY_TERMS) db.prepare('INSERT INTO glossary (term, data) VALUES (?, ?)').run(g.term, JSON.stringify(g));
    for (const a of PIXEL_ASSETS) db.prepare('INSERT INTO pixel_assets (id, data) VALUES (?, ?)').run(a.id, JSON.stringify(a));
    for (const a of PLAYER_AVATARS) db.prepare('INSERT INTO avatars (id, data) VALUES (?, ?)').run(a.id, JSON.stringify(a));

    const sourceIds = new Set<string>();
    const addSource = (title: string) => {
      const id = sid(title);
      if (!sourceIds.has(id)) {
        sourceIds.add(id);
        db.prepare(`INSERT INTO sources (id, title, created_at, updated_at) VALUES (?, ?, ?, ?)`).run(id, title, t, t);
      }
      return id;
    };

    for (const original of STORIES) {
      const story: Story = original.id === RORO_JONGGRANG_STORY_ID ? applyRoroJonggrang2D(original) : { ...original, sceneCount: original.scenes.length };
      const { scenes, ...meta } = story;
      // sceneCount reflects real data (PRD baseline finding: metadata said 8, data had 4)
      meta.sceneCount = scenes.length;
      db.prepare(`INSERT INTO stories (id, slug, status, data, legacy_published, created_at, updated_at, published_at) VALUES (?, ?, 'published', ?, 1, ?, ?, ?)`)
        .run(story.id, story.slug, JSON.stringify({ ...meta, imageUrl: '' }), t, t, t);
      const link = (sourceId: string) => db.prepare('INSERT OR IGNORE INTO story_sources (story_id, source_id) VALUES (?, ?)').run(story.id, sourceId);
      link(addSource(story.verifiedSource));

      if (story.imageUrl)
        db.prepare(`INSERT INTO visual_assets (id, story_id, scene_number, asset_url, alt, generation_method, status, license_status, review_note, created_at, updated_at)
                    VALUES (?, ?, 0, ?, ?, 'unknown', 'approved', 'unknown', ?, ?, ?)`)
          .run(`va_${story.id}_cover`, story.id, story.imageUrl, story.imageAlt, 'Impor dari prototipe; asal-usul dan lisensi belum diverifikasi.', t, t);

      const seenChars = new Set<string>();
      scenes.forEach((sc, idx) => {
        const { imageUrl, ...sceneRest } = sc;
        db.prepare('INSERT INTO scenes (story_id, scene_number, data) VALUES (?, ?, ?)').run(story.id, sc.sceneNumber, JSON.stringify({ ...sceneRest, imageUrl: '', totalScenes: scenes.length }));
        if (imageUrl)
          db.prepare(`INSERT INTO visual_assets (id, story_id, scene_number, asset_url, alt, generation_method, status, license_status, review_note, created_at, updated_at)
                      VALUES (?, ?, ?, ?, ?, 'unknown', 'approved', 'unknown', ?, ?, ?)`)
            .run(`va_${story.id}_s${sc.sceneNumber}`, story.id, sc.sceneNumber, imageUrl, sc.imageAlt, 'Impor dari prototipe; asal-usul dan lisensi belum diverifikasi.', t, t);
        const sourceId = addSource(sc.culturalAnnotation.source);
        link(sourceId);
        db.prepare(`INSERT INTO cultural_content (id, story_id, scene_number, type, title, description, source_id, verification_status, created_at, updated_at)
                    VALUES (?, ?, ?, 'Konteks Budaya', ?, ?, ?, 'unverified', ?, ?)`)
          .run(`cc_${story.id}_${idx + 1}`, story.id, sc.sceneNumber, sc.culturalAnnotation.title, sc.culturalAnnotation.description, sourceId, t, t);
        for (const ch of sc.characters) {
          if (seenChars.has(ch.name)) continue;
          seenChars.add(ch.name);
          db.prepare('INSERT INTO characters (id, story_id, name, description, role, icon) VALUES (?, ?, ?, ?, ?, ?)')
            .run(`ch_${story.id}_${seenChars.size}`, story.id, ch.name, '', ch.role, ch.icon);
        }
      });
    }
  });
  return { seeded: true };
}

/** Creates the admin user if it does not exist. Never ships a default password. */
export function ensureAdmin(db: DB, email: string, password: string, opts: { resetPassword?: boolean } = {}) {
  const e = email.trim().toLowerCase();
  const row = db.prepare('SELECT id FROM users WHERE email = ?').get(e) as { id: string } | undefined;
  if (row) {
    if (opts.resetPassword) db.prepare('UPDATE users SET password_hash = ? WHERE id = ?').run(hashPassword(password), row.id);
    return { created: false, id: row.id };
  }
  const id = 'usr_' + createHash('sha1').update(e).digest('hex').slice(0, 8);
  db.prepare(`INSERT INTO users (id, email, password_hash, role, status, created_at) VALUES (?, ?, ?, 'admin', 'active', ?)`).run(id, e, hashPassword(password), now());
  return { created: true, id };
}
