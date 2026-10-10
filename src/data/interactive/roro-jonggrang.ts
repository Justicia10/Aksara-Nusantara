import { CulturalAnnotation, Scene, Story } from '../../types';

/**
 * Interactive 2D configuration for the vertical-slice story "Roro Jonggrang & Pasukan Jin".
 *
 * This is DATA, not view logic (FR-2D-SCN-02): the reader only consumes the shapes in src/types.ts.
 * All dialogue is taken verbatim from the story's existing curated scene paragraphs, and all cultural
 * information comes from the scene's existing `culturalAnnotation` (title/description/source). Nothing
 * here is newly authored cultural content (FR-2D-CULT-01).
 *
 * Coordinates are in logical art pixels (OQ34 default). Interaction radius is per target (OQ31 default).
 * Editorial mapping choices (e.g. which object carries which annotation) are flagged for cultural review.
 */
export const RORO_JONGGRANG_STORY_ID = 'roro-jonggrang';

type Config2D = Pick<
  Scene,
  | 'mode' | 'backgroundAssetId' | 'backgroundAlt' | 'worldWidth' | 'movementBounds' | 'avatarStartX'
  | 'interactiveTargets' | 'storyEvents' | 'decorSprites' | 'nextSceneNumber'
>;

const RADIUS = 36;

