import { PixelAsset } from '../../types';

/**
 * Registry of pixel-art assets for Interactive 2D mode (FR-2D-AST-01..05).
 *
 * Provenance is declared here explicitly - it is never inferred from a URL (FR-2D-AST-04).
 * All current assets were produced by scripts/generate-pixel-assets.mjs: hand-coded, procedural
 * placeholder art by the engineering team (no AI model, no third-party artwork), so the licence is
 * project-original. They have NOT been reviewed by a cultural editor: culturalReviewStatus stays
 * 'pending' until a named approver signs off (Open Question 35 - approver not yet assigned).
 */
const SRC = 'scripts/generate-pixel-assets.mjs (NGM engineering, procedural placeholder art)';
const base = {
  source: SRC,
  generationMethod: 'hand-coded-procedural' as const,
  licenseStatus: 'project-original' as const,
  culturalReviewStatus: 'pending' as const,
  reviewNote: 'Placeholder art; costume/architecture detail not yet checked against curated sources.',
};

export const PIXEL_ASSETS: PixelAsset[] = [
  { ...base, id: 'bg-s1', kind: 'background', url: '/assets/2d/bg-scene1-keraton.png', width: 480, height: 144, alt: 'Latar piksel: senja di pelataran keraton dengan siluet candi' },
  { ...base, id: 'bg-s2', kind: 'background', url: '/assets/2d/bg-scene2-tengah-malam.png', width: 640, height: 144, alt: 'Latar piksel: tengah malam berbulan purnama dengan siluet menara candi' },
  { ...base, id: 'bg-s3', kind: 'background', url: '/assets/2d/bg-scene3-keputren.png', width: 480, height: 144, alt: 'Latar piksel: dini hari di halaman keputren dengan pagar kayu' },
  { ...base, id: 'bg-s4', kind: 'background', url: '/assets/2d/bg-scene4-fajar.png', width: 400, height: 144, alt: 'Latar piksel: fajar di pelataran candi' },

  { ...base, id: 'avatar-pemandu', kind: 'avatar', url: '/assets/2d/avatar-pemandu.png', width: 16, height: 26, alt: 'Pemandu Nusa, penjelajah berjubah biru membawa lentera' },

  { ...base, id: 'char-roro', kind: 'character', url: '/assets/2d/char-roro-jonggrang.png', width: 16, height: 26, alt: 'Roro Jonggrang' },
  { ...base, id: 'char-bandung', kind: 'character', url: '/assets/2d/char-bandung-bondowoso.png', width: 16, height: 26, alt: 'Bandung Bondowoso' },
  { ...base, id: 'char-dayang', kind: 'character', url: '/assets/2d/char-dayang.png', width: 16, height: 26, alt: 'Dayang istana' },

  { ...base, id: 'obj-lesung', kind: 'object', url: '/assets/2d/obj-lesung.png', width: 26, height: 16, alt: 'Lesung dan alu penumbuk padi' },
  { ...base, id: 'obj-batu', kind: 'object', url: '/assets/2d/obj-batu-candi.png', width: 28, height: 22, alt: 'Tumpukan batu andesit candi' },
  { ...base, id: 'obj-singgasana', kind: 'object', url: '/assets/2d/obj-singgasana.png', width: 30, height: 24, alt: 'Singgasana pendopo' },
  { ...base, id: 'obj-durga', kind: 'object', url: '/assets/2d/obj-arca-durga.png', width: 22, height: 34, alt: 'Arca Durga di atas lapik batu' },
  { ...base, id: 'obj-ayam', kind: 'object', url: '/assets/2d/obj-ayam.png', width: 16, height: 16, alt: 'Ayam jantan' },

  { ...base, id: 'decor-palem', kind: 'decor', url: '/assets/2d/decor-palem.png', width: 18, height: 56, alt: 'Pohon palem (dekoratif)' },
  { ...base, id: 'decor-obor', kind: 'decor', url: '/assets/2d/decor-obor.png', width: 8, height: 30, alt: 'Obor (dekoratif)' },
  { ...base, id: 'decor-batu', kind: 'decor', url: '/assets/2d/decor-batu.png', width: 14, height: 10, alt: 'Batu kecil (dekoratif)' },
];

export const getPixelAsset = (id: string): PixelAsset | undefined => PIXEL_ASSETS.find((a) => a.id === id);

/** Logical (art-pixel) geometry shared by renderer, engine and validation. */
export const SCENE_HEIGHT = 144;
export const GROUND_Y = 112;
/** y of the sprites' feet (just below the ground line so figures stand on the floor band). */
export const FEET_Y = 120;
