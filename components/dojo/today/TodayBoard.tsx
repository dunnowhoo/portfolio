'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';
import { checkIn, logActivity, logFree, manualQuest, markListen, rerollDaily, reviewItem, type ActivityKind } from '@/app/actions/today';
import { emitAward } from '@/components/dojo/AwardToaster';
import QuizButton from '@/components/dojo/quiz/QuizButton';
import type { DailyItem, QuestView } from '@/lib/dojo/daily';
import { RATING_LABEL, type Rating } from '@/lib/dojo/engine/srs';

type Track = 'jp' | 'dsa';
type Props = {
  gate: string;
  sets: Record<Track, { items: DailyItem[]; rerolled: boolean }>;
  quests: QuestView[];
  perfect: boolean;
  goals: Record<Track, { xp: number; goal: number }>;
};
const META: Record<Track, { label: string; color: string; soft: string; seg: string }> = {
  jp: { label: '日本語', color: '#e8453c', soft: '#fdecea', seg: 'nihongo' },
  dsa: { label: 'DSA', color: '#0066cc', soft: '#e6f0fa', seg: 'dsa' },
};

function Ring({ value, goal, color }: { value: number; goal: number; color: string }) {
  const pct = Math.min(1, value / Math.max(1, goal));
  const r = 22;
  const c = 2 * Math.PI * r;
  return (
    <svg width="56" height="56" viewBox="0 0 56 56" aria-label={`${value} dari ${goal} XP`}>
      <circle cx="28" cy="28" r={r} fill="none" stroke="#e5e5ea" strokeWidth="6" />
      <circle cx="28" cy="28" r={r} fill="none" stroke={pct >= 1 ? '#34c759' : color} strokeWidth="6" strokeLinecap="round" strokeDasharray={`${c * pct} ${c}`} transform="rotate(-90 28 28)" />
      <text x="28" y="32" textAnchor="middle" fontSize="12" fontWeight="700" fill="#1d1d1f">
        {pct >= 1 ? '✓' : `${Math.round(pct * 100)}%`}
      </text>
    </svg>
  );
}

function ReviewControls({ item, onDone }: { item: DailyItem; onDone: () => void }) {
  const [quick, setQuick] = useState(false);
  const [pending, start] = useTransition();
  const [msg, setMsg] = useState<string | null>(null);
  return (
    <div className="mt-3">
      <label className="mb-2 flex items-center gap-2 text-[12px] text-text-secondary">
        <input type="checkbox" checked={quick} onChange={(e) => setQuick(e.target.checked)} className="rounded border-black/20 text-[#0066cc]" />
        Mode cepat: recall pola + kompleksitas saja (tidak bisa naik ke ★3)
      </label>
      <div className="grid grid-cols-4 gap-1.5">
        {([1, 2, 3, 4] as Rating[]).map((r) => (
          <button
            key={r}
            type="button"
            disabled={pending}
            onClick={() =>
              start(async () => {
                const res = await reviewItem({ id: item.nodeId!, rating: r, quick });
                if (!res.ok) return setMsg(res.error);
                if (res.result) emitAward(res.result);
                setMsg(res.message ?? null);
                onDone();
              })
            }
            className="rounded-xl border border-black/10 bg-white py-2 text-[13px] font-medium text-text-main hover:border-[#0066cc] disabled:opacity-50"
          >
            {RATING_LABEL[r]}
          </button>
        ))}
      </div>
      {msg && <p className="mt-2 text-[12px] text-text-secondary">{msg}</p>}
    </div>
  );
}

