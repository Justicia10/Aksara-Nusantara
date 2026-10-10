#!/usr/bin/env node
/**
 * Generates the pixel-art PNG assets used by the Interactive 2D vertical slice
 * ("Roro Jonggrang & Pasukan Jin"). Output: public/assets/2d/*.png
 *
 * Provenance: these are hand-coded, procedural placeholder assets written by the
 * engineering team (no AI model, no third-party artwork). They are deterministic
 * and licence-clean ("project-original"), but they are NOT culturally reviewed
 * artwork - see src/data/interactive/assets.ts (culturalReviewStatus: 'pending').
 *
 * Run: npm run assets:generate
 */
import { deflateSync } from 'node:zlib';
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const OUT = join(dirname(fileURLToPath(import.meta.url)), '..', 'public', 'assets', '2d');
mkdirSync(OUT, { recursive: true });

// ---------- minimal PNG encoder ----------
const CRC = new Uint32Array(256).map((_, n) => {
  let c = n;
  for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  return c >>> 0;
});
const crc32 = (buf) => {
  let c = 0xffffffff;
  for (const b of buf) c = CRC[(c ^ b) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
};
const chunk = (type, data) => {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const td = Buffer.concat([Buffer.from(type), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(td));
  return Buffer.concat([len, td, crc]);
};
const encodePNG = (w, h, rgba) => {
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(w, 0);
  ihdr.writeUInt32BE(h, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // RGBA
  const raw = Buffer.alloc((w * 4 + 1) * h);
  for (let y = 0; y < h; y++) {
    raw[y * (w * 4 + 1)] = 0;
    rgba.copy(raw, y * (w * 4 + 1) + 1, y * w * 4, (y + 1) * w * 4);
  }
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', ihdr),
    chunk('IDAT', deflateSync(raw)),
    chunk('IEND', Buffer.alloc(0)),
  ]);
};

// ---------- tiny drawing toolkit ----------
const hex = (s) => {
  if (!s) return null;
  const v = parseInt(s.slice(1), 16);
  return [(v >> 16) & 255, (v >> 8) & 255, v & 255, 255];
};
class Canvas {
  constructor(w, h) {
    this.w = w;
    this.h = h;
    this.d = Buffer.alloc(w * h * 4);
  }
  px(x, y, c) {
    x = Math.round(x);
    y = Math.round(y);
    if (x < 0 || y < 0 || x >= this.w || y >= this.h || !c) return;
    const col = typeof c === 'string' ? hex(c) : c;
    const i = (y * this.w + x) * 4;
    this.d[i] = col[0];
    this.d[i + 1] = col[1];
    this.d[i + 2] = col[2];
    this.d[i + 3] = col[3];
  }
  rect(x, y, w, h, c) {
    for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) this.px(x + i, y + j, c);
  }
  save(name) {
    writeFileSync(join(OUT, name), encodePNG(this.w, this.h, this.d));
    console.log(`  ${name}  ${this.w}x${this.h}`);
  }
}
// deterministic RNG
let seed = 1337;
const rnd = () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296);

// 4x4 Bayer dithering between two colours
const BAYER = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5];
const mix = (a, b, t, x, y) => (BAYER[(y & 3) * 4 + (x & 3)] / 16 < t ? b : a);

