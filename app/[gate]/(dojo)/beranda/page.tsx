import { asc, desc, eq } from 'drizzle-orm';
import Link from 'next/link';
import { getDb } from '@/db/client';
import { badgeAward, countdown, daruma, jlptSession } from '@/db/schema';
import DarumaIcon from '@/components/dojo/DarumaIcon';
import Heatmap from '@/components/dojo/Heatmap';
import { BADGES, evaluateBadges } from '@/lib/dojo/badges';
import { warState } from '@/lib/dojo/calendar';
import { getDailySets, getQuests } from '@/lib/dojo/daily';
import { getGoals } from '@/lib/dojo/goals';
import { heatmapData } from '@/lib/dojo/stats';
import { computePace, computeStatuses, nextNode, type Track } from '@/lib/dojo/curriculum';
import { requireDojo } from '@/lib/dojo/dal';
import { getTodayStateCached, type StreakView } from '@/lib/dojo/engine/core';
import { beltFor } from '@/lib/dojo/level';
import { loadProgress } from '@/lib/dojo/progress';
import { daysUntil, greeting, longDateId, shortDateId } from '@/lib/dojo/time';

const OFFER_SIGNED = new Date('2026-11-08T12:00:00+07:00');
const TRACKS: { key: Track; label: string; seg: string; color: string; soft: string }[] = [
  { key: 'jp', label: '日本語', seg: 'nihongo', color: '#e8453c', soft: '#fdecea' },
  { key: 'dsa', label: 'DSA', seg: 'dsa', color: '#0066cc', soft: '#e6f0fa' },
];

const STATUS: Record<StreakView['status'], { text: string; tone: string }> = {
  aman: { text: 'Aman hari ini ✓', tone: 'text-[#1f7a3a]' },
  belum: { text: 'Belum aman', tone: 'text-text-secondary' },
  berisiko: { text: 'Berisiko, sudah lewat 18:00', tone: 'text-[#c25e00]' },
  retak: { text: 'Retak 七転び八起き', tone: 'text-[#0b6b94]' },
  sibuk: { text: 'Mode sibuk (ambang 5 XP)', tone: 'text-text-secondary' },
};

const hm = (mins: number) => `${Math.floor(mins / 60)}j ${mins % 60}m`;

