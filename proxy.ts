import { NextResponse, type NextRequest } from 'next/server';

// Lapis pertama keamanan Dōjō (Next 16: middleware → proxy).
// 1) Sub-path di bawah slug yang SALAH tidak boleh dirender sama sekali: Next merender layout & page
//    secara paralel, jadi notFound() di layout saja tidak cukup. Path itu di-rewrite ke /<segmen-pertama>
//    sehingga hasilnya 404 biasa.
// 2) Sub-path di bawah slug yang BENAR wajib membawa cookie sesi; validasi penuh tetap di server (lib/dojo/dal.ts).
const PASS_FIRST = new Set(['api', 'media', 'assets']);
const SESSION_COOKIES = ['__Host-dojo', 'dojo_dev'];

function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

export function proxy(req: NextRequest) {
  const segs = req.nextUrl.pathname.split('/').filter(Boolean);
  if (segs.length === 0) return NextResponse.next();
  const first = segs[0];
  if (first.startsWith('_') || first.includes('.') || PASS_FIRST.has(first)) return NextResponse.next();

  const slug = process.env.DASHBOARD_SLUG ?? '';
  let decoded = first;
  try {
    decoded = decodeURIComponent(first);
  } catch {
    /* biarkan, akan 404 */
  }
  if (!slug || !safeEqual(decoded, slug)) {
    if (segs.length > 1) return NextResponse.rewrite(new URL(`/${first}`, req.url));
    return NextResponse.next();
  }

  const hasSession = SESSION_COOKIES.some((n) => req.cookies.has(n));
  const res = segs.length === 1 || hasSession ? NextResponse.next() : NextResponse.redirect(new URL(`/${slug}`, req.url));
  res.headers.set('X-Robots-Tag', 'noindex, nofollow');
  return res;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon|apple-touch-icon|assets/|media/|api/).*)'],
};