function sky(c, groundY, stops) {
  // stops: [[yFrac, '#hex'], ...] dithered vertical bands
  for (let y = 0; y < groundY; y++) {
    const f = y / groundY;
    let k = 0;
    while (k < stops.length - 2 && f > stops[k + 1][0]) k++;
    const [f0, c0] = stops[k];
    const [f1, c1] = stops[k + 1];
    const t = Math.min(1, Math.max(0, (f - f0) / (f1 - f0)));
    for (let x = 0; x < c.w; x++) c.px(x, y, mix(c0, c1, t, x, y));
  }
}
function mountain(c, groundY, cx, w, h, col) {
  for (let x = -w; x <= w; x++) {
    const top = h * (1 - Math.abs(x) / w) ** 1.15;
    c.rect(cx + x, groundY - Math.round(top), 1, Math.round(top), col);
  }
}
function candi(c, groundY, cx, baseW, tiers, tierH, col, edge) {
  let w = baseW;
  let y = groundY;
  for (let i = 0; i < tiers; i++) {
    c.rect(cx - Math.floor(w / 2), y - tierH, w, tierH, col);
    c.rect(cx - Math.floor(w / 2), y - tierH, w, 1, edge || col);
    y -= tierH;
    w = Math.max(4, w - 6);
  }
  // spire
  for (let i = 0; i < 10; i++) c.rect(cx - Math.max(0, 3 - Math.floor(i / 3)), y - i, Math.max(1, 7 - Math.floor(i / 3) * 2), 1, col);
  c.rect(cx, y - 13, 1, 3, edge || col);
}
function stars(c, groundY, n, col) {
  for (let i = 0; i < n; i++) c.px(Math.floor(rnd() * c.w), Math.floor(rnd() * groundY * 0.6), col);
}
function ground(c, groundY, top, mid, low, tile) {
  c.rect(0, groundY, c.w, c.h - groundY, mid);
  c.rect(0, groundY, c.w, 3, top);
  c.rect(0, groundY + 3, c.w, 1, low);
  for (let x = 0; x < c.w; x += tile) {
    c.rect(x, groundY + 6, tile - 1, 1, low);
    c.rect(x + (tile >> 1), groundY + 14, tile - 1, 1, low);
  }
  for (let y = groundY + 6; y < c.h; y += 8) for (let x = 0; x < c.w; x += tile) c.px(x, y + 1, low);
}
function palm(c, x, groundY, h, trunk, leaf) {
  for (let i = 0; i < h; i++) c.rect(x + Math.round(Math.sin(i / 9) * 1.5), groundY - i, 2, 1, trunk);
  const topX = x + Math.round(Math.sin(h / 9) * 1.5);
  const topY = groundY - h;
  for (let k = -6; k <= 7; k++) {
    c.px(topX + k, topY + Math.round(Math.abs(k) * 0.6), leaf);
    c.px(topX + k, topY + 1 + Math.round(Math.abs(k) * 0.6), leaf);
  }
  c.rect(topX - 1, topY - 2, 3, 3, leaf);
}

// ---------- sprites ----------
const P = {
  skin: '#d9a273', skinDark: '#b57e53', outline: '#1c1630', white: '#f4ecdc', gold: '#e8b44a', goldDark: '#b5832b',
  indigo: '#263a5b', navy: '#0e2444', terra: '#9d422a', terraLight: '#fd8c6e', cream: '#f5ded6', stone: '#8d8a92',
  stoneDark: '#5d5a66', stoneLight: '#b5b2ba', wood: '#7a4a2b', woodDark: '#533019', red: '#a1272b', green: '#3f7a4a',
};
function person(c, ox, oy, o) {
  const hair = o.hair || '#1c1630';
  // legs / skirt
  if (o.skirt) {
    for (let r = 0; r < 8; r++) c.rect(ox + 3 - Math.floor(r / 3), oy + 18 + r, 10 + Math.floor(r / 3) * 2, 1, o.bottom);
    c.rect(ox + 3, oy + 21, 10, 1, o.trim || o.bottom);
  } else {
    c.rect(ox + 4, oy + 19, 3, 6, o.bottom);
    c.rect(ox + 9, oy + 19, 3, 6, o.bottom);
    c.rect(ox + 3, oy + 25, 4, 1, P.outline);
    c.rect(ox + 9, oy + 25, 4, 1, P.outline);
  }
  // torso + arms
  c.rect(ox + 4, oy + 10, 8, 9, o.top);
  c.rect(ox + 2, oy + 11, 2, 7, o.top);
  c.rect(ox + 12, oy + 11, 2, 7, o.top);
  c.rect(ox + 2, oy + 18, 2, 1, P.skin);
  c.rect(ox + 12, oy + 18, 2, 1, P.skin);
  if (o.sash) c.rect(ox + 4, oy + 15, 8, 2, o.sash);
  // neck + head
  c.rect(ox + 7, oy + 9, 2, 1, P.skinDark);
  c.rect(ox + 5, oy + 3, 6, 6, o.skinTone || P.skin);
  c.px(ox + 9, oy + 5, P.outline); // eye (facing right)
  c.px(ox + 10, oy + 5, P.outline);
  c.px(ox + 8, oy + 7, P.skinDark);
  // hair + headgear
  c.rect(ox + 5, oy + 2, 6, 2, hair);
  c.px(ox + 5, oy + 4, hair);
  if (o.head === 'crown') {
    c.rect(ox + 5, oy + 1, 6, 1, P.gold);
    c.px(ox + 5, oy, P.gold);
    c.px(ox + 8, oy, P.gold);
    c.px(ox + 10, oy, P.gold);
    c.rect(ox + 4, oy + 3, 1, 4, hair);
  } else if (o.head === 'sanggul') {
    c.rect(ox + 3, oy + 2, 3, 3, hair);
    c.px(ox + 4, oy + 1, hair);
    c.px(ox + 5, oy + 1, P.gold);
  } else if (o.head === 'band') {
    c.rect(ox + 5, oy + 1, 6, 1, hair);
    c.rect(ox + 5, oy + 3, 6, 1, o.accent || P.terra);
  } else if (o.head === 'blangkon') {
    c.rect(ox + 4, oy + 1, 7, 3, o.accent || P.wood);
    c.rect(ox + 3, oy + 3, 2, 2, o.accent || P.wood);
  } else if (o.head === 'cap') {
    c.rect(ox + 5, oy + 1, 6, 2, o.accent || P.terra);
  }
}
function sprite(w, h, fn, name) {
  const c = new Canvas(w, h);
  fn(c);
  c.save(name);
}

