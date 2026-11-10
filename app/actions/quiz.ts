'use server';

import { and, eq, inArray, lte, or, sql } from 'drizzle-orm';
import { z } from 'zod';
import { getDb } from '@/db/client';
import { activityEvent, card, quizSession } from '@/db/schema';
import { completeNode } from '@/app/actions/dojo';
import { markDailyItem } from '@/app/actions/today';
import { NODES, computeStatuses, type QuizSpec } from '@/lib/dojo/curriculum';
import { award, dojoToday, getProfile, type AwardResult } from '@/lib/dojo/engine/core';
import { schedule } from '@/lib/dojo/engine/srs';
import { guard } from '@/lib/dojo/guard';
import { badgeEvents } from '@/lib/dojo/badges';
import { loadProgress } from '@/lib/dojo/progress';
import { buildQuiz, quizKind, rng, shuffle, type Question, type QuizKind } from '@/lib/dojo/quiz/build';

export type QuizPayload = {
  title: string;
  questions: Question[];
  kind: QuizKind;
  timeLimitS?: number;
  passPct?: number;
  nodeId?: string;
  dailyItem?: string;
  review?: boolean;
};

// Kartu lemah / jatuh tempo diutamakan di sprint (60% lemah, 40% acak)
async function weakCards(prefix: string, today: string): Promise<string[]> {
  const rows = await getDb()
    .select({ id: card.id })
    .from(card)
    .where(and(sql`${card.id} like ${prefix + '%'}`, or(lte(card.srsDue, today), eq(card.lastGrade, 1))));
  return rows.map((r) => r.id);
}

async function learnedDsaTopics(): Promise<string[]> {
  const statuses = computeStatuses('dsa', await loadProgress('dsa'));
  const topics = new Set<string>();
  for (const n of NODES.values()) {
    if (n.track === 'dsa' && n.problem && statuses.get(n.id) !== 'locked') topics.add(n.problem.topic);
  }
  return [...topics];
}

export async function startNodeQuiz(nodeId: string): Promise<QuizPayload> {
  await guard();
  const node = NODES.get(nodeId);
  if (!node?.quiz) throw new Error('Node ini tidak punya kuis bawaan.');
  const today = dojoToday(await getProfile());
  const prefix = node.quiz.kind === 'kana' ? 'kana:' : node.quiz.kind === 'grammar' ? 'gram:' : node.quiz.kind === 'kanji' ? 'kanji:' : 'pat:';
  const isGate = node.type === 'checkpoint' || node.type === 'boss';
  const questions = await buildQuiz(node.quiz, {
    prefer: isGate ? [] : await weakCards(prefix, today),
    count: node.quiz.kind === 'kana' && isGate ? 30 : undefined,
    learnedTopics: node.quiz.kind === 'pattern' ? await learnedDsaTopics() : undefined,
  });
  return { title: node.title, questions, kind: quizKind(node.quiz), timeLimitS: node.timeLimitS, passPct: isGate ? (node.passPct ?? 80) : undefined, nodeId };
}

// Kuis bebas (dari Hari ini / Review): spec dibangun server, bukan dari klien
export async function startSpecQuiz(spec: QuizSpec, title: string, opts: { seed?: string; count?: number; dailyItem?: string } = {}): Promise<QuizPayload> {
  await guard();
  const today = dojoToday(await getProfile());
  const prefix = spec.kind === 'kana' ? 'kana:' : spec.kind === 'grammar' ? 'gram:' : spec.kind === 'kanji' ? 'kanji:' : 'pat:';
  const questions = await buildQuiz(spec, {
    seed: opts.seed,
    count: opts.count,
    prefer: await weakCards(prefix, today),
    learnedTopics: spec.kind === 'pattern' ? await learnedDsaTopics() : undefined,
  });
  return { title, questions, kind: quizKind(spec), dailyItem: opts.dailyItem };
}

// Kuis dari item Hari ini: spec diambil dari set harian yang tersimpan, bukan dari klien
export async function startDailyQuiz(itemId: string): Promise<QuizPayload> {
  await guard();
  const { getDailySets } = await import('@/lib/dojo/daily');
  const { today, sets } = await getDailySets();
  const item = [...sets.jp.items, ...sets.dsa.items].find((x) => x.id === itemId);
  if (!item?.quiz) throw new Error('Item kuis tidak ditemukan.');
  const prefix = item.quiz.kind === 'kana' ? 'kana:' : item.quiz.kind === 'grammar' ? 'gram:' : item.quiz.kind === 'kanji' ? 'kanji:' : 'pat:';
  const questions = await buildQuiz(item.quiz, {
    seed: `${today}:${itemId}:${Date.now()}`,
    count: item.quiz.kind === 'grammar' ? 5 : item.quiz.kind === 'pattern' ? 5 : 20,
    prefer: await weakCards(prefix, today),
    learnedTopics: item.quiz.kind === 'pattern' ? item.quiz.topics : undefined,
  });
  return { title: item.quizTitle ?? item.title, questions, kind: quizKind(item.quiz), dailyItem: itemId };
}

