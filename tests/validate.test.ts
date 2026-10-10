import { describe, expect, it } from 'vitest';
import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { validateStory2D } from '../src/engine2d/validate';
import { STORIES } from '../src/data/stories';
import { PIXEL_ASSETS } from '../src/data/interactive/assets';
import { ctx, roro2D } from './helpers';

const codes = (r: ReturnType<typeof validateStory2D>) => r.errors.map((e) => e.code);

describe('2D configuration validation', () => {
  it('the shipped vertical slice validates (errors = 0)', () => {
    const r = validateStory2D(roro2D(), ctx());
    expect(r.errors).toEqual([]);
    expect(r.ok).toBe(true);
  });
  it('reports pending cultural review of assets as warnings, not silently as approved', () => {
    const r = validateStory2D(roro2D(), ctx());
    expect(r.warnings.some((w) => w.code === 'asset-review-pending')).toBe(true);
  });
  it('AC-2D-02: stories without 2D config are untouched and simply not ready', () => {
    for (const s of STORIES) {
      expect(s.interactive2DStatus).toBeUndefined();
      expect(s.defaultReaderMode).toBeUndefined();
      expect(validateStory2D(s, ctx()).ok).toBe(false);
    }
  });

  const mutate = (fn: (s: ReturnType<typeof roro2D>, c: ReturnType<typeof ctx>) => void) => {
    const s = roro2D();
    const c = ctx();
    fn(s, c);
    return validateStory2D(s, c);
  };

  it('rejects unreachable targets (FR-2D-BND-04)', () => {
    expect(codes(mutate((s) => { s.scenes[0].movementBounds = { minX: 24, maxX: 100 }; }))).toContain('unreachable');
  });
  it('rejects bad bounds / start (FR-2D-BND-03)', () => {
    expect(codes(mutate((s) => { s.scenes[0].movementBounds = { minX: 300, maxX: 100 }; }))).toContain('bounds-order');
    expect(codes(mutate((s) => { s.scenes[0].movementBounds = { minX: 24, maxX: 9999 }; }))).toContain('bounds-outside-world');
    expect(codes(mutate((s) => { s.scenes[0].avatarStartX = 3; }))).toContain('start-outside-bounds');
  });
  it('rejects broken target<->event references', () => {
    expect(codes(mutate((s) => { s.scenes[0].interactiveTargets![0].eventId = 'nope'; }))).toContain('target-event');
    expect(codes(mutate((s) => { s.scenes[0].storyEvents![0].triggerTargetId = 'nope'; }))).toContain('event-trigger');
  });
  it('rejects a missing / invalid next scene and non-linear links', () => {
    expect(codes(mutate((s) => { s.scenes[0].nextSceneNumber = 99; }))).toContain('next-unknown');
    expect(codes(mutate((s) => { s.scenes[1].nextSceneNumber = 1; }))).toContain('next-not-forward');
    expect(codes(mutate((s) => { delete s.scenes[0].nextSceneNumber; }))).toContain('next-missing');
    expect(codes(mutate((s) => { s.scenes[3].nextSceneNumber = 2; }))).toContain('next-on-last');
  });
  it('requires a completion path (FR-2D-CMP-02)', () => {
    expect(codes(mutate((s) => { s.scenes[1].storyEvents = s.scenes[1].storyEvents!.filter((e) => e.requirement === 'optional'); }))).toContain('no-required-event');
    expect(codes(mutate((s) => { s.scenes[0].storyEvents!.find((e) => e.id === 'e1-roro')!.afterEvent = 'return-control'; }))).toContain('no-advance');
  });
  it('rejects cultural targets without curated data or without a source (FR-2D-CULT-01/02)', () => {
    expect(codes(mutate((s) => { delete s.scenes[0].interactiveTargets!.find((t) => t.id === 't1-singgasana')!.culturalContent; }))).toContain('cultural-data-missing');
    expect(codes(mutate((s) => { s.scenes[0].storyEvents!.find((e) => e.id === 'e1-budaya')!.culturalContent!.annotation!.source = ' '; }))).toContain('cultural-no-source');
    expect(codes(mutate((s) => { s.scenes[2].storyEvents!.find((e) => e.id === 'e3-budaya')!.culturalContent!.glossaryTerm = 'Tidak Ada'; }))).toContain('glossary-missing');
  });
  it('blocks assets with unknown licence / rejected review (FR-2D-AST-03, AC-2D-19)', () => {
    expect(codes(mutate((_s, c) => { c.assets.find((a) => a.id === 'bg-s1')!.licenseStatus = 'unknown'; }))).toContain('asset-license');
    expect(codes(mutate((_s, c) => { c.assets.find((a) => a.id === 'char-roro')!.culturalReviewStatus = 'rejected'; }))).toContain('asset-rejected');
    expect(codes(mutate((_s, c) => { c.assets = c.assets.filter((a) => a.id !== 'obj-lesung'); }))).toContain('target-sprite');
  });
  it('rejects decorative sprites that collide with a target id (FR-2D-TGT-01)', () => {
    expect(codes(mutate((s) => { s.scenes[0].decorSprites![0].id = 't1-roro'; }))).toContain('decor-is-target');
  });
  it('enforces metadata consistency: sceneCount/totalScenes (PRD baseline finding)', () => {
    expect(codes(mutate((s) => { s.sceneCount = 8; }))).toContain('scene-count-mismatch');
    expect(codes(mutate((s) => { s.scenes[0].totalScenes = 8; }))).toContain('total-scenes-mismatch');
  });
  it('requires status ready', () => {
    expect(codes(mutate((s) => { s.interactive2DStatus = 'not-ready'; }))).toContain('status-not-ready');
  });
});

describe('asset files match their declared metadata', () => {
  const pngSize = (file: string) => {
    const b = readFileSync(file);
    return { w: b.readUInt32BE(16), h: b.readUInt32BE(20), sig: b.subarray(1, 4).toString() };
  };
  for (const a of PIXEL_ASSETS) {
    it(`${a.id}: file exists, is a PNG and has the declared size`, () => {
      const file = join(process.cwd(), 'public', a.url);
      expect(existsSync(file)).toBe(true);
      const { w, h, sig } = pngSize(file);
      expect(sig).toBe('PNG');
      expect([w, h]).toEqual([a.width, a.height]);
    });
    it(`${a.id}: provenance is declared, not inferred`, () => {
      expect(a.source.length).toBeGreaterThan(0);
      expect(a.licenseStatus).not.toBe('unknown');
      expect(['hand-coded-procedural', 'manual-artwork', 'ai-assisted', 'unknown']).toContain(a.generationMethod);
    });
  }
});