// avatar: neutral guide ("Pemandu Nusa") - indigo travel cloak, lantern. NOT a folklore character (FR-CHAR-06).
sprite(16, 26, (c) => {
  person(c, 0, 0, { top: '#3a5a8c', bottom: P.indigo, head: 'cap', accent: P.terraLight, hair: '#3b2a1e', sash: P.terra });
  // lantern held in front
  c.rect(13, 14, 1, 4, P.woodDark);
  c.rect(13, 17, 3, 4, P.terraLight);
  c.rect(14, 18, 1, 2, '#fff2b0');
  c.rect(13, 16, 3, 1, P.goldDark);
}, 'avatar-pemandu.png');

sprite(16, 26, (c) => person(c, 0, 0, { top: P.terra, bottom: '#6a2a3d', skirt: true, head: 'crown', sash: P.gold, trim: P.gold, hair: '#1c1630' }), 'char-roro-jonggrang.png');
sprite(16, 26, (c) => {
  person(c, 0, 0, { top: P.indigo, bottom: '#2c2a44', head: 'band', accent: P.red, sash: P.red, hair: '#1c1630' });
  c.rect(14, 4, 1, 22, P.woodDark); // spear
  c.rect(13, 2, 3, 3, P.stoneLight);
}, 'char-bandung-bondowoso.png');
sprite(16, 26, (c) => person(c, 0, 0, { top: '#8a6bb0', bottom: '#5b3f7a', skirt: true, head: 'sanggul', hair: '#1c1630', sash: P.gold, trim: P.cream }), 'char-dayang.png');