function ItemCard({ gate, track, item, refresh }: { gate: string; track: Track; item: DailyItem; refresh: () => void }) {
  const [pending, start] = useTransition();
  const m = META[track];
  const act = (fn: () => Promise<{ ok: boolean; result?: Parameters<typeof emitAward>[0] }>) =>
    start(async () => {
      const r = await fn();
      if (r.ok && r.result) emitAward(r.result);
      refresh();
    });
  const icon = item.kind === 'quiz' ? 'bolt' : item.kind === 'review' ? 'replay' : item.kind === 'checkin' ? 'task_alt' : item.kind === 'listen' ? 'headphones' : 'route';
  return (
    <li className={`rounded-3xl border bg-white p-4 transition-colors ${item.done ? 'border-[#b7e4c4]' : 'border-black/5'}`}>
      <div className="flex items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl" style={{ background: item.done ? '#eaf8ee' : m.soft, color: item.done ? '#1f7a3a' : m.color }}>
          <span className="material-symbols-outlined text-[20px]">{item.done ? 'check' : icon}</span>
        </span>
        <div className="min-w-0 flex-1">
          <p className={`font-semibold leading-snug ${item.done ? 'text-text-secondary line-through decoration-black/20' : 'text-text-main'}`}>{item.title}</p>
          {item.subtitle && <p className="text-[13px] text-text-secondary">{item.subtitle}</p>}
        </div>
        <span className="whitespace-nowrap text-[12px] font-semibold text-[#8a6100]">+{item.xp}</span>
      </div>
      {!item.done && (
        <div className="mt-3 flex flex-wrap items-center gap-2 pl-[52px]">
          {item.kind === 'quiz' && <QuizButton source="daily" id={item.id} label="Mulai" onFinished={refresh} />}
          {item.kind === 'node' && item.nodeId && (
            <Link href={`/${gate}/${m.seg}?node=${encodeURIComponent(item.nodeId)}`} className="rounded-full px-4 py-2 text-[13px] font-semibold text-white" style={{ background: m.color }}>
              Buka di jalur
            </Link>
          )}
          {item.kind === 'checkin' && (
            <button type="button" disabled={pending} onClick={() => act(() => checkIn(item.id === 'jp:anki' ? 'anki' : 'duolingo'))} className="rounded-full bg-[#1d1d1f] px-4 py-2 text-[13px] font-semibold text-white disabled:opacity-60">
              Check-in
            </button>
          )}
          {item.kind === 'listen' && (
            <>
              {item.link && (
                <a href={item.link.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 rounded-full border border-black/10 px-4 py-2 text-[13px] font-medium text-text-main">
                  {item.link.label} <span className="material-symbols-outlined text-[15px]">open_in_new</span>
                </a>
              )}
              <button type="button" disabled={pending} onClick={() => act(markListen)} className="rounded-full bg-[#1d1d1f] px-4 py-2 text-[13px] font-semibold text-white disabled:opacity-60">
                Tandai selesai
              </button>
            </>
          )}
        </div>
      )}
      {!item.done && item.kind === 'review' && item.nodeId && (
        <div className="pl-[52px]">
          <Link href={`/${gate}/${m.seg}?node=${encodeURIComponent(item.nodeId)}`} className="mt-2 inline-block text-[13px] font-medium text-[#0066cc]">
            Lihat soal & link LeetCode
          </Link>
          <ReviewControls item={item} onDone={refresh} />
        </div>
      )}
      {item.done && item.kind === 'quiz' && (
        <div className="mt-2 pl-[52px]">
          <QuizButton source="daily" id={item.id} label="Ulangi (latihan)" className="text-[13px] font-medium text-[#0066cc]" onFinished={refresh} />
        </div>
      )}
    </li>
  );
}

export default function TodayBoard({ gate, sets, quests, perfect, goals }: Props) {
  const router = useRouter();
  const refresh = () => router.refresh();
  const [tab, setTab] = useState<Track>('jp');
  const [pending, start] = useTransition();
  const [freeTrack, setFreeTrack] = useState<Track>('jp');
  const [freeMin, setFreeMin] = useState('');
  const [msg, setMsg] = useState<string | null>(null);

  const run = (fn: () => Promise<{ ok: boolean; error?: string; message?: string; result?: Parameters<typeof emitAward>[0] }>) =>
    start(async () => {
      const r = await fn();
      if (r.ok && r.result) emitAward(r.result);
      setMsg(r.ok ? (r.message ?? null) : (r.error ?? null));
      refresh();
    });

  const column = (track: Track) => {
    const s = sets[track];
    const m = META[track];
    const doneCount = s.items.filter((i) => i.done).length;
    return (
      <section className={`${tab === track ? 'block' : 'hidden'} md:block`} aria-labelledby={`today-${track}`}>
        <div className="glass-card mb-3 flex items-center gap-4 rounded-3xl p-5">
          <Ring value={goals[track].xp} goal={goals[track].goal} color={m.color} />
          <div className="min-w-0 flex-1">
            <h2 id={`today-${track}`} className="font-jp text-xl font-bold text-text-main" lang={track === 'jp' ? 'ja' : undefined}>
              {m.label}
            </h2>
            <p className="text-[13px] text-text-secondary">
              {goals[track].xp}/{goals[track].goal} XP · {doneCount}/{s.items.length} item
            </p>
          </div>
          <button
            type="button"
            disabled={s.rerolled || pending}
            onClick={() => run(() => rerollDaily(track))}
            className="rounded-full border border-black/10 bg-white px-3 py-1.5 text-[12px] font-medium text-text-main disabled:opacity-40"
            title="Ganti item non-review, 1× per hari"
          >
            <span className="material-symbols-outlined align-[-4px] text-[16px]">casino</span> {s.rerolled ? 'Sudah reroll' : 'Reroll'}
          </button>
        </div>
        <ul className="space-y-3">
          {s.items.map((it) => (
            <ItemCard key={it.id} gate={gate} track={track} item={it} refresh={refresh} />
          ))}
        </ul>
      </section>
    );
  };

  return (
    <div>
      <div className="glass-card mb-6 rounded-3xl p-6 md:p-8">
        <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-text-secondary">日替わり · daily shuffle</p>
        <div className="flex flex-wrap items-end justify-between gap-3">
          <h1 className="text-3xl font-bold text-text-main md:text-4xl">Hari ini</h1>
          {perfect && <span className="rounded-full bg-[#eaf8ee] px-3 py-1 text-[13px] font-semibold text-[#1f7a3a]">Perfect day ✓</span>}
        </div>
        <p className="mt-1 text-sm text-text-secondary">Set yang sama di semua perangkat. Selesaikan semua item + kedua daily goal untuk bonus Perfect day (+20 XP).</p>
      </div>

      <div className="mb-4 flex gap-1 rounded-full bg-white p-1 shadow-sm md:hidden" role="tablist">
        {(['jp', 'dsa'] as const).map((t) => (
          <button key={t} type="button" role="tab" aria-selected={tab === t} onClick={() => setTab(t)} className={`flex-1 rounded-full py-2 text-sm font-semibold ${tab === t ? 'text-white' : 'text-text-secondary'}`} style={tab === t ? { background: META[t].color } : undefined}>
            {META[t].label}
          </button>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {column('jp')}
        {column('dsa')}
      </div>

      <div className="mt-6 grid gap-6 md:grid-cols-2">
        <section className="glass-card rounded-3xl p-6">
          <h2 className="text-lg font-bold text-text-main">Quest hari ini</h2>
          <ul className="mt-3 space-y-3">
            {quests.map((q) => (
              <li key={q.id} className="flex items-center gap-3">
                <span className={`material-symbols-outlined text-[22px] ${q.completed ? 'text-[#34c759]' : 'text-[#c7c7cc]'}`}>{q.completed ? 'check_circle' : 'radio_button_unchecked'}</span>
                <div className="min-w-0 flex-1">
                  <p className={`text-[14px] ${q.completed ? 'text-text-secondary' : 'text-text-main'}`}>{q.title}</p>
                  {q.target > 1 && !q.completed && (
                    <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-black/5">
                      <div className="h-full rounded-full bg-[#ffb800]" style={{ width: `${Math.min(100, (q.progress / q.target) * 100)}%` }} />
                    </div>
                  )}
                </div>
                {q.manual && !q.completed ? (
                  <button type="button" disabled={pending} onClick={() => run(() => manualQuest(q.id))} className="rounded-full border border-black/10 px-3 py-1 text-[12px] font-medium">
                    Tandai
                  </button>
                ) : (
                  <span className="text-[12px] font-semibold text-[#8a6100]">+{q.xp}</span>
                )}
              </li>
            ))}
          </ul>
        </section>

        <section className="glass-card rounded-3xl p-6">
          <h2 className="text-lg font-bold text-text-main">Catat aktivitas</h2>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <select value={freeTrack} onChange={(e) => setFreeTrack(e.target.value as Track)} className="rounded-full border-black/10 py-1.5 pl-3 pr-8 text-[13px]" aria-label="Jalur">
              <option value="jp">日本語</option>
              <option value="dsa">DSA</option>
            </select>
            <input value={freeMin} onChange={(e) => setFreeMin(e.target.value.replace(/\D/g, '').slice(0, 3))} inputMode="numeric" placeholder="menit" className="w-20 rounded-full border-black/10 px-3 py-1.5 text-[13px]" aria-label="Menit belajar bebas" />
            <button type="button" disabled={!freeMin || pending} onClick={() => run(async () => { const r = await logFree({ track: freeTrack, minutes: Number(freeMin) }); if (r.ok) setFreeMin(''); return r; })} className="rounded-full bg-[#1d1d1f] px-4 py-1.5 text-[13px] font-semibold text-white disabled:opacity-40">
              Catat waktu
            </button>
          </div>
          <p className="mt-1 text-[12px] text-text-secondary">1 XP per 3 menit, maks 40 XP per jalur per hari.</p>
          <div className="mt-4 grid grid-cols-2 gap-2">
            {(
              [
                ['bicara', 'Sesi bicara', '+40'],
                ['nhk', 'Artikel NHK Easy', '+10'],
                ['kontes', 'Ikut kontes', '+60'],
                ['mock', 'Mock interview', '+80'],
              ] as [ActivityKind, string, string][]
            ).map(([k, label, xp]) => (
              <button key={k} type="button" disabled={pending} onClick={() => run(() => logActivity(k))} className="flex items-center justify-between rounded-2xl border border-black/10 bg-white px-3 py-2.5 text-left text-[13px] font-medium text-text-main hover:border-[#0066cc] disabled:opacity-50">
                {label}
                <span className="text-[12px] font-semibold text-[#8a6100]">{xp}</span>
              </button>
            ))}
          </div>
          {msg && <p className="mt-3 text-[13px] text-text-secondary">{msg}</p>}
        </section>
      </div>
    </div>
  );
}
