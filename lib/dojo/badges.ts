import 'server-only';
import { and, eq, gte, sql } from 'drizzle-orm';
import { getDb } from '@/db/client';
import { activityEvent, badgeAward, card, jlptSession, nodeProgress, problemProgress, quizSession, reflection, streakState } from '@/db/schema';
import { NODES, ORDERED } from '@/lib/dojo/curriculum';
import { PROBLEMS, TOPIC_TITLES } from '@/lib/dojo/curriculum/dsa';
import { award } from '@/lib/dojo/engine/core';
import { localHour } from '@/lib/dojo/time';

// Lencana (docs/dojo/04-GAMIFICATION.md §5). Dievaluasi dari data, lalu diberikan sekali.

export type BadgeDef = { id: string; group: '日本語' | 'DSA' | 'Disiplin'; name: string; hint: string; xp: number };

const TOPICS = [...new Set(PROBLEMS.filter((p) => p.topic !== 'd19').map((p) => p.topic))];

export const BADGES: BadgeDef[] = [
  { id: 'hira_done', group: '日本語', name: 'ひらがな修了', hint: 'Lulus checkpoint ひらがな修了', xp: 50 },
  { id: 'kata_done', group: '日本語', name: 'カタカナ修了', hint: 'Selesaikan sprint katakana penuh', xp: 50 },
  { id: 'kana_master', group: '日本語', name: 'かなマスター', hint: 'Lulus checkpoint かなマスター (≥ 95%)', xp: 100 },
  { id: 'kana_shinkansen', group: '日本語', name: 'かな新幹線', hint: 'Sprint kana ≥ 20 kartu, akurasi ≥ 95%, ≤ 1,3 detik per kartu', xp: 50 },
  { id: 'iro_first', group: '日本語', name: 'いろどり一歩', hint: 'Pelajaran Irodori pertama', xp: 20 },
  { id: 'iro_starter', group: '日本語', name: '入門修了', hint: 'Irodori Starter selesai', xp: 150 },
  { id: 'iro_e1', group: '日本語', name: '初級1修了', hint: 'Irodori Elementary 1 selesai', xp: 150 },
  { id: 'iro_e2', group: '日本語', name: '初級2修了', hint: 'Irodori Elementary 2 selesai', xp: 150 },
  { id: 'iro_pre', group: '日本語', name: '中級へ', hint: 'Irodori Pre-Intermediate selesai', xp: 200 },
  { id: 'kanji100', group: '日本語', name: '漢字100', hint: '100 kartu kanji bintang 2 (interval ≥ 7 hari)', xp: 50 },
  { id: 'kanji300', group: '日本語', name: '漢字300', hint: '300 kartu kanji bintang 2', xp: 100 },
  { id: 'kanji650', group: '日本語', name: '漢字650', hint: '650 kartu kanji bintang 2', xp: 200 },
  { id: 'kaishi500', group: '日本語', name: '開始500', hint: 'Target Anki Kaishi 520 tercapai', xp: 30 },
  { id: 'kaishi1000', group: '日本語', name: '開始1000', hint: 'Target Anki Kaishi 990 tercapai', xp: 50 },
  { id: 'kaishi1500', group: '日本語', name: '開始1500', hint: 'Kaishi 1.500 selesai', xp: 150 },
  { id: 'war_winner', group: '日本語', name: '申込成功', hint: 'Status sesi JLPT = terdaftar', xp: 50 },
  { id: 'n5_taken', group: '日本語', name: 'N5受験', hint: 'Ikut ujian N5', xp: 50 },
  { id: 'n5_passed', group: '日本語', name: 'N5合格', hint: 'Lulus N5', xp: 100 },
  { id: 'n4_taken', group: '日本語', name: 'N4受験', hint: 'Ikut ujian N4', xp: 50 },
  { id: 'n4_passed', group: '日本語', name: 'N4合格', hint: 'Lulus N4', xp: 100 },
  { id: 'n3_taken', group: '日本語', name: 'N3受験', hint: 'Ikut ujian N3', xp: 50 },
  { id: 'n3_passed', group: '日本語', name: 'N3合格', hint: 'Lulus N3', xp: 200 },
  { id: 'first_talk', group: '日本語', name: '初会話', hint: 'Sesi bicara pertama', xp: 30 },
  { id: 'tadoku30', group: '日本語', name: '多読30', hint: '30 bacaan NHK Easy / graded reader', xp: 50 },
  { id: 'hello_world', group: 'DSA', name: 'Hello, World', hint: 'Soal pertama', xp: 20 },
  { id: 'solved10', group: 'DSA', name: '10 Solved', hint: '10 soal selesai', xp: 30 },
  { id: 'solved50', group: 'DSA', name: '50 Solved', hint: '50 soal selesai', xp: 80 },
  { id: 'solved100', group: 'DSA', name: '100 Solved', hint: '100 soal selesai', xp: 150 },
  { id: 'solved150', group: 'DSA', name: '150 Solved', hint: '150 soal selesai', xp: 300 },
  { id: 'first_medium', group: 'DSA', name: 'First Medium', hint: 'Medium pertama', xp: 20 },
  { id: 'first_hard', group: 'DSA', name: 'First Hard', hint: 'Hard pertama', xp: 50 },
  ...TOPICS.map((t) => ({ id: `topic_${t}`, group: 'DSA' as const, name: `Topic Master: ${TOPIC_TITLES[t] ?? t}`, hint: 'Semua soal topik ini bintang 3', xp: 100 })),
  { id: 'nc150', group: 'DSA', name: 'NC150 完走', hint: '150/150 NeetCode 150', xp: 500 },
  { id: 'speedrun', group: 'DSA', name: 'Speedrun', hint: 'Medium < 15 menit tanpa hint', xp: 30 },
  { id: 'comeback', group: 'DSA', name: '復活', hint: 'Review "Baik/Mudah" soal yang pernah "Lupa"', xp: 20 },
  { id: 'contestant', group: 'DSA', name: 'Contestant', hint: 'Kontes pertama', xp: 50 },
  { id: 'mock_survivor', group: 'DSA', name: 'Mock Survivor', hint: 'Mock interview pertama', xp: 50 },
  { id: 'jp7', group: 'Disiplin', name: '日本語 7', hint: 'Streak 日本語 7 hari', xp: 0 },
  { id: 'jp30', group: 'Disiplin', name: '日本語 30', hint: 'Streak 日本語 30 hari', xp: 0 },
  { id: 'jp100', group: 'Disiplin', name: '日本語 100', hint: 'Streak 日本語 100 hari', xp: 0 },
  { id: 'jp365', group: 'Disiplin', name: '日本語 365', hint: 'Streak 日本語 365 hari', xp: 0 },
  { id: 'dsa7', group: 'Disiplin', name: 'DSA 7', hint: 'Streak DSA 7 hari', xp: 0 },
  { id: 'dsa30', group: 'Disiplin', name: 'DSA 30', hint: 'Streak DSA 30 hari', xp: 0 },
  { id: 'dsa100', group: 'Disiplin', name: 'DSA 100', hint: 'Streak DSA 100 hari', xp: 0 },
  { id: 'dsa365', group: 'Disiplin', name: 'DSA 365', hint: 'Streak DSA 365 hari', xp: 0 },
  { id: 'nitoryu30', group: 'Disiplin', name: '二刀流30', hint: 'Kedua streak ≥ 30 bersamaan', xp: 100 },
  { id: 'nanakorobi', group: 'Disiplin', name: '七転び八起き', hint: 'Repair streak pertama', xp: 20 },
  { id: 'perfect_week1', group: 'Disiplin', name: 'Perfect Week', hint: 'Perfect week pertama', xp: 50 },
  { id: 'perfect_week4', group: 'Disiplin', name: 'Perfect Week ×4', hint: '4 kali Perfect week', xp: 150 },
  { id: 'early_bird', group: 'Disiplin', name: '早起き', hint: '10 hari mulai belajar sebelum 07:00', xp: 30 },
  { id: 'weekend_warrior', group: 'Disiplin', name: 'Weekend Warrior', hint: 'Aktif Sabtu & Minggu, 4 akhir pekan berturut-turut', xp: 50 },
  { id: 'reflection10', group: 'Disiplin', name: '振り返り10', hint: '10 refleksi mingguan', xp: 50 },
];