// objects
sprite(26, 16, (c) => { // lesung (rice mortar) with two alu (pestles)
  c.rect(2, 7, 22, 8, P.wood);
  c.rect(2, 7, 22, 1, P.woodDark);
  c.rect(4, 8, 18, 3, P.woodDark);
  c.rect(1, 14, 24, 2, P.woodDark);
  c.rect(6, 0, 2, 9, P.stoneLight);
  c.rect(17, 1, 2, 8, P.stoneLight);
  c.rect(6, 0, 2, 2, P.wood);
  c.rect(17, 1, 2, 2, P.wood);
}, 'obj-lesung.png');
sprite(28, 22, (c) => { // stacked andesite blocks
  c.rect(1, 14, 26, 8, P.stone);
  c.rect(4, 7, 20, 8, P.stoneLight);
  c.rect(8, 1, 12, 7, P.stone);
  for (const [x, y, w] of [[1, 14, 26], [4, 7, 20], [8, 1, 12]]) {
    c.rect(x, y, w, 1, '#d3d0d8');
    c.rect(x, y + 7, w, 1, P.stoneDark);
  }
  c.rect(14, 14, 1, 8, P.stoneDark);
  c.rect(11, 7, 1, 7, P.stoneDark);
  c.rect(18, 1, 1, 6, P.stoneDark);
}, 'obj-batu-candi.png');
sprite(30, 24, (c) => { // pendopo seat / singgasana
  c.rect(2, 20, 26, 4, P.woodDark);
  c.rect(4, 12, 22, 9, P.red);
  c.rect(4, 12, 22, 1, P.gold);
  c.rect(8, 2, 14, 11, P.red);
  c.rect(8, 2, 14, 1, P.gold);
  c.rect(10, 4, 10, 1, P.goldDark);
  c.px(15, 6, P.gold);
  c.rect(13, 7, 4, 1, P.gold);
  c.rect(2, 8, 3, 13, P.goldDark);
  c.rect(25, 8, 3, 13, P.goldDark);
}, 'obj-singgasana.png');
sprite(22, 34, (c) => { // arca Durga (stylised stone statue on pedestal; many-armed silhouette)
  c.rect(1, 28, 20, 6, P.stoneDark);
  c.rect(3, 26, 16, 3, P.stone);
  c.rect(8, 10, 6, 17, P.stone);
  c.rect(8, 4, 6, 6, P.stoneLight);
  c.rect(7, 2, 8, 3, P.stoneDark);
  c.rect(10, 0, 2, 3, P.stoneLight);
  for (let i = 0; i < 4; i++) {
    c.rect(1 + i, 12 + i * 3 - 1, 7 - i, 1, P.stoneLight);
    c.rect(14, 12 + i * 3 - 1, 7 - i, 1, P.stoneLight);
  }
  c.px(9, 6, P.outline);
  c.px(12, 6, P.outline);
}, 'obj-arca-durga.png');
sprite(16, 16, (c) => { // rooster
  c.rect(4, 6, 8, 6, P.terra);
  c.rect(2, 4, 3, 4, P.terra);
  c.rect(1, 3, 2, 1, P.red);
  c.rect(0, 5, 2, 1, P.gold);
  c.px(3, 5, P.outline);
  c.rect(11, 3, 3, 5, P.green);
  c.rect(12, 2, 3, 3, '#1d5a3a');
  c.rect(5, 12, 1, 3, P.goldDark);
  c.rect(9, 12, 1, 3, P.goldDark);
  c.rect(6, 7, 4, 3, '#c25b3b');
}, 'obj-ayam.png');

// decor
sprite(18, 56, (c) => palm(c, 7, 55, 48, '#6b4a2b', '#2f6b3f'), 'decor-palem.png');
sprite(8, 30, (c) => { c.rect(3, 8, 2, 22, P.woodDark); c.rect(1, 3, 6, 6, P.terraLight); c.rect(2, 1, 4, 3, P.gold); c.rect(3, 0, 2, 2, '#fff2b0'); }, 'decor-obor.png');
sprite(14, 10, (c) => { c.rect(0, 3, 14, 7, P.stone); c.rect(2, 0, 10, 4, P.stoneLight); c.rect(0, 9, 14, 1, P.stoneDark); }, 'decor-batu.png');

// ---------- backgrounds ----------
const H = 144;
const G = 112; // ground line (y)

