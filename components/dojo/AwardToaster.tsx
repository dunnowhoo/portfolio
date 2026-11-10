'use client';

import { useEffect, useState } from 'react';
import type { AwardResult } from '@/lib/dojo/engine/core';
import { beltFor } from '@/lib/dojo/level';
import { DARU_GEAR, daruTier, nextGear } from '@/lib/dojo/daru';
import DaruAvatar from './DaruAvatar';
import DojoIcon from './DojoIcon';
import type { DojoIconName } from '@/lib/dojo/icons';

// Umpan balik XP global: komponen mana pun cukup memanggil emitAward(result).
export function emitAward(result: AwardResult) {
  window.dispatchEvent(new CustomEvent<AwardResult>('dojo:award', { detail: result }));
}

type Toast = { id: number; text: string; tone: 'xp' | 'goal' | 'streak' | 'repair'; icon?: DojoIconName };

export default function AwardToaster() {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [up, setUp] = useState<{ level: number; prev: number } | null>(null);

  useEffect(() => {
    let id = 0;
    const onAward = (e: Event) => {
      const r = (e as CustomEvent<AwardResult>).detail;
      if (!r || r.duplicate) return;
      const next: Toast[] = [];
      // XP lencana dicatat terpisah (tidak termasuk r.xp)
      const base = r.xp - r.events.filter((x) => x.type !== 'badge').reduce((a, x) => a + x.xp, 0);
      if (base > 0) next.push({ id: ++id, text: `+${base} XP`, tone: 'xp' });
      for (const ev of r.events) {
        next.push({ id: ++id, text: ev.xp ? `${ev.label} · +${ev.xp} XP` : ev.label, tone: ev.type === 'daily_goal' || ev.type === 'badge' ? 'goal' : ev.type === 'streak_repair' ? 'repair' : 'streak' });
      }
      if (r.qualified && r.streak) next.push({ id: ++id, text: `Streak ${r.streak.track === 'jp' ? '日本語' : 'DSA'} aman · ${r.streak.current} hari`, tone: 'streak', icon: r.streak.track === 'jp' ? 'flame' : 'flame-blue' });
      if (r.nitoryu) next.push({ id: ++id, text: `二刀流 · kedua streak aman (${r.nitoryu} hari)`, tone: 'streak' });
      setToasts((t) => [...t, ...next].slice(-5));
      for (const t of next) window.setTimeout(() => setToasts((all) => all.filter((x) => x.id !== t.id)), 3600);
      if (r.level > r.prevLevel) setUp((u) => ({ level: r.level, prev: u ? Math.min(u.prev, r.prevLevel) : r.prevLevel }));
    };
    window.addEventListener('dojo:award', onAward);
    return () => window.removeEventListener('dojo:award', onAward);
  }, []);

  const belt = up ? beltFor(up.level) : null;
  const tier = up ? daruTier(up.level) : 0;
  const prevTier = up ? daruTier(up.prev) : 0;
  const gotGear = tier > prevTier;
  const nx = up ? nextGear(up.level) : null;

  return (
    <>
      <div className="pointer-events-none fixed left-1/2 top-4 md:top-24 z-[70] flex -translate-x-1/2 flex-col items-center gap-2" role="status" aria-live="polite">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold shadow-lg border backdrop-blur-md motion-safe:animate-[toast-in_0.25s_ease-out] ${
              t.tone === 'xp'
                ? 'bg-[#fff8e1]/95 border-[#ffd76a] text-[#8a6100]'
                : t.tone === 'goal'
                  ? 'bg-[#eaf8ee]/95 border-[#b7e4c4] text-[#1f7a3a]'
                  : t.tone === 'repair'
                    ? 'bg-[#e8f6fd]/95 border-[#b3e0f5] text-[#0b6b94]'
                    : 'bg-[#fff1e6]/95 border-[#ffd2b0] text-[#a34b00]'
            }`}
          >
            {t.icon && <DojoIcon name={t.icon} className="h-4 w-4" />}
            {t.text}
          </div>
        ))}
      </div>
      {up && belt && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/30 p-6 backdrop-blur-sm" role="dialog" aria-modal="true" aria-label="Naik level">
          <div className="glass-card-strong w-full max-w-sm rounded-3xl p-8 text-center motion-safe:animate-[toast-in_0.3s_ease-out]">
            <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-text-secondary">Naik level</p>
            <div className="relative mx-auto mt-2 h-40 w-40">
              {gotGear && (
                <div aria-hidden="true" className="absolute inset-3 rounded-full blur-2xl motion-safe:animate-[daru-glow_1.4s_ease-out_both]" style={{ background: `radial-gradient(circle, ${belt.color} 0%, transparent 70%)`, opacity: 0.55 }} />
              )}
              {gotGear && <DaruAvatar tier={prevTier} eager className="absolute inset-0 h-full w-full opacity-0 motion-safe:animate-[daru-out_0.5s_ease-in_both] motion-reduce:hidden" />}
              <DaruAvatar tier={tier} eager className={`relative h-full w-full drop-shadow-xl ${gotGear ? 'motion-safe:animate-[daru-in_0.7s_cubic-bezier(.2,1.3,.4,1)_0.35s_both]' : ''}`} />
            </div>
            <p className="mt-1 text-5xl font-bold tabular-nums text-text-main">Lv {up.level}</p>
            <div className="mx-auto mt-5 h-3 w-40 rounded-full border" style={{ background: belt.color, borderColor: belt.edge }} aria-hidden="true" />
            <p className="mt-4 font-jp text-xl font-bold text-text-main" lang="ja">
              {belt.obi} · {belt.title}
            </p>
            <p className="text-sm text-text-secondary">
              {belt.romaji} · {belt.titleRomaji}
            </p>
            {gotGear ? (
              <div className="mt-4 rounded-2xl bg-white px-4 py-3">
                <p className="text-sm font-semibold text-text-main">Perlengkapan baru: {DARU_GEAR[tier].name}</p>
                <p className="text-xs text-text-secondary">{DARU_GEAR[tier].note}</p>
              </div>
            ) : (
              nx && <p className="mt-4 text-xs text-text-secondary">Perlengkapan berikutnya di Lv {nx.atLevel}: {nx.gear.name}</p>
            )}
            <p className="mt-4 font-jp text-base text-text-main" lang="ja">
              よくできました！
            </p>
            <button type="button" autoFocus onClick={() => setUp(null)} className="mt-6 w-full rounded-full bg-[#0066cc] py-3 text-sm font-semibold text-white hover:bg-[#0077ed]">
              Lanjut berlatih
            </button>
          </div>
        </div>
      )}
    </>
  );
}