const isDone = (s?: string) => s === 'completed' || s === 'skipped';

export async function evaluateBadges(tz = 'Asia/Jakarta'): Promise<string[]> {
  const db = getDb();
  const [awarded, nodes, probs, streaks, typeCounts, kanaFast, kanjiStrong, sessions, reflections, solvedEvents, reviewEvents, firstEvents] = await Promise.all([
    db.select({ id: badgeAward.badgeId }).from(badgeAward),
    db.select({ id: nodeProgress.nodeId, status: nodeProgress.status }).from(nodeProgress),
    db.select().from(problemProgress),
    db.select().from(streakState),
    db.select({ type: activityEvent.type, n: sql<number>`count(*)::int` }).from(activityEvent).groupBy(activityEvent.type),
    db.select({ id: quizSession.id }).from(quizSession).where(and(eq(quizSession.kind, 'kana'), gte(quizSession.total, 20), sql`${quizSession.correct}::float / ${quizSession.total} >= 0.95`, sql`${quizSession.durationS}::float / ${quizSession.total} <= 1.3`)).limit(1),
    db.select({ n: sql<number>`count(*)::int` }).from(card).where(and(eq(card.deck, 'kanji'), gte(card.srsInterval, 7))),
    db.select().from(jlptSession),
    db.select({ n: sql<number>`count(*)::int` }).from(reflection),
    db.select({ refId: activityEvent.refId, minutes: activityEvent.minutes, payload: activityEvent.payload }).from(activityEvent).where(eq(activityEvent.type, 'problem_solved')),
    db.select({ payload: activityEvent.payload }).from(activityEvent).where(eq(activityEvent.type, 'review')),
    db.select({ date: activityEvent.localDate, at: sql<Date>`min(${activityEvent.occurredAt})` }).from(activityEvent).where(sql`${activityEvent.xp} > 0`).groupBy(activityEvent.localDate),
  ]);
  const have = new Set(awarded.map((a) => a.id));
  const status = new Map(nodes.map((n) => [n.id, n.status]));
  const count = (t: string) => typeCounts.find((x) => x.type === t)?.n ?? 0;
  const solved = probs.filter((p) => p.status === 'solved');
  const solvedLevel = (l: string) => solved.some((p) => NODES.get(p.problemId)?.problem?.level === l);
  const longest = (t: string) => streaks.find((s) => s.track === t)?.longest ?? 0;
  const bookDone = (b: string) => {
    const list = ORDERED.jp.filter((n) => n.irodori?.book === b);
    return list.length > 0 && list.every((n) => isDone(status.get(n.id)));
  };
  const statusAt = (level: string, states: string[]) => sessions.some((s) => s.levelPlanned?.startsWith(level) && states.includes(s.status));
  const nc = PROBLEMS.filter((p) => p.topic !== 'd19');
  const mastery = new Map(probs.map((p) => [p.problemId, p.mastery]));
  // 早起き: hari pertama belajar sebelum 07:00
  const earlyDays = firstEvents.filter((f) => localHour(new Date(f.at), tz) < 7).length;
  // Weekend Warrior: 4 akhir pekan berturut-turut aktif Sabtu & Minggu
  const activeDays = new Set(firstEvents.map((f) => f.date));
  let streakWeekends = 0;
  let bestWeekends = 0;
  const sorted = [...activeDays].sort();
  if (sorted.length) {
    const end = new Date(`${sorted[sorted.length - 1]}T00:00:00Z`);
    const startD = new Date(`${sorted[0]}T00:00:00Z`);
    for (let d = new Date(startD); d <= end; d.setUTCDate(d.getUTCDate() + 1)) {
      if (d.getUTCDay() !== 6) continue;
      const sat = d.toISOString().slice(0, 10);
      const sun = new Date(d.getTime() + 86_400_000).toISOString().slice(0, 10);
      streakWeekends = activeDays.has(sat) && activeDays.has(sun) ? streakWeekends + 1 : 0;
      bestWeekends = Math.max(bestWeekends, streakWeekends);
    }
  }
  const cur = (t: string) => streaks.find((s) => s.track === t)?.current ?? 0;
  const both = (n: number) => cur('jp') >= n && cur('dsa') >= n;

  const cond: Record<string, boolean> = {
    hira_done: isDone(status.get('jp-0.2-checkpoint')),
    kata_done: isDone(status.get('jp-0.3-sprint-kata')),
    kana_master: status.get('jp-0.3-checkpoint') === 'completed',
    kana_shinkansen: kanaFast.length > 0,
    iro_first: ORDERED.jp.some((n) => n.type === 'irodori' && status.get(n.id) === 'completed'),
    iro_starter: bookDone('X'),
    iro_e1: bookDone('Y'),
    iro_e2: bookDone('Z'),
    iro_pre: bookDone('ZZ'),
    kanji100: (kanjiStrong[0]?.n ?? 0) >= 100,
    kanji300: (kanjiStrong[0]?.n ?? 0) >= 300,
    kanji650: (kanjiStrong[0]?.n ?? 0) >= 650,
    kaishi500: isDone(status.get('jp-1.4-anki')),
    kaishi1000: isDone(status.get('jp-1.9-anki')),
    kaishi1500: isDone(status.get('jp-1.14-anki')),
    war_winner: sessions.some((s) => ['registered', 'paid', 'ticket', 'taken', 'passed', 'failed'].includes(s.status)) || ['jp-1.8-war', 'jp-2.4-war', 'jp-3.7-war'].some((id) => status.get(id) === 'completed'),
    n5_taken: statusAt('N5', ['taken', 'passed', 'failed']) || isDone(status.get('jp-1.15-exam')),
    n5_passed: statusAt('N5', ['passed']),
    n4_taken: statusAt('N4', ['taken', 'passed', 'failed']) || isDone(status.get('jp-2.14-exam')),
    n4_passed: statusAt('N4', ['passed']),
    n3_taken: statusAt('N3', ['taken', 'passed', 'failed']) || isDone(status.get('jp-3.11-exam')),
    n3_passed: statusAt('N3', ['passed']),
    first_talk: count('act_bicara') > 0 || ORDERED.jp.some((n) => n.type === 'bicara' && status.get(n.id) === 'completed'),
    tadoku30: count('act_nhk') >= 30,
    hello_world: solved.length >= 1,
    solved10: solved.length >= 10,
    solved50: solved.length >= 50,
    solved100: solved.length >= 100,
    solved150: solved.length >= 150,
    first_medium: solvedLevel('M'),
    first_hard: solvedLevel('H'),
    nc150: nc.every((p) => solved.some((s) => s.problemId === `lc-${p.lc}`)),
    speedrun: solvedEvents.some((e) => NODES.get(e.refId ?? '')?.problem?.level === 'M' && e.minutes > 0 && e.minutes < 15 && (e.payload as { usedHint?: boolean })?.usedHint === false),
    comeback: reviewEvents.some((e) => (e.payload as { comeback?: boolean })?.comeback),
    contestant: count('act_kontes') > 0,
    mock_survivor: count('act_mock') > 0,
    jp7: longest('jp') >= 7,
    jp30: longest('jp') >= 30,
    jp100: longest('jp') >= 100,
    jp365: longest('jp') >= 365,
    dsa7: longest('dsa') >= 7,
    dsa30: longest('dsa') >= 30,
    dsa100: longest('dsa') >= 100,
    dsa365: longest('dsa') >= 365,
    nitoryu30: both(30) || longest('both') >= 30,
    nanakorobi: count('streak_repair') > 0,
    perfect_week1: count('perfect_week') >= 1,
    perfect_week4: count('perfect_week') >= 4,
    early_bird: earlyDays >= 10,
    weekend_warrior: bestWeekends >= 4,
    reflection10: (reflections[0]?.n ?? 0) >= 10,
  };
  for (const t of TOPICS) cond[`topic_${t}`] = nc.filter((p) => p.topic === t).every((p) => (mastery.get(`lc-${p.lc}`) ?? 0) >= 3);

  const fresh: string[] = [];
  for (const b of BADGES) {
    if (have.has(b.id) || !cond[b.id]) continue;
    const inserted = await db.insert(badgeAward).values({ badgeId: b.id }).onConflictDoNothing().returning();
    if (!inserted.length) continue;
    fresh.push(b.id);
    if (b.xp) await award({ track: b.group === '日本語' ? 'jp' : b.group === 'DSA' ? 'dsa' : 'general', type: 'badge', refId: b.id, xp: b.xp, dedupeKey: `badge:${b.id}` });
  }
  return fresh;
}

// Untuk server action: evaluasi lalu kembalikan sebagai event toast
export async function badgeEvents(tz?: string): Promise<{ type: string; xp: number; label: string }[]> {
  const fresh = await evaluateBadges(tz);
  return fresh.map((id) => {
    const b = BADGES.find((x) => x.id === id)!;
    return { type: 'badge', xp: b.xp, label: `Lencana baru: ${b.name}` };
  });
}
