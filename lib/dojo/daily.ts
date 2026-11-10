import 'server-only';
import { and, eq, gte } from 'drizzle-orm';
import { getDb } from '@/db/client';
import { activityEvent, dailySet, dailyStat, note, problemProgress, quest, quizSession } from '@/db/schema';
import { NODES, ORDERED, UNITS, computeStatuses, nextNode, type NodeStatus, type PathNode, type QuizSpec, type Track } from '@/lib/dojo/curriculum';
import { award, dojoToday, getProfile } from '@/lib/dojo/engine/core';
import { addDays } from '@/lib/dojo/engine/srs';
import { loadProgress } from '@/lib/dojo/progress';
import { rng, shuffle } from '@/lib/dojo/quiz/build';
import { localHour } from '@/lib/dojo/time';

// Hari ini 日替わり (PRD F6, GAMIFICATION §6 & §8)

export type DailyItem = {
  id: string;
  kind: 'node' | 'review' | 'quiz' | 'checkin' | 'listen';
  title: string;
  subtitle?: string;
  nodeId?: string;
  quiz?: QuizSpec;
  quizTitle?: string;
  link?: { label: string; url: string };
  xp: number;
  review?: boolean;
  done?: boolean;
  meta?: Record<string, unknown>;
};

const done = (s?: NodeStatus) => s === 'completed' || s === 'skipped';

function firstAvailable(track: Track, statuses: Map<string, NodeStatus>, pred: (n: PathNode) => boolean): PathNode | undefined {
  return ORDERED[track].find((n) => pred(n) && (statuses.get(n.id) === 'available' || statuses.get(n.id) === 'in_progress'));
}

// Unit aktif = unit node berikutnya; dipakai untuk memilih materi dengar/baca dan cakupan kuis
function activeUnitIndex(track: Track, statuses: Map<string, NodeStatus>): number {
  const n = nextNode(track, statuses);
  const units = UNITS[track];
  const idx = n ? units.findIndex((u) => u.id === n.unitId) : units.length - 1;
  return Math.max(0, idx);
}

function jpSprintSpec(statuses: Map<string, NodeStatus>): { spec: QuizSpec; title: string } {
  if (!done(statuses.get('jp-0.1-checkpoint'))) return { spec: { kind: 'kana', set: done(statuses.get('jp-0.1-sprint-a')) ? 'hira-all' : 'hira-a-no' }, title: 'Sprint hiragana' };
  if (!done(statuses.get('jp-0.2-checkpoint'))) return { spec: { kind: 'mix', parts: [{ kind: 'kana', set: 'hira-all' }, { kind: 'kana', set: 'hira-var' }] }, title: 'Sprint hiragana + variasi' };
  if (!done(statuses.get('jp-0.3-checkpoint'))) return { spec: { kind: 'kana', set: done(statuses.get('jp-0.2-sprint-kata')) ? 'kata-full' : 'kata-basic' }, title: 'Sprint katakana' };
  const batches: number[] = [];
  for (const n of ORDERED.jp) if (n.quiz?.kind === 'kanji' && n.quiz.batches.length === 1 && statuses.get(n.id) !== 'locked') batches.push(n.quiz.batches[0]);
  if (!batches.length) return { spec: { kind: 'kana', set: 'kana-all' }, title: 'Sprint kana campuran' };
  return { spec: { kind: 'kanji', batches }, title: `Sprint kanji (batch 1–${Math.max(...batches)})` };
}

function jpRecallSpec(statuses: Map<string, NodeStatus>): QuizSpec | null {
  const ranges = new Map<'n5' | 'n4' | 'n3', number>();
  for (const n of ORDERED.jp) {
    if (n.quiz?.kind === 'grammar' && n.type === 'materi' && statuses.get(n.id) !== 'locked') {
      ranges.set(n.quiz.level, Math.max(ranges.get(n.quiz.level) ?? 0, n.quiz.to));
    }
  }
  const level = ranges.has('n3') ? 'n3' : ranges.has('n4') ? 'n4' : ranges.has('n5') ? 'n5' : null;
  return level ? { kind: 'grammar', level, from: 1, to: ranges.get(level)! } : null;
}

