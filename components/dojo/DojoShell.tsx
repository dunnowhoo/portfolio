'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { logoutAction } from '@/app/actions/auth';
import AwardToaster from '@/components/dojo/AwardToaster';

const MAIN = [
  { seg: 'beranda', icon: 'home', label: 'Beranda' },
  { seg: 'nihongo', icon: 'translate', label: '日本語' },
  { seg: 'dsa', icon: 'code', label: 'DSA' },
  { seg: 'hari-ini', icon: 'today', label: 'Hari ini' },
  { seg: 'profil', icon: 'person', label: 'Profil' },
];
const MORE = [
  { seg: 'target', icon: 'flag', label: 'Target' },
  { seg: 'kalender', icon: 'calendar_month', label: 'Kalender' },
  { seg: 'review', icon: 'replay', label: 'Review' },
  { seg: 'materi', icon: 'menu_book', label: 'Materi' },
  { seg: 'cms', icon: 'edit_note', label: 'Editor portfolio' },
  { seg: 'pengaturan', icon: 'settings', label: 'Pengaturan' },
];

type Chip = { jp: number; dsa: number; jpSafe: boolean; dsaSafe: boolean };

function StreakChip({ gate, chip, className = '' }: { gate: string; chip: Chip; className?: string }) {
  return (
    <Link href={`/${gate}/beranda`} className={`flex items-center gap-2 rounded-full bg-white/80 px-3 py-1.5 text-[13px] font-semibold tabular-nums shadow-sm ${className}`} aria-label={`Streak 日本語 ${chip.jp} hari, DSA ${chip.dsa} hari`}>
      <span className={chip.jpSafe ? 'text-[#e8453c]' : 'text-[#aeaeb2]'}>🔥{chip.jp}</span>
      <span className="text-black/15">·</span>
      <span className={chip.dsaSafe ? 'text-[#0066cc]' : 'text-[#aeaeb2]'}>🔥{chip.dsa}</span>
    </Link>
  );
}

export default function DojoShell({ gate, chip, children }: { gate: string; chip: Chip; children: React.ReactNode }) {
  const pathname = usePathname();
  const [moreOpen, setMoreOpen] = useState(false);
  const href = (seg: string) => `/${gate}/${seg}`;
  const isActive = (seg: string) => pathname === href(seg) || pathname.startsWith(`${href(seg)}/`);

  return (
    <>
      {/* Desktop: pill melayang seperti navbar portfolio */}
      <nav className="hidden md:block fixed top-6 left-1/2 -translate-x-1/2 z-50" aria-label="Navigasi Dōjō">
        <div className="glass-nav rounded-full p-1.5 flex items-center gap-1 shadow-lg border border-white/40">
          {[...MAIN, ...MORE].map((item) => {
            const active = isActive(item.seg);
            return (
              <Link
                key={item.seg}
                href={href(item.seg)}
                title={item.label}
                className={`flex items-center gap-1.5 rounded-full transition-all duration-300 ${active ? 'bg-[#0066cc]/10 px-4 py-2.5 text-[#0066cc]' : 'px-2.5 py-2.5 text-text-secondary hover:bg-gray-100 hover:text-text-main'}`}
              >
                <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
                {active && <span className="text-[13px] font-medium whitespace-nowrap font-jp">{item.label}</span>}
              </Link>
            );
          })}
          <StreakChip gate={gate} chip={chip} className="ml-1" />
          <form action={logoutAction}>
            <button type="submit" title="Keluar" className="px-2.5 py-2.5 rounded-full text-text-secondary hover:bg-gray-100 hover:text-[#c2452d] transition-colors">
              <span className="material-symbols-outlined text-[20px]">logout</span>
            </button>
          </form>
        </div>
      </nav>

      <AwardToaster />
      <StreakChip gate={gate} chip={chip} className="fixed right-4 top-4 z-40 md:hidden" />
      <main className="relative z-10 container mx-auto px-4 md:px-6 pt-8 md:pt-28 pb-28 md:pb-20 max-w-7xl">{children}</main>

      {/* HP: tab bar bawah */}
      <nav className="md:hidden fixed inset-x-0 bottom-0 z-50 glass-nav border-t border-white/50 pb-[env(safe-area-inset-bottom)]" aria-label="Navigasi Dōjō">
        <div className="grid grid-cols-6">
          {MAIN.map((item) => {
            const active = isActive(item.seg);
            return (
              <Link key={item.seg} href={href(item.seg)} className={`flex flex-col items-center gap-0.5 py-2.5 ${active ? 'text-[#0066cc]' : 'text-text-secondary'}`}>
                <span className="material-symbols-outlined text-[22px]">{item.icon}</span>
                <span className="text-[10px] font-medium font-jp">{item.label}</span>
              </Link>
            );
          })}
          <button type="button" onClick={() => setMoreOpen((v) => !v)} className="flex flex-col items-center gap-0.5 py-2.5 text-text-secondary" aria-expanded={moreOpen}>
            <span className="material-symbols-outlined text-[22px]">more_horiz</span>
            <span className="text-[10px] font-medium">Lainnya</span>
          </button>
        </div>
        {moreOpen && (
          <div className="absolute bottom-full inset-x-3 mb-3 glass-card-strong rounded-3xl p-2 flex flex-col">
            {MORE.map((item) => (
              <Link key={item.seg} href={href(item.seg)} onClick={() => setMoreOpen(false)} className="flex items-center gap-3 px-4 py-3 rounded-2xl text-sm text-text-main hover:bg-white/70">
                <span className="material-symbols-outlined text-[20px] text-text-secondary">{item.icon}</span>
                {item.label}
              </Link>
            ))}
            <form action={logoutAction}>
              <button type="submit" className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm text-[#c2452d] hover:bg-white/70">
                <span className="material-symbols-outlined text-[20px]">logout</span>
                Keluar
              </button>
            </form>
          </div>
        )}
      </nav>
    </>
  );
}