// Scene 1 - sunset at the Prambanan palace
{
  const c = new Canvas(480, H);
  sky(c, G, [[0, '#2b2457'], [0.35, '#7b3f6e'], [0.65, '#d9704e'], [1, '#f9bb62']]);
  c.rect(380, 66, 18, 18, '#ffe9a8');
  c.rect(382, 64, 14, 22, '#ffe9a8');
  mountain(c, G, 90, 120, 52, '#4a3366');
  mountain(c, G, 330, 150, 38, '#5a3a62');
  candi(c, G, 235, 52, 4, 16, '#2c2147', '#3b2c5c');
  candi(c, G, 160, 34, 3, 12, '#352757', '#41306a');
  candi(c, G, 315, 34, 3, 12, '#352757', '#41306a');
  for (let i = 0; i < 18; i++) c.px(Math.floor(rnd() * 480), Math.floor(rnd() * 40), '#d9c9f0');
  ground(c, G, '#8a5a3a', '#6e432c', '#4d2e1d', 16);
  // pendopo columns
  for (const x of [48, 432]) { c.rect(x, 60, 6, G - 60, P.woodDark); c.rect(x - 4, 56, 14, 5, P.red); c.rect(x - 4, 56, 14, 1, P.gold); }
  c.save('bg-scene1-keraton.png');
}
// Scene 2 - midnight: jin raising the stone
{
  const c = new Canvas(640, H);
  sky(c, G, [[0, '#06081c'], [0.5, '#101a45'], [1, '#243a7a']]);
  stars(c, G, 90, '#e9e4ff');
  c.rect(520, 18, 22, 22, '#f2efd8');
  c.rect(522, 16, 18, 26, '#f2efd8');
  c.rect(526, 22, 4, 4, '#d6d2bb');
  mountain(c, G, 140, 160, 46, '#0c1030');
  mountain(c, G, 470, 190, 56, '#0a0e29');
  candi(c, G, 330, 60, 5, 15, '#0a0c24', '#1b2150');
  candi(c, G, 250, 38, 4, 12, '#0d1130', '#1f265b');
  candi(c, G, 410, 38, 4, 12, '#0d1130', '#1f265b');
  candi(c, G, 560, 30, 3, 11, '#0d1130', '#1f265b');
  ground(c, G, '#3a3f66', '#262a4a', '#161931', 16);
  // faint spirit glow (jin)
  for (let i = 0; i < 40; i++) c.px(Math.floor(rnd() * 640), 40 + Math.floor(rnd() * 70), '#7fe3d0');
  c.save('bg-scene2-tengah-malam.png');
}
// Scene 3 - pre-dawn at the keputren / village yard
{
  const c = new Canvas(480, H);
  sky(c, G, [[0, '#1b2459'], [0.5, '#5b4a86'], [0.85, '#e0846a'], [1, '#f6c27a']]);
  stars(c, G, 25, '#e9e4ff');
  mountain(c, G, 120, 140, 40, '#3b3166');
  mountain(c, G, 380, 170, 48, '#34295c');
  candi(c, G, 410, 44, 4, 14, '#241c47', '#312765');
  candi(c, G, 60, 34, 3, 12, '#241c47', '#312765');
  palm(c, 300, G, 70, '#2a2038', '#26402f');
  ground(c, G, '#6b5a3a', '#54452d', '#3a2f1e', 16);
  // keputren fence
  for (let x = 20; x < 460; x += 14) c.rect(x, G - 14, 2, 14, P.woodDark);
  c.rect(20, G - 12, 440, 2, P.woodDark);
  c.save('bg-scene3-keputren.png');
}
// Scene 4 - true dawn at the temple grounds
{
  const c = new Canvas(400, H);
  sky(c, G, [[0, '#4a6fb0'], [0.45, '#f2b27a'], [0.8, '#ffd9a0'], [1, '#fff0c8']]);
  c.rect(300, 78, 26, 26, '#fff7d6');
  c.rect(302, 76, 22, 30, '#fff7d6');
  mountain(c, G, 80, 120, 36, '#8c7aa6');
  mountain(c, G, 320, 130, 30, '#a08cb0');
  candi(c, G, 200, 56, 5, 14, '#6c5a86', '#8a76a6');
  candi(c, G, 120, 36, 4, 11, '#76629a', '#9480b4');
  candi(c, G, 285, 36, 4, 11, '#76629a', '#9480b4');
  ground(c, G, '#b49264', '#8f7248', '#6a5434', 16);
  c.save('bg-scene4-fajar.png');
}
console.log('done ->', OUT);
