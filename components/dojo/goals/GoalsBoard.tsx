'use client';

import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';
import { addGoal, deleteGoal, saveReflection, toggleManual, updateTarget } from '@/app/actions/goals';
import { emitAward } from '@/components/dojo/AwardToaster';

type Goal = { id: string; track: string; period: string; title: string; metric: string; target: number; progress: number; done: boolean; manualDone: boolean | null; source: string };
type Props = {
  week: { start: string; end: string; goals: Goal[] };
  month: { start: string; end: string; goals: Goal[] };
  reflection: { wentWell: string | null; blockers: string | null; nextWeek: string | null } | null;
  metrics: Record<string, string>;
  history: { start: string; done: number; total: number }[];
};
const COLOR = { jp: '#e8453c', dsa: '#0066cc' } as Record<string, string>;
const fmt = (d: string) => new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'short' }).format(new Date(`${d}T00:00:00`));

function Row({ g, onChange }: { g: Goal; onChange: () => void }) {
  const [pending, start] = useTransition();
  const [editing, setEditing] = useState(false);
  const [val, setVal] = useState(String(g.target));
  const pct = Math.min(100, Math.round((g.progress / g.target) * 100));
  const run = (fn: () => Promise<unknown>) => start(async () => { await fn(); onChange(); });
  return (
    <li className="group flex items-center gap-3 py-2">
      {g.metric === 'manual' ? (
        <button type="button" disabled={pending} onClick={() => run(() => toggleManual(g.id))} aria-pressed={!!g.manualDone} className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border ${g.manualDone ? 'border-[#34c759] bg-[#34c759] text-white' : 'border-black/20 bg-white'}`}>
          {g.manualDone && <span className="material-symbols-outlined text-[16px]">check</span>}
        </button>
      ) : (
        <span className={`material-symbols-outlined shrink-0 text-[22px] ${g.done ? 'text-[#34c759]' : 'text-[#c7c7cc]'}`}>{g.done ? 'check_circle' : 'radio_button_unchecked'}</span>
      )}
      <div className="min-w-0 flex-1">
        <p className={`text-[14px] ${g.done ? 'text-text-secondary' : 'text-text-main'}`}>{g.title}</p>
        {g.metric !== 'manual' && (
          <div className="mt-1 flex items-center gap-2">
            <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-black/5">
              <div className="h-full rounded-full" style={{ width: `${pct}%`, background: g.done ? '#34c759' : COLOR[g.track] }} />
            </div>
            {editing ? (
              <span className="flex items-center gap-1">
                <input value={val} onChange={(e) => setVal(e.target.value.replace(/\D/g, '').slice(0, 6))} className="w-16 rounded-lg border-black/10 px-2 py-0.5 text-[12px]" inputMode="numeric" aria-label="Target baru" />
                <button type="button" onClick={() => run(async () => { await updateTarget(g.id, Number(val)); setEditing(false); })} className="text-[12px] font-semibold text-[#0066cc]">Simpan</button>
              </span>
            ) : (
              <button type="button" onClick={() => setEditing(true)} className="whitespace-nowrap text-[12px] tabular-nums text-text-secondary hover:text-[#0066cc]" title="Ubah target">
                {g.progress}/{g.target}
              </button>
            )}
          </div>
        )}
      </div>
      <button type="button" onClick={() => run(() => deleteGoal(g.id))} className="rounded-full p-1 text-text-secondary opacity-0 hover:text-[#c2452d] group-hover:opacity-100 focus:opacity-100" aria-label={`Hapus target ${g.title}`}>
        <span className="material-symbols-outlined text-[18px]">delete</span>
      </button>
    </li>
  );
}

export default function GoalsBoard({ week, month, reflection, metrics, history }: Props) {
  const router = useRouter();
  const refresh = () => router.refresh();
  const [pending, start] = useTransition();
  const [form, setForm] = useState({ track: 'jp', period: 'week', title: '', metric: 'manual', target: '1' });
  const [refl, setRefl] = useState({ wentWell: reflection?.wentWell ?? '', blockers: reflection?.blockers ?? '', nextWeek: reflection?.nextWeek ?? '' });
  const [msg, setMsg] = useState<string | null>(null);

  const block = (title: string, range: string, goals: Goal[], reward: string) => (
    <section className="glass-card rounded-3xl p-6">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="text-lg font-bold text-text-main">{title}</h2>
        <p className="text-[12px] text-text-secondary">{range} · {reward}</p>
      </div>
      <div className="mt-3 grid gap-6 md:grid-cols-2">
        {(['jp', 'dsa'] as const).map((t) => {
          const list = goals.filter((g) => g.track === t);
          const done = list.filter((g) => g.done).length;
          return (
            <div key={t}>
              <p className="flex items-center justify-between text-[13px] font-semibold" style={{ color: COLOR[t] }}>
                <span className="font-jp">{t === 'jp' ? '日本語' : 'DSA'}</span>
                <span className="tabular-nums text-text-secondary">{done}/{list.length}</span>
              </p>
              <ul className="divide-y divide-black/5">{list.map((g) => <Row key={g.id} g={g} onChange={refresh} />)}</ul>
            </div>
          );
        })}
      </div>
    </section>
  );

  return (
    <div className="space-y-6">
      {block('Minggu ini', `${fmt(week.start)}–${fmt(week.end)}`, week.goals, 'tercapai: +100 XP & +1 freeze per jalur, Perfect week +150')}
      {block('Bulan ini', `${fmt(month.start)}–${fmt(month.end)}`, month.goals, 'tercapai: +300 XP per jalur')}

      <div className="grid gap-6 md:grid-cols-2">
        <section className="glass-card rounded-3xl p-6">
          <h2 className="text-lg font-bold text-text-main">Tambah target</h2>
          <div className="mt-3 grid gap-2">
            <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Mis. Tonton 2 video Miku Real Japanese" className="rounded-xl border-black/10 text-sm" aria-label="Judul target" />
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              <select value={form.track} onChange={(e) => setForm({ ...form, track: e.target.value })} className="rounded-xl border-black/10 text-sm" aria-label="Jalur">
                <option value="jp">日本語</option>
                <option value="dsa">DSA</option>
              </select>
              <select value={form.period} onChange={(e) => setForm({ ...form, period: e.target.value })} className="rounded-xl border-black/10 text-sm" aria-label="Periode">
                <option value="week">Minggu ini</option>
                <option value="month">Bulan ini</option>
              </select>
              <select value={form.metric} onChange={(e) => setForm({ ...form, metric: e.target.value })} className="rounded-xl border-black/10 text-sm" aria-label="Metrik">
                {Object.entries(metrics).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
              <input value={form.target} onChange={(e) => setForm({ ...form, target: e.target.value.replace(/\D/g, '').slice(0, 6) })} inputMode="numeric" className="rounded-xl border-black/10 text-sm" aria-label="Target" />
            </div>
            <button type="button" disabled={pending || form.title.trim().length < 2} onClick={() => start(async () => { const r = await addGoal({ track: form.track as 'jp' | 'dsa', period: form.period as 'week' | 'month', title: form.title, metric: form.metric as never, target: Number(form.target) || 1 }); setMsg(r.ok ? 'Target ditambahkan.' : (r.error ?? null)); if (r.ok) setForm({ ...form, title: '' }); refresh(); })} className="rounded-full bg-[#1d1d1f] py-2.5 text-sm font-semibold text-white disabled:opacity-40">
              Tambah
            </button>
          </div>
          {history.length > 0 && (
            <div className="mt-5">
              <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.08em] text-text-secondary">Minggu sebelumnya</p>
              <ul className="space-y-1.5">
                {history.map((h) => (
                  <li key={h.start} className="flex items-center gap-2 text-[13px]">
                    <span className="w-16 text-text-secondary">{fmt(h.start)}</span>
                    <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-black/5"><div className="h-full rounded-full bg-[#34c759]" style={{ width: `${h.total ? (h.done / h.total) * 100 : 0}%` }} /></div>
                    <span className="tabular-nums text-text-secondary">{h.done}/{h.total}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </section>

        <section className="glass-card rounded-3xl p-6">
          <h2 className="text-lg font-bold text-text-main">Refleksi mingguan <span className="font-jp text-base text-text-secondary">振り返り</span></h2>
          <p className="text-[12px] text-text-secondary">+20 XP sekali per minggu. Bisa diedit kapan saja.</p>
          <div className="mt-3 grid gap-2">
            {(
              [
                ['wentWell', 'Apa yang berhasil minggu ini?'],
                ['blockers', 'Apa yang menghambat?'],
                ['nextWeek', 'Rencana minggu depan'],
              ] as const
            ).map(([k, label]) => (
              <label key={k} className="text-[13px] text-text-main">
                {label}
                <textarea value={refl[k]} onChange={(e) => setRefl({ ...refl, [k]: e.target.value })} rows={2} className="mt-1 w-full rounded-xl border-black/10 text-sm" />
              </label>
            ))}
            <button type="button" disabled={pending} onClick={() => start(async () => { const r = await saveReflection(refl); if (r.ok && r.result) emitAward(r.result); setMsg(r.ok ? 'Refleksi tersimpan. お疲れさま！' : (r.error ?? null)); refresh(); })} className="rounded-full bg-[#0066cc] py-2.5 text-sm font-semibold text-white disabled:opacity-50">
              Simpan refleksi
            </button>
          </div>
        </section>
      </div>
      {msg && <p className="text-center text-[13px] text-text-secondary" role="status">{msg}</p>}
    </div>
  );
}
