'use server';

import { eq } from 'drizzle-orm';
import { z } from 'zod';
import { getDb } from '@/db/client';
import { countdown, daruma, jlptSession, profile } from '@/db/schema';
import { completeNode } from '@/app/actions/dojo';
import { JLPT_STATUS, REGISTERED_OR_LATER } from '@/lib/dojo/calendar';
import { award, getProfile, type AwardResult } from '@/lib/dojo/engine/core';
import { guard } from '@/lib/dojo/guard';
import { loadProgress } from '@/lib/dojo/progress';

type Res = { ok: true; result?: AwardResult } | { ok: false; error: string };
const uuid = z.string().regex(/^[0-9a-f-]{36}$/i);
const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);
const dateTime = z.string().regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/); // dari <input type="datetime-local">, WIB
const wib = (s: string) => new Date(`${s}:00+07:00`);

const NODES_BY_LEVEL: Record<string, { war: string; exam: string; daruma: string }> = {
  N5: { war: 'jp-1.8-war', exam: 'jp-1.15-exam', daruma: 'jlpt-n5' },
  N4: { war: 'jp-2.4-war', exam: 'jp-2.14-exam', daruma: 'jlpt-n4' },
  N3: { war: 'jp-3.7-war', exam: 'jp-3.11-exam', daruma: 'jlpt-n3' },
};

const SessionInput = z.object({
  id: uuid,
  examDate: isoDate,
  levelPlanned: z.string().trim().max(10),
  city: z.string().trim().max(60),
  regOpenAt: dateTime.or(z.literal('')),
  regCloseAt: dateTime.or(z.literal('')),
  isEstimate: z.boolean(),
  status: z.enum(JLPT_STATUS.map((s) => s[0]) as [string, ...string[]]),
  score: z.string().trim().max(60),
  notes: z.string().trim().max(300),
});

export async function updateSession(raw: z.input<typeof SessionInput>): Promise<Res> {
  await guard();
  const p = SessionInput.safeParse(raw);
  if (!p.success) return { ok: false, error: 'Periksa lagi isian sesi (tanggal, status, panjang teks).' };
  const d = p.data;
  const db = getDb();
  const [prev] = await db.select().from(jlptSession).where(eq(jlptSession.id, d.id));
  if (!prev) return { ok: false, error: 'Sesi tidak ditemukan.' };
  await db
    .update(jlptSession)
    .set({
      examDate: d.examDate,
      levelPlanned: d.levelPlanned || null,
      city: d.city || null,
      regOpenAt: d.regOpenAt ? wib(d.regOpenAt) : null,
      regCloseAt: d.regCloseAt ? wib(d.regCloseAt) : null,
      isEstimate: d.isEstimate,
      status: d.status,
      score: d.score ? { text: d.score } : null,
      notes: d.notes || null,
    })
    .where(eq(jlptSession.id, d.id));

  // Status → node jalur + XP milestone
  const map = NODES_BY_LEVEL[(d.levelPlanned || '').toUpperCase().slice(0, 2)];
  let result: AwardResult | undefined;
  if (map) {
    const prog = await loadProgress('jp');
    const done = (id: string) => ['completed', 'skipped'].includes(prog.get(id)?.status ?? '');
    if (REGISTERED_OR_LATER.has(d.status) && !done(map.war)) {
      const r = await completeNode({ nodeId: map.war, rating: 3 });
      if (r.ok) result = r.result;
    }
    if (['taken', 'passed', 'failed'].includes(d.status) && !done(map.exam)) {
      const r = await completeNode({ nodeId: map.exam, rating: 3 });
      if (r.ok) result = r.result;
    }
    if (d.status === 'passed' && prev.status !== 'passed') {
      result = await award({ track: 'jp', type: 'jlpt_passed', refId: d.examDate, xp: 1000, dedupeKey: `jlpt_pass:${d.examDate}` });
      await db.update(daruma).set({ rightEyeAt: new Date(), status: 'achieved' }).where(eq(daruma.slug, map.daruma));
    }
  }
  return { ok: true, result };
}

