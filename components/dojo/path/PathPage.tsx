import { CURRICULUM, computePace, computeStatuses, nextNode, type Track } from '@/lib/dojo/curriculum';
import { getTodayState } from '@/lib/dojo/engine/core';
import { beltFor } from '@/lib/dojo/level';
import { loadProblemMastery, loadProgress } from '@/lib/dojo/progress';
import PathMap from './PathMap';

// Server component: hanya dipakai oleh page yang sudah memanggil requireDojo().
export default async function PathPage({ track }: { track: Track }) {
  const [progress, state, probs] = await Promise.all([loadProgress(track), getTodayState(), track === 'dsa' ? loadProblemMastery() : Promise.resolve(null)]);
  const statuses = computeStatuses(track, progress);
  const today = state.today;
  const pace = computePace(track, progress, today);
  const next = nextNode(track, statuses);
  const mastery: Record<string, number> = {};
  const due = new Set<string>();
  for (const [id, p] of progress) {
    if (p.mastery) mastery[id] = p.mastery;
    if (p.srsDue && p.srsDue <= today) due.add(id);
  }
  if (probs) {
    for (const [id, p] of probs) {
      if (p.mastery) mastery[id] = Math.max(mastery[id] ?? 0, p.mastery);
      if (p.srsDue && p.srsDue <= today) due.add(id);
    }
  }
  const s = state.streaks[track];
  const belt = beltFor(state.level.level);
  return (
    <PathMap
      track={track}
      sections={CURRICULUM[track]}
      statuses={Object.fromEntries(statuses)}
      mastery={mastery}
      dueIds={[...due]}
      pace={pace}
      nextId={next?.id}
      today={today}
      side={{
        streak: { current: s.current, freezes: s.freezes, status: s.status, todayXp: s.todayXp, goal: s.goal, threshold: s.threshold, minutesLeft: s.minutesLeft, repairTarget: s.repairTarget },
        level: { level: state.level.level, intoLevel: state.level.intoLevel, span: state.level.span },
        belt: { obi: belt.obi, title: belt.title, color: belt.color, edge: belt.edge },
      }}
    />
  );
}