function learnedTopics(statuses: Map<string, NodeStatus>): string[] {
  const t = new Set<string>();
  for (const n of ORDERED.dsa) if (n.problem && statuses.get(n.id) !== 'locked' && n.problem.topic !== 'd0') t.add(n.problem.topic);
  return t.size ? [...t] : ['d1'];
}

async function generate(track: Track, today: string, seed: string): Promise<DailyItem[]> {
  const rand = rng(seed);
  const statuses = computeStatuses(track, await loadProgress(track));
  const items: DailyItem[] = [];
  if (track === 'dsa') {
    const path = firstAvailable('dsa', statuses, (n) => n.type === 'soal') ?? nextNode('dsa', statuses);
    if (path) items.push({ id: 'dsa:path', kind: 'node', title: path.title, subtitle: path.problem ? `Jalur · ${path.subtitle}` : 'Jalur · berikutnya', nodeId: path.id, xp: path.xp });
    // Acak: soal belum selesai dari topik lain yang sudah terbuka; kalau tidak ada, soal berbintang terendah
    const probs = await getDb().select().from(problemProgress);
    const solved = new Map(probs.map((p) => [p.problemId, p]));
    const open = ORDERED.dsa.filter((n) => n.problem && n.id !== path?.id && statuses.get(n.id) === 'available');
    if (open.length) {
      const pick = open[Math.floor(rand() * open.length)];
      items.push({ id: 'dsa:random', kind: 'node', title: pick.title, subtitle: `Acak · ${pick.subtitle}`, nodeId: pick.id, xp: pick.xp });
    } else {
      const low = [...solved.values()].filter((p) => p.status === 'solved').sort((a, b) => a.mastery - b.mastery);
      const pick = low.length ? low[Math.floor(rand() * Math.min(3, low.length))] : undefined;
      if (pick && NODES.get(pick.problemId)) items.push({ id: `dsa:review:${pick.problemId}:x`, kind: 'review', title: NODES.get(pick.problemId)!.title, subtitle: 'Acak · ulangi soal dengan bintang terendah', nodeId: pick.problemId, xp: 10, review: true });
    }
    const due = probs
      .filter((p) => p.srsDue && p.srsDue <= today && p.status === 'solved')
      .sort((a, b) => (a.srsDue ?? '').localeCompare(b.srsDue ?? '') || a.mastery - b.mastery)
      .slice(0, 2);
    for (const d of due) {
      const n = NODES.get(d.problemId);
      if (n) items.push({ id: `dsa:review:${d.problemId}`, kind: 'review', title: n.title, subtitle: `Review · jatuh tempo ${d.srsDue}`, nodeId: n.id, xp: 10, review: true });
    }
    items.push({ id: 'dsa:pattern', kind: 'quiz', title: 'Tebak Pola', subtitle: '5 kartu dari topik yang sudah terbuka', quiz: { kind: 'pattern', topics: learnedTopics(statuses) }, quizTitle: 'Tebak Pola', xp: 10 });
  } else {
    const sprint = jpSprintSpec(statuses);
    items.push({ id: 'jp:sprint', kind: 'quiz', title: sprint.title, subtitle: '20 kartu: 60% lemah/jatuh tempo, 40% acak', quiz: sprint.spec, quizTitle: sprint.title, xp: 10 });
    const recall = jpRecallSpec(statuses);
    if (recall) items.push({ id: 'jp:recall', kind: 'quiz', title: 'Grammar recall', subtitle: '5 kartu dari poin yang sudah terbuka', quiz: recall, quizTitle: 'Grammar recall', xp: 10 });
    const unit = UNITS.jp[activeUnitIndex('jp', statuses)];
    const iro = unit?.nodes.find((n) => n.irodori?.audio);
    const sectionNo = Number(unit?.sectionId.replace('S', '') ?? 0);
    if (sectionNo >= 3) items.push({ id: 'jp:listen', kind: 'listen', title: 'Baca 1 artikel NHK News Web Easy', link: { label: 'NHK Easy', url: 'https://www3.nhk.or.jp/news/easy/' }, xp: 10 });
    else if (iro?.irodori?.audio) items.push({ id: 'jp:listen', kind: 'listen', title: `Dengar audio ${iro.title.split(':')[0]}`, subtitle: 'Shadowing 5–10 menit', link: { label: 'Audio Irodori', url: iro.irodori.audio }, xp: 10 });
    else items.push({ id: 'jp:listen', kind: 'listen', title: 'Dengar 1 video Comprehensible Japanese', link: { label: 'YouTube', url: 'https://www.youtube.com/results?search_query=Comprehensible+Japanese+complete+beginner' }, xp: 10 });
    items.push({ id: 'jp:anki', kind: 'checkin', title: 'Check-in Anki', subtitle: 'Review Anki hari ini selesai', xp: 15 });
    items.push({ id: 'jp:duolingo', kind: 'checkin', title: 'Check-in Duolingo', subtitle: 'Minimal 1 pelajaran', xp: 10 });
  }
  return items;
}

