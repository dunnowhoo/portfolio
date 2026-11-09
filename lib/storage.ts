import 'server-only';
import { Files } from 'files-sdk';
import { neon } from 'files-sdk/neon';

// Neon Object Storage (S3-compatible), bucket `assets` (private, dideklarasikan di neon.ts).
// Di Vercel, nama AWS_* bisa bentrok dengan kredensial bawaan runtime (Lambda), jadi di sana kita
// memakai STORAGE_*. Di lokal, fallback ke AWS_* yang diisi `neon deploy` / `neon env pull`.
export const BUCKET = 'assets';
export const PUBLIC_PREFIX = 'public/'; // hanya kunci di bawah prefix ini yang boleh disajikan /media

const g = globalThis as unknown as { __dojoFiles?: Files };

function adapterOptions() {
  const e = process.env;
  return {
    bucket: BUCKET,
    endpoint: e.STORAGE_ENDPOINT ?? e.AWS_ENDPOINT_URL_S3,
    region: e.STORAGE_REGION ?? e.AWS_REGION,
    accessKeyId: e.STORAGE_ACCESS_KEY_ID ?? e.AWS_ACCESS_KEY_ID,
    secretAccessKey: e.STORAGE_SECRET_ACCESS_KEY ?? e.AWS_SECRET_ACCESS_KEY,
  };
}

export function getFiles(): Files {
  return (g.__dojoFiles ??= new Files({ adapter: neon(adapterOptions()) }));
}

export function mediaUrl(key: string): string {
  return `/media/${key.split('/').map(encodeURIComponent).join('/')}`;
}
