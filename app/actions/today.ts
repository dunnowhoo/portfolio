'use server';

import { and, eq, sql } from 'drizzle-orm';
import { z } from 'zod';
import { getDb } from '@/db/client';
import { activityEvent, nodeProgress, problemProgress } from '@/db/schema';
import { NODES } from '@/lib/dojo/curriculum';
import { completeManualQuest, getDailySets, getQuests, maybePerfectDay, rerollTrack, setItemDone } from '@/lib/dojo/daily';
import { award, dojoToday, getProfile, type AwardResult } from '@/lib/dojo/engine/core';
import { schedule, type Rating } from '@/lib/dojo/engine/srs';
import { guard } from '@/lib/dojo/guard';
import { badgeEvents } from '@/lib/dojo/badges';

type Ok = { ok: true; result?: AwardResult; message?: string } | { ok: false; error: string };

async function todayCount(type: string, track?: string): Promise<{ n: number; xp: number; today: string }> {
  const today = dojoToday(await getProfile());
  const where = track ? and(eq(activityEvent.localDate, today), eq(activityEvent.type, type), eq(activityEvent.track, track)) : and(eq(activityEvent.localDate, today), eq(activityEvent.type, type));
  const [r] = await getDb().select({ n: sql<number>`count(*)::int`, xp: sql<number>`coalesce(sum(${activityEvent.xp}), 0)::int` }).from(activityEvent).where(where);
  return { ...r, today };
}

async function afterDaily(): Promise<void> {
  const { perfect } = await getDailySets();
  await maybePerfectDay(perfect);
  await getQuests(perfect);
}

export async function markDailyItem(itemId: string, meta: Record<string, unknown> = {}): Promise<void> {
  await guard();
  if (!/^(jp|dsa):[\w:.-]{1,60}$/.test(itemId)) return;
  await setItemDone(itemId, meta);
  await afterDaily();
}

export async function checkIn(kind: 'anki' | 'duolingo'): Promise<Ok> {
  await guard();
  if (kind !== 'anki' && kind !== 'duolingo') return { ok: false, error: 'Check-in tidak dikenal.' };
  const today = dojoToday(await getProfile());
  const result = await award({ track: 'jp', type: `checkin_${kind}`, xp: kind === 'anki' ? 15 : 10, dedupeKey: `checkin:${kind}:${today}` });
  await setItemDone(`jp:${kind}`);
  await afterDaily();
  return { ok: true, result, message: result.duplicate ? 'Sudah check-in hari ini.' : undefined };
}

export async function markListen(): Promise<Ok> {
  await guard();
  const { n, today } = await todayCount('listen');
  const result = n < 3 ? await award({ track: 'jp', type: 'listen', xp: 10, minutes: 10, dedupeKey: `listen:${today}:${n + 1}` }) : undefined;
  await setItemDone('jp:listen');
  await afterDaily();
  return { ok: true, result };
}

export async function rerollDaily(track: 'jp' | 'dsa'): Promise<Ok> {
  await guard();
  if (track !== 'jp' && track !== 'dsa') return { ok: false, error: 'Jalur tidak dikenal.' };
  const ok = await rerollTrack(track);
  return ok ? { ok: true } : { ok: false, error: 'Reroll hanya 1× per hari per jalur.' };
}

export async function manualQuest(questId: string): Promise<Ok> {
  await guard();
  const ok = await completeManualQuest(questId);
  if (!ok) return { ok: false, error: 'Quest ini tidak bisa ditandai manual.' };
  const { perfect } = await getDailySets();
  await getQuests(perfect);
  return { ok: true };
}

const FreeInput = z.object({ track: z.enum(['jp', 'dsa']), minutes: z.number().int().min(1).max(480) });
// Catat waktu belajar bebas: 1 XP per 3 menit, maks 40 XP per hari per jalur
export async function logFree(raw: z.input<typeof FreeInput>): Promise<Ok> {
  await guard();
  const parsed = FreeInput.safeParse(raw);
  if (!parsed.success) return { ok: false, error: 'Isi menit 1–480.' };
  const { track, minutes } = parsed.data;
  const { xp: used, n, today } = await todayCount('free_time', track);
  const xp = Math.max(0, Math.min(40 - used, Math.floor(minutes / 3)));
  const result = await award({ track, type: 'free_time', xp, minutes, dedupeKey: `free:${today}:${track}:${n + 1}` });
  await afterDaily();
  return { ok: true, result, message: xp === 0 ? 'Menit dicatat. Batas XP waktu bebas hari ini sudah tercapai.' : undefined };
}