export async function getDailySets(): Promise<{ today: string; sets: Record<Track, { items: DailyItem[]; rerolled: boolean }>; perfect: boolean }> {
  const db = getDb();
  const p = await getProfile();
  const today = dojoToday(p);
  const rows = await db.select().from(dailySet).where(eq(dailySet.localDate, today));
  const out = {} as Record<Track, { items: DailyItem[]; rerolled: boolean }>;
  for (const track of ['jp', 'dsa'] as const) {
    let row = rows.find((r) => r.track === track);
    if (!row) {
      const items = await generate(track, today, `${today}:${track}`);
      await db.insert(dailySet).values({ localDate: today, track, items }).onConflictDoNothing();
      row = (await db.select().from(dailySet).where(and(eq(dailySet.localDate, today), eq(dailySet.track, track))))[0];
    }
    out[track] = { items: row.items as DailyItem[], rerolled: row.rerolled };
  }
  // Status item berbasis node/review dihitung dari data, bukan disimpan
  const [progJp, progDsa, reviewsToday] = await Promise.all([
    loadProgress('jp'),
    loadProgress('dsa'),
    db.select({ refId: activityEvent.refId }).from(activityEvent).where(and(eq(activityEvent.localDate, today), eq(activityEvent.type, 'review'))),
  ]);
  const reviewed = new Set(reviewsToday.map((r) => r.refId));
  for (const track of ['jp', 'dsa'] as const) {
    const prog = track === 'jp' ? progJp : progDsa;
    for (const it of out[track].items) {
      if (it.kind === 'node' && it.nodeId) it.done = ['completed', 'skipped'].includes(prog.get(it.nodeId)?.status ?? '');
      if (it.kind === 'review' && it.nodeId) it.done = reviewed.has(it.nodeId);
    }
  }
  const all = [...out.jp.items, ...out.dsa.items];
  const perfect = all.length > 0 && all.every((i) => i.done);
  return { today, sets: out, perfect };
}

export async function rerollTrack(track: Track): Promise<boolean> {
  const db = getDb();
  const today = dojoToday(await getProfile());
  const [row] = await db.select().from(dailySet).where(and(eq(dailySet.localDate, today), eq(dailySet.track, track)));
  if (!row || row.rerolled) return false;
  const old = row.items as DailyItem[];
  const fresh = await generate(track, today, `${today}:${track}:1`);
  // Review dan item yang sudah selesai tidak ikut di-reroll
  const keep = old.filter((i) => i.review || i.done);
  const merged = [...keep, ...fresh.filter((f) => !f.review && !keep.some((k) => k.id === f.id))];
  await db.update(dailySet).set({ items: merged, rerolled: true }).where(and(eq(dailySet.localDate, today), eq(dailySet.track, track)));
  return true;
}

export async function setItemDone(itemId: string, meta: Record<string, unknown> = {}): Promise<boolean> {
  const db = getDb();
  const today = dojoToday(await getProfile());
  const track = itemId.startsWith('jp:') ? 'jp' : 'dsa';
  const [row] = await db.select().from(dailySet).where(and(eq(dailySet.localDate, today), eq(dailySet.track, track)));
  if (!row) return false;
  const items = (row.items as DailyItem[]).map((i) => (i.id === itemId ? { ...i, done: true, meta: { ...i.meta, ...meta } } : i));
  await db.update(dailySet).set({ items }).where(and(eq(dailySet.localDate, today), eq(dailySet.track, track)));
  return true;
}

