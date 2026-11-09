'use client';

import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';
import { addBusyDay, logoutEverywhere, removeBusyDay, saveProfile } from '@/app/actions/settings';

type P = { displayName: string; timezone: string; dayStartHour: number; dailyGoalJp: number; dailyGoalDsa: number; streakMinXp: number };
const TZ = ['Asia/Jakarta', 'Asia/Tokyo', 'Asia/Singapore', 'Asia/Makassar', 'Asia/Jayapura', 'UTC'];
const field = 'mt-1 w-full rounded-xl border-black/10 text-sm';

export default function SettingsForm({ profile, busy }: { profile: P; busy: { date: string; track: string }[] }) {
  const router = useRouter();
  const [v, setV] = useState(profile);
  const [b, setB] = useState({ date: '', track: 'both' });
  const [msg, setMsg] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const num = (k: keyof P) => (e: React.ChangeEvent<HTMLInputElement>) => setV({ ...v, [k]: Number(e.target.value.replace(/\D/g, '')) || 0 });

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <section className="glass-card rounded-3xl p-6">
        <h2 className="text-lg font-bold text-text-main">Profil & target harian</h2>
        <div className="mt-3 grid gap-3">
          <label className="text-[13px] text-text-main">Nama<input value={v.displayName} onChange={(e) => setV({ ...v, displayName: e.target.value })} className={field} /></label>
          <label className="text-[13px] text-text-main">
            Zona waktu
            <select value={v.timezone} onChange={(e) => setV({ ...v, timezone: e.target.value })} className={field}>
              {TZ.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
            <span className="text-[11px] text-text-secondary">Ganti ke Asia/Tokyo saat pindah ke Jepang. Riwayat aman karena tanggal lokal disimpan per event.</span>
          </label>
          <label className="text-[13px] text-text-main">
            Hari berganti pukul
            <select value={v.dayStartHour} onChange={(e) => setV({ ...v, dayStartHour: Number(e.target.value) })} className={field}>
              {[0, 1, 2, 3, 4, 5].map((h) => <option key={h} value={h}>{String(h).padStart(2, '0')}:00{h === 3 ? ' (untuk belajar larut)' : ''}</option>)}
            </select>
          </label>
          <div className="grid grid-cols-3 gap-2">
            <label className="text-[13px] text-text-main">Goal 日本語<input value={v.dailyGoalJp} onChange={num('dailyGoalJp')} inputMode="numeric" className={field} /></label>
            <label className="text-[13px] text-text-main">Goal DSA<input value={v.dailyGoalDsa} onChange={num('dailyGoalDsa')} inputMode="numeric" className={field} /></label>
            <label className="text-[13px] text-text-main">Ambang streak<input value={v.streakMinXp} onChange={num('streakMinXp')} inputMode="numeric" className={field} /></label>
          </div>
          <button type="button" disabled={pending} onClick={() => start(async () => { const r = await saveProfile({ ...v, timezone: v.timezone as never }); setMsg(r.ok ? 'Pengaturan tersimpan.' : (r.error ?? null)); router.refresh(); })} className="rounded-full bg-[#0066cc] py-2.5 text-sm font-semibold text-white disabled:opacity-50">
            Simpan pengaturan
          </button>
        </div>
      </section>

      <section className="glass-card rounded-3xl p-6">
        <h2 className="text-lg font-bold text-text-main">Mode sibuk 💼</h2>
        <p className="text-[12px] text-text-secondary">Ambang streak turun ke 5 XP pada hari itu. Pasang sebelum harinya mulai; maks 3 hari per bulan per jalur.</p>
        <div className="mt-3 flex flex-wrap gap-2">
          <input type="date" value={b.date} onChange={(e) => setB({ ...b, date: e.target.value })} className="rounded-xl border-black/10 text-sm" aria-label="Tanggal sibuk" />
          <select value={b.track} onChange={(e) => setB({ ...b, track: e.target.value })} className="rounded-xl border-black/10 text-sm" aria-label="Jalur">
            <option value="both">Kedua jalur</option><option value="jp">日本語</option><option value="dsa">DSA</option>
          </select>
          <button type="button" disabled={!b.date || pending} onClick={() => start(async () => { const r = await addBusyDay({ date: b.date, track: b.track as 'jp' | 'dsa' | 'both' }); setMsg(r.ok ? 'Mode sibuk dipasang.' : (r.error ?? null)); router.refresh(); })} className="rounded-full bg-[#1d1d1f] px-4 text-[13px] font-semibold text-white disabled:opacity-40">Pasang</button>
        </div>
        <ul className="mt-3 space-y-1.5">
          {busy.length === 0 && <li className="text-[13px] text-text-secondary">Belum ada hari sibuk yang akan datang.</li>}
          {busy.map((d) => (
            <li key={`${d.date}-${d.track}`} className="flex items-center justify-between text-[13px]">
              <span>{d.date} · {d.track === 'jp' ? '日本語' : 'DSA'}</span>
              <button type="button" onClick={() => start(async () => { await removeBusyDay(d.date, d.track); router.refresh(); })} className="text-text-secondary hover:text-[#c2452d]">Hapus</button>
            </li>
          ))}
        </ul>

        <h2 className="mt-6 text-lg font-bold text-text-main">Data</h2>
        <p className="text-[12px] text-text-secondary">Semua aktivitas disimpan sebagai event, jadi XP dan streak bisa dihitung ulang. Simpan cadangan JSON secara berkala.</p>
        <div className="mt-3 flex flex-wrap gap-2">
          <a href="/api/dojo/export" className="rounded-full bg-[#0066cc] px-4 py-2 text-[13px] font-semibold text-white">Ekspor JSON</a>
          <form action={logoutEverywhere}>
            <button type="submit" className="rounded-full border border-black/10 px-4 py-2 text-[13px] font-semibold text-[#c2452d]">Keluar dari semua perangkat</button>
          </form>
        </div>
      </section>
      {msg && <p className="text-center text-[13px] text-text-secondary md:col-span-2" role="status">{msg}</p>}
    </div>
  );
}