const ACTIVITIES = {
  bicara: { track: 'jp', xp: 40, cap: 0, label: 'Sesi bicara' },
  nhk: { track: 'jp', xp: 10, cap: 3, label: 'Artikel NHK Easy / graded reader' },
  kontes: { track: 'dsa', xp: 60, cap: 0, label: 'Ikut kontes' },
  mock: { track: 'dsa', xp: 80, cap: 0, label: 'Mock interview' },
} as const;
export type ActivityKind = keyof typeof ACTIVITIES;

export async function logActivity(kind: ActivityKind, minutes = 0): Promise<Ok> {
  await guard();
  const a = ACTIVITIES[kind];
  if (!a) return { ok: false, error: 'Aktivitas tidak dikenal.' };
  const { n, today } = await todayCount(`act_${kind}`);
  if (a.cap && n >= a.cap) return { ok: false, error: `${a.label}: maksimal ${a.cap}× per hari.` };
  const result = await award({ track: a.track, type: `act_${kind}`, xp: a.xp, minutes: Math.max(0, Math.min(480, Math.round(minutes))), dedupeKey: `act:${kind}:${today}:${n + 1}` });
  await afterDaily();
  return { ok: true, result };
}

const ReviewInput = z.object({ id: z.string().max(80), rating: z.number().int().min(1).max(4), minutes: z.number().int().min(0).max(300).default(0), quick: z.boolean().optional() });

// Review SRS untuk soal DSA atau node: XP soal 10 (1× per soal per hari), node 5
export async function reviewItem(raw: z.input<typeof ReviewInput>): Promise<Ok> {
  await guard();
  const parsed = ReviewInput.safeParse(raw);
  if (!parsed.success) return { ok: false, error: 'Data review tidak valid.' };
  const { id, rating, minutes, quick } = parsed.data;
  const node = NODES.get(id);
  if (!node) return { ok: false, error: 'Item tidak ditemukan.' };
  const db = getDb();
  const today = dojoToday(await getProfile());
  if (node.problem) {
    const [p] = await db.select().from(problemProgress).where(eq(problemProgress.problemId, id));
    if (!p) return { ok: false, error: 'Soal ini belum pernah diselesaikan.' };
    const next = schedule({ interval: p.srsInterval, ease: p.srsEase, reps: p.srsReps, lapses: p.srsLapses, mastery: p.mastery }, rating as Rating, today, id, { quickRecall: quick });
    const wasForgotten = p.srsLapses > 0 && rating >= 3;
    await db
      .update(problemProgress)
      .set({ srsDue: next.due, srsInterval: next.interval, srsEase: next.ease, srsReps: next.reps, srsLapses: next.lapses, mastery: quick ? Math.min(2, next.mastery) : next.mastery, bestMinutes: minutes ? sql`least(coalesce(${problemProgress.bestMinutes}, ${minutes}), ${minutes})` : sql`${problemProgress.bestMinutes}` })
      .where(eq(problemProgress.problemId, id));
    await db.update(nodeProgress).set({ mastery: quick ? Math.min(2, next.mastery) : next.mastery, lastReviewedAt: new Date() }).where(eq(nodeProgress.nodeId, id));
    const result = await award({ track: 'dsa', type: 'review', refId: id, xp: 10, minutes, payload: { rating, quick: !!quick, comeback: wasForgotten }, dedupeKey: `review:${id}:${today}`, counters: { reviews: 1 } });
    await afterDaily();
    result.events.push(...(await badgeEvents()));
    return { ok: true, result, message: `Review berikutnya ${next.due}${next.mastery > p.mastery ? ` · naik ke ${'★'.repeat(next.mastery)}` : ''}` };
  }
  const [np] = await db.select().from(nodeProgress).where(eq(nodeProgress.nodeId, id));
  if (!np) return { ok: false, error: 'Node ini belum selesai.' };
  const next = schedule({ interval: np.srsInterval, ease: np.srsEase, reps: np.srsReps, lapses: np.srsLapses, mastery: np.mastery }, rating as Rating, today, id);
  await db
    .update(nodeProgress)
    .set({ srsDue: next.due, srsInterval: next.interval, srsEase: next.ease, srsReps: next.reps, srsLapses: next.lapses, mastery: next.mastery, lastReviewedAt: new Date() })
    .where(eq(nodeProgress.nodeId, id));
  const result = await award({ track: node.track, type: 'review', refId: id, xp: 5, minutes, payload: { rating }, dedupeKey: `review:${id}:${today}`, counters: { reviews: 1 } });
  await afterDaily();
  return { ok: true, result, message: `Review berikutnya ${next.due}` };
}
