import { sql } from 'drizzle-orm';
import { getDb } from '@/db/client';
import { getSession } from '@/lib/auth/session';
import { getFiles } from '@/lib/storage';
import { callNeonFunction } from '@/lib/neon-functions';
import { loadGrammar, loadKanji, loadMaterials } from '@/lib/dojo/content';

export const dynamic = 'force-dynamic';

type Check = { ok: boolean; ms: number; detail?: string };

async function timed(fn: () => Promise<string | undefined>): Promise<Check> {
  const t0 = Date.now();
  try {
    const detail = await fn();
    return { ok: true, ms: Date.now() - t0, detail };
  } catch (e) {
    return { ok: false, ms: Date.now() - t0, detail: e instanceof Error ? e.message : String(e) };
  }
}

// Cek end-to-end ketiga layanan Neon. Hanya untuk pemilik (sesi Dōjō) atau Bearer CRON_SECRET.
export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  const bearerOk = !!secret && req.headers.get('authorization') === `Bearer ${secret}`;
  if (!bearerOk && !(await getSession())) return new Response('Not found', { status: 404 });

  const postgres = await timed(async () => {
    const r = await getDb().execute(sql`select current_database() as db, version() as v`);
    const row = r.rows[0] as { db: string; v: string };
    return `${row.db} · ${row.v.split(' on ')[0]}`;
  });

  const storage = await timed(async () => {
    const files = getFiles();
    const key = `health/${crypto.randomUUID()}.txt`;
    const body = `ok ${new Date().toISOString()}`;
    await files.upload(key, body, { contentType: 'text/plain' });
    const back = await (await files.download(key)).text();
    await files.delete(key);
    if (back !== body) throw new Error('isi objek berbeda');
    return `put/get/delete ${key}`;
  });

  const functions = await timed(async () => {
    const res = await callNeonFunction('hello');
    const text = await res.text();
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return `hello → ${res.status} "${text.slice(0, 60)}"`;
  });

  const content = await timed(async () => {
    const all = await loadMaterials();
    const [kanji, grammar] = await Promise.all([loadKanji(), loadGrammar()]);
    if (all.length < 30 || kanji.length < 80 || grammar.length < 180) throw new Error(`materi ${all.length}, kanji ${kanji.length}, grammar ${grammar.length}`);
    return `${all.length} materi · ${kanji.length} kanji · ${grammar.length} poin grammar`;
  });
  const ok = postgres.ok && storage.ok && functions.ok && content.ok;
  return Response.json({ ok, postgres, storage, functions, content }, { status: ok ? 200 : 500, headers: { 'Cache-Control': 'no-store' } });
}