const NewSession = z.object({ examDate: isoDate, levelPlanned: z.string().trim().max(10), city: z.string().trim().max(60) });
export async function addSession(raw: z.input<typeof NewSession>): Promise<Res> {
  await guard();
  const p = NewSession.safeParse(raw);
  if (!p.success) return { ok: false, error: 'Tanggal ujian wajib (YYYY-MM-DD).' };
  await getDb().insert(jlptSession).values({ examDate: p.data.examDate, levelPlanned: p.data.levelPlanned || null, city: p.data.city || null, isEstimate: true }).onConflictDoNothing();
  return { ok: true };
}

export async function deleteSession(id: string): Promise<void> {
  await guard();
  if (uuid.safeParse(id).success) await getDb().delete(jlptSession).where(eq(jlptSession.id, id));
}

const NewCountdown = z.object({ title: z.string().trim().min(2).max(80), targetAt: dateTime });
export async function addCountdown(raw: z.input<typeof NewCountdown>): Promise<Res> {
  await guard();
  const p = NewCountdown.safeParse(raw);
  if (!p.success) return { ok: false, error: 'Judul 2–80 karakter dan tanggal-jam wajib.' };
  await getDb().insert(countdown).values({ title: p.data.title, targetAt: wib(p.data.targetAt), kind: 'custom' });
  return { ok: true };
}

export async function deleteCountdown(id: string): Promise<void> {
  await guard();
  if (!uuid.safeParse(id).success) return;
  const db = getDb();
  const [c] = await db.select().from(countdown).where(eq(countdown.id, id));
  if (c && c.kind === 'custom') await db.delete(countdown).where(eq(countdown.id, id));
}

const Checklist = z.array(z.object({ text: z.string().trim().min(1).max(120), done: z.boolean() })).max(20);
export async function saveWarChecklist(raw: z.input<typeof Checklist>): Promise<void> {
  await guard();
  const items = Checklist.parse(raw);
  const p = await getProfile();
  await getDb()
    .update(profile)
    .set({ settings: { ...(p.settings as Record<string, unknown>), warChecklist: items } })
    .where(eq(profile.id, 1));
}

const DarumaInput = z.object({ id: uuid, action: z.enum(['achieve', 'extend', 'release', 'reopen']), date: isoDate.optional(), note: z.string().trim().max(1000).optional() });
export async function darumaAction(raw: z.input<typeof DarumaInput>): Promise<Res> {
  await guard();
  const p = DarumaInput.safeParse(raw);
  if (!p.success) return { ok: false, error: 'Data tidak valid.' };
  const { id, action, date, note } = p.data;
  const db = getDb();
  if (action === 'achieve') await db.update(daruma).set({ rightEyeAt: new Date(), status: 'achieved' }).where(eq(daruma.id, id));
  if (action === 'extend') {
    if (!date) return { ok: false, error: 'Isi tanggal baru.' };
    await db.update(daruma).set({ dueDate: date, status: 'active' }).where(eq(daruma.id, id));
  }
  if (action === 'release') {
    if (!note || note.length < 20) return { ok: false, error: 'Tulis satu paragraf refleksi (minimal 20 karakter).' };
    await db.update(daruma).set({ status: 'released', note }).where(eq(daruma.id, id));
  }
  if (action === 'reopen') await db.update(daruma).set({ status: 'active', rightEyeAt: null }).where(eq(daruma.id, id));
  return { ok: true };
}

const NewDaruma = z.object({ title: z.string().trim().min(2).max(60), track: z.enum(['jp', 'dsa', 'general']), dueDate: isoDate });
export async function addDaruma(raw: z.input<typeof NewDaruma>): Promise<Res> {
  await guard();
  const p = NewDaruma.safeParse(raw);
  if (!p.success) return { ok: false, error: 'Judul dan tanggal target wajib.' };
  const slug = `custom-${Date.now().toString(36)}`;
  await getDb().insert(daruma).values({ slug, title: p.data.title, track: p.data.track, dueDate: p.data.dueDate });
  return { ok: true };
}
