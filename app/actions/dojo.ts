'use server';

import { asc, eq, sql } from 'drizzle-orm';
import { z } from 'zod';
import { getDb } from '@/db/client';
import { customResource, materialRead, nodeProgress, note, problemProgress } from '@/db/schema';
import { NODES, computeStatuses, lockReason, skippedBy, type PathNode } from '@/lib/dojo/curriculum';
import { getMaterial, loadGrammar, loadKanji, sliceMarkdown, type GrammarPoint, type Kanji } from '@/lib/dojo/content';
import { mdToHtml } from '@/lib/dojo/markdown';
import { badgeEvents } from '@/lib/dojo/badges';
import { award, awardBatch, dojoToday, getProfile, type AwardResult } from '@/lib/dojo/engine/core';
import { schedule, type Rating } from '@/lib/dojo/engine/srs';
import { guard, safeHttpUrl, youtubeId } from '@/lib/dojo/guard';
import { loadProgress } from '@/lib/dojo/progress';

export type NodeDetail = {
  html: string | null;
  grammar: GrammarPoint[];
  kanji: Kanji[];
  status: string;
  lockReason: string | null;
  progress: { status: string; mastery: number; confidence: number | null; minutesSpent: number; completedAt: string | null; srsDue: string | null } | null;
  problem: { attempts: number; bestMinutes: number | null; usedHint: boolean; solutionUrl: string | null; mastery: number } | null;
  note: string;
  resources: { id: string; kind: string; title: string; url: string | null; youtubeId: string | null }[];
  skipCount: number;
};

function grammarFor(node: PathNode, all: GrammarPoint[]): GrammarPoint[] {
  const q = node.quiz;
  if (q?.kind === 'grammar') return all.filter((g) => g.level === q.level && g.num >= q.from && g.num <= q.to);
  if (node.material?.id.includes('grammar') && node.material.sections?.length) {
    const unitId = node.material.sections[0].replace('Unit ', '');
    return all.filter((g) => g.unit === unitId);
  }
  return [];
}

export async function getNodeDetail(nodeId: string): Promise<NodeDetail> {
  await guard();
  const node = NODES.get(nodeId);
  if (!node) throw new Error('Node tidak ditemukan.');
  const db = getDb();
  const progressMap = await loadProgress(node.track);
  const statuses = computeStatuses(node.track, progressMap);
  const [mat, grammar, kanji, prog, prob, noteRow, resources] = await Promise.all([
    node.material ? getMaterial(node.material.id) : Promise.resolve(undefined),
    loadGrammar(),
    node.quiz?.kind === 'kanji' || node.quiz?.kind === 'mix' ? loadKanji() : Promise.resolve([] as Kanji[]),
    db.select().from(nodeProgress).where(eq(nodeProgress.nodeId, nodeId)),
    node.problem ? db.select().from(problemProgress).where(eq(problemProgress.problemId, nodeId)) : Promise.resolve([]),
    db.select().from(note).where(eq(note.nodeId, nodeId)),
    db.select().from(customResource).where(eq(customResource.nodeId, nodeId)).orderBy(asc(customResource.sort), asc(customResource.createdAt)),
  ]);
  const kanjiBatches = node.quiz?.kind === 'kanji' ? node.quiz.batches : node.quiz?.kind === 'mix' ? node.quiz.parts.flatMap((p) => (p.kind === 'kanji' ? p.batches : [])) : [];
  const p = prog[0];
  const pr = prob[0];
  return {
    html: mat && node.quiz?.kind !== 'kanji' ? await mdToHtml(sliceMarkdown(mat.body, node.material?.sections)) : null,
    grammar: grammarFor(node, grammar),
    kanji: kanji.filter((k) => kanjiBatches.includes(k.batch)),
    status: statuses.get(nodeId) ?? 'locked',
    lockReason: lockReason(node, statuses),
    progress: p
      ? { status: p.status, mastery: p.mastery, confidence: p.confidence, minutesSpent: p.minutesSpent, completedAt: p.completedAt?.toISOString() ?? null, srsDue: p.srsDue }
      : null,
    problem: pr ? { attempts: pr.attempts, bestMinutes: pr.bestMinutes, usedHint: pr.usedHint, solutionUrl: pr.solutionUrl, mastery: pr.mastery } : null,
    note: noteRow[0]?.bodyMd ?? '',
    resources: resources.map((r) => ({ id: r.id, kind: r.kind, title: r.title, url: r.url, youtubeId: r.kind === 'youtube' && r.url ? youtubeId(r.url) : null })),
    skipCount: node.type === 'checkpoint' && statuses.get(nodeId) === 'locked' ? skippedBy(node, progressMap).length : 0,
  };
}

const CompleteInput = z.object({
  nodeId: z.string().max(80),
  rating: z.number().int().min(1).max(4),
  minutes: z.number().int().min(0).max(600).default(0),
  usedHint: z.boolean().optional(),
  solutionUrl: z.string().max(500).optional(),
  score: z.number().min(0).max(100).optional(),
  skipTest: z.boolean().optional(),
});

