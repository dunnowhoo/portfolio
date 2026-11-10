'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';
import { reviewItem } from '@/app/actions/today';
import { emitAward } from '@/components/dojo/AwardToaster';
import { RATING_LABEL, type Rating } from '@/lib/dojo/engine/srs';

export type ReviewRow = { id: string; title: string; sub: string; track: 'jp' | 'dsa'; due: string; stars: number; problem: boolean; overdue: number };

export default function ReviewList({ gate, rows }: { gate: string; rows: ReviewRow[] }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [quick, setQuick] = useState<Record<string, boolean>>({});
  const [msg, setMsg] = useState<Record<string, string>>({});
  if (!rows.length) return <p className="rounded-3xl bg-white p-6 text-sm text-text-secondary">Tidak ada soal atau node yang jatuh tempo. お疲れさま！</p>;
  return (
    <ul className="space-y-3">
      {rows.map((r) => (
        <li key={r.id} className="rounded-3xl border border-black/5 bg-white p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <Link href={`/${gate}/${r.track === 'jp' ? 'nihongo' : 'dsa'}?node=${encodeURIComponent(r.id)}`} className="font-semibold text-text-main hover:text-[#0066cc]">
                {r.title}
              </Link>
              <p className="text-[13px] text-text-secondary">
                {r.sub} · jatuh tempo {r.due}
                {r.overdue > 0 ? ` (telat ${r.overdue} hari)` : ''}
              </p>
            </div>
            <span className="text-[13px] text-[#ffb800]" aria-label={`${r.stars} bintang`}>
              {'★'.repeat(r.stars)}
              <span className="text-[#d1d1d6]">{'★'.repeat(Math.max(0, 3 - r.stars))}</span>
            </span>
          </div>
          {r.problem && (
            <label className="mt-2 flex items-center gap-2 text-[12px] text-text-secondary">
              <input type="checkbox" checked={!!quick[r.id]} onChange={(e) => setQuick((q) => ({ ...q, [r.id]: e.target.checked }))} className="rounded border-black/20 text-[#0066cc]" />
              Mode cepat: recall pola + kompleksitas (tidak bisa naik ke ★3)
            </label>
          )}
          <div className="mt-3 grid grid-cols-4 gap-1.5">
            {([1, 2, 3, 4] as Rating[]).map((rt) => (
              <button
                key={rt}
                type="button"
                disabled={pending}
                onClick={() =>
                  start(async () => {
                    const res = await reviewItem({ id: r.id, rating: rt, quick: !!quick[r.id] });
                    if (res.ok && res.result) emitAward(res.result);
                    setMsg((m) => ({ ...m, [r.id]: res.ok ? (res.message ?? '') : res.error }));
                    router.refresh();
                  })
                }
                className="rounded-xl border border-black/10 py-2 text-[13px] font-medium text-text-main hover:border-[#0066cc] disabled:opacity-50"
              >
                {RATING_LABEL[rt]}
              </button>
            ))}
          </div>
          {msg[r.id] && <p className="mt-2 text-[12px] text-text-secondary">{msg[r.id]}</p>}
        </li>
      ))}
    </ul>
  );
}
