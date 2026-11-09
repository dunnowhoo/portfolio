import 'server-only';
import { and, asc, eq, gte, lte } from 'drizzle-orm';
import { getDb } from '@/db/client';
import { activityEvent, dailyStat, goal, problemProgress, quizSession, reflection, streakState } from '@/db/schema';
import { NODES } from '@/lib/dojo/curriculum';
import { award, dojoToday, getProfile } from '@/lib/dojo/engine/core';
import { addDays } from '@/lib/dojo/engine/srs';

// Target mingguan & bulanan (PRD F10). Progres selalu dihitung ulang dari event.

export type Metric =
  | 'days_active'
  | 'minutes'
  | 'xp'
  | 'irodori'
  | 'grammar'
  | 'video'
  | 'materi'
  | 'sprint_kana'
  | 'sprint_kanji'
  | 'pattern'
  | 'problems_new'
  | 'problems_total'
  | 'reviews'
  | 'boss'
  | 'checkpoint'
  | 'duolingo_days'
  | 'bicara'
  | 'nhk'
  | 'mock'
  | 'kontes'
  | 'manual';

export const METRIC_LABEL: Record<Metric, string> = {
  days_active: 'hari aktif',
  minutes: 'menit',
  xp: 'XP',
  irodori: 'pelajaran Irodori',
  grammar: 'node grammar',
  video: 'video',
  materi: 'materi',
  sprint_kana: 'sprint kana',
  sprint_kanji: 'sprint kanji',
  pattern: 'sesi Tebak Pola',
  problems_new: 'soal baru',
  problems_total: 'soal NC150 (kumulatif)',
  reviews: 'review',
  boss: 'boss',
  checkpoint: 'checkpoint',
  duolingo_days: 'hari Duolingo',
  bicara: 'sesi bicara',
  nhk: 'artikel NHK',
  mock: 'mock interview',
  kontes: 'kontes',
  manual: 'checklist',
};

type Tpl = { title: string; metric: Metric; target: number };

export const weekStart = (d: string) => {
  const day = new Date(`${d}T00:00:00Z`).getUTCDay(); // 0 = Minggu
  return addDays(d, -((day + 6) % 7));
};
export const monthStart = (d: string) => `${d.slice(0, 7)}-01`;
export const monthEnd = (d: string) => {
  const [y, m] = d.split('-').map(Number);
  return new Date(Date.UTC(y, m, 0)).toISOString().slice(0, 10);
};

function jpWeekly(d: string): Tpl[] {
  if (d <= '2026-11-30')
    return [
      { title: '7 hari aktif', metric: 'days_active', target: 7 },
      { title: '±5 jam belajar', metric: 'minutes', target: 300 },
      { title: '≥ 3 sprint kana', metric: 'sprint_kana', target: 3 },
      { title: 'Tulis tangan semua huruf baru', metric: 'manual', target: 1 },
    ];
  if (d <= '2027-07-04')
    return [
      { title: '≥ 6 hari aktif', metric: 'days_active', target: 6 },
      { title: '±7 jam belajar', metric: 'minutes', target: 420 },
      { title: '1 pelajaran Irodori', metric: 'irodori', target: 1 },
      { title: '4 poin grammar (1 node)', metric: 'grammar', target: 1 },
      { title: '1 video grammar', metric: 'video', target: 1 },
      { title: '2 sprint kanji', metric: 'sprint_kanji', target: 2 },
      { title: 'Duolingo 5 hari', metric: 'duolingo_days', target: 5 },
      { title: '56 kartu Kaishi baru (8/hari)', metric: 'manual', target: 1 },
    ];
  if (d <= '2027-12-05')
    return [
      { title: '≥ 6 hari aktif', metric: 'days_active', target: 6 },
      { title: '±6 jam belajar', metric: 'minutes', target: 360 },
      { title: '1 pelajaran Irodori', metric: 'irodori', target: 1 },
      { title: '4 poin grammar (1 node)', metric: 'grammar', target: 1 },
      { title: '70 kartu baru (deck pribadi Irodori)', metric: 'manual', target: 1 },
      ...(d >= '2027-09-01' ? [{ title: '1 sesi bicara', metric: 'bicara' as Metric, target: 1 }] : []),
    ];
  if (d <= '2028-07-02')
    return [
      { title: '7 hari aktif', metric: 'days_active', target: 7 },
      { title: '14 jam belajar', metric: 'minutes', target: 840 },
      ...(d <= '2028-04-09' ? [{ title: '1 pelajaran Irodori', metric: 'irodori' as Metric, target: 1 }] : []),
      { title: '5 artikel NHK Easy', metric: 'nhk', target: 5 },
      { title: '2 sesi bicara', metric: 'bicara', target: 2 },
      { title: '1 bab buku N3', metric: 'manual', target: 1 },
      ...(d >= '2028-05-01' ? [{ title: 'Simulasi penuh (tiap 2 minggu)', metric: 'boss' as Metric, target: 1 }] : []),
    ];
  return [
    { title: '≥ 5 hari aktif', metric: 'days_active', target: 5 },
    { title: '±5 jam belajar', metric: 'minutes', target: 300 },
    { title: '1 materi bahasa kerja', metric: 'materi', target: 1 },
  ];
}

