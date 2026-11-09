import { and, desc, eq, lt } from 'drizzle-orm';
import { getDb } from '@/db/client';
import { goal } from '@/db/schema';
import GoalsBoard from '@/components/dojo/goals/GoalsBoard';
import { requireDojo } from '@/lib/dojo/dal';
import { METRIC_LABEL, getGoals } from '@/lib/dojo/goals';

export default async function TargetPage({ params }: { params: Promise<{ gate: string }> }) {
  const { gate } = await params;
  await requireDojo(gate);
  const data = await getGoals();
  const past = await getDb().select().from(goal).where(and(eq(goal.period, 'week'), lt(goal.periodStart, data.week.start))).orderBy(desc(goal.periodStart)).limit(60);
  const byWeek = new Map<string, { done: number; total: number }>();
  for (const g of past) {
    const w = byWeek.get(g.periodStart) ?? { done: 0, total: 0 };
    w.total += 1;
    if (g.completedAt) w.done += 1;
    byWeek.set(g.periodStart, w);
  }
  const history = [...byWeek.entries()].slice(0, 6).map(([start, v]) => ({ start, ...v }));
  return (
    <div>
      <div className="glass-card mb-6 rounded-3xl p-6 md:p-8">
        <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-text-secondary">目標 · target</p>
        <h1 className="text-3xl font-bold text-text-main md:text-4xl">Target</h1>
        <p className="mt-1 text-sm text-text-secondary">Dibuat otomatis dari template fase kurikulum setiap Senin dan tanggal 1. Angka target bisa diubah; progres dihitung dari aktivitasmu.</p>
      </div>
      <GoalsBoard week={data.week} month={data.month} reflection={data.reflection} metrics={METRIC_LABEL} history={history} />
    </div>
  );
}
