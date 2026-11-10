import { asc } from 'drizzle-orm';
import { getDb } from '@/db/client';
import { badgeAward, daruma } from '@/db/schema';
import DarumaIcon from '@/components/dojo/DarumaIcon';
import Heatmap from '@/components/dojo/Heatmap';
import { BADGES, evaluateBadges } from '@/lib/dojo/badges';
import { requireDojo } from '@/lib/dojo/dal';
import { getTodayStateCached } from '@/lib/dojo/engine/core';
import { BELTS, beltFor } from '@/lib/dojo/level';
import { DARU_GEAR, daruTier, nextGear } from '@/lib/dojo/daru';
import DaruAvatar from '@/components/dojo/DaruAvatar';
import DojoIcon from '@/components/dojo/DojoIcon';
import { Stars, Sym } from '@/components/dojo/Sym';
import type { DojoIconName } from '@/lib/dojo/icons';
import { loadProgress } from '@/lib/dojo/progress';
import { heatmapData, profileStats, weeklyXp } from '@/lib/dojo/stats';

const fmtDate = (d: Date | string) => new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }).format(typeof d === 'string' ? new Date(`${d}T00:00:00`) : d);
const label = 'text-[11px] font-semibold uppercase tracking-[0.08em] text-text-secondary';

export default async function ProfilPage({ params, searchParams }: { params: Promise<{ gate: string }>; searchParams: Promise<{ year?: string }> }) {
  const { gate } = await params;
  await requireDojo(gate);
  const state = await getTodayStateCached();
  await evaluateBadges(state.profile.timezone);
  const yParam = Number((await searchParams).year);
  const year = Number.isInteger(yParam) && yParam >= 2026 && yParam <= 2035 ? yParam : Number(state.today.slice(0, 4));
  const db = getDb();
  const [progJp, progDsa, heat, weeks, earned, darumas] = await Promise.all([
    loadProgress('jp'),
    loadProgress('dsa'),
    heatmapData(year),
    weeklyXp(state.today),
    db.select().from(badgeAward),
    db.select().from(daruma).orderBy(asc(daruma.dueDate)),
  ]);
  const stats = await profileStats({ jp: progJp, dsa: progDsa });
  const lv = state.level;
  const belt = beltFor(lv.level);
  const tier = daruTier(lv.level);
  const nx = nextGear(lv.level);
  const earnedMap = new Map(earned.map((b) => [b.badgeId, b.awardedAt]));
  const maxWeek = Math.max(1, ...weeks.map((w) => w.jp + w.dsa + w.general));

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-4 md:gap-6 lg:grid-cols-6">
      <section className="glass-card flex flex-col items-center gap-3 rounded-3xl p-6 text-center md:col-span-4 md:flex-row md:text-left lg:col-span-6">
        <div className="relative">
          <DaruAvatar level={lv.level} eager className="h-28 w-28 drop-shadow-xl" />
          <span className="absolute -bottom-1 left-1/2 h-3 w-20 -translate-x-1/2 rounded-full border" style={{ background: belt.color, borderColor: belt.edge }} aria-hidden="true" />
        </div>
        <div className="flex-1">
          <p className={label}>Profil</p>
          <h1 className="text-3xl font-bold text-text-main">{state.profile.displayName}</h1>
          <p className="font-jp text-lg text-text-main" lang="ja">
            Lv {lv.level} · {belt.obi} · {belt.title} <span className="text-sm text-text-secondary">({belt.titleRomaji})</span>
          </p>
          <p className="text-sm tabular-nums text-text-secondary">
            {state.profile.totalXp.toLocaleString('id-ID')} XP total · {lv.intoLevel}/{lv.span} ke Lv {Math.min(50, lv.level + 1)}
          </p>
        </div>
        <div className="grid grid-cols-3 gap-3 text-center">
          {(
            [
              ['flame', '日本語', state.streaks.jp.current, `terpanjang ${state.streaks.jp.longest}`],
              ['flame-blue', 'DSA', state.streaks.dsa.current, `terpanjang ${state.streaks.dsa.longest}`],
              [null, '二刀流', state.nitoryu, 'hari bersamaan'],
            ] as [DojoIconName | null, string, number, string][]
          ).map(([icon, t, v, s]) => (
            <div key={t} className="rounded-2xl bg-white px-4 py-3">
              <p className="flex items-center justify-center gap-1 font-jp text-[12px] text-text-secondary">
                {icon && <DojoIcon name={icon} className="h-4 w-4" />}
                {t}
              </p>
              <p className="text-2xl font-bold tabular-nums text-text-main">{v}</p>
              <p className="text-[11px] text-text-secondary">{s}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="glass-card rounded-3xl p-6 md:col-span-4 lg:col-span-6">
        <p className={`${label} mb-3`}>Heatmap</p>
        <Heatmap year={year} data={heat.data} years={heat.years} basePath={`/${gate}/profil`} />
      </section>

      <section className="glass-card rounded-3xl p-6 md:col-span-4 lg:col-span-6">
        <div className="mb-4 flex flex-wrap items-baseline justify-between gap-2">
          <p className={label}>Evolusi Daru</p>
          <p className="text-xs text-text-secondary">{nx ? `Berikutnya di Lv ${nx.atLevel}: ${nx.gear.name}` : 'Semua perlengkapan sudah terbuka'}</p>
        </div>
        <ol className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-11">
          {BELTS.map((b, i) => {
            const open = i <= tier;
            return (
              <li key={b.romaji} aria-current={i === tier ? 'step' : undefined} className={`flex flex-col items-center rounded-2xl px-1 py-2 text-center ${i === tier ? 'bg-white shadow-sm ring-2 ring-[#0066cc]/30' : ''}`}>
                <DaruAvatar tier={i} alt={open ? undefined : `Terkunci sampai Lv ${b.min}`} className={`h-16 w-16 ${open ? 'drop-shadow-md' : 'opacity-15 brightness-0'}`} />
                <span className="mt-1 h-1.5 w-9 rounded-full border" style={{ background: b.color, borderColor: b.edge }} aria-hidden="true" />
                <p className="mt-1 text-[11px] font-semibold leading-tight text-text-main">{open ? DARU_GEAR[i].name : 'Terkunci'}</p>
                <p className="text-[10px] tabular-nums text-text-secondary">Lv {b.min}</p>
              </li>
            );
          })}
        </ol>
      </section>

      <section className="glass-card rounded-3xl p-6 md:col-span-4 lg:col-span-3">
        <p className={`${label} mb-3`}>XP 12 minggu</p>
        <div className="flex h-36 items-end gap-1.5" role="img" aria-label="Grafik XP 12 minggu terakhir">
          {weeks.map((w) => {
            const tot = w.jp + w.dsa + w.general;
            return (
              <div key={w.start} className="flex flex-1 flex-col justify-end" title={`${w.start}: ${tot} XP`}>
                <div className="rounded-t-md bg-[#c7c7cc]" style={{ height: `${(w.general / maxWeek) * 100}%` }} />
                <div className="bg-[#0066cc]" style={{ height: `${(w.dsa / maxWeek) * 100}%` }} />
                <div className="rounded-b-md bg-[#e8453c]" style={{ height: `${(w.jp / maxWeek) * 100}%` }} />
              </div>
            );
          })}
        </div>
        <p className="mt-2 text-[11px] text-text-secondary">
          <span className="mr-1 inline-block h-2.5 w-2.5 rounded-sm bg-[#e8453c] align-middle" aria-hidden="true" />日本語
          <span className="ml-3 mr-1 inline-block h-2.5 w-2.5 rounded-sm bg-[#0066cc] align-middle" aria-hidden="true" />DSA
          <span className="ml-3 mr-1 inline-block h-2.5 w-2.5 rounded-sm bg-[#c7c7cc] align-middle" aria-hidden="true" />bonus
        </p>
      </section>

      <section className="glass-card rounded-3xl p-6 md:col-span-2 lg:col-span-3">
        <p className={`${label} mb-3`}>Statistik</p>
        <dl className="grid grid-cols-2 gap-3 text-sm">
          <div><dt className="text-text-secondary">Jam 日本語</dt><dd className="text-xl font-bold tabular-nums">{stats.hours.jp.toFixed(1)}</dd></div>
          <div><dt className="text-text-secondary">Jam DSA</dt><dd className="text-xl font-bold tabular-nums">{stats.hours.dsa.toFixed(1)}</dd></div>
          <div><dt className="text-text-secondary">Soal selesai</dt><dd className="text-xl font-bold tabular-nums">{stats.solved} <span className="text-[13px] font-normal text-text-secondary">E{stats.byLevel.E} · M{stats.byLevel.M} · H{stats.byLevel.H}</span></dd></div>
          <div><dt className="text-text-secondary">Kana dikuasai</dt><dd className="text-xl font-bold tabular-nums">{stats.kana.strong}<span className="text-[13px] font-normal text-text-secondary">/{stats.kana.total}</span></dd></div>
          <div><dt className="flex items-center gap-1 text-text-secondary">Kanji <Stars n={2} of={2} size="text-[13px]" /></dt><dd className="text-xl font-bold tabular-nums">{stats.kanji.strong}<span className="text-[13px] font-normal text-text-secondary">/{stats.kanji.total}</span></dd></div>
          <div><dt className="text-text-secondary">Akurasi kuis</dt><dd className="text-[13px] tabular-nums">kana {stats.accuracy.kana ?? '—'}% · kanji {stats.accuracy.kanji ?? '—'}% · grammar {stats.accuracy.grammar ?? '—'}% · pola {stats.accuracy.pattern ?? '—'}%</dd></div>
        </dl>
      </section>

      <section className="glass-card rounded-3xl p-6 md:col-span-2 lg:col-span-3">
        <p className={`${label} mb-3`}>Irodori per jilid</p>
        <ul className="space-y-3">
          {stats.books.map((b) => (
            <li key={b.book}>
              <div className="flex justify-between text-[13px]"><span className="text-text-main">{b.name}</span><span className="tabular-nums text-text-secondary">{b.done}/{b.total}</span></div>
              <div className="mt-1 h-2 overflow-hidden rounded-full bg-black/5"><div className="h-full rounded-full bg-[#e8453c]" style={{ width: `${(b.done / Math.max(1, b.total)) * 100}%` }} /></div>
            </li>
          ))}
        </ul>
      </section>

      <section className="glass-card rounded-3xl p-6 md:col-span-4 lg:col-span-3">
        <p className={`${label} mb-3`}>DSA per topik (rata-rata bintang)</p>
        <ul className="grid grid-cols-1 gap-x-6 gap-y-2 sm:grid-cols-2">
          {stats.topics.map((t) => (
            <li key={t.id} className="flex items-center justify-between gap-2 text-[13px]">
              <span className="truncate text-text-main">{t.title}</span>
              <span className="whitespace-nowrap tabular-nums text-text-secondary">
                {t.solved}/{t.total} <Stars n={Math.round(t.avgStars)} size="text-[13px]" />
              </span>
            </li>
          ))}
        </ul>
      </section>

      <section className="glass-card rounded-3xl p-6 md:col-span-4 lg:col-span-6">
        <p className={`${label} mb-1`}>Rak Daruma 達磨</p>
        <p className="mb-4 text-[12px] text-text-secondary">Mata kiri dicat saat target dipasang, mata kanan saat tercapai.</p>
        <ul className="grid grid-cols-3 gap-4 sm:grid-cols-5">
          {darumas.map((d) => (
            <li key={d.id} className="flex flex-col items-center gap-1 text-center" title={`${d.title}${d.dueDate ? ` · ${fmtDate(d.dueDate)}` : ''}`}>
              <DarumaIcon eyes={d.rightEyeAt ? 2 : 1} color={d.track === 'dsa' ? '#0066cc' : d.track === 'general' ? '#d4a017' : '#e8453c'} className="h-16 w-16" />
              <span className="text-xs font-semibold text-text-main">{d.title}</span>
              <span className="text-[10px] text-text-secondary">{d.status === 'achieved' ? (
                  <>
                    tercapai <Sym name="check" className="text-[12px]" />
                  </>
                ) : d.dueDate ? (
                  fmtDate(d.dueDate)
                ) : (
                  ''
                )}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="glass-card rounded-3xl p-6 md:col-span-4 lg:col-span-6">
        <div className="mb-4 flex items-baseline justify-between">
          <p className={label}>Lencana</p>
          <p className="text-[12px] tabular-nums text-text-secondary">{earnedMap.size}/{BADGES.length}</p>
        </div>
        {(['日本語', 'DSA', 'Disiplin'] as const).map((g) => (
          <div key={g} className="mb-5">
            <p className="mb-2 font-jp text-sm font-semibold text-text-main">{g}</p>
            <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
              {BADGES.filter((b) => b.group === g).map((b) => {
                const at = earnedMap.get(b.id);
                return (
                  <li key={b.id} className={`rounded-2xl border p-3 ${at ? 'border-[#ffd76a] bg-[#fffaf0]' : 'border-black/5 bg-white/60 opacity-70 grayscale'}`} title={b.hint}>
                    <DojoIcon name={at ? 'medal' : 'lock'} className="h-7 w-7" />
                    <p className="font-jp text-[13px] font-semibold leading-tight text-text-main">{b.name}</p>
                    <p className="mt-0.5 text-[11px] leading-snug text-text-secondary">{at ? fmtDate(at) : b.hint}</p>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </section>
    </div>
  );
}
