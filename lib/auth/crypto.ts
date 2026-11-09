import 'server-only';
import { createHash, createHmac, randomBytes, timingSafeEqual } from 'node:crypto';

export const sha256Hex = (s: string) => createHash('sha256').update(s).digest('hex');
export const hmacHex = (key: string, s: string) => createHmac('sha256', key).update(s).digest('hex');
export const newToken = () => randomBytes(32).toString('base64url');

// Perbandingan constant-time untuk string dengan panjang berbeda (di-hash dulu).
export function safeEqual(a: string, b: string): boolean {
  return timingSafeEqual(createHash('sha256').update(a).digest(), createHash('sha256').update(b).digest());
}