const DECKS = ['kana', 'kanji', 'grammar', 'pattern'] as const;
// Review kartu jatuh tempo per dek (maks 50 kartu per sesi, sesuai batas harian)
export async function startCardReview(deck: (typeof DECKS)[number]): Promise<QuizPayload> {
  await guard();
  if (!DECKS.includes(deck)) throw new Error('Dek tidak dikenal.');
  const db = getDb();
  const today = dojoToday(await getProfile());
  const due = await db
    .select()
    .from(card)
    .where(and(eq(card.deck, deck), eq(card.suspended, false), lte(card.srsDue, today)))
    .orderBy(card.srsDue)
    .limit(50);
  if (!due.length) throw new Error('Tidak ada kartu jatuh tempo di dek ini.');
  const pool = await db.select({ back: card.back }).from(card).where(eq(card.deck, deck)).limit(400);
  const backs = [...new Set(pool.map((p) => p.back))];
  const rand = rng(`${today}:${deck}:${Date.now()}`);
  const questions: Question[] = shuffle(due, rand).map((c) => {
    const others = shuffle(backs.filter((b) => b !== c.back), rand).slice(0, 3);
    const opts = shuffle([c.back, ...others], rand);
    return {
      id: c.id,
      kind: deck === 'pattern' ? 'pattern' : (deck as QuizKind),
      prompt: c.front,
      ja: deck !== 'pattern',
      sub: deck === 'pattern' ? 'Pola apa yang cocok?' : deck === 'grammar' ? 'Apa artinya?' : 'Jawabannya?',
      options: opts,
      answer: c.back,
    };
  });
  return { title: `Review kartu ${deck}`, questions, kind: deck === 'pattern' ? 'pattern' : (deck as QuizKind), review: true };
}

const SubmitInput = z.object({
  kind: z.enum(['kana', 'kanji', 'grammar', 'pattern', 'bigo']),
  nodeId: z.string().max(80).optional(),
  dailyItem: z.string().max(80).optional(),
  review: z.boolean().optional(),
  durationS: z.number().int().min(0).max(36000),
  results: z
    .array(z.object({ id: z.string().max(80), correct: z.boolean(), front: z.string().max(200), back: z.string().max(300) }))
    .min(1)
    .max(120),
});

export type SubmitResult = { ok: true; correct: number; total: number; pct: number; passed?: boolean; message: string; result?: AwardResult } | { ok: false; error: string };

const DECK: Record<QuizKind, string> = { kana: 'kana', kanji: 'kanji', grammar: 'grammar', pattern: 'pattern', bigo: 'bigo' };