// ---------- Quest harian ----------
type QuestDef = { id: string; pool: 'jp' | 'dsa' | 'general'; title: string; xp: number; target: number; manual?: boolean };
export const QUESTS: QuestDef[] = [
  { id: 'jp_goal', pool: 'jp', title: 'Capai daily goal 日本語', xp: 10, target: 1 },
  { id: 'jp_sprint90', pool: 'jp', title: 'Sprint kana/kanji dengan akurasi ≥ 90%', xp: 10, target: 1 },
  { id: 'jp_shadow', pool: 'jp', title: 'Shadowing audio Irodori 5 menit', xp: 10, target: 1, manual: true },
  { id: 'jp_video', pool: 'jp', title: 'Tonton 1 video grammar sampai habis', xp: 10, target: 1 },
  { id: 'jp_cards20', pool: 'jp', title: 'Review 20 kartu 日本語', xp: 10, target: 20 },
  { id: 'jp_read', pool: 'jp', title: 'Baca 1 artikel NHK Easy', xp: 15, target: 1, manual: true },
  { id: 'dsa_goal', pool: 'dsa', title: 'Capai daily goal DSA', xp: 10, target: 1 },
  { id: 'dsa_medium', pool: 'dsa', title: 'Selesaikan 1 soal Medium', xp: 15, target: 1 },
  { id: 'dsa_review2', pool: 'dsa', title: 'Selesaikan 2 review', xp: 15, target: 2 },
  { id: 'dsa_pattern5', pool: 'dsa', title: 'Tebak Pola 5/5 benar', xp: 15, target: 1 },
  { id: 'dsa_nohint', pool: 'dsa', title: 'Selesaikan 1 soal tanpa hint', xp: 15, target: 1 },
  { id: 'dsa_explain', pool: 'dsa', title: 'Tulis penjelasan solusi 3 kalimat di catatan soal', xp: 10, target: 1 },
  { id: 'early', pool: 'general', title: 'Mulai belajar sebelum 08:00', xp: 15, target: 1 },
  { id: 'both_before_20', pool: 'general', title: 'Amankan kedua streak sebelum 20:00', xp: 15, target: 1 },
  { id: 'focus25', pool: 'general', title: 'Satu sesi fokus 25 menit', xp: 10, target: 1 },
  { id: 'note', pool: 'general', title: 'Tulis catatan atau refleksi singkat', xp: 10, target: 1 },
  { id: 'perfect', pool: 'general', title: 'Selesaikan semua item Hari ini', xp: 20, target: 1 },
];

export type QuestView = QuestDef & { progress: number; completed: boolean };

