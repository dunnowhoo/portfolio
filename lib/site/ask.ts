import 'server-only';
import { and, eq, gte, sql } from 'drizzle-orm';
import { getDb } from '@/db/client';
import { askCache, askLog } from '@/db/schema';
import { hmacHex } from '@/lib/auth/crypto';

// Sisi server asisten portfolio: batas pemakaian, cache jawaban, dan pemanggil Groq (OpenAI-compatible)
// dengan model cadangan berantai. Key Groq tier gratis dibatasi ±8.000 token/menit per model.

export const LIMITS = { perIp10m: 6, perIpDay: 25, globalDay: 400 };
const CACHE_DAYS = 7;
const DEFAULT_MODELS = 'qwen/qwen3.8-27b,openai/gpt-oss-120b,openai/gpt-oss-20b';

export const ipHash = (ip: string) => hmacHex(process.env.AUTH_SECRET ?? 'portfolio-ask', `ask:${ip}`);

// Tabel belum dimigrasi (mis. preview sebelum migrasi production) → jangan gagal, pakai memori.
function missingTable(e: unknown): boolean {
  const any = e as { code?: string; cause?: { code?: string } } | undefined;
  return any?.code === '42P01' || any?.cause?.code === '42P01';
}
const mem = new Map<string, number[]>();

export type Limit = { ok: true } | { ok: false; retryAfter: number };

export async function checkLimit(hash: string): Promise<Limit> {
  try {
    const [r] = await getDb()
      .select({
        ip10: sql<number>`count(*) filter (where ${askLog.ipHash} = ${hash} and ${askLog.createdAt} > now() - interval '10 minutes')`,
        ipDay: sql<number>`count(*) filter (where ${askLog.ipHash} = ${hash})`,
        all: sql<number>`count(*)`,
      })
      .from(askLog)
      .where(gte(askLog.createdAt, sql`now() - interval '1 day'`));
    if (Number(r.all) >= LIMITS.globalDay || Number(r.ipDay) >= LIMITS.perIpDay) return { ok: false, retryAfter: 3600 };
    if (Number(r.ip10) >= LIMITS.perIp10m) return { ok: false, retryAfter: 120 };
    return { ok: true };
  } catch (e) {
    if (!missingTable(e)) throw e;
    const now = Date.now();
    const recent = (mem.get(hash) ?? []).filter((t) => now - t < 86_400_000);
    mem.set(hash, recent);
    if (recent.length >= LIMITS.perIpDay) return { ok: false, retryAfter: 3600 };
    if (recent.filter((t) => now - t < 600_000).length >= LIMITS.perIp10m) return { ok: false, retryAfter: 120 };
    return { ok: true };
  }
}

export async function logAsk(hash: string, ok: boolean, ms: number, tokens: number): Promise<void> {
  try {
    await getDb().insert(askLog).values({ ipHash: hash, ok, ms, tokens });
  } catch (e) {
    if (missingTable(e)) mem.set(hash, [...(mem.get(hash) ?? []), Date.now()]);
    else console.error('[ask] log', e);
  }
}

export async function cacheGet(key: string): Promise<{ answer: string; items: number; picked: number } | null> {
  try {
    const [r] = await getDb()
      .select({ answer: askCache.answer, items: askCache.items, picked: askCache.picked })
      .from(askCache)
      .where(and(eq(askCache.key, key), gte(askCache.createdAt, sql`now() - make_interval(days => ${CACHE_DAYS})`)))
      .limit(1);
    return r ?? null;
  } catch (e) {
    if (!missingTable(e)) console.error('[ask] cache get', e);
    return null;
  }
}

export async function cachePut(key: string, answer: string, items: number, picked: number, model: string): Promise<void> {
  try {
    await getDb()
      .insert(askCache)
      .values({ key, answer, items, picked, model })
      .onConflictDoUpdate({ target: askCache.key, set: { answer, items, picked, model, createdAt: new Date() } });
  } catch (e) {
    if (!missingTable(e)) console.error('[ask] cache put', e);
  }
}

// ---------- Groq ----------
type Msg = { role: 'system' | 'user' | 'assistant'; content: string };
export type GroqOpen = { ok: true; model: string; body: ReadableStream<Uint8Array> } | { ok: false; reason: 'busy' | 'unavailable' | 'not_configured' };

function modelParams(model: string): Record<string, unknown> {
  if (model.startsWith('openai/gpt-oss')) return { reasoning_effort: 'low' };
  if (model.startsWith('qwen/')) return { reasoning_format: 'hidden' };
  return {};
}

/** Membuka stream jawaban; kalau satu model kena limit/error, coba model berikutnya. */
export async function openGroqStream(messages: Msg[], signal?: AbortSignal): Promise<GroqOpen> {
  const key = process.env.GROQ_API_KEY;
  if (!key) return { ok: false, reason: 'not_configured' };
  const base = process.env.GROQ_BASE_URL ?? 'https://api.groq.com/openai/v1';
  const models = (process.env.GROQ_MODELS ?? DEFAULT_MODELS).split(',').map((m) => m.trim()).filter(Boolean);
  let busy = false;
  for (const model of models) {
    try {
      const res = await fetch(`${base}/chat/completions`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ model, messages, stream: true, temperature: 0.3, max_completion_tokens: 600, ...modelParams(model) }),
        signal: signal ? AbortSignal.any([signal, AbortSignal.timeout(25_000)]) : AbortSignal.timeout(25_000),
      });
      if (res.ok && res.body) return { ok: true, model, body: res.body };
      if (res.status === 429) busy = true;
      else console.error('[ask] groq', model, res.status, (await res.text().catch(() => '')).slice(0, 200));
    } catch (e) {
      if (signal?.aborted) break;
      console.error('[ask] groq fetch', model, String(e).slice(0, 200));
    }
  }
  return { ok: false, reason: busy ? 'busy' : 'unavailable' };
}

/** Membaca SSE OpenAI-compatible: potongan teks jawaban dan jumlah token di akhir. */
export async function* sseDeltas(body: ReadableStream<Uint8Array>): AsyncGenerator<{ text?: string; tokens?: number }> {
  const reader = body.getReader();
  const dec = new TextDecoder();
  let buf = '';
  try {
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      buf += dec.decode(value, { stream: true });
      let i: number;
      while ((i = buf.indexOf('\n')) >= 0) {
        const line = buf.slice(0, i).trim();
        buf = buf.slice(i + 1);
        if (!line.startsWith('data:')) continue;
        const data = line.slice(5).trim();
        if (!data || data === '[DONE]') continue;
        let j: { choices?: { delta?: { content?: string } }[]; x_groq?: { usage?: { total_tokens?: number } }; usage?: { total_tokens?: number } };
        try {
          j = JSON.parse(data);
        } catch {
          continue;
        }
        const text = j.choices?.[0]?.delta?.content;
        if (text) yield { text };
        const tokens = j.x_groq?.usage?.total_tokens ?? j.usage?.total_tokens;
        if (tokens) yield { tokens };
      }
    }
  } finally {
    reader.releaseLock();
  }
}
