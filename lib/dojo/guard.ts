import 'server-only';
import { getSession } from '@/lib/auth/session';

// Server action = endpoint publik. Setiap action Dōjō memanggil ini lebih dulu.
export class DojoAuthError extends Error {
  constructor() {
    super('Sesi berakhir. Muat ulang halaman lalu masuk lagi.');
  }
}

export async function guard() {
  const s = await getSession();
  if (!s) throw new DojoAuthError();
  return s;
}

export function youtubeId(url: string): string | null {
  try {
    const u = new URL(url);
    let id: string | null = null;
    if (u.hostname === 'youtu.be') id = u.pathname.slice(1, 12);
    else if (/(^|\.)youtube(-nocookie)?\.com$/.test(u.hostname)) {
      if (u.pathname === '/watch') id = u.searchParams.get('v');
      else id = u.pathname.match(/^\/(?:embed|shorts|live)\/([\w-]{11})/)?.[1] ?? null;
    }
    return id && /^[\w-]{11}$/.test(id) ? id : null;
  } catch {
    return null;
  }
}

export function safeHttpUrl(url: string): string | null {
  try {
    const u = new URL(url);
    return u.protocol === 'https:' || u.protocol === 'http:' ? u.toString() : null;
  } catch {
    return null;
  }
}
