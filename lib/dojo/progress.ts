import 'server-only';
import { eq } from 'drizzle-orm';
import { getDb } from '@/db/client';
import { nodeProgress, problemProgress } from '@/db/schema';
import type { ProgressMap, Track } from '@/lib/dojo/curriculum';

export async function loadProgress(track: Track): Promise<ProgressMap> {
  const rows = await getDb()
    .select({ nodeId: nodeProgress.nodeId, status: nodeProgress.status, mastery: nodeProgress.mastery, srsDue: nodeProgress.srsDue })
    .from(nodeProgress)
    .where(eq(nodeProgress.track, track));
  return new Map(rows.map((r) => [r.nodeId, { status: r.status, mastery: r.mastery, srsDue: r.srsDue }]));
}

export async function loadProblemMastery(): Promise<Map<string, { mastery: number; srsDue: string | null; bestMinutes: number | null; usedHint: boolean }>> {
  const rows = await getDb()
    .select({ id: problemProgress.problemId, mastery: problemProgress.mastery, srsDue: problemProgress.srsDue, bestMinutes: problemProgress.bestMinutes, usedHint: problemProgress.usedHint })
    .from(problemProgress);
  return new Map(rows.map((r) => [r.id, { mastery: r.mastery, srsDue: r.srsDue, bestMinutes: r.bestMinutes, usedHint: r.usedHint }]));
}