export default async function Beranda({ params }: { params: Promise<{ gate: string }> }) {
  const { gate } = await params;
  await requireDojo(gate);
  const db = getDb();
  const state = await getTodayStateCached();
  await evaluateBadges(state.profile.timezone);
  const daily = await getDailySets();
  const [quests, goals, heat, recent, darumas, sessions, [misumi], progJp, progDsa] = await Promise.all([
    getQuests(daily.perfect),
    getGoals(),
    heatmapData(Number(state.today.slice(0, 4))),
    db.select().from(badgeAward).orderBy(desc(badgeAward.awardedAt)).limit(4),
    db.select().from(daruma).orderBy(asc(daruma.dueDate)),
    db.select().from(jlptSession).orderBy(asc(jlptSession.examDate)),
    db.select().from(countdown).where(eq(countdown.slug, 'misumi-day1')).limit(1),
    loadProgress('jp'),
    loadProgress('dsa'),
  ]);

  const tz = state.profile.timezone;
  const now = new Date();
  const today = state.today;
  const greet = greeting(state.hour);
  const lv = state.level;
  const belt = beltFor(lv.level);
  const progress = { jp: progJp, dsa: progDsa };
  const tracks = TRACKS.map((t) => {
    const statuses = computeStatuses(t.key, progress[t.key]);
    return { ...t, streak: state.streaks[t.key], next: nextNode(t.key, statuses), pace: computePace(t.key, progress[t.key], today) };
  });
  const nextJlpt = sessions.find((s) => s.examDate >= today);
  const war = warState(sessions, now);
  const items = [...daily.sets.jp.items, ...daily.sets.dsa.items];
  const weekGoals = goals.week.goals;
  const misumiAt = misumi?.targetAt ?? new Date('2028-10-01T09:00:00+09:00');
  const misumiDays = daysUntil(misumiAt, tz, now);
  const misumiPct = Math.min(100, Math.max(0, ((now.getTime() - OFFER_SIGNED.getTime()) / (misumiAt.getTime() - OFFER_SIGNED.getTime())) * 100));

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-4 md:gap-6 lg:grid-cols-6">
      {war && (
        <Link href={`/${gate}/kalender`} className="flex flex-wrap items-center gap-3 rounded-3xl border border-[#f5c2be] bg-[#fdecea] px-6 py-4 md:col-span-4 lg:col-span-6">
          <span className="text-2xl" aria-hidden="true">🎌</span>
          <div className="min-w-0 flex-1">
            <p className="font-semibold text-[#a3271f]">
              WAR JLPT {war.session.levelPlanned}: pendaftaran {war.phase === 'open' ? 'SEDANG BUKA' : `buka ${shortDateId(war.opensAt, tz)}`}
              {war.session.isEstimate ? ' (perkiraan)' : ''}
            </p>
            <p className="text-[13px] text-[#a3271f]/80">Cek checklist war, lalu daftar di jlptonline.or.id. Ubah status jadi &quot;Terdaftar&quot; setelah berhasil.</p>
          </div>
          <span className="rounded-full bg-[#e8453c] px-4 py-2 text-sm font-semibold text-white">Buka checklist</span>
        </Link>
      )}

      {/* Sapaan + level */}
      <section className="glass-card flex flex-col gap-5 rounded-3xl p-6 md:col-span-4 md:p-8 lg:col-span-4">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-text-secondary">{longDateId(now, tz)}</p>
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-text-main md:text-5xl">
            <span className="font-jp" lang="ja">{greet.jp}</span>, {state.profile.displayName}
          </h1>
          <p className="mt-1 text-text-secondary">{greet.romaji} · がんばって！</p>
        </div>
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-3 text-sm">
            <span className="inline-block h-3 w-8 rounded-full border" style={{ background: belt.color, borderColor: belt.edge }} />
            <span className="font-semibold text-text-main">Lv {lv.level}</span>
            <span className="font-jp text-text-secondary" lang="ja">
              {belt.obi} · {belt.title}
            </span>
            <span className="ml-auto text-xs tabular-nums text-text-secondary">{state.profile.totalXp.toLocaleString('id-ID')} XP</span>
          </div>
          <div className="h-2.5 overflow-hidden rounded-full bg-gray-200/80">
            <div className="h-full rounded-full bg-[#ffb800]" style={{ width: `${Math.round((lv.intoLevel / lv.span) * 100)}%` }} />
          </div>
          <p className="text-xs tabular-nums text-text-secondary">
            {lv.intoLevel} / {lv.span} XP ke Lv {Math.min(50, lv.level + 1)}
          </p>
        </div>
        <p className="text-sm text-text-main">
          Hari ini:{' '}
          {tracks.map((t, i) => (
            <span key={t.key}>
              {i > 0 && ' · '}
              <span className="font-jp font-semibold" lang={t.key === 'jp' ? 'ja' : undefined}>
                {t.label}
              </span>{' '}
              <span className="tabular-nums">
                {t.streak.todayXp}/{t.streak.goal} XP
              </span>
            </span>
          ))}
        </p>
        <div className="flex flex-wrap gap-2">
          {tracks.map((t) => (
            <Link key={t.key} href={`/${gate}/${t.seg}`} className="inline-flex items-center gap-1.5 rounded-full px-5 py-2.5 text-sm font-semibold text-white shadow-lg" style={{ background: t.color }}>
              Lanjut <span className="font-jp" lang={t.key === 'jp' ? 'ja' : undefined}>{t.label}</span>
              <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Daru */}
      <section className="glass-card flex flex-col items-center justify-center gap-3 rounded-3xl p-6 text-center md:col-span-4 lg:col-span-2">
        <DarumaIcon eyes={1} className="h-28 w-28 drop-shadow-xl" />
        <p className="font-jp text-sm font-semibold text-text-main" lang="ja">
          {belt.title} · {belt.titleRomaji}
        </p>
        <p className="text-xs text-text-secondary">{state.nitoryu > 0 ? `二刀流 ${state.nitoryu} hari: kedua streak aman bersamaan` : 'Sabuk naik setiap 5 level.'}</p>
      </section>

      {/* Streak per jalur */}
      {tracks.map((t) => {
        const s = t.streak;
        const st = STATUS[s.status];
        const need = Math.max(0, s.threshold - s.todayXp);
        return (
          <section key={t.key} className="glass-card flex flex-col gap-3 rounded-3xl p-6 md:col-span-2 lg:col-span-2">
            <div className="flex items-center justify-between">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-text-secondary">
                Streak <span className="font-jp normal-case" lang={t.key === 'jp' ? 'ja' : undefined}>{t.label}</span>
              </p>
              <span className="flex gap-0.5 text-[#32ade6]" title={`${s.freezes} freeze`} aria-label={`${s.freezes} freeze`}>
                {Array.from({ length: s.freezes }).map((_, i) => (
                  <span key={i} className="material-symbols-outlined text-[18px]">ac_unit</span>
                ))}
              </span>
            </div>
            <div className="flex items-end gap-2">
              <span className={`material-symbols-outlined text-[40px] ${s.status === 'aman' ? 'text-[#ff9500]' : s.status === 'berisiko' ? 'text-[#ff9500] motion-safe:animate-pulse' : 'text-[#c7c7cc]'}`}>local_fire_department</span>
              <span className="text-5xl font-bold tabular-nums text-text-main">{s.current}</span>
              <span className="mb-1.5 text-text-secondary">hari</span>
            </div>
            <p className={`text-sm font-medium ${st.tone}`}>{st.text}</p>
            <p className="text-xs text-text-secondary">
              {s.status === 'retak'
                ? `Capai ${s.repairTarget} XP hari ini untuk memulihkan streak.`
                : s.status === 'aman'
                  ? `Terpanjang ${s.longest} hari${s.frozenYesterday ? ' · kemarin tertutup freeze 🧊' : ''}`
                  : `Butuh ${need} XP lagi · sisa ${hm(s.minutesLeft)}`}
            </p>
            {t.next && (
              <Link href={`/${gate}/${t.seg}`} className="mt-auto truncate rounded-2xl px-3 py-2 text-[13px] font-medium" style={{ background: t.soft, color: t.color }}>
                Berikutnya: {t.next.title}
              </Link>
            )}
          </section>
        );
      })}

      {/* Countdown */}
      <section className="glass-card flex flex-col gap-2 rounded-3xl p-6 md:col-span-2 lg:col-span-1">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-text-secondary">MISUMI</p>
        <p className="font-mono text-4xl font-bold tabular-nums text-text-main">D-{misumiDays}</p>
        <p className="text-xs text-text-secondary">{shortDateId(misumiAt, 'Asia/Tokyo')} · 九段下</p>
        <div className="mt-auto h-1.5 overflow-hidden rounded-full bg-gray-200/80">
          <div className="h-full bg-[#0066cc]" style={{ width: `${misumiPct.toFixed(1)}%` }} />
        </div>
      </section>
      <section className="glass-card flex flex-col gap-2 rounded-3xl p-6 md:col-span-2 lg:col-span-1">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-text-secondary">JLPT {nextJlpt?.levelPlanned ?? ''}</p>
        <p className="font-mono text-4xl font-bold tabular-nums text-text-main">{nextJlpt ? `D-${daysUntil(new Date(`${nextJlpt.examDate}T09:00:00+07:00`), tz, now)}` : '—'}</p>
        <p className="text-xs text-text-secondary">
          {nextJlpt ? shortDateId(new Date(`${nextJlpt.examDate}T09:00:00+07:00`), tz) : 'Belum ada sesi'}
          {nextJlpt?.isEstimate ? ' · perkiraan' : ''}
        </p>
      </section>

      {/* Hari ini */}
      <section className="glass-card flex flex-col gap-3 rounded-3xl p-6 md:col-span-2 lg:col-span-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-text-main">Hari ini</h2>
          <Link href={`/${gate}/hari-ini`} className="text-[13px] font-medium text-[#0066cc]">
            {items.filter((i) => i.done).length}/{items.length} item →
          </Link>
        </div>
        <ul className="space-y-2">
          {quests.map((q) => (
            <li key={q.id} className="flex items-center gap-2 text-[14px]">
              <span className={`material-symbols-outlined text-[20px] ${q.completed ? 'text-[#34c759]' : 'text-[#c7c7cc]'}`}>{q.completed ? 'check_circle' : 'radio_button_unchecked'}</span>
              <span className={q.completed ? 'text-text-secondary' : 'text-text-main'}>{q.title}</span>
              <span className="ml-auto text-[12px] font-semibold text-[#8a6100]">+{q.xp}</span>
            </li>
          ))}
        </ul>
        {daily.perfect && <p className="text-[13px] font-semibold text-[#1f7a3a]">Perfect day ✓</p>}
      </section>

      {/* Target minggu ini */}
      <section className="glass-card flex flex-col gap-3 rounded-3xl p-6 md:col-span-2 lg:col-span-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-text-main">Target minggu ini</h2>
          <Link href={`/${gate}/target`} className="text-[13px] font-medium text-[#0066cc]">
            {weekGoals.filter((g) => g.done).length}/{weekGoals.length} →
          </Link>
        </div>
        <ul className="space-y-2">
          {weekGoals.slice(0, 6).map((g) => (
            <li key={g.id} className="flex items-center gap-2 text-[13px]">
              <span className="w-12 font-jp text-[12px]" style={{ color: g.track === 'jp' ? '#e8453c' : '#0066cc' }}>{g.track === 'jp' ? '日本語' : 'DSA'}</span>
              <span className={`min-w-0 flex-1 truncate ${g.done ? 'text-text-secondary line-through' : 'text-text-main'}`}>{g.title}</span>
              <span className="tabular-nums text-text-secondary">{g.metric === 'manual' ? (g.done ? '✓' : '—') : `${g.progress}/${g.target}`}</span>
            </li>
          ))}
        </ul>
      </section>

      {/* Heatmap */}
      <section className="glass-card rounded-3xl p-6 md:col-span-4 lg:col-span-6">
        <h2 className="mb-3 text-lg font-bold text-text-main">Heatmap</h2>
        <Heatmap year={Number(today.slice(0, 4))} data={heat.data} />
      </section>

      {/* Pace */}
      <section className="glass-card flex flex-col gap-3 rounded-3xl p-6 md:col-span-4 lg:col-span-3">
        <h2 className="text-lg font-bold text-text-main">Pace</h2>
        <ul className="space-y-3">
          {tracks.map((t) => (
            <li key={t.key} className="flex items-center gap-3">
              <span className="w-16 font-jp text-sm font-semibold text-text-main" lang={t.key === 'jp' ? 'ja' : undefined}>
                {t.label}
              </span>
              <div className="h-2 flex-1 overflow-hidden rounded-full bg-black/5">
                <div className="h-full rounded-full" style={{ width: `${Math.round((t.pace.actual / Math.max(1, t.pace.total)) * 100)}%`, background: t.color }} />
              </div>
              <span className={`whitespace-nowrap text-[13px] font-semibold ${t.pace.tone === 'behind' ? 'text-[#c25e00]' : t.pace.tone === 'ahead' ? 'text-[#1f7a3a]' : 'text-text-secondary'}`}>{t.pace.label}</span>
            </li>
          ))}
        </ul>
        {tracks.some((t) => t.pace.plan) && <p className="text-xs text-text-secondary">{tracks.map((t) => t.pace.plan && `${t.label}: ${t.pace.plan}`).filter(Boolean).join(' ')}</p>}
      </section>

      {/* Lencana terbaru */}
      {recent.length > 0 && (
        <section className="glass-card flex flex-col gap-3 rounded-3xl p-6 md:col-span-4 lg:col-span-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-text-main">Lencana terbaru</h2>
            <Link href={`/${gate}/profil`} className="text-[13px] font-medium text-[#0066cc]">Semua →</Link>
          </div>
          <ul className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {recent.map((b) => {
              const def = BADGES.find((x) => x.id === b.badgeId);
              return (
                <li key={b.badgeId} className="rounded-2xl border border-[#ffd76a] bg-[#fffaf0] p-3">
                  <p className="font-jp text-[14px] font-semibold text-text-main">🏅 {def?.name ?? b.badgeId}</p>
                  <p className="text-[11px] text-text-secondary">{def?.hint}</p>
                </li>
              );
            })}
          </ul>
        </section>
      )}

      {/* Rak Daruma */}
      <section className="glass-card flex flex-col gap-4 rounded-3xl p-6 md:col-span-4 lg:col-span-3">
        <div>
          <h2 className="text-lg font-bold text-text-main">
            Rak Daruma <span className="font-jp" lang="ja">達磨</span>
          </h2>
          <p className="text-xs text-text-secondary">Mata kiri dicat saat target dipasang. Mata kanan dicat saat tercapai.</p>
        </div>
        <ul className="grid grid-cols-3 gap-3 sm:grid-cols-5">
          {darumas.map((d) => (
            <li key={d.id} className="flex flex-col items-center gap-1 text-center">
              <DarumaIcon eyes={d.rightEyeAt ? 2 : 1} color={d.track === 'dsa' ? '#0066cc' : d.track === 'general' ? '#d4a017' : '#e8453c'} className="h-14 w-14" />
              <span className="text-xs font-semibold leading-tight text-text-main">{d.title}</span>
              <span className="text-[10px] tabular-nums text-text-secondary">{d.dueDate ? `D-${daysUntil(new Date(`${d.dueDate}T12:00:00+07:00`), tz, now)}` : ''}</span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
