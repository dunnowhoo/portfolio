'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { Sym } from '@/components/dojo/Sym';

export type MateriItem = { id: string; track: 'jp' | 'dsa'; title: string; estMinutes: number; tags: string[]; read: boolean; nodes: number };

export default function MateriList({ gate, items }: { gate: string; items: MateriItem[] }) {
  const [q, setQ] = useState('');
  const [track, setTrack] = useState<'all' | 'jp' | 'dsa'>('all');
  const shown = useMemo(() => {
    const s = q.trim().toLowerCase();
    return items.filter((m) => (track === 'all' || m.track === track) && (!s || m.title.toLowerCase().includes(s) || m.tags.some((t) => t.toLowerCase().includes(s))));
  }, [items, q, track]);
  return (
    <div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Cari judul atau tag (mis. graph, n5, keigo)…" className="w-full rounded-full border-black/10 bg-white px-5 py-2.5 text-sm sm:max-w-md" aria-label="Cari materi" />
        <div className="flex gap-1 rounded-full bg-white p-1 shadow-sm" role="tablist">
          {(['all', 'jp', 'dsa'] as const).map((t) => (
            <button key={t} type="button" role="tab" aria-selected={track === t} onClick={() => setTrack(t)} className={`rounded-full px-4 py-1.5 text-[13px] font-medium ${track === t ? 'bg-[#0066cc]/10 text-[#0066cc]' : 'text-text-secondary'}`}>
              {t === 'all' ? 'Semua' : t === 'jp' ? '日本語' : 'DSA'}
            </button>
          ))}
        </div>
      </div>
      <ul className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {shown.map((m) => (
          <li key={m.id}>
            <Link href={`/${gate}/materi/${m.id}`} className="glass-card bento-hover flex h-full flex-col gap-2 rounded-3xl p-5">
              <div className="flex items-center justify-between">
                <span className="rounded-full px-2.5 py-0.5 text-[11px] font-semibold" style={{ background: m.track === 'jp' ? '#fdecea' : '#e6f0fa', color: m.track === 'jp' ? '#c2342d' : '#0057ad' }}>
                  {m.track === 'jp' ? '日本語' : 'DSA'}
                </span>
                {m.read && (
                  <span className="inline-flex items-center gap-0.5 text-[12px] font-medium text-[#1f7a3a]">
                    Sudah dibaca <Sym name="check" className="text-[14px]" />
                  </span>
                )}
              </div>
              <p className="font-semibold leading-snug text-text-main">{m.title}</p>
              <p className="mt-auto text-[12px] text-text-secondary">
                ±{m.estMinutes} mnt{m.nodes ? ` · dipakai di ${m.nodes} node` : ''}
                {m.tags.length ? ` · ${m.tags.slice(0, 3).join(', ')}` : ''}
              </p>
            </Link>
          </li>
        ))}
      </ul>
      {!shown.length && <p className="mt-8 text-center text-sm text-text-secondary">Tidak ada materi yang cocok. Coba kata lain.</p>}
    </div>
  );
}
