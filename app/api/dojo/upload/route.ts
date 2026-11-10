import { randomUUID } from 'node:crypto';
import { getDb } from '@/db/client';
import { mediaAsset } from '@/db/schema';
import { getSession } from '@/lib/auth/session';
import { getFiles, mediaUrl, PUBLIC_PREFIX } from '@/lib/storage';

// Upload gambar/PDF untuk CMS → Neon Object Storage (public/cms/YYYY-MM/<uuid>.<ext>), disajikan lewat /media.
// Editor sudah mengecilkan & mengonversi ke WebP di browser (sekaligus membuang EXIF/GPS);
// di sini tipe file diperiksa dari byte awalnya, bukan dari nama atau header yang dikirim klien.
const MAX_BYTES = 8 * 1024 * 1024;
const EXT = { 'image/webp': 'webp', 'image/png': 'png', 'image/jpeg': 'jpg', 'image/gif': 'gif', 'image/avif': 'avif', 'application/pdf': 'pdf' } as const;
type FileType = keyof typeof EXT;

const ascii = (b: Uint8Array, from: number, to: number) => String.fromCharCode(...b.subarray(from, to));
function sniff(b: Uint8Array): FileType | null {
  if (b.length < 12) return null;
  if (b[0] === 0x89 && ascii(b, 1, 4) === 'PNG') return 'image/png';
  if (b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff) return 'image/jpeg';
  if (ascii(b, 0, 4) === 'GIF8') return 'image/gif';
  if (ascii(b, 0, 4) === 'RIFF' && ascii(b, 8, 12) === 'WEBP') return 'image/webp';
  if (ascii(b, 4, 8) === 'ftyp' && ['avif', 'avis'].includes(ascii(b, 8, 12))) return 'image/avif';
  if (ascii(b, 0, 5) === '%PDF-') return 'application/pdf';
  return null;
}

function sameHost(origin: string, host: string | null): boolean {
  try {
    return new URL(origin).host === host;
  } catch {
    return false;
  }
}

const json = (body: unknown, status = 200) => Response.json(body, { status, headers: { 'Cache-Control': 'no-store' } });

export async function POST(req: Request) {
  if (!(await getSession())) return json({ error: 'Sesi berakhir. Login lagi lalu ulangi.' }, 401);
  // Cookie sesi sudah SameSite=Strict; cek Origin sebagai lapis kedua terhadap CSRF.
  const origin = req.headers.get('origin');
  if (origin && !sameHost(origin, req.headers.get('host'))) return json({ error: 'Origin tidak cocok.' }, 403);

  const form = await req.formData().catch(() => null);
  const file = form?.get('file');
  if (!(file instanceof File)) return json({ error: 'Tidak ada file.' }, 400);
  if (file.size > MAX_BYTES) return json({ error: 'Ukuran maksimal 8 MB.' }, 413);

  const bytes = new Uint8Array(await file.arrayBuffer());
  const type = sniff(bytes);
  if (!type) return json({ error: 'Hanya gambar PNG, JPEG, WebP, GIF, AVIF, atau PDF.' }, 415);

  const dim = (k: string) => {
    const n = Number(form?.get(k));
    return Number.isInteger(n) && n > 0 && n < 20000 ? n : null;
  };
  const alt = String(form?.get('alt') ?? '').trim().slice(0, 200) || null;
  const key = `${PUBLIC_PREFIX}cms/${new Date().toISOString().slice(0, 7)}/${randomUUID()}.${EXT[type]}`;

  try {
    await getFiles().upload(key, bytes, { contentType: type, cacheControl: 'public, max-age=31536000, immutable' });
  } catch (e) {
    console.error('[upload] storage', e);
    return json({ error: 'Gagal menyimpan ke storage. Coba lagi.' }, 502);
  }
  await getDb().insert(mediaAsset).values({ key, contentType: type, width: dim('width'), height: dim('height'), bytes: bytes.length, alt });
  return json({ url: mediaUrl(key), key, bytes: bytes.length, type });
}
