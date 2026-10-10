/**
 * Validation of an Interactive 2D story configuration (FR-2D-SCN-06, FR-2D-MODE-02, FR-2D-BND-03/04,
 * FR-2D-CMP-02, FR-2D-CULT-01/02, FR-2D-AST-03, FR-CMS2D-11, PRD section 7 "Aturan validasi data").
 *
 * Pure and shared by the browser reader (to decide standard vs 2D) and the server (publish gate).
 */
import { GlossaryTerm, PixelAsset, PlayerAvatar, Scene, Story } from '../types';
import { sceneBounds } from './engine';

export interface Issue {
  code: string;
  message: string;
  sceneNumber?: number;
  ref?: string;
}
export interface ValidationResult {
  ok: boolean;
  errors: Issue[];
  warnings: Issue[];
}
export interface ValidationContext {
  assets: PixelAsset[];
  avatars: PlayerAvatar[];
  glossary: Pick<GlossaryTerm, 'term'>[];
}

const nonEmpty = (s?: string) => !!s && s.trim().length > 0;

export function validateStory2D(story: Story, ctx: ValidationContext): ValidationResult {
  const errors: Issue[] = [];
  const warnings: Issue[] = [];
  const err = (code: string, message: string, sceneNumber?: number, ref?: string) => errors.push({ code, message, sceneNumber, ref });
  const warn = (code: string, message: string, sceneNumber?: number, ref?: string) => warnings.push({ code, message, sceneNumber, ref });
  const asset = (id?: string) => ctx.assets.find((a) => a.id === id);
  const usedAssets = new Set<string>();

  const scenes = story.scenes ?? [];
  if (story.interactive2DStatus !== 'ready') err('status-not-ready', 'Status kesiapan 2D belum "ready".');
  if (scenes.length === 0) {
    err('no-scenes', 'Cerita tidak memiliki adegan.');
    return { ok: false, errors, warnings };
  }
  if (story.sceneCount !== scenes.length) err('scene-count-mismatch', `sceneCount (${story.sceneCount}) tidak sama dengan jumlah adegan sebenarnya (${scenes.length}).`);
  scenes.forEach((s, i) => {
    if (s.sceneNumber !== i + 1) err('scene-order', `Urutan adegan tidak berurutan: indeks ${i} bernomor ${s.sceneNumber}.`, s.sceneNumber);
    if (s.totalScenes !== scenes.length) err('total-scenes-mismatch', `totalScenes adegan ${s.sceneNumber} (${s.totalScenes}) tidak konsisten.`, s.sceneNumber);
  });

  const avatar = ctx.avatars.find((a) => a.id === story.playerAvatarId);
  if (!avatar) err('avatar-missing', 'Avatar pemandu tidak ditemukan.');
  else {
    usedAssets.add(avatar.spriteAssetId);
    if (!asset(avatar.spriteAssetId)) err('avatar-asset', `Aset avatar "${avatar.spriteAssetId}" tidak terdaftar.`);
  }

  for (const sc of scenes) validateScene(sc);

  function validateScene(sc: Scene) {
    const n = sc.sceneNumber;
    if (sc.mode !== 'interactive-2d') {
      err('scene-not-2d', 'Setiap adegan pada cerita 2D harus berkonfigurasi 2D (mode campuran belum didukung).', n);
      return;
    }
    const bg = asset(sc.backgroundAssetId);
    if (!bg) err('bg-missing', `Aset latar "${sc.backgroundAssetId}" tidak terdaftar.`, n);
    else if (bg.kind !== 'background') err('bg-kind', `Aset "${bg.id}" bukan latar.`, n);
    if (sc.backgroundAssetId) usedAssets.add(sc.backgroundAssetId);

    const world = sc.worldWidth ?? 0;
    if (!(world > 0)) err('world-width', 'worldWidth harus > 0.', n);
    const b = sceneBounds(sc);
    if (!(b.minX < b.maxX)) err('bounds-order', 'movementBounds: minX harus lebih kecil dari maxX.', n);
    if (b.minX < 0 || b.maxX > world) err('bounds-outside-world', 'movementBounds berada di luar worldWidth.', n);
    if (sc.avatarStartX == null || sc.avatarStartX < b.minX || sc.avatarStartX > b.maxX) err('start-outside-bounds', 'avatarStartX berada di luar batas gerak.', n);
    if (bg && world > 0 && bg.width !== world) warn('bg-width', `Lebar aset latar (${bg.width}) berbeda dari worldWidth (${world}).`, n);

    const isLast = n === scenes.length;
    if (sc.nextSceneNumber == null) {
      if (!isLast) err('next-missing', 'Adegan non-terakhir harus memiliki nextSceneNumber.', n);
    } else {
      if (sc.nextSceneNumber <= n) err('next-not-forward', 'nextSceneNumber harus menunjuk adegan berikutnya (alur linear).', n);
      if (!scenes.some((x) => x.sceneNumber === sc.nextSceneNumber)) err('next-unknown', `nextSceneNumber ${sc.nextSceneNumber} tidak ada.`, n);
      if (isLast) err('next-on-last', 'Adegan terakhir tidak boleh memiliki nextSceneNumber.', n);
    }

    const targets = sc.interactiveTargets ?? [];
    const events = sc.storyEvents ?? [];
    const unique = (ids: string[], what: string) => {
      const dup = ids.find((id, i) => ids.indexOf(id) !== i);
      if (dup) err('duplicate-id', `ID ${what} ganda: ${dup}.`, n, dup);
    };
    unique(targets.map((t) => t.id), 'target');
    unique(events.map((e) => e.id), 'event');

    for (const t of targets) {
      if (t.sceneNumber !== n) err('target-scene', `Target ${t.id} merujuk adegan lain (${t.sceneNumber}).`, n, t.id);
      const sprite = asset(t.spriteAssetId);
      if (!sprite) err('target-sprite', `Sprite target ${t.id} ("${t.spriteAssetId}") tidak terdaftar.`, n, t.id);
      usedAssets.add(t.spriteAssetId);
      if (!(t.interactionRadius > 0)) err('radius', `Radius interaksi target ${t.id} harus > 0.`, n, t.id);
      if (t.positionX < 0 || t.positionX > world) err('target-outside-world', `Target ${t.id} berada di luar dunia.`, n, t.id);
      // FR-2D-BND-04: some reachable avatar position must lie within the interaction radius
      const nearest = Math.min(b.maxX, Math.max(b.minX, t.positionX));
      if (Math.abs(nearest - t.positionX) > t.interactionRadius) err('unreachable', `Target ${t.id} tidak dapat dijangkau avatar di dalam batas gerak.`, n, t.id);
      if (!nonEmpty(t.hint)) err('hint-missing', `Target ${t.id} tidak memiliki petunjuk interaksi.`, n, t.id);
      if (!nonEmpty(t.label)) err('label-missing', `Target ${t.id} tidak memiliki label.`, n, t.id);
      const ev = events.find((e) => e.id === t.eventId);
      if (!ev) err('target-event', `Target ${t.id} merujuk event "${t.eventId}" yang tidak ada.`, n, t.id);
      else if (ev.triggerTargetId !== t.id) err('event-target-mismatch', `Event ${ev.id} tidak merujuk balik target ${t.id}.`, n, t.id);
      if (t.culturalContent) checkCultural(t.culturalContent, n, t.id);
      if (t.type === 'environment' && !t.culturalContent) err('cultural-data-missing', `Target budaya ${t.id} tidak memiliki data budaya terkurasi (tidak boleh sintetis).`, n, t.id);
    }
    for (const sprite of sc.decorSprites ?? []) {
      if (!asset(sprite.spriteAssetId)) err('decor-sprite', `Sprite dekoratif "${sprite.spriteAssetId}" tidak terdaftar.`, n, sprite.id);
      usedAssets.add(sprite.spriteAssetId);
      if (targets.some((t) => t.id === sprite.id)) err('decor-is-target', `Objek dekoratif ${sprite.id} tidak boleh sekaligus target.`, n, sprite.id);
    }
    for (const e of events) {
      const t = targets.find((x) => x.id === e.triggerTargetId);
      if (!t) err('event-trigger', `Event ${e.id} merujuk target pemicu "${e.triggerTargetId}" yang tidak ada.`, n, e.id);
      else if (t.eventId !== e.id) err('event-target-mismatch', `Target ${t.id} tidak merujuk event ${e.id}.`, n, e.id);
      if (e.sceneNumber !== n) err('event-scene', `Event ${e.id} merujuk adegan lain.`, n, e.id);
      if (e.type === 'cultural-info') {
        if (!e.culturalContent) err('cultural-data-missing', `Event budaya ${e.id} tidak memiliki konten budaya.`, n, e.id);
        else checkCultural(e.culturalContent, n, e.id);
      } else if (!e.lines || e.lines.length === 0 || e.lines.some((l) => !nonEmpty(l.text))) {
        err('lines-missing', `Event ${e.id} tidak memiliki teks dialog/narasi.`, n, e.id);
      }
      if (e.culturalContent && e.type !== 'cultural-info') checkCultural(e.culturalContent, n, e.id);
    }

    // completion path (FR-2D-CMP-02, FR-2D-TRN-02)
    const req = events.filter((e) => e.requirement === 'required');
    if (req.length === 0) err('no-required-event', 'Adegan harus memiliki minimal satu event wajib agar dapat diselesaikan.', n);
    else {
      const seqs = req.map((e) => e.sequence);
      if (req.length > 1 && seqs.some((s) => s == null)) err('sequence-missing', 'Event wajib lebih dari satu harus memiliki sequence.', n);
      if (new Set(seqs).size !== seqs.length) err('sequence-duplicate', 'Sequence event wajib tidak boleh sama.', n);
      const ordered = [...req].sort((a, b) => (a.sequence ?? 0) - (b.sequence ?? 0));
      const last = ordered[ordered.length - 1];
      if (last.afterEvent !== 'advance-scene') err('no-advance', `Event wajib terakhir (${last.id}) harus berakhir dengan 'advance-scene'.`, n, last.id);
      for (const e of ordered.slice(0, -1)) if (e.afterEvent === 'advance-scene') err('early-advance', `Event wajib ${e.id} bukan yang terakhir tetapi memakai 'advance-scene'.`, n, e.id);
    }
    for (const e of events.filter((x) => x.requirement === 'optional'))
      if (e.afterEvent === 'advance-scene') err('optional-advance', `Event opsional ${e.id} tidak boleh memindahkan adegan.`, n, e.id);
  }

  function checkCultural(c: NonNullable<Scene['storyEvents']>[number]['culturalContent'], n: number, ref: string) {
    if (!c) return;
    if (c.glossaryTerm && !ctx.glossary.some((g) => g.term === c.glossaryTerm)) err('glossary-missing', `Istilah glosarium "${c.glossaryTerm}" tidak ditemukan.`, n, ref);
    if (!c.annotation || !nonEmpty(c.annotation.title) || !nonEmpty(c.annotation.description)) err('cultural-incomplete', 'Informasi budaya wajib memiliki judul dan deskripsi.', n, ref);
    else if (!nonEmpty(c.annotation.source)) err('cultural-no-source', 'Setiap informasi budaya wajib memiliki sumber (FR-CULT-02).', n, ref);
  }

  // asset provenance gate (FR-2D-AST-02..05, AC-2D-19)
  for (const id of usedAssets) {
    const a = asset(id);
    if (!a) continue;
    if (a.licenseStatus === 'unknown') err('asset-license', `Aset "${a.id}" tidak memiliki status lisensi/hak yang jelas.`, undefined, a.id);
    if (!nonEmpty(a.source)) err('asset-source', `Aset "${a.id}" tidak memiliki sumber.`, undefined, a.id);
    if (a.culturalReviewStatus === 'rejected') err('asset-rejected', `Aset "${a.id}" ditolak pada tinjauan.`, undefined, a.id);
    if (a.culturalReviewStatus === 'pending') warn('asset-review-pending', `Aset "${a.id}" belum ditinjau terhadap sumber budaya terkurasi (FR-2D-AST-05).`, undefined, a.id);
  }

  return { ok: errors.length === 0, errors, warnings };
}

/** FR-2D-MODE-02: a story opens in 2D only if it is flagged ready AND its configuration validates. */
export const isStory2DReady = (story: Story, ctx: ValidationContext) => validateStory2D(story, ctx).ok;
