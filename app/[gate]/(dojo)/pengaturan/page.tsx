import { asc, gt } from 'drizzle-orm';
import { getDb } from '@/db/client';
import { busyDay } from '@/db/schema';
import SettingsForm from '@/components/dojo/settings/SettingsForm';
import { requireDojo } from '@/lib/dojo/dal';
import { dojoToday, getProfile } from '@/lib/dojo/engine/core';

export default async function Pengaturan({ params }: { params: Promise<{ gate: string }> }) {
  const { gate } = await params;
  await requireDojo(gate);
  const p = await getProfile();
  const busy = await getDb().select().from(busyDay).where(gt(busyDay.localDate, dojoToday(p))).orderBy(asc(busyDay.localDate));
  return (
    <div>
      <div className="glass-card mb-6 rounded-3xl p-6 md:p-8">
        <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-text-secondary">設定</p>
        <h1 className="text-3xl font-bold text-text-main md:text-4xl">Pengaturan</h1>
      </div>
      <SettingsForm profile={{ displayName: p.displayName, timezone: p.timezone, dayStartHour: p.dayStartHour, dailyGoalJp: p.dailyGoalJp, dailyGoalDsa: p.dailyGoalDsa, streakMinXp: p.streakMinXp }} busy={busy.map((b) => ({ date: b.localDate, track: b.track }))} />
    </div>
  );
}