export function buildRoroJonggrang2D(scenes: Scene[]): Record<number, Config2D> {
  const sc = (n: number) => scenes.find((s) => s.sceneNumber === n)!;
  const para = (n: number, i: number) => sc(n).paragraphs[i];
  const ann = (n: number): CulturalAnnotation => sc(n).culturalAnnotation;
  const narr = (n: number, i: number) => ({ speaker: 'Narator', text: para(n, i) });
  // sentences of a paragraph, verbatim (no rewording), used to split one paragraph across targets
  const sentences = (n: number, i: number) => para(n, i).match(/[^.]+\.(\s|$)/g)!.map((t) => t.trim());
  const sent = (n: number, i: number, from: number, to = from) => ({ speaker: 'Narator', text: sentences(n, i).slice(from, to + 1).join(' ') });

  return {
    1: {
      mode: 'interactive-2d',
      backgroundAssetId: 'bg-s1',
      backgroundAlt: 'Senja di pelataran Keraton Prambanan',
      worldWidth: 480,
      movementBounds: { minX: 24, maxX: 456 },
      avatarStartX: 48,
      nextSceneNumber: 2,
      decorSprites: [
        { id: 'd1-obor-a', spriteAssetId: 'decor-obor', positionX: 90 },
        { id: 'd1-obor-b', spriteAssetId: 'decor-obor', positionX: 410 },
        { id: 'd1-batu', spriteAssetId: 'decor-batu', positionX: 215, offsetY: -2 },
      ],
      interactiveTargets: [
        { id: 't1-bandung', sceneNumber: 1, type: 'character', label: 'Bandung Bondowoso', spriteAssetId: 'char-bandung', entityRef: { kind: 'character', key: 'Bandung Bondowoso' }, positionX: 140, interactionRadius: RADIUS, hint: 'Dekati Bandung Bondowoso, lalu klik atau ketuk dia.', eventId: 'e1-bandung' },
        { id: 't1-singgasana', sceneNumber: 1, type: 'environment', label: 'Singgasana pendopo', spriteAssetId: 'obj-singgasana', entityRef: { kind: 'cultural-annotation', key: 'diplomasi-halus' }, positionX: 270, interactionRadius: RADIUS, hint: 'Dekati singgasana untuk membaca konteks budaya (opsional).', eventId: 'e1-budaya', culturalContent: { annotation: ann(1) } },
        { id: 't1-roro', sceneNumber: 1, type: 'character', label: 'Roro Jonggrang', spriteAssetId: 'char-roro', entityRef: { kind: 'character', key: 'Roro Jonggrang' }, positionX: 360, interactionRadius: RADIUS, hint: 'Dekati Roro Jonggrang, lalu klik atau ketuk dia.', eventId: 'e1-roro' },
      ],
      storyEvents: [
        { id: 'e1-bandung', sceneNumber: 1, triggerTargetId: 't1-bandung', type: 'narration', requirement: 'required', sequence: 1, lines: [narr(1, 0)], afterEvent: 'return-control' },
        { id: 'e1-budaya', sceneNumber: 1, triggerTargetId: 't1-singgasana', type: 'cultural-info', requirement: 'optional', culturalContent: { annotation: ann(1) }, afterEvent: 'return-control' },
        { id: 'e1-roro', sceneNumber: 1, triggerTargetId: 't1-roro', type: 'narration', requirement: 'required', sequence: 2, lines: [narr(1, 1)], afterEvent: 'advance-scene' },
      ],
    },
    2: {
      mode: 'interactive-2d',
      backgroundAssetId: 'bg-s2',
      backgroundAlt: 'Tengah malam di Dataran Kewu di bawah bulan purnama',
      worldWidth: 640,
      movementBounds: { minX: 24, maxX: 616 },
      avatarStartX: 48,
      nextSceneNumber: 3,
      decorSprites: [
        { id: 'd2-palem', spriteAssetId: 'decor-palem', positionX: 140 },
        { id: 'd2-obor', spriteAssetId: 'decor-obor', positionX: 250 },
        { id: 'd2-batu', spriteAssetId: 'decor-batu', positionX: 560, offsetY: -2 },
      ],
      interactiveTargets: [
        { id: 't2-bandung', sceneNumber: 2, type: 'character', label: 'Bandung Bondowoso', spriteAssetId: 'char-bandung', entityRef: { kind: 'character', key: 'Bandung Bondowoso' }, positionX: 330, interactionRadius: RADIUS, hint: 'Dekati Bandung Bondowoso, lalu klik atau ketuk dia.', eventId: 'e2-bandung' },
        { id: 't2-batu', sceneNumber: 2, type: 'environment', label: 'Batu andesit candi', spriteAssetId: 'obj-batu', entityRef: { kind: 'cultural-annotation', key: 'batu-andesit' }, positionX: 470, interactionRadius: RADIUS, hint: 'Dekati tumpukan batu untuk membaca konteks budaya (opsional).', eventId: 'e2-budaya', culturalContent: { annotation: ann(2) } },
      ],
      storyEvents: [
        { id: 'e2-bandung', sceneNumber: 2, triggerTargetId: 't2-bandung', type: 'narration', requirement: 'required', sequence: 1, lines: [narr(2, 0), narr(2, 1)], afterEvent: 'advance-scene' },
        { id: 'e2-budaya', sceneNumber: 2, triggerTargetId: 't2-batu', type: 'cultural-info', requirement: 'optional', culturalContent: { annotation: ann(2) }, afterEvent: 'return-control' },
      ],
    },
    3: {
      mode: 'interactive-2d',
      backgroundAssetId: 'bg-s3',
      backgroundAlt: 'Dini hari di halaman keputren',
      worldWidth: 480,
      movementBounds: { minX: 24, maxX: 456 },
      avatarStartX: 48,
      nextSceneNumber: 4,
      decorSprites: [
        { id: 'd3-palem', spriteAssetId: 'decor-palem', positionX: 300 },
        { id: 'd3-obor', spriteAssetId: 'decor-obor', positionX: 90 },
      ],
      interactiveTargets: [
        { id: 't3-lesung', sceneNumber: 3, type: 'object', label: 'Lesung dan alu', spriteAssetId: 'obj-lesung', entityRef: { kind: 'glossary-term', key: 'Gejog Lesung' }, positionX: 120, interactionRadius: RADIUS, hint: 'Dekati lesung untuk membaca konteks budaya (opsional).', eventId: 'e3-budaya', culturalContent: { glossaryTerm: 'Gejog Lesung', annotation: ann(3) } },
        { id: 't3-roro', sceneNumber: 3, type: 'character', label: 'Roro Jonggrang', spriteAssetId: 'char-roro', entityRef: { kind: 'character', key: 'Roro Jonggrang' }, positionX: 220, interactionRadius: RADIUS, hint: 'Dekati Roro Jonggrang, lalu klik atau ketuk dia.', eventId: 'e3-roro' },
        { id: 't3-dayang', sceneNumber: 3, type: 'character', label: 'Dayang istana', spriteAssetId: 'char-dayang', positionX: 290, interactionRadius: RADIUS, hint: 'Dekati dayang istana, lalu klik atau ketuk.', eventId: 'e3-dayang-info' },
        { id: 't3-ayam', sceneNumber: 3, type: 'object', label: 'Ayam jantan', spriteAssetId: 'obj-ayam', positionX: 400, interactionRadius: RADIUS, hint: 'Dekati ayam jantan, lalu klik atau ketuk.', eventId: 'e3-ayam' },
      ],
      storyEvents: [
        { id: 'e3-budaya', sceneNumber: 3, triggerTargetId: 't3-lesung', type: 'cultural-info', requirement: 'optional', culturalContent: { glossaryTerm: 'Gejog Lesung', annotation: ann(3) }, afterEvent: 'return-control' },
        { id: 'e3-roro', sceneNumber: 3, triggerTargetId: 't3-roro', type: 'narration', requirement: 'required', sequence: 1, lines: [sent(3, 0, 0, 1), sent(3, 0, 2)], afterEvent: 'return-control' },
        // the attendants carry out the order described in the last sentence of the first paragraph (verbatim)
        { id: 'e3-dayang-info', sceneNumber: 3, triggerTargetId: 't3-dayang', type: 'narration', requirement: 'optional', lines: [sent(3, 0, 3)], afterEvent: 'return-control' },
        { id: 'e3-ayam', sceneNumber: 3, triggerTargetId: 't3-ayam', type: 'narration', requirement: 'required', sequence: 2, lines: [narr(3, 1)], afterEvent: 'advance-scene' },
      ],
    },
    4: {
      mode: 'interactive-2d',
      backgroundAssetId: 'bg-s4',
      backgroundAlt: 'Fajar di pelataran candi',
      worldWidth: 400,
      movementBounds: { minX: 24, maxX: 376 },
      avatarStartX: 48,
      // last scene: no nextSceneNumber -> completing the final required event ends the story
      decorSprites: [
        { id: 'd4-obor', spriteAssetId: 'decor-obor', positionX: 90 },
        { id: 'd4-batu', spriteAssetId: 'decor-batu', positionX: 360, offsetY: -2 },
      ],
      interactiveTargets: [
        { id: 't4-bandung', sceneNumber: 4, type: 'character', label: 'Bandung Bondowoso', spriteAssetId: 'char-bandung', entityRef: { kind: 'character', key: 'Bandung Bondowoso' }, positionX: 150, interactionRadius: RADIUS, hint: 'Dekati Bandung Bondowoso, lalu klik atau ketuk dia.', eventId: 'e4-bandung' },
        { id: 't4-roro', sceneNumber: 4, type: 'character', label: 'Roro Jonggrang', spriteAssetId: 'char-roro', entityRef: { kind: 'character', key: 'Roro Jonggrang' }, positionX: 235, interactionRadius: RADIUS, hint: 'Dekati Roro Jonggrang, lalu klik atau ketuk dia.', eventId: 'e4-roro' },
        { id: 't4-durga', sceneNumber: 4, type: 'environment', label: 'Arca Durga', spriteAssetId: 'obj-durga', entityRef: { kind: 'cultural-annotation', key: 'durga' }, positionX: 320, interactionRadius: RADIUS, hint: 'Dekati arca untuk membaca konteks budaya (opsional).', eventId: 'e4-budaya', culturalContent: { annotation: ann(4) } },
      ],
      storyEvents: [
        { id: 'e4-bandung', sceneNumber: 4, triggerTargetId: 't4-bandung', type: 'narration', requirement: 'required', sequence: 1, lines: [narr(4, 0)], afterEvent: 'return-control' },
        { id: 'e4-budaya', sceneNumber: 4, triggerTargetId: 't4-durga', type: 'cultural-info', requirement: 'optional', culturalContent: { annotation: ann(4) }, afterEvent: 'return-control' },
        { id: 'e4-roro', sceneNumber: 4, triggerTargetId: 't4-roro', type: 'narration', requirement: 'required', sequence: 2, lines: [narr(4, 1)], afterEvent: 'advance-scene' },
      ],
    },
  };
}

/** Returns a copy of the story with the 2D configuration merged in (scenes keep every original field). */
export function applyRoroJonggrang2D(story: Story): Story {
  const cfg = buildRoroJonggrang2D(story.scenes);
  const scenes = story.scenes.map((s) => ({ ...s, ...(cfg[s.sceneNumber] ?? {}) }));
  return {
    ...story,
    sceneCount: scenes.length,
    scenes: scenes.map((s) => ({ ...s, totalScenes: scenes.length })),
    defaultReaderMode: 'interactive-2d',
    interactive2DStatus: 'ready',
    playerAvatarId: 'pemandu-nusa',
  };
}