function dsaWeekly(d: string): Tpl[] {
  if (d <= '2026-11-29')
    return [
      { title: '≥ 5 hari aktif', metric: 'days_active', target: 5 },
      { title: '3 soal pemanasan', metric: 'problems_new', target: 3 },
      { title: 'Materi fondasi', metric: 'materi', target: 2 },
    ];
  if (d <= '2027-08-31')
    return [
      { title: '≥ 5 hari aktif', metric: 'days_active', target: 5 },
      { title: '5 soal baru', metric: 'problems_new', target: 5 },
      { title: '3 review', metric: 'reviews', target: 3 },
      { title: '1 boss ber-timer (akhir pekan)', metric: 'boss', target: 1 },
      { title: '3 sesi Tebak Pola', metric: 'pattern', target: 3 },
    ];
  if (d <= '2027-12-31')
    return [
      { title: '≥ 5 hari aktif', metric: 'days_active', target: 5 },
      { title: '3 soal baru (ekstra/Hard)', metric: 'problems_new', target: 3 },
      { title: '5 review', metric: 'reviews', target: 5 },
      { title: '1 mock interview 45 menit', metric: 'mock', target: 1 },
    ];
  return [
    { title: '≥ 4 hari aktif', metric: 'days_active', target: 4 },
    { title: '2 soal baru', metric: 'problems_new', target: 2 },
    { title: '4 review', metric: 'reviews', target: 4 },
  ];
}

// Tabel target bulanan dari kurikulum (Irodori per bulan, NC150 kumulatif)
const IRODORI_MONTH: Record<string, number> = {
  '2026-11': 1, '2026-12': 4, '2027-01': 4, '2027-02': 4, '2027-03': 6, '2027-04': 4, '2027-05': 4, '2027-06': 2, '2027-07': 4, '2027-08': 4,
  '2027-09': 6, '2027-10': 6, '2027-11': 6, '2027-12': 4, '2028-01': 4, '2028-02': 4, '2028-03': 4, '2028-04': 2,
};
const KANJI_MONTH: Record<string, number> = { '2026-12': 12, '2027-01': 24, '2027-02': 36, '2027-03': 54, '2027-04': 66, '2027-05': 78, '2027-06': 84 };
const ANKI_MONTH: Record<string, number> = { '2026-11': 20, '2026-12': 270, '2027-01': 520, '2027-02': 740, '2027-03': 990, '2027-04': 1230, '2027-05': 1480, '2027-06': 1500 };
const NC_MONTH: Record<string, number> = { '2026-12': 17, '2027-01': 36, '2027-02': 56, '2027-03': 73, '2027-04': 91, '2027-05': 106, '2027-06': 118, '2027-07': 137, '2027-08': 150 };

