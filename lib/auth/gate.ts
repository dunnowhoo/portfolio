import 'server-only';
import { safeEqual } from './crypto';

// Slug dibandingkan constant-time. Slug salah → pemanggil memanggil notFound().
// Cek akses lengkap (slug + sesi) ada di lib/dojo/dal.ts → requireDojo().
export function isGate(slug: string): boolean {
  const expected = process.env.DASHBOARD_SLUG;
  if (!expected) return false;
  let value = slug;
  try {
    value = decodeURIComponent(slug);
  } catch {
    return false;
  }
  return safeEqual(value, expected);
}
