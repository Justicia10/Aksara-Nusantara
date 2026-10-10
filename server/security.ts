import { createHmac, randomBytes, scryptSync, timingSafeEqual } from 'node:crypto';

/** scrypt password hashing: "scrypt$<saltHex>$<hashHex>" */
export function hashPassword(password: string): string {
  const salt = randomBytes(16);
  const hash = scryptSync(password, salt, 64);
  return `scrypt$${salt.toString('hex')}$${hash.toString('hex')}`;
}
export function verifyPassword(password: string, stored: string): boolean {
  const [scheme, saltHex, hashHex] = stored.split('$');
  if (scheme !== 'scrypt' || !saltHex || !hashHex) return false;
  const expected = Buffer.from(hashHex, 'hex');
  const actual = scryptSync(password, Buffer.from(saltHex, 'hex'), expected.length);
  return timingSafeEqual(actual, expected);
}

const b64 = (b: Buffer | string) => Buffer.from(b).toString('base64url');

/** Stateless signed session token: base64url(payload).base64url(hmac) */
export function signSession(payload: { uid: string; exp: number }, secret: string): string {
  const body = b64(JSON.stringify(payload));
  return `${body}.${b64(createHmac('sha256', secret).update(body).digest())}`;
}
export function readSession(token: string | undefined, secret: string): { uid: string; exp: number } | null {
  if (!token) return null;
  const [body, sig] = token.split('.');
  if (!body || !sig) return null;
  const expected = createHmac('sha256', secret).update(body).digest();
  const given = Buffer.from(sig, 'base64url');
  if (given.length !== expected.length || !timingSafeEqual(given, expected)) return null;
  try {
    const p = JSON.parse(Buffer.from(body, 'base64url').toString());
    return typeof p.uid === 'string' && typeof p.exp === 'number' && p.exp > Date.now() ? p : null;
  } catch {
    return null;
  }
}

export function parseCookies(header: string | undefined): Record<string, string> {
  const out: Record<string, string> = {};
  for (const part of (header ?? '').split(';')) {
    const i = part.indexOf('=');
    if (i > 0) out[part.slice(0, i).trim()] = decodeURIComponent(part.slice(i + 1).trim());
  }
  return out;
}

/** Tiny in-memory login throttle: max N failures per key per window. */
export class LoginThrottle {
  private hits = new Map<string, { n: number; reset: number }>();
  constructor(private max = 5, private windowMs = 15 * 60 * 1000) {}
  blocked(key: string): boolean {
    const h = this.hits.get(key);
    if (!h || h.reset < Date.now()) return false;
    return h.n >= this.max;
  }
  fail(key: string) {
    const h = this.hits.get(key);
    if (!h || h.reset < Date.now()) this.hits.set(key, { n: 1, reset: Date.now() + this.windowMs });
    else h.n++;
  }
  clear(key: string) {
    this.hits.delete(key);
  }
}