function jpMonthly(d: string): Tpl[] {
  const ym = d.slice(0, 7);
  const out: Tpl[] = [];
  if (IRODORI_MONTH[ym]) out.push({ title: `${IRODORI_MONTH[ym]} pelajaran Irodori`, metric: 'irodori', target: IRODORI_MONTH[ym] });
  if (d >= '2026-12-01' && d <= '2028-04-30') out.push({ title: 'Grammar sesuai jadwal (2 node)', metric: 'grammar', target: 2 });
  if (KANJI_MONTH[ym]) out.push({ title: `Kanji kumulatif ${KANJI_MONTH[ym]}`, metric: 'manual', target: 1 });
  if (ANKI_MONTH[ym]) out.push({ title: `Kaishi kumulatif ${ANKI_MONTH[ym].toLocaleString('id-ID')} kartu`, metric: 'manual', target: 1 });
  out.push({ title: '≥ 24 hari aktif', metric: 'days_active', target: 24 });
  return out;
}

function dsaMonthly(d: string): Tpl[] {
  const ym = d.slice(0, 7);
  if (ym === '2026-11') return [{ title: 'D0 fondasi selesai (checkpoint)', metric: 'checkpoint', target: 1 }];
  if (NC_MONTH[ym]) return [{ title: `NC150 kumulatif ${NC_MONTH[ym]} soal`, metric: 'problems_total', target: NC_MONTH[ym] }, { title: '≥ 20 hari aktif', metric: 'days_active', target: 20 }];
  if (d <= '2027-12-31') return [{ title: '±9 soal ekstra', metric: 'problems_new', target: 9 }, { title: '2 kontes', metric: 'kontes', target: 2 }];
  return [{ title: '2 AtCoder ABC', metric: 'boss', target: 2 }, { title: '≥ 16 hari aktif', metric: 'days_active', target: 16 }];
}

async function ensurePeriod(period: 'week' | 'month', start: string, end: string) {
  const db = getDb();
  const existing = await db.select({ id: goal.id }).from(goal).where(and(eq(goal.period, period), eq(goal.periodStart, start)));
  if (existing.length) return;
  const rows = (['jp', 'dsa'] as const).flatMap((track) =>
    (period === 'week' ? (track === 'jp' ? jpWeekly(start) : dsaWeekly(start)) : track === 'jp' ? jpMonthly(start) : dsaMonthly(start)).map((t, i) => ({
      track,
      period,
      periodStart: start,
      periodEnd: end,
      title: t.title,
      metric: t.metric,
      target: t.target,
      manualDone: t.metric === 'manual' ? false : null,
      sort: i,
    })),
  );
  if (rows.length) await db.insert(goal).values(rows);
}

export type GoalView = typeof goal.$inferSelect & { progress: number; done: boolean };

async function measure(track: 'jp' | 'dsa', start: string, end: string) {
  const db = getDb();
  const [events, stats, quizzes, totalSolved] = await Promise.all([
    db.select().from(activityEvent).where(and(gte(activityEvent.localDate, start), lte(activityEvent.localDate, end))),
    db.select().from(dailyStat).where(and(eq(dailyStat.track, track), gte(dailyStat.localDate, start), lte(dailyStat.localDate, end))),
    db.select().from(quizSession).where(and(gte(quizSession.createdAt, new Date(`${start}T00:00:00+07:00`)), lte(quizSession.createdAt, new Date(`${addDays(end, 1)}T03:00:00+07:00`)))),
    db.select({ id: problemProgress.problemId }).from(problemProgress).where(eq(problemProgress.status, 'solved')),
  ]);
  const ev = events.filter((e) => e.track === track);
  const completedType = (t: string, pred?: (id: string) => boolean) =>
    ev.filter((e) => (e.type === 'node_complete' || e.type === 'problem_solved') && NODES.get(e.refId ?? '')?.type === t && (!pred || pred(e.refId ?? ''))).length;
  const nc150 = totalSolved.filter((p) => NODES.get(p.id)?.sectionId === 'NC150').length;
  return (m: Metric): number => {
    switch (m) {
      case 'days_active':
        return stats.filter((s) => s.xp > 0).length;
      case 'minutes':
        return stats.reduce((a, s) => a + s.minutes, 0);
      case 'xp':
        return stats.reduce((a, s) => a + s.xp, 0);
      case 'irodori':
        return completedType('irodori');
      case 'grammar':
        return completedType('materi', (id) => id.endsWith('-grammar'));
      case 'video':
        return completedType('video');
      case 'materi':
        return completedType('materi');
      case 'sprint_kana':
        return quizzes.filter((q) => q.kind === 'kana').length;
      case 'sprint_kanji':
        return quizzes.filter((q) => q.kind === 'kanji').length;
      case 'pattern':
        return quizzes.filter((q) => q.kind === 'pattern').length;
      case 'problems_new':
        return ev.filter((e) => e.type === 'problem_solved').length;
      case 'problems_total':
        return nc150;
      case 'reviews':
        return ev.filter((e) => e.type === 'review').length;
      case 'boss':
        return completedType('boss');
      case 'checkpoint':
        return completedType('checkpoint');
      case 'duolingo_days':
        return events.filter((e) => e.type === 'checkin_duolingo').length;
      case 'bicara':
        return events.filter((e) => e.type === 'act_bicara').length + completedType('bicara');
      case 'nhk':
        return events.filter((e) => e.type === 'act_nhk' || e.type === 'listen').length;
      case 'mock':
        return events.filter((e) => e.type === 'act_mock').length;
      case 'kontes':
        return events.filter((e) => e.type === 'act_kontes').length;
      default:
        return 0;
    }
  };
}

