'use client';

import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';
import { addCountdown, addDaruma, addSession, darumaAction, deleteCountdown, deleteSession, saveWarChecklist, updateSession } from '@/app/actions/calendar';
import { emitAward } from '@/components/dojo/AwardToaster';
import DarumaIcon from '@/components/dojo/DarumaIcon';
import DojoIcon from '@/components/dojo/DojoIcon';
import { Sym } from '@/components/dojo/Sym';

export type SessionRow = { id: string; examDate: string; levelPlanned: string; city: string; regOpenAt: string; regCloseAt: string; isEstimate: boolean; status: string; score: string; notes: string };
type Props = {
  sessions: SessionRow[];
  statuses: readonly (readonly [string, string])[];
  countdowns: { id: string; title: string; targetAt: string; kind: string; days: number }[];
  darumas: { id: string; title: string; track: string; dueDate: string | null; status: string; eyes: 1 | 2; note: string | null }[];
  checklist: { text: string; done: boolean }[];
  reminders: { at: string; title: string; done: boolean }[];
  icsUrl: string;
};

const fmt = (iso: string) => new Intl.DateTimeFormat('id-ID', { timeZone: 'Asia/Jakarta', day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }).format(new Date(iso));
const input = 'rounded-lg border-black/10 px-2 py-1 text-[13px]';

function SessionEditor({ s, statuses, onSaved }: { s: SessionRow; statuses: Props['statuses']; onSaved: (msg: string) => void }) {
  const [v, setV] = useState(s);
  const [pending, start] = useTransition();
  const set = (k: keyof SessionRow, val: string | boolean) => setV((x) => ({ ...x, [k]: val }));
  return (
    <tr className="border-t border-black/5 align-top">
      <td className="py-2 pr-2"><input type="date" value={v.examDate} onChange={(e) => set('examDate', e.target.value)} className={input} aria-label="Tanggal ujian" /></td>
      <td className="py-2 pr-2"><input value={v.levelPlanned} onChange={(e) => set('levelPlanned', e.target.value)} className={`${input} w-16`} aria-label="Level" /></td>
      <td className="py-2 pr-2"><input value={v.city} onChange={(e) => set('city', e.target.value)} className={`${input} w-28`} aria-label="Kota" /></td>
      <td className="py-2 pr-2"><input type="datetime-local" value={v.regOpenAt} onChange={(e) => set('regOpenAt', e.target.value)} className={input} aria-label="Pendaftaran buka (WIB)" /></td>
      <td className="py-2 pr-2"><input type="datetime-local" value={v.regCloseAt} onChange={(e) => set('regCloseAt', e.target.value)} className={input} aria-label="Pendaftaran tutup (WIB)" /></td>
      <td className="py-2 pr-2">
        <select value={v.status} onChange={(e) => set('status', e.target.value)} className={`${input} pr-7`} aria-label="Status">
          {statuses.map(([k, l]) => <option key={k} value={k}>{l}</option>)}
        </select>
      </td>
      <td className="py-2 pr-2"><input value={v.score} onChange={(e) => set('score', e.target.value)} className={`${input} w-24`} placeholder="mis. 142/180" aria-label="Skor" /></td>
      <td className="py-2 pr-2">
        <label className="flex items-center gap-1 text-[12px] text-text-secondary"><input type="checkbox" checked={v.isEstimate} onChange={(e) => set('isEstimate', e.target.checked)} className="rounded border-black/20" /> perkiraan</label>
      </td>
      <td className="whitespace-nowrap py-2">
        <button type="button" disabled={pending} onClick={() => start(async () => { const r = await updateSession(v); if (r.ok && r.result) emitAward(r.result); onSaved(r.ok ? 'Sesi tersimpan.' : r.error); })} className="rounded-full bg-[#0066cc] px-3 py-1 text-[12px] font-semibold text-white disabled:opacity-50">Simpan</button>
        <button type="button" disabled={pending} onClick={() => start(async () => { await deleteSession(s.id); onSaved('Sesi dihapus.'); })} className="ml-1 rounded-full p-1 text-text-secondary hover:text-[#c2452d]" aria-label="Hapus sesi"><span className="material-symbols-outlined text-[18px]">delete</span></button>
      </td>
    </tr>
  );
}