export async function submitQuiz(raw: z.input<typeof SubmitInput>): Promise<SubmitResult> {
  await guard();
  const parsed = SubmitInput.safeParse(raw);
  if (!parsed.success) return { ok: false, error: 'Data kuis tidak valid.' };
  const input = parsed.data;
  const db = getDb();
  const p = await getProfile();
  const today = dojoToday(p);
  const total = input.results.length;
  const correct = input.results.filter((r) => r.correct).length;
  const pct = Math.round((correct / total) * 100);
  const track = input.kind === 'pattern' || input.kind === 'bigo' ? 'dsa' : 'jp';

  await db.insert(quizSession).values({ kind: input.kind, refId: input.nodeId ?? input.dailyItem, total, correct, durationS: input.durationS, items: input.results });

  // Jadwal SRS per kartu: benar = Baik, salah = Lupa
  if (input.kind !== 'bigo') {
    const ids = [...new Set(input.results.map((r) => r.id))];
    const existing = new Map((await db.select().from(card).where(inArray(card.id, ids))).map((c) => [c.id, c]));
    const rows = ids.map((id) => {
      const r = input.results.filter((x) => x.id === id);
      const ok = r.every((x) => x.correct);
      const prev = existing.get(id);
      const next = schedule({ interval: prev?.srsInterval ?? null, ease: prev?.srsEase ?? null, reps: prev?.srsReps ?? 0, lapses: prev?.srsLapses ?? 0, mastery: 1 }, ok ? 3 : 1, today, id);
      return {
        id,
        deck: DECK[input.kind],
        front: r[0].front,
        back: r[0].back,
        lastGrade: ok ? 3 : 1,
        correctStreak: ok ? (prev?.correctStreak ?? 0) + 1 : 0,
        srsDue: next.due,
        srsInterval: next.interval,
        srsEase: next.ease,
        srsReps: next.reps,
        srsLapses: next.lapses,
      };
    });
    await db
      .insert(card)
      .values(rows)
      .onConflictDoUpdate({
        target: card.id,
        set: {
          lastGrade: sql`excluded.last_grade`,
          correctStreak: sql`excluded.correct_streak`,
          srsDue: sql`excluded.srs_due`,
          srsInterval: sql`excluded.srs_interval`,
          srsEase: sql`excluded.srs_ease`,
          srsReps: sql`excluded.srs_reps`,
          srsLapses: sql`excluded.srs_lapses`,
        },
      });
  }

  const minutes = Math.max(1, Math.round(input.durationS / 60));
  const rating = pct >= 90 ? 4 : pct >= 70 ? 3 : pct >= 50 ? 2 : 1;
  const node = input.nodeId ? NODES.get(input.nodeId) : undefined;

  // Kuis dari node jalur
  if (node?.quiz) {
    const statuses = computeStatuses(node.track, await loadProgress(node.track));
    const status = statuses.get(node.id);
    const done = status === 'completed' || status === 'skipped';
    const isGate = node.type === 'checkpoint' || node.type === 'boss';
    if (isGate && !done) {
      const pass = node.passPct ?? 80;
      const inTime = !node.timeLimitS || input.durationS <= node.timeLimitS;
      if (pct < pass || !inTime) {
        return { ok: true, correct, total, pct, passed: false, message: !inTime ? `Waktu habis: butuh ≤ ${Math.round((node.timeLimitS ?? 0) / 60)} menit.` : `Belum lulus: butuh ≥ ${pass}%. Coba lagi, がんばって！` };
      }
      const r = await completeNode({ nodeId: node.id, rating, minutes, score: pct, skipTest: status === 'locked' || undefined });
      if (!r.ok) return { ok: false, error: r.error };
      return { ok: true, correct, total, pct, passed: true, message: r.skipped ? `Lulus! ${r.skipped} node sebelumnya ditandai dilewati.` : 'Lulus! よくできました！', result: r.result };
    }
    if (!done && status !== 'locked') {
      const r = await completeNode({ nodeId: node.id, rating, minutes, score: pct });
      if (!r.ok) return { ok: false, error: r.error };
      if (pct >= 90) {
        const b = await award({ track: node.track, type: 'quiz_bonus', refId: node.id, xp: 5, dedupeKey: `nodebonus:${node.id}` });
        r.result.xp += b.xp;
        r.result.totalXp = b.totalXp;
        r.result.level = b.level;
      }
      return { ok: true, correct, total, pct, passed: true, message: `Node selesai · akurasi ${pct}%`, result: r.result };
    }
  }

  if (input.review && input.kind !== 'pattern' && input.kind !== 'bigo') {
    const [{ xp: used }] = await db
      .select({ xp: sql<number>`coalesce(sum(${activityEvent.xp}), 0)::int` })
      .from(activityEvent)
      .where(and(eq(activityEvent.localDate, today), eq(activityEvent.type, 'card_review')));
    const xp = Math.max(0, Math.min(30 - used, correct));
    const [{ n }] = await db.select({ n: sql<number>`count(*)::int` }).from(activityEvent).where(and(eq(activityEvent.localDate, today), eq(activityEvent.type, 'card_review')));
    const result = await award({ track: 'jp', type: 'card_review', xp, minutes, payload: { total, correct }, dedupeKey: `card_review:${today}:${n + 1}`, counters: { reviews: total } });
    return { ok: true, correct, total, pct, message: xp ? `Akurasi ${pct}%` : `Akurasi ${pct}% · batas 30 XP review kartu hari ini sudah tercapai`, result };
  }

  // Sesi bebas: sprint/recall maks 6 per hari, Tebak Pola maks 3 per hari
  if (input.kind === 'bigo') return { ok: true, correct, total, pct, message: `Akurasi ${pct}%` };
  const evType = input.kind === 'pattern' ? 'quiz_pattern' : 'quiz_sprint';
  const cap = input.kind === 'pattern' ? 3 : 6;
  const [{ n }] = await db
    .select({ n: sql<number>`count(*)::int` })
    .from(activityEvent)
    .where(and(eq(activityEvent.localDate, today), eq(activityEvent.type, evType)));
  let result: AwardResult | undefined;
  if (n < cap) {
    const xp = input.kind === 'pattern' ? 10 : 10 + (pct >= 90 ? 5 : 0);
    result = await award({
      track,
      type: evType,
      refId: input.dailyItem ?? input.nodeId,
      xp,
      minutes,
      payload: { pct, kind: input.kind },
      dedupeKey: `${evType}:${today}:${n + 1}`,
      counters: { quizzes: 1 },
    });
  }
  if (input.dailyItem) await markDailyItem(input.dailyItem, { pct });
  if (result) result.events.push(...(await badgeEvents(p.timezone)));
  return { ok: true, correct, total, pct, message: n < cap ? `Akurasi ${pct}%` : `Akurasi ${pct}% · batas XP sesi hari ini sudah tercapai`, result };
}