export type CompleteResult = { ok: true; result: AwardResult; skipped: number } | { ok: false; error: string };

const SRS_TYPES = new Set(['materi', 'soal']);

export async function completeNode(raw: z.input<typeof CompleteInput>): Promise<CompleteResult> {
  await guard();
  const parsed = CompleteInput.safeParse(raw);
  if (!parsed.success) return { ok: false, error: 'Data tidak valid.' };
  const input = parsed.data;
  const node = NODES.get(input.nodeId);
  if (!node) return { ok: false, error: 'Node tidak ditemukan.' };

  const db = getDb();
  const progressMap = await loadProgress(node.track);
  const statuses = computeStatuses(node.track, progressMap);
  const status = statuses.get(node.id);
  if (status === 'completed' || status === 'skipped') return { ok: false, error: 'Node ini sudah selesai.' };

  const pass = node.passPct ?? 80;
  const isGateTest = node.type === 'checkpoint' || node.type === 'boss';
  if (isGateTest && node.passPct && (input.score ?? 0) < pass) return { ok: false, error: `Belum lulus: butuh ≥ ${pass}%.` };
  if (status === 'locked') {
    const canSkip = node.type === 'checkpoint' && input.skipTest && (input.score ?? 0) >= pass;
    if (!canSkip) return { ok: false, error: lockReason(node, statuses) ?? 'Node ini masih terkunci.' };
  }

  const p = await getProfile();
  const today = dojoToday(p);
  const rating = input.rating as Rating;
  const now = new Date();
  const prev = await db.select().from(nodeProgress).where(eq(nodeProgress.nodeId, node.id));
  const srs = SRS_TYPES.has(node.type) ? schedule({ interval: null, ease: null, reps: 0, lapses: 0, mastery: 1 }, rating, today, node.id) : null;

  await db
    .insert(nodeProgress)
    .values({
      nodeId: node.id,
      track: node.track,
      status: 'completed',
      startedAt: prev[0]?.startedAt ?? now,
      completedAt: now,
      mastery: 1,
      confidence: rating,
      minutesSpent: input.minutes,
      srsDue: srs?.due,
      srsInterval: srs?.interval,
      srsEase: srs?.ease,
      srsReps: srs ? 1 : 0,
    })
    .onConflictDoUpdate({
      target: nodeProgress.nodeId,
      set: {
        status: 'completed',
        completedAt: now,
        mastery: sql`greatest(${nodeProgress.mastery}, 1)`,
        confidence: rating,
        minutesSpent: sql`${nodeProgress.minutesSpent} + ${input.minutes}`,
        srsDue: srs?.due ?? null,
        srsInterval: srs?.interval ?? null,
        srsEase: srs?.ease ?? null,
        srsReps: srs ? 1 : 0,
      },
    });

  let xp = node.xp;
  if (node.problem) {
    const noHint = !input.usedHint;
    if (noHint) xp += 5;
    const url = input.solutionUrl ? safeHttpUrl(input.solutionUrl) : null;
    await db
      .insert(problemProgress)
      .values({
        problemId: node.id,
        status: 'solved',
        firstSolvedAt: now,
        attempts: 1,
        bestMinutes: input.minutes || null,
        usedHint: !!input.usedHint,
        solutionUrl: url,
        mastery: 1,
        srsDue: srs?.due,
        srsInterval: srs?.interval,
        srsEase: srs?.ease,
        srsReps: 1,
      })
      .onConflictDoUpdate({
        target: problemProgress.problemId,
        set: {
          status: 'solved',
          firstSolvedAt: sql`coalesce(${problemProgress.firstSolvedAt}, now())`,
          attempts: sql`${problemProgress.attempts} + 1`,
          bestMinutes: input.minutes ? sql`least(coalesce(${problemProgress.bestMinutes}, ${input.minutes}), ${input.minutes})` : sql`${problemProgress.bestMinutes}`,
          usedHint: !!input.usedHint,
          solutionUrl: url ?? sql`${problemProgress.solutionUrl}`,
          mastery: sql`greatest(${problemProgress.mastery}, 1)`,
          srsDue: srs?.due,
          srsInterval: srs?.interval,
          srsEase: srs?.ease,
          srsReps: 1,
        },
      });
  }

  const result = await award({
    track: node.track,
    type: node.problem ? 'problem_solved' : 'node_complete',
    refId: node.id,
    xp,
    minutes: input.minutes,
    payload: { rating, score: input.score, usedHint: input.usedHint, skipTest: input.skipTest || undefined },
    dedupeKey: `node:${node.id}`,
    counters: { nodes: 1, problems: node.problem ? 1 : 0 },
  });

  // Tes lompat lulus: node yang dilewati ditandai "dilewati" dan memberi 50% XP
  let skipped = 0;
  if (status === 'locked' && input.skipTest) {
    const list = skippedBy(node, progressMap);
    if (list.length) {
      await db
        .insert(nodeProgress)
        .values(list.map((s) => ({ nodeId: s.id, track: s.track, status: 'skipped', completedAt: now })))
        .onConflictDoUpdate({ target: nodeProgress.nodeId, set: { status: 'skipped', completedAt: now } });
      const r = await awardBatch(
        node.track,
        list.map((s) => ({ type: 'node_skipped', refId: s.id, xp: Math.round(s.xp / 2), dedupeKey: `node:${s.id}` })),
      );
      result.xp += r.xp;
      result.events.push(...r.events);
      result.totalXp = r.totalXp;
      result.level = r.level;
      skipped = list.length;
    }
  }
  result.events.push(...(await badgeEvents(p.timezone)));
  return { ok: true, result, skipped };
}

