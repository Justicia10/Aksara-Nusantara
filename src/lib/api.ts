import { PublicContent } from '../types';

export class ApiError extends Error {
  constructor(public status: number, message: string, public body?: any) {
    super(message);
  }
}

export async function api<T = any>(path: string, init: { method?: string; json?: unknown; signal?: AbortSignal } = {}): Promise<T> {
  let res: Response;
  try {
    res = await fetch(path, {
      method: init.method ?? 'GET',
      headers: init.json !== undefined ? { 'Content-Type': 'application/json' } : undefined,
      body: init.json !== undefined ? JSON.stringify(init.json) : undefined,
      credentials: 'same-origin',
      signal: init.signal,
    });
  } catch {
    throw new ApiError(0, 'Tidak dapat terhubung ke server. Periksa koneksi Anda.');
  }
  let body: any = null;
  try { body = await res.json(); } catch { /* no body */ }
  if (!res.ok) throw new ApiError(res.status, body?.error || `Permintaan gagal (${res.status}).`, body);
  return body as T;
}

export const fetchContent = (signal?: AbortSignal) => api<PublicContent>('/api/content', { signal });

// ---- analytics (best effort; never blocks or breaks the UI) ----
const sessionId = (() => {
  try {
    const k = 'ngm_sid';
    let v = sessionStorage.getItem(k);
    if (!v) { v = Math.random().toString(36).slice(2) + Date.now().toString(36); sessionStorage.setItem(k, v); }
    return v;
  } catch {
    return 'anon';
  }
})();

export function track(name: string, data: { storyId?: string; sceneNumber?: number; props?: Record<string, unknown> } = {}) {
  try {
    void fetch('/api/analytics', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, keepalive: true,
      body: JSON.stringify({ name, sessionId, storyId: data.storyId, sceneNumber: data.sceneNumber, props: data.props }),
    }).catch(() => undefined);
  } catch { /* ignore */ }
}
