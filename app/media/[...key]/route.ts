import { getFiles, PUBLIC_PREFIX } from '@/lib/storage';

// Menyajikan gambar portfolio dari bucket private Neon. Hanya kunci di bawah "public/".
// Kunci selalu unik per upload, jadi aman di-cache selamanya oleh browser & CDN Vercel.
export async function GET(_req: Request, { params }: { params: Promise<{ key: string[] }> }) {
  const { key } = await params;
  const parts = key.map((p) => decodeURIComponent(p));
  const objectKey = parts.join('/');
  if (!objectKey.startsWith(PUBLIC_PREFIX) || parts.some((p) => p === '' || p === '.' || p === '..')) {
    return new Response('Not found', { status: 404 });
  }
  try {
    const file = await getFiles().download(objectKey);
    return new Response(file.stream(), {
      headers: {
        'Content-Type': file.contentType || 'application/octet-stream',
        'Content-Length': String(file.size),
        'Cache-Control': 'public, max-age=31536000, s-maxage=31536000, immutable',
        'X-Content-Type-Options': 'nosniff',
      },
    });
  } catch {
    return new Response('Not found', { status: 404 });
  }
}