export async function getQuests(perfect: boolean): Promise<QuestView[]> {
  const db = getDb();
  const p = await getProfile();
  const today = dojoToday(p);
  let rows = await db.select().from(quest).where(eq(quest.localDate, today));
  if (!rows.length) {
    const yesterday = new Set((await db.select({ id: quest.questId }).from(quest).where(eq(quest.localDate, addDays(today, -1)))).map((r) => r.id));
    const rand = rng(`${today}:quest`);
    const pick = (pool: QuestDef['pool']) => shuffle(QUESTS.filter((q) => q.pool === pool && !yesterday.has(q.id)), rand)[0] ?? QUESTS.find((q) => q.pool === pool)!;
    const chosen = [pick('jp'), pick('dsa'), pick('general')];
    await db.insert(quest).values(chosen.map((q) => ({ localDate: today, questId: q.id, target: q.target, xp: q.xp }))).onConflictDoNothing();
    rows = await db.select().from(quest).where(eq(quest.localDate, today));
  }

  const [events, stats, quizzes, notes] = await Promise.all([
    db.select().from(activityEvent).where(eq(activityEvent.localDate, today)),
    db.select().from(dailyStat).where(eq(dailyStat.localDate, today)),
    db.select().from(quizSession).where(gte(quizSession.createdAt, new Date(Date.now() - 36 * 3600_000))),
    db.select().from(note).where(gte(note.updatedAt, new Date(Date.now() - 36 * 3600_000))),
  ]);
  const tz = p.timezone;
  const hourOf = (d: Date) => localHour(d, tz);
  const todaysQuiz = quizzes.filter((q) => dojoToday(p, q.createdAt) === today);
  const todaysNotes = notes.filter((n) => dojoToday(p, n.updatedAt) === today);
  const ev = (type: string) => events.filter((e) => e.type === type);
  const progressOf = (id: string): number => {
    switch (id) {
      case 'jp_goal':
        return stats.find((s) => s.track === 'jp')?.goalMet ? 1 : 0;
      case 'dsa_goal':
        return stats.find((s) => s.track === 'dsa')?.goalMet ? 1 : 0;
      case 'jp_sprint90':
        return todaysQuiz.some((q) => (q.kind === 'kana' || q.kind === 'kanji') && q.correct / q.total >= 0.9) ? 1 : 0;
      case 'jp_video':
        return events.some((e) => e.type === 'node_complete' && e.track === 'jp' && NODES.get(e.refId ?? '')?.type === 'video') ? 1 : 0;
      case 'jp_cards20':
        return todaysQuiz.filter((q) => ['kana', 'kanji', 'grammar'].includes(q.kind)).reduce((a, q) => a + q.total, 0);
      case 'dsa_medium':
        return ev('problem_solved').some((e) => NODES.get(e.refId ?? '')?.problem?.level === 'M') ? 1 : 0;
      case 'dsa_review2':
        return events.filter((e) => e.type === 'review' && e.track === 'dsa').length;
      case 'dsa_pattern5':
        return todaysQuiz.some((q) => q.kind === 'pattern' && q.correct === q.total && q.total >= 5) ? 1 : 0;
      case 'dsa_nohint':
        return ev('problem_solved').some((e) => (e.payload as { usedHint?: boolean })?.usedHint === false) ? 1 : 0;
      case 'dsa_explain':
        return todaysNotes.some((n) => n.nodeId.startsWith('lc-') && (n.bodyMd.match(/[.!?](\s|$)/g)?.length ?? 0) >= 3) ? 1 : 0;
      case 'early':
        return events.some((e) => e.xp > 0 && hourOf(e.occurredAt) < 8 && !e.type.startsWith('quest')) ? 1 : 0;
      case 'both_before_20': {
        const ok = (t: string) => events.filter((e) => e.track === t && hourOf(e.occurredAt) < 20).reduce((a, e) => a + e.xp, 0) >= p.streakMinXp;
        return ok('jp') && ok('dsa') ? 1 : 0;
      }
      case 'focus25':
        return events.some((e) => e.minutes >= 25) ? 1 : 0;
      case 'note':
        return todaysNotes.length > 0 ? 1 : 0;
      case 'perfect':
        return perfect ? 1 : 0;
      default:
        return 0;
    }
  };

  const out: QuestView[] = [];
  for (const r of rows) {
    const def = QUESTS.find((q) => q.id === r.questId);
    if (!def) continue;
    const progress = def.manual ? r.progress : Math.min(def.target, progressOf(def.id));
    let completed = !!r.completedAt;
    if (!completed && progress >= def.target) {
      await award({ track: def.pool === 'general' ? 'general' : def.pool, type: 'quest', refId: def.id, xp: def.xp, dedupeKey: `quest:${today}:${def.id}` });
      await db.update(quest).set({ progress, completedAt: new Date() }).where(and(eq(quest.localDate, today), eq(quest.questId, def.id)));
      completed = true;
    } else if (progress !== r.progress) {
      await db.update(quest).set({ progress }).where(and(eq(quest.localDate, today), eq(quest.questId, def.id)));
    }
    out.push({ ...def, progress, completed });
  }
  return out;
}

export async function completeManualQuest(questId: string): Promise<boolean> {
  const def = QUESTS.find((q) => q.id === questId && q.manual);
  if (!def) return false;
  const db = getDb();
  const today = dojoToday(await getProfile());
  const [row] = await db.select().from(quest).where(and(eq(quest.localDate, today), eq(quest.questId, questId)));
  if (!row || row.completedAt) return false;
  await db.update(quest).set({ progress: def.target }).where(and(eq(quest.localDate, today), eq(quest.questId, questId)));
  return true;
}

// Bonus Perfect day: kedua daily goal + semua item Hari ini
export async function maybePerfectDay(perfect: boolean): Promise<boolean> {
  if (!perfect) return false;
  const db = getDb();
  const today = dojoToday(await getProfile());
  const stats = await db.select().from(dailyStat).where(eq(dailyStat.localDate, today));
  const goals = ['jp', 'dsa'].every((t) => stats.find((s) => s.track === t)?.goalMet);
  if (!goals) return false;
  const r = await award({ track: 'general', type: 'perfect_day', xp: 20, dedupeKey: `perfect:${today}` });
  return !r.duplicate;
}