export default function CalendarBoard({ sessions, statuses, countdowns, darumas, checklist, reminders, icsUrl }: Props) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [msg, setMsg] = useState<string | null>(null);
  const [items, setItems] = useState(checklist);
  const [newItem, setNewItem] = useState('');
  const [cd, setCd] = useState({ title: '', targetAt: '' });
  const [ns, setNs] = useState({ examDate: '', levelPlanned: '', city: '' });
  const [nd, setNd] = useState({ title: '', track: 'jp', dueDate: '' });
  const [extend, setExtend] = useState<Record<string, string>>({});
  const [release, setRelease] = useState<Record<string, string>>({});
  const saved = (m: string) => { setMsg(m); router.refresh(); };
  const saveList = (next: typeof items) => { setItems(next); start(async () => { await saveWarChecklist(next); }); };

  return (
    <div className="space-y-6">
      <section className="glass-card rounded-3xl p-6">
        <h2 className="text-lg font-bold text-text-main">Sesi JLPT</h2>
        <p className="text-[12px] text-text-secondary">Tanggal resmi keluar belakangan; ganti tanggal perkiraan begitu ada pengumuman di jlptonline.or.id. Jam dalam WIB. Status &quot;Terdaftar&quot; menyelesaikan node WAR (+100 XP), &quot;Sudah ujian&quot; node ujian (+300), &quot;Lulus&quot; +1.000 XP dan mata kanan Daruma.</p>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[980px] text-left text-[13px]">
            <thead className="text-[11px] uppercase tracking-[0.06em] text-text-secondary">
              <tr><th className="py-1">Ujian</th><th>Level</th><th>Kota</th><th>Daftar buka</th><th>Daftar tutup</th><th>Status</th><th>Skor</th><th /><th /></tr>
            </thead>
            <tbody>{sessions.map((s) => <SessionEditor key={s.id} s={s} statuses={statuses} onSaved={saved} />)}</tbody>
          </table>
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <input type="date" value={ns.examDate} onChange={(e) => setNs({ ...ns, examDate: e.target.value })} className={input} aria-label="Tanggal ujian baru" />
          <input value={ns.levelPlanned} onChange={(e) => setNs({ ...ns, levelPlanned: e.target.value })} placeholder="Level" className={`${input} w-20`} aria-label="Level sesi baru" />
          <input value={ns.city} onChange={(e) => setNs({ ...ns, city: e.target.value })} placeholder="Kota" className={`${input} w-28`} aria-label="Kota sesi baru" />
          <button type="button" disabled={!ns.examDate || pending} onClick={() => start(async () => { const r = await addSession(ns); saved(r.ok ? 'Sesi ditambahkan.' : r.error); })} className="rounded-full bg-[#1d1d1f] px-3 py-1.5 text-[12px] font-semibold text-white disabled:opacity-40">Tambah sesi</button>
        </div>
      </section>

      <div className="grid gap-6 md:grid-cols-2">
        <section className="glass-card rounded-3xl p-6">
          <h2 className="flex items-center gap-2 text-lg font-bold text-text-main">
            Checklist war <DojoIcon name="banner" className="h-6 w-6" />
          </h2>
          <ul className="mt-3 space-y-2">
            {items.map((it, i) => (
              <li key={`${it.text}-${i}`} className="flex items-center gap-2">
                <input type="checkbox" checked={it.done} onChange={(e) => saveList(items.map((x, k) => (k === i ? { ...x, done: e.target.checked } : x)))} className="rounded border-black/20 text-[#e8453c]" aria-label={it.text} />
                <span className={`flex-1 text-[14px] ${it.done ? 'text-text-secondary line-through' : 'text-text-main'}`}>{it.text}</span>
                <button type="button" onClick={() => saveList(items.filter((_, k) => k !== i))} className="rounded-full p-1 text-text-secondary hover:text-[#c2452d]" aria-label={`Hapus ${it.text}`}><span className="material-symbols-outlined text-[16px]">close</span></button>
              </li>
            ))}
          </ul>
          <div className="mt-3 flex gap-2">
            <input value={newItem} onChange={(e) => setNewItem(e.target.value)} placeholder="Tambah item" className="min-w-0 flex-1 rounded-xl border-black/10 text-sm" aria-label="Item checklist baru" />
            <button type="button" disabled={!newItem.trim()} onClick={() => { saveList([...items, { text: newItem.trim(), done: false }]); setNewItem(''); }} className="rounded-full bg-[#1d1d1f] px-4 text-[13px] font-semibold text-white disabled:opacity-40">Tambah</button>
          </div>
          <button type="button" onClick={() => saveList(items.map((x) => ({ ...x, done: false })))} className="mt-3 text-[12px] font-medium text-[#0066cc]">Reset centang (untuk war berikutnya)</button>
        </section>

        <section className="glass-card rounded-3xl p-6">
          <h2 className="text-lg font-bold text-text-main">Pengingat & kalender</h2>
          <ul className="mt-3 max-h-56 space-y-1.5 overflow-y-auto pr-1">
            {reminders.map((r) => (
              <li key={`${r.at}-${r.title}`} className="flex gap-2 text-[13px]">
                <span className="w-36 shrink-0 tabular-nums text-text-secondary">{fmt(r.at)}</span>
                <span className={r.done ? 'text-text-secondary line-through' : 'text-text-main'}>{r.title}</span>
              </li>
            ))}
          </ul>
          <div className="mt-4 flex flex-wrap gap-2">
            <a href={icsUrl} className="rounded-full bg-[#0066cc] px-4 py-2 text-[13px] font-semibold text-white">Unduh .ics</a>
            <button type="button" onClick={async () => { try { await navigator.clipboard.writeText(icsUrl); setMsg('URL langganan tersalin. Tambahkan di Apple/Google Calendar → "Subscribe/From URL".'); } catch { setMsg(icsUrl); } }} className="rounded-full border border-black/10 px-4 py-2 text-[13px] font-semibold text-text-main">Salin URL langganan</button>
          </div>
          <p className="mt-2 text-[11px] text-text-secondary">URL ini berisi token rahasia; jangan dibagikan. Alarm: H-14, H-7, H-1, dan saat pendaftaran buka.</p>
        </section>
      </div>

      <section className="glass-card rounded-3xl p-6">
        <h2 className="text-lg font-bold text-text-main">Countdown tambahan</h2>
        <ul className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {countdowns.map((c) => (
            <li key={c.id} className="flex items-center justify-between rounded-2xl bg-white p-3">
              <div>
                <p className="text-[14px] font-semibold text-text-main">{c.title}</p>
                <p className="text-[12px] text-text-secondary">{fmt(c.targetAt)}</p>
              </div>
              <span className="font-mono text-lg font-bold tabular-nums text-text-main">{c.days >= 0 ? `D-${c.days}` : `D+${-c.days}`}</span>
              {c.kind === 'custom' && <button type="button" onClick={() => start(async () => { await deleteCountdown(c.id); saved('Countdown dihapus.'); })} className="rounded-full p-1 text-text-secondary hover:text-[#c2452d]" aria-label={`Hapus ${c.title}`}><span className="material-symbols-outlined text-[16px]">close</span></button>}
            </li>
          ))}
        </ul>
        <div className="mt-3 flex flex-wrap gap-2">
          <input value={cd.title} onChange={(e) => setCd({ ...cd, title: e.target.value })} placeholder="Mis. Wisuda UI" className="rounded-xl border-black/10 text-sm" aria-label="Judul countdown" />
          <input type="datetime-local" value={cd.targetAt} onChange={(e) => setCd({ ...cd, targetAt: e.target.value })} className="rounded-xl border-black/10 text-sm" aria-label="Tanggal dan jam (WIB)" />
          <button type="button" disabled={pending || !cd.title || !cd.targetAt} onClick={() => start(async () => { const r = await addCountdown(cd); if (r.ok) setCd({ title: '', targetAt: '' }); saved(r.ok ? 'Countdown ditambahkan.' : r.error); })} className="rounded-full bg-[#1d1d1f] px-4 text-[13px] font-semibold text-white disabled:opacity-40">Tambah</button>
        </div>
      </section>

      <section className="glass-card rounded-3xl p-6">
        <h2 className="text-lg font-bold text-text-main">Daruma 達磨</h2>
        <ul className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {darumas.map((d) => (
            <li key={d.id} className="rounded-2xl bg-white p-4">
              <div className="flex items-center gap-3">
                <DarumaIcon eyes={d.eyes} color={d.track === 'dsa' ? '#0066cc' : d.track === 'general' ? '#d4a017' : '#e8453c'} className="h-12 w-12" />
                <div>
                  <p className="text-[14px] font-semibold text-text-main">{d.title}</p>
                  <p className="text-[12px] text-text-secondary">{d.status === 'achieved' ? <>Tercapai <Sym name="check" className="text-[14px]" /></> : d.status === 'released' ? 'Dilepas (pelajaran)' : d.dueDate ? `Target ${d.dueDate}` : ''}</p>
                </div>
              </div>
              {d.status === 'active' && (
                <div className="mt-3 space-y-2">
                  <button type="button" disabled={pending} onClick={() => start(async () => { const r = await darumaAction({ id: d.id, action: 'achieve' }); saved(r.ok ? 'Mata kanan dicat. おめでとう！' : r.error); })} className="w-full rounded-full bg-[#e8453c] py-1.5 text-[12px] font-semibold text-white">Cat mata kanan (tercapai)</button>
                  <div className="flex gap-1">
                    <input type="date" value={extend[d.id] ?? ''} onChange={(e) => setExtend({ ...extend, [d.id]: e.target.value })} className="min-w-0 flex-1 rounded-lg border-black/10 px-2 py-1 text-[12px]" aria-label="Tanggal baru" />
                    <button type="button" disabled={!extend[d.id]} onClick={() => start(async () => { const r = await darumaAction({ id: d.id, action: 'extend', date: extend[d.id] }); saved(r.ok ? 'Target diperpanjang.' : r.error); })} className="rounded-full border border-black/10 px-2 text-[12px] disabled:opacity-40">Perpanjang</button>
                  </div>
                  <details>
                    <summary className="cursor-pointer text-[12px] text-text-secondary">Lepas dengan refleksi</summary>
                    <textarea value={release[d.id] ?? ''} onChange={(e) => setRelease({ ...release, [d.id]: e.target.value })} rows={3} className="mt-1 w-full rounded-lg border-black/10 text-[12px]" placeholder="Apa yang kupelajari dari target ini?" />
                    <button type="button" onClick={() => start(async () => { const r = await darumaAction({ id: d.id, action: 'release', note: release[d.id] }); saved(r.ok ? 'Daruma dipindah ke rak pelajaran.' : r.error); })} className="mt-1 rounded-full border border-black/10 px-3 py-1 text-[12px]">Lepas</button>
                  </details>
                </div>
              )}
              {d.status !== 'active' && <button type="button" onClick={() => start(async () => { await darumaAction({ id: d.id, action: 'reopen' }); saved('Daruma diaktifkan lagi.'); })} className="mt-2 text-[12px] text-[#0066cc]">Aktifkan lagi</button>}
            </li>
          ))}
        </ul>
        <div className="mt-3 flex flex-wrap gap-2">
          <input value={nd.title} onChange={(e) => setNd({ ...nd, title: e.target.value })} placeholder="Target besar baru" className="rounded-xl border-black/10 text-sm" aria-label="Judul Daruma" />
          <select value={nd.track} onChange={(e) => setNd({ ...nd, track: e.target.value })} className="rounded-xl border-black/10 text-sm" aria-label="Jalur Daruma">
            <option value="jp">日本語</option><option value="dsa">DSA</option><option value="general">Umum</option>
          </select>
          <input type="date" value={nd.dueDate} onChange={(e) => setNd({ ...nd, dueDate: e.target.value })} className="rounded-xl border-black/10 text-sm" aria-label="Tanggal target" />
          <button type="button" disabled={pending || !nd.title || !nd.dueDate} onClick={() => start(async () => { const r = await addDaruma({ title: nd.title, track: nd.track as 'jp' | 'dsa' | 'general', dueDate: nd.dueDate }); if (r.ok) setNd({ title: '', track: 'jp', dueDate: '' }); saved(r.ok ? 'Daruma dipasang. Mata kiri dicat.' : r.error); })} className="rounded-full bg-[#1d1d1f] px-4 text-[13px] font-semibold text-white disabled:opacity-40">Pasang Daruma</button>
        </div>
      </section>
      {msg && <p className="text-center text-[13px] text-text-secondary" role="status">{msg}</p>}
    </div>
  );
}
