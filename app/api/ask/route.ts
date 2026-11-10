import { z } from 'zod';
import { sha256Hex } from '@/lib/auth/crypto';
import { requestMeta } from '@/lib/auth/request';
import { buildContext, normalizeQuestion, systemPrompt } from '@/lib/site/assistant';
import { cacheGet, cachePut, checkLimit, ipHash, logAsk, openGroqStream, sseDeltas } from '@/lib/site/ask';
import { getPublishedContent } from '@/lib/site/cms';
import { getCvChunks } from '@/lib/site/cv';

// "Tanya portfolio": jawaban asisten robot di halaman utama, di-stream sebagai NDJSON:
// {"t":"meta",...} → {"t":"d","v":"…"}* → {"t":"end"} (atau {"t":"err"}).
export const dynamic = 'force-dynamic';
export const maxDuration = 30;

const Body = z.object({
  question: z.string().trim().min(1).max(400),
  history: z
    .array(z.object({ role: z.enum(['user', 'assistant']), content: z.string().max(1500) }))
    .max(6)
    .default([]),
});

const json = (body: unknown, status: number, headers: Record<string, string> = {}) =>
  Response.json(body, { status, headers: { 'Cache-Control': 'no-store', ...headers } });

function sameHost(origin: string, host: string | null): boolean {
  try {
    return new URL(origin).host === host;
  } catch {
    return false;
  }
}

export async function POST(req: Request) {
  const origin = req.headers.get('origin');
  if (origin && !sameHost(origin, req.headers.get('host'))) return json({ error: 'forbidden' }, 403);
  if (Number(req.headers.get('content-length') ?? 0) > 16_000) return json({ error: 'too_large' }, 413);
  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return json({ error: 'invalid' }, 400);
  const { question, history } = parsed.data;

  const content = await getPublishedContent();
  if (content.assistant.variant !== 'robot') return json({ error: 'disabled' }, 404);

  const hash = ipHash((await requestMeta()).ip);
  const limit = await checkLimit(hash);
  if (!limit.ok) return json({ error: 'rate_limited', retryAfter: limit.retryAfter }, 429, { 'Retry-After': String(limit.retryAfter) });

  // Retrieval memakai pertanyaan + pertanyaan sebelumnya (untuk pertanyaan lanjutan seperti "yang kedua?")
  const lastUser = [...history].reverse().find((h) => h.role === 'user')?.content ?? '';
  const cv = await getCvChunks(content.profile.resumeUrl, new URL(req.url).origin);
  const ctx = buildContext(content, `${question} ${lastUser}`, cv);
  const cacheKey = history.length === 0 ? sha256Hex(`${normalizeQuestion(question)}|${sha256Hex(ctx.text)}`) : null;
  const enc = new TextEncoder();
  const line = (o: unknown) => enc.encode(`${JSON.stringify(o)}\n`);
  const headers = { 'Content-Type': 'application/x-ndjson; charset=utf-8', 'Cache-Control': 'no-store', 'X-Accel-Buffering': 'no' };
  const t0 = Date.now();

  const hit = cacheKey ? await cacheGet(cacheKey) : null;
  if (hit) {
    await logAsk(hash, true, Date.now() - t0, 0);
    return new Response(
      new ReadableStream({
        start(c) {
          c.enqueue(line({ t: 'meta', items: hit.items, picked: hit.picked, cached: true }));
          c.enqueue(line({ t: 'd', v: hit.answer }));
          c.enqueue(line({ t: 'end' }));
          c.close();
        },
      }),
      { headers },
    );
  }

  const abort = new AbortController();
  const g = await openGroqStream(
    [{ role: 'system', content: systemPrompt(content, ctx.text) }, ...history, { role: 'user', content: question }],
    abort.signal,
  );
  if (!g.ok) {
    await logAsk(hash, false, Date.now() - t0, 0);
    return json({ error: g.reason }, g.reason === 'busy' ? 429 : 503, g.reason === 'busy' ? { 'Retry-After': '20' } : {});
  }

  const model = g.model;
  return new Response(
    new ReadableStream({
      async start(c) {
        c.enqueue(line({ t: 'meta', items: ctx.items, picked: ctx.picked }));
        let answer = '';
        let tokens = 0;
        let ok = true;
        try {
          for await (const ev of sseDeltas(g.body)) {
            if (ev.text) {
              answer += ev.text;
              c.enqueue(line({ t: 'd', v: ev.text }));
            }
            if (ev.tokens) tokens = ev.tokens;
            if (answer.length > 4000) break;
          }
          c.enqueue(line({ t: 'end' }));
        } catch {
          ok = false;
          try {
            c.enqueue(line({ t: 'err' }));
          } catch {
            /* klien sudah pergi */
          }
        }
        // Catat sebelum menutup stream supaya tidak terpotong saat fungsi selesai
        await logAsk(hash, ok && answer.length > 0, Date.now() - t0, tokens);
        if (ok && cacheKey && answer.trim()) await cachePut(cacheKey, answer, ctx.items, ctx.picked, model);
        try {
          c.close();
        } catch {
          /* sudah ditutup */
        }
      },
      cancel() {
        abort.abort();
      },
    }),
    { headers },
  );
}