export async function getGoals(): Promise<{ today: string; week: { start: string; end: string; goals: GoalView[] }; month: { start: string; end: string; goals: GoalView[] }; reflection: typeof reflection.$inferSelect | null }> {
  const db = getDb();
  const today = dojoToday(await getProfile());
  const ws = weekStart(today);
  const we = addDays(ws, 6);
  const ms = monthStart(today);
  const me = monthEnd(today);
  await ensurePeriod('week', ws, we);
  await ensurePeriod('month', ms, me);
  const rows = await db.select().from(goal).where(and(lte(goal.periodStart, today), gte(goal.periodEnd, today))).orderBy(asc(goal.track), asc(goal.sort));
  const meters = { week: { jp: await measure('jp', ws, we), dsa: await measure('dsa', ws, we) }, month: { jp: await measure('jp', ms, me), dsa: await measure('dsa', ms, me) } };
  const views: GoalView[] = [];
  for (const g of rows) {
    const per = g.period === 'month' ? 'month' : 'week';
    const progress = g.metric === 'manual' ? (g.manualDone ? 1 : 0) : meters[per][g.track as 'jp' | 'dsa'](g.metric as Metric);
    const done = progress >= g.target;
    if (done && !g.completedAt) await db.update(goal).set({ completedAt: new Date() }).where(eq(goal.id, g.id));
    if (!done && g.completedAt) await db.update(goal).set({ completedAt: null }).where(eq(goal.id, g.id));
    views.push({ ...g, progress, done });
  }
  await payRewards(views, ws, ms);
  const [refl] = await db.select().from(reflection).where(eq(reflection.weekStart, ws));
  return { today, week: { start: ws, end: we, goals: views.filter((g) => g.period === 'week') }, month: { start: ms, end: me, goals: views.filter((g) => g.period === 'month') }, reflection: refl ?? null };
}

// Hadiah: target mingguan per jalur +100 XP & +1 freeze (maks 2), Perfect week +150, bulanan +300
async function payRewards(views: GoalView[], ws: string, ms: string) {
  const db = getDb();
  for (const track of ['jp', 'dsa'] as const) {
    const week = views.filter((g) => g.period === 'week' && g.track === track);
    if (week.length && week.every((g) => g.done)) {
      const r = await award({ track, type: 'goal_week', refId: ws, xp: 100, dedupeKey: `week:${ws}:${track}` });
      if (!r.duplicate) {
        const [st] = await db.select().from(streakState).where(eq(streakState.track, track));
        if (st && st.freezes < 2) await db.update(streakState).set({ freezes: st.freezes + 1 }).where(eq(streakState.track, track));
      }
    }
    const month = views.filter((g) => g.period === 'month' && g.track === track);
    if (month.length && month.every((g) => g.done)) await award({ track, type: 'goal_month', refId: ms, xp: 300, dedupeKey: `month:${ms}:${track}` });
  }
  const allWeek = views.filter((g) => g.period === 'week');
  if (allWeek.length && allWeek.every((g) => g.done)) await award({ track: 'general', type: 'perfect_week', refId: ws, xp: 150, dedupeKey: `perfectweek:${ws}` });
}
