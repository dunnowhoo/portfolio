import 'server-only';
import { and, gte, lte, sql } from 'drizzle-orm';
import { getDb } from '@/db/client';
import { card, dailyStat, problemProgress, quizSession } from '@/db/schema';
import type { DayXp } from '@/components/dojo/Heatmap';
import { NODES, ORDERED, type ProgressMap } from '@/lib/dojo/curriculum';
import { PROBLEMS, TOPIC_TITLES } from '@/lib/dojo/curriculum/dsa';
import { addDays } from '@/lib/dojo/engine/srs';
import { weekStart } from '@/lib/dojo/goals';

export async function heatmapData(year: number): Promise<{ data: Record<string, DayXp>; years: number[] }> {
  const db = getDb();
  const rows = await db.select().from(dailyStat).where(and(gte(dailyStat.localDate, `${year}-01-01`), lte(dailyStat.localDate, `${year}-12-31`)));
  const data: Record<string, DayXp> = {};
  for (const r of rows) {
    const d = (data[r.localDate] ??= { jp: 0, dsa: 0, general: 0 });
    if (r.track === 'jp' || r.track === 'dsa' || r.track === 'general') d[r.track] += r.xp;
  }
  const [{ minY }] = await db.select({ minY: sql<string | null>`min(${dailyStat.localDate})::text` }).from(dailyStat);
  const first = minY ? Number(minY.slice(0, 4)) : year;
  const years: number[] = [];
  for (let y = Math.min(first, year); y <= Math.max(year, new Date().getFullYear()); y++) years.push(y);
  return { data, years };
}

export async function weeklyXp(today: string, weeks = 12): Promise<{ start: string; jp: number; dsa: number; general: number }[]> {
  const end = weekStart(today);
  const start = addDays(end, -7 * (weeks - 1));
  const rows = await getDb().select().from(dailyStat).where(gte(dailyStat.localDate, start));
  const out = Array.from({ length: weeks }, (_, i) => ({ start: addDays(start, i * 7), jp: 0, dsa: 0, general: 0 }));
  for (const r of rows) {
    const idx = Math.floor((Date.parse(`${r.localDate}T00:00:00Z`) - Date.parse(`${start}T00:00:00Z`)) / (7 * 86_400_000));
    const w = out[idx];
    if (w && (r.track === 'jp' || r.track === 'dsa' || r.track === 'general')) w[r.track] += r.xp;
  }
  return out;
}

export async function profileStats(progress: { jp: ProgressMap; dsa: ProgressMap }) {
  const db = getDb();
  const [minutes, probs, cards, quizzes] = await Promise.all([
    db.select({ track: dailyStat.track, m: sql<number>`coalesce(sum(${dailyStat.minutes}), 0)::int`, xp: sql<number>`coalesce(sum(${dailyStat.xp}), 0)::int` }).from(dailyStat).groupBy(dailyStat.track),
    db.select().from(problemProgress),
    db.select({ deck: card.deck, total: sql<number>`count(*)::int`, strong: sql<number>`count(*) filter (where ${card.srsInterval} >= 7)::int` }).from(card).groupBy(card.deck),
    db.select({ kind: quizSession.kind, c: sql<number>`coalesce(sum(${quizSession.correct}), 0)::int`, t: sql<number>`coalesce(sum(${quizSession.total}), 0)::int` }).from(quizSession).groupBy(quizSession.kind),
  ]);
  const solved = probs.filter((p) => p.status === 'solved');
  const byLevel = { E: 0, M: 0, H: 0 } as Record<'E' | 'M' | 'H', number>;
  for (const p of solved) {
    const l = NODES.get(p.problemId)?.problem?.level;
    if (l) byLevel[l] += 1;
  }
  const topics = [...new Set(PROBLEMS.map((p) => p.topic))].map((t) => {
    const list = PROBLEMS.filter((p) => p.topic === t);
    const ms = list.map((p) => probs.find((x) => x.problemId === `lc-${p.lc}`)?.mastery ?? 0);
    return { id: t, title: TOPIC_TITLES[t] ?? t, solved: ms.filter((m) => m > 0).length, total: list.length, avgStars: ms.reduce((a, m) => a + m, 0) / Math.max(1, list.length) };
  });
  const books = (['X', 'Y', 'Z', 'ZZ'] as const).map((b) => {
    const list = ORDERED.jp.filter((n) => n.irodori?.book === b);
    const done = list.filter((n) => ['completed', 'skipped'].includes(progress.jp.get(n.id)?.status ?? '')).length;
    return { book: b, name: { X: 'Starter', Y: 'Elementary 1', Z: 'Elementary 2', ZZ: 'Pre-Intermediate' }[b], done, total: list.length };
  });
  const deck = (d: string) => cards.find((c) => c.deck === d) ?? { total: 0, strong: 0 };
  const acc = (k: string) => {
    const q = quizzes.find((x) => x.kind === k);
    return q && q.t ? Math.round((q.c / q.t) * 100) : null;
  };
  return {
    hours: { jp: (minutes.find((m) => m.track === 'jp')?.m ?? 0) / 60, dsa: (minutes.find((m) => m.track === 'dsa')?.m ?? 0) / 60 },
    xpByTrack: { jp: minutes.find((m) => m.track === 'jp')?.xp ?? 0, dsa: minutes.find((m) => m.track === 'dsa')?.xp ?? 0, general: minutes.find((m) => m.track === 'general')?.xp ?? 0 },
    solved: solved.length,
    byLevel,
    topics,
    books,
    kana: deck('kana'),
    kanji: deck('kanji'),
    grammar: deck('grammar'),
    accuracy: { kana: acc('kana'), kanji: acc('kanji'), grammar: acc('grammar'), pattern: acc('pattern') },
  };
}
