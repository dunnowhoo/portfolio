'use server';

import { eq } from 'drizzle-orm';
import { z } from 'zod';
import { getDb } from '@/db/client';
import { goal, reflection } from '@/db/schema';
import { award, dojoToday, getProfile, type AwardResult } from '@/lib/dojo/engine/core';
import { addDays } from '@/lib/dojo/engine/srs';
import { METRIC_LABEL, monthEnd, monthStart, weekStart, type Metric } from '@/lib/dojo/goals';
import { guard } from '@/lib/dojo/guard';

const uuid = z.string().regex(/^[0-9a-f-]{36}$/i);

export async function toggleManual(id: string): Promise<void> {
  await guard();
  if (!uuid.safeParse(id).success) return;
  const db = getDb();
  const [g] = await db.select().from(goal).where(eq(goal.id, id));
  if (!g || g.metric !== 'manual') return;
  await db.update(goal).set({ manualDone: !g.manualDone }).where(eq(goal.id, id));
}

export async function updateTarget(id: string, target: number): Promise<void> {
  await guard();
  if (!uuid.safeParse(id).success || !Number.isInteger(target) || target < 1 || target > 100000) return;
  await getDb().update(goal).set({ target, source: 'edited' }).where(eq(goal.id, id));
}

export async function deleteGoal(id: string): Promise<void> {
  await guard();
  if (!uuid.safeParse(id).success) return;
  await getDb().delete(goal).where(eq(goal.id, id));
}

const AddInput = z.object({
  track: z.enum(['jp', 'dsa']),
  period: z.enum(['week', 'month']),
  title: z.string().trim().min(2).max(120),
  metric: z.enum(Object.keys(METRIC_LABEL) as [Metric, ...Metric[]]),
  target: z.number().int().min(1).max(100000),
});
export async function addGoal(raw: z.input<typeof AddInput>): Promise<{ ok: boolean; error?: string }> {
  await guard();
  const p = AddInput.safeParse(raw);
  if (!p.success) return { ok: false, error: 'Judul 2–120 karakter dan target ≥ 1.' };
  const today = dojoToday(await getProfile());
  const start = p.data.period === 'week' ? weekStart(today) : monthStart(today);
  const end = p.data.period === 'week' ? addDays(start, 6) : monthEnd(today);
  await getDb().insert(goal).values({ ...p.data, periodStart: start, periodEnd: end, manualDone: p.data.metric === 'manual' ? false : null, source: 'custom', sort: 99 });
  return { ok: true };
}

const ReflInput = z.object({ wentWell: z.string().trim().max(2000), blockers: z.string().trim().max(2000), nextWeek: z.string().trim().max(2000) });
export async function saveReflection(raw: z.input<typeof ReflInput>): Promise<{ ok: boolean; error?: string; result?: AwardResult }> {
  await guard();
  const p = ReflInput.safeParse(raw);
  if (!p.success) return { ok: false, error: 'Teks terlalu panjang (maks 2000 karakter per kolom).' };
  if (!p.data.wentWell && !p.data.blockers && !p.data.nextWeek) return { ok: false, error: 'Isi minimal satu kolom.' };
  const ws = weekStart(dojoToday(await getProfile()));
  await getDb()
    .insert(reflection)
    .values({ weekStart: ws, ...p.data })
    .onConflictDoUpdate({ target: reflection.weekStart, set: p.data });
  const result = await award({ track: 'general', type: 'reflection', refId: ws, xp: 20, dedupeKey: `reflection:${ws}` });
  return { ok: true, result };
}