export async function startNode(nodeId: string): Promise<void> {
  await guard();
  const node = NODES.get(nodeId);
  if (!node) return;
  await getDb()
    .insert(nodeProgress)
    .values({ nodeId, track: node.track, status: 'in_progress', startedAt: new Date() })
    .onConflictDoNothing();
}

const NoteInput = z.object({ nodeId: z.string().max(80), body: z.string().max(20000) });
export async function saveNote(raw: z.input<typeof NoteInput>): Promise<{ ok: boolean; savedAt?: string }> {
  await guard();
  const { nodeId, body } = NoteInput.parse(raw);
  if (!NODES.has(nodeId)) return { ok: false };
  const now = new Date();
  await getDb()
    .insert(note)
    .values({ nodeId, bodyMd: body, updatedAt: now })
    .onConflictDoUpdate({ target: note.nodeId, set: { bodyMd: body, updatedAt: now } });
  return { ok: true, savedAt: now.toISOString() };
}

const ResourceInput = z.object({ nodeId: z.string().max(80), title: z.string().trim().max(120).optional(), url: z.string().trim().max(500) });
export async function addResource(raw: z.input<typeof ResourceInput>): Promise<{ ok: true } | { ok: false; error: string }> {
  await guard();
  const parsed = ResourceInput.safeParse(raw);
  if (!parsed.success || !NODES.has(parsed.data.nodeId)) return { ok: false, error: 'Data tidak valid.' };
  const url = safeHttpUrl(parsed.data.url);
  if (!url) return { ok: false, error: 'Link harus diawali https:// atau http://.' };
  const yt = youtubeId(url);
  await getDb()
    .insert(customResource)
    .values({ nodeId: parsed.data.nodeId, kind: yt ? 'youtube' : 'url', title: parsed.data.title || (yt ? 'Video YouTube' : new URL(url).hostname), url });
  return { ok: true };
}

export async function removeResource(id: string): Promise<void> {
  await guard();
  if (!/^[0-9a-f-]{36}$/i.test(id)) return;
  await getDb().delete(customResource).where(eq(customResource.id, id));
}

const AttemptInput = z.object({ nodeId: z.string().max(80), minutes: z.number().int().min(0).max(600), usedHint: z.boolean(), solutionUrl: z.string().max(500).optional() });
// "Catat percobaan" tanpa menyelesaikan (belum lulus semua test)
export async function logAttempt(raw: z.input<typeof AttemptInput>): Promise<{ ok: boolean }> {
  await guard();
  const parsed = AttemptInput.safeParse(raw);
  if (!parsed.success) return { ok: false };
  const node = NODES.get(parsed.data.nodeId);
  if (!node?.problem) return { ok: false };
  const url = parsed.data.solutionUrl ? safeHttpUrl(parsed.data.solutionUrl) : null;
  await getDb()
    .insert(problemProgress)
    .values({ problemId: node.id, status: 'attempted', attempts: 1, usedHint: parsed.data.usedHint, solutionUrl: url })
    .onConflictDoUpdate({
      target: problemProgress.problemId,
      set: { attempts: sql`${problemProgress.attempts} + 1`, usedHint: sql`${problemProgress.usedHint} or ${parsed.data.usedHint}`, solutionUrl: url ?? sql`${problemProgress.solutionUrl}` },
    });
  if (parsed.data.minutes > 0) {
    await getDb()
      .insert(nodeProgress)
      .values({ nodeId: node.id, track: node.track, status: 'in_progress', startedAt: new Date(), minutesSpent: parsed.data.minutes })
      .onConflictDoUpdate({ target: nodeProgress.nodeId, set: { minutesSpent: sql`${nodeProgress.minutesSpent} + ${parsed.data.minutes}` } });
  }
  return { ok: true };
}

export async function markMaterialRead(materialId: string): Promise<void> {
  await guard();
  if (!/^[a-z0-9-]{3,60}$/.test(materialId)) return;
  await getDb().insert(materialRead).values({ materialId }).onConflictDoNothing();
}
