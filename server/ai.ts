import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { randomBytes } from 'node:crypto';
import { Scene, Story } from '../src/types';

/**
 * Server-side AI visual generation (PRD 6.4). The API key only ever lives in process.env on the server.
 * AI is a visualisation tool, never a source of cultural fact (FR-AI-07): the prompt is assembled ONLY from
 * the curated scene text and curated cultural annotation, and tells the model not to add cultural detail.
 */
export const PROMPT_VERSION = 'v1';

export class AiNotConfiguredError extends Error {
  constructor() {
    super('Pembuatan visual AI belum dikonfigurasi: GEMINI_API_KEY belum diatur di server.');
  }
}
export class AiVendorError extends Error {}
export class PromptBlockedError extends Error {}

const BLOCKED: Array<[RegExp, string]> = [
  [/[\w.+-]+@[\w-]+\.[\w.]+/i, 'alamat email'],
  [/https?:\/\//i, 'tautan'],
  [/\b\d{10,}\b/, 'deretan angka panjang (kemungkinan data pribadi)'],
  [/\b(telanjang|porno|erotis|gore|mutilasi)\b/i, 'konten tidak pantas'],
];

/** Edge case "Prompt mengandung informasi sensitif/tidak pantas -> block/review". Minimal heuristic, not a moderation system. */
export function checkPrompt(prompt: string): void {
  for (const [re, what] of BLOCKED) if (re.test(prompt)) throw new PromptBlockedError(`Prompt diblokir: terdeteksi ${what}. Periksa dan ubah prompt.`);
}

export function buildPrompt(story: Pick<Story, 'title' | 'region'>, scene: Scene, extraNote = ''): string {
  const note = extraNote.trim();
  const prompt = [
    'Buat ilustrasi editorial 16:9 bergaya lukisan digital hangat (palet terakota dan biru indigo) untuk adegan cerita rakyat Nusantara.',
    `Cerita: ${story.title} (asal: ${story.region}).`,
    `Adegan ${scene.sceneNumber}: ${scene.actTitle} - ${scene.actSubtitle}. Waktu/tempat: ${scene.timeContext}.`,
    `Narasi terkurasi: ${scene.paragraphs.join(' ')}`,
    scene.culturalAnnotation ? `Konteks budaya terkurasi (satu-satunya sumber detail budaya): ${scene.culturalAnnotation.title}. ${scene.culturalAnnotation.description}` : '',
    'Jangan menambahkan detail busana, arsitektur, atau tradisi yang tidak tercantum di atas. Tanpa teks, tanpa tulisan, tanpa logo.',
    note ? `Catatan admin: ${note}` : '',
  ].filter(Boolean).join('\n');
  checkPrompt(prompt);
  return prompt;
}

export interface AiConfig {
  apiKey?: string;
  model: string;
  outDir: string;
}

export async function generateImage(cfg: AiConfig, prompt: string): Promise<{ file: string; url: string }> {
  if (!cfg.apiKey) throw new AiNotConfiguredError();
  checkPrompt(prompt);
  let parts: any[] | undefined;
  try {
    const { GoogleGenAI } = await import('@google/genai');
    const ai = new GoogleGenAI({ apiKey: cfg.apiKey });
    const res = await ai.models.generateContent({ model: cfg.model, contents: prompt, config: { responseModalities: ['TEXT', 'IMAGE'] } });
    parts = res.candidates?.[0]?.content?.parts;
  } catch (e: any) {
    throw new AiVendorError(`Layanan AI tidak dapat dihubungi atau menolak permintaan: ${String(e?.message ?? e).slice(0, 200)}`);
  }
  const img = parts?.find((p) => p.inlineData?.data);
  if (!img) throw new AiVendorError('Layanan AI tidak mengembalikan gambar (kemungkinan diblokir kebijakan konten). Ubah prompt lalu coba lagi.');
  const mime: string = img.inlineData.mimeType || 'image/png';
  const ext = mime.includes('jpeg') ? 'jpg' : mime.includes('webp') ? 'webp' : 'png';
  mkdirSync(cfg.outDir, { recursive: true });
  const name = `ai_${Date.now().toString(36)}_${randomBytes(4).toString('hex')}.${ext}`;
  writeFileSync(join(cfg.outDir, name), Buffer.from(img.inlineData.data, 'base64'));
  return { file: name, url: `/generated/${name}` };
}
