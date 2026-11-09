import { asc, eq } from 'drizzle-orm';
import { getDb } from '@/db/client';
import { countdown, daruma, jlptSession, profile, streakState } from '@/db/schema';
import { beltFor, levelFromXp } from '@/lib/dojo/level';
import { daysUntil, greeting, localDate, localHour, longDateId, shortDateId } from '@/lib/dojo/time';
import DarumaIcon from '@/components/dojo/DarumaIcon';
import { requireDojo } from '@/lib/dojo/dal';

const OFFER_SIGNED = new Date('2026-11-08T12:00:00+07:00');

export default async function Beranda({ params }: { params: Promise<{ gate: string }> }) {
  await requireDojo((await params).gate);
  const db = getDb();
  const [[prof], streaks, darumas, sessions, [misumi]] = await Promise.all([
    db.select().from(profile).where(eq(profile.id, 1)).limit(1),
    db.select().from(streakState),
    db.select().from(daruma).orderBy(asc(daruma.dueDate)),
    db.select().from(jlptSession).orderBy(asc(jlptSession.examDate)),
    db.select().from(countdown).where(eq(countdown.slug, 'misumi-day1')).limit(1),
  ]);

  const tz = prof?.timezone ?? 'Asia/Jakarta';
  const now = new Date();
  const today = localDate(now, tz);
  const greet = greeting(localHour(now, tz));
  const lv = levelFromXp(prof?.totalXp ?? 0);
  const belt = beltFor(lv.level);
  const streak = (t: string) => streaks.find((s) => s.track === t);
  const nextJlpt = sessions.find((s) => s.examDate >= today);
  const misumiAt = misumi?.targetAt ?? new Date('2028-10-01T09:00:00+09:00');
  const misumiDays = daysUntil(misumiAt, tz, now);
  const misumiPct = Math.min(100, Math.max(0, ((now.getTime() - OFFER_SIGNED.getTime()) / (misumiAt.getTime() - OFFER_SIGNED.getTime())) * 100));

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-6 gap-4 md:gap-6">
      {/* Sapaan + level */}
      <section className="glass-card rounded-3xl p-6 md:p-8 md:col-span-4 lg:col-span-4 flex flex-col gap-5">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-text-secondary">{longDateId(now, tz)}</p>
        <div>
          <h1 className="text-3xl md:text-5xl font-bold tracking-tight text-text-main">
            <span className="font-jp">{greet.jp}</span>, Fauzan
          </h1>
          <p className="text-text-secondary mt-1">{greet.romaji} · Selamat datang di Dōjō.</p>
        </div>
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-3 text-sm">
            <span className="inline-block h-3 w-8 rounded-full border" style={{ background: belt.color, borderColor: belt.edge }} />
            <span className="font-semibold text-text-main">Lv {lv.level}</span>
            <span className="text-text-secondary font-jp">{belt.obi} · {belt.title}</span>
          </div>
          <div className="h-2.5 rounded-full bg-gray-200/80 overflow-hidden">
            <div className="h-full rounded-full bg-[#ffb800]" style={{ width: `${Math.round((lv.intoLevel / lv.span) * 100)}%` }} />
          </div>
          <p className="text-xs text-text-secondary tabular-nums">
            {lv.intoLevel} / {lv.span} XP ke Lv {Math.min(50, lv.level + 1)}
          </p>
        </div>
        <p className="text-sm text-text-main">
          Hari ini: <span className="font-jp font-semibold">日本語</span> 0/{prof?.dailyGoalJp ?? 50} XP · <span className="font-semibold">DSA</span> 0/{prof?.dailyGoalDsa ?? 30} XP
        </p>
      </section>

      {/* Daru */}
      <section className="glass-card rounded-3xl p-6 md:col-span-4 lg:col-span-2 flex flex-col items-center justify-center gap-3 text-center">
        <DarumaIcon eyes={1} className="w-28 h-28 drop-shadow-xl" />
        <p className="text-sm font-semibold text-text-main font-jp">{belt.title} · {belt.titleRomaji}</p>
        <p className="text-xs text-text-secondary">Sabuk naik setiap 5 level.</p>
      </section>

      {/* Streak */}
      {[
        { key: 'jp', label: '日本語', color: '#e8453c' },
        { key: 'dsa', label: 'DSA', color: '#0066cc' },
      ].map((t) => {
        const s = streak(t.key);
        return (
          <section key={t.key} className="glass-card rounded-3xl p-6 md:col-span-2 lg:col-span-2 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-text-secondary">Streak <span className="font-jp normal-case">{t.label}</span></p>
              <span className="flex gap-0.5 text-[#32ade6]" title={`${s?.freezes ?? 0} freeze`}>
                {Array.from({ length: s?.freezes ?? 0 }).map((_, i) => (
                  <span key={i} className="material-symbols-outlined text-[18px]">ac_unit</span>
                ))}
              </span>
            </div>
            <div className="flex items-end gap-2">
              <span className="material-symbols-outlined text-[40px] text-[#ff9500]">local_fire_department</span>
              <span className="text-5xl font-bold tabular-nums text-text-main">{s?.current ?? 0}</span>
              <span className="text-text-secondary mb-1.5">hari</span>
            </div>
            <p className="text-xs text-text-secondary">Terpanjang {s?.longest ?? 0} hari · Mulai hitung setelah jalur aktif (M2).</p>
          </section>
        );
      })}

      {/* Countdown */}
      <section className="glass-card rounded-3xl p-6 md:col-span-2 lg:col-span-1 flex flex-col gap-2">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-text-secondary">MISUMI</p>
        <p className="text-4xl font-bold tabular-nums text-text-main">D-{misumiDays}</p>
        <p className="text-xs text-text-secondary">{shortDateId(misumiAt, 'Asia/Tokyo')} · 九段下</p>
        <div className="h-1.5 rounded-full bg-gray-200/80 overflow-hidden mt-auto">
          <div className="h-full bg-[#0066cc]" style={{ width: `${misumiPct.toFixed(1)}%` }} />
        </div>
      </section>
      <section className="glass-card rounded-3xl p-6 md:col-span-2 lg:col-span-1 flex flex-col gap-2">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-text-secondary">JLPT {nextJlpt?.levelPlanned ?? ''}</p>
        <p className="text-4xl font-bold tabular-nums text-text-main">{nextJlpt ? `D-${daysUntil(new Date(`${nextJlpt.examDate}T09:00:00+07:00`), tz, now)}` : '—'}</p>
        <p className="text-xs text-text-secondary">
          {nextJlpt ? shortDateId(new Date(`${nextJlpt.examDate}T09:00:00+07:00`), tz) : 'Belum ada sesi'}
          {nextJlpt?.isEstimate ? ' · perkiraan' : ''}
        </p>
      </section>

      {/* Rak Daruma */}
      <section className="glass-card rounded-3xl p-6 md:col-span-4 lg:col-span-3 flex flex-col gap-4">
        <div>
          <h2 className="text-lg font-bold text-text-main">Rak Daruma <span className="font-jp">達磨</span></h2>
          <p className="text-xs text-text-secondary">Mata kiri dicat saat target dipasang. Mata kanan dicat saat tercapai.</p>
        </div>
        <ul className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {darumas.map((d) => (
            <li key={d.id} className="flex flex-col items-center text-center gap-1">
              <DarumaIcon eyes={d.rightEyeAt ? 2 : 1} color={d.track === 'dsa' ? '#0066cc' : d.track === 'general' ? '#d4a017' : '#e8453c'} className="w-14 h-14" />
              <span className="text-xs font-semibold text-text-main leading-tight">{d.title}</span>
              <span className="text-[10px] text-text-secondary tabular-nums">{d.dueDate ? `D-${daysUntil(new Date(`${d.dueDate}T12:00:00+07:00`), tz, now)}` : ''}</span>
            </li>
          ))}
        </ul>
      </section>

      {/* Berikutnya */}
      <section className="glass-card rounded-3xl p-6 md:col-span-4 lg:col-span-3 flex flex-col gap-3">
        <h2 className="text-lg font-bold text-text-main">Sedang dibangun</h2>
        <ol className="space-y-2 text-sm">
          <li className="flex gap-3"><span className="font-semibold text-[#0066cc] w-8">M2</span><span>Peta jalur 日本語 & DSA, panel node, mesin XP & streak</span></li>
          <li className="flex gap-3"><span className="font-semibold text-[#0066cc] w-8">M3</span><span>Hari ini, SRS, target, heatmap, kalender & war JLPT</span></li>
          <li className="flex gap-3"><span className="font-semibold text-[#0066cc] w-8">M4</span><span>Editor portfolio + upload gambar ke Neon Object Storage</span></li>
          <li className="flex gap-3"><span className="font-semibold text-[#0066cc] w-8">M5</span><span>Maskot & banner, animasi, tes</span></li>
        </ol>
      </section>
    </div>
  );
}
