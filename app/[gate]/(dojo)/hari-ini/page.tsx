import TodayBoard from '@/components/dojo/today/TodayBoard';
import { getDailySets, getQuests, maybePerfectDay } from '@/lib/dojo/daily';
import { requireDojo } from '@/lib/dojo/dal';
import { getTodayStateCached } from '@/lib/dojo/engine/core';

export default async function HariIni({ params }: { params: Promise<{ gate: string }> }) {
  const { gate } = await params;
  await requireDojo(gate);
  const { sets, perfect } = await getDailySets();
  await maybePerfectDay(perfect);
  const [quests, state] = await Promise.all([getQuests(perfect), getTodayStateCached()]);
  return (
    <TodayBoard
      gate={gate}
      sets={sets}
      quests={quests}
      perfect={perfect}
      goals={{ jp: { xp: state.streaks.jp.todayXp, goal: state.streaks.jp.goal }, dsa: { xp: state.streaks.dsa.todayXp, goal: state.streaks.dsa.goal } }}
    />
  );
}
