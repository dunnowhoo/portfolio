import 'server-only';
import { extractText, getDocumentProxy } from 'unpdf';
import { chunkCv, cleanCvText, type CvChunk } from './cv-text';

// CV (PDF tombol "Download Resume") sebagai sumber tambahan asisten. Diambil dari situs sendiri saja
// (path relatif "/…", tidak pernah URL luar), diekstrak dengan unpdf, dipotong, lalu di-cache per URL.
// Upload CV baru lewat CMS menghasilkan URL baru, jadi asisten langsung memakai versi terbaru.

const TTL = 6 * 60 * 60 * 1000;
const RETRY = 60 * 1000;
const MAX_BYTES = 8 * 1024 * 1024;
const cache = new Map<string, { at: number; ttl: number; chunks: CvChunk[] }>();

export async function getCvChunks(resumeUrl: string, origin: string): Promise<CvChunk[]> {
  if (!resumeUrl.startsWith('/') || resumeUrl.startsWith('//')) return [];
  const url = new URL(resumeUrl, origin).toString();
  const hit = cache.get(url);
  if (hit && Date.now() - hit.at < hit.ttl) return hit.chunks;
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(6000) });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const bytes = new Uint8Array(await res.arrayBuffer());
    if (bytes.length > MAX_BYTES || String.fromCharCode(...bytes.subarray(0, 5)) !== '%PDF-') throw new Error('bukan PDF');
    const { text } = await extractText(await getDocumentProxy(bytes), { mergePages: true });
    const chunks = chunkCv(cleanCvText(Array.isArray(text) ? text.join('\n') : text));
    cache.set(url, { at: Date.now(), ttl: TTL, chunks });
    return chunks;
  } catch (e) {
    console.error('[cv]', String(e).slice(0, 160));
    cache.set(url, { at: Date.now(), ttl: RETRY, chunks: [] });
    return [];
  }
}
