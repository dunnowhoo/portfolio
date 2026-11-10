'use server';

import { and, eq, gte, lte, sql } from 'drizzle-orm';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import { getDb } from '@/db/client';
import { busyDay, profile } from '@/db/schema';
import { destroyAllSessions } from '@/lib/auth/session';
import { dojoToday, getProfile } from '@/lib/dojo/engine/core';
import { monthEnd } from '@/lib/dojo/goals';
import { guard } from '@/lib/dojo/guard';

const TIMEZONES = ['Asia/Jakarta', 'Asia/Tokyo', 'Asia/Singapore', 'Asia/Makassar', 'Asia/Jayapura', 'UTC'] as const;
const ProfileInput = z.object({
  displayName: z.string().trim().min(1).max(40),
  timezone: z.enum(TIMEZONES),
  dayStartHour: z.number().int().min(0).max(5),
  dailyGoalJp: z.number().int().min(10).max(300),
  dailyGoalDsa: z.number().int().min(10).max(300),
  streakMinXp: z.number().int().min(5).max(100),
});

export async function saveProfile(raw: z.input<typeof ProfileInput>): Promise<{ ok: boolean; error?: string }> {
  await guard();
  const p = ProfileInput.safeParse(raw);
  if (!p.success) return { ok: false, error: 'Periksa lagi: daily goal 10–300, ambang streak 5–100, jam pergantian 0–5.' };
  if (p.data.streakMinXp > Math.min(p.data.dailyGoalJp, p.data.dailyGoalDsa)) return { ok: false, error: 'Ambang streak tidak boleh lebih besar dari daily goal.' };
  await getDb().update(profile).set(p.data).where(eq(profile.id, 1));
  return { ok: true };
}

const BusyInput = z.object({ date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/), track: z.enum(['jp', 'dsa', 'both']) });
// Mode sibuk: dipasang sebelum harinya mulai, maks 3 hari per bulan per jalur
export async function addBusyDay(raw: z.input<typeof BusyInput>): Promise<{ ok: boolean; error?: string }> {
  await guard();
  const p = BusyInput.safeParse(raw);
  if (!p.success) return { ok: false, error: 'Tanggal tidak valid.' };
  const today = dojoToday(await getProfile());
  if (p.data.date <= today) return { ok: false, error: 'Mode sibuk harus dipasang sebelum harinya dimulai.' };
  const db = getDb();
  const month = p.data.date.slice(0, 7);
  const tracks = p.data.track === 'both' ? (['jp', 'dsa'] as const) : ([p.data.track] as const);
  for (const t of tracks) {
    const [{ n }] = await db
      .select({ n: sql<number>`count(*)::int` })
      .from(busyDay)
      .where(and(eq(busyDay.track, t), gte(busyDay.localDate, `${month}-01`), lte(busyDay.localDate, monthEnd(p.data.date))));
    if (n >= 3) return { ok: false, error: `Jatah mode sibuk ${t === 'jp' ? '日本語' : 'DSA'} bulan ini sudah habis (maks 3).` };
  }
  await db.insert(busyDay).values(tracks.map((t) => ({ localDate: p.data.date, track: t }))).onConflictDoNothing();
  return { ok: true };
}

export async function removeBusyDay(date: string, track: string): Promise<void> {
  await guard();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !['jp', 'dsa'].includes(track)) return;
  const today = dojoToday(await getProfile());
  if (date <= today) return; // hari yang sudah berjalan tidak bisa diubah
  await getDb().delete(busyDay).where(and(eq(busyDay.localDate, date), eq(busyDay.track, track)));
}

export async function logoutEverywhere(): Promise<void> {
  await guard();
  await destroyAllSessions();
  redirect('/');
}
