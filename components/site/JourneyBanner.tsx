'use client';

import React, { useEffect, useRef, useState } from 'react';
import SecretLogin from './SecretLogin';

// Menggantikan kartu Spotify. Rute belajar menuju Tokyo + Daruma.
// Mata kanan Daruma yang masih kosong adalah pintu masuk Dōjō:
// klik 3x dalam 1,5 detik, atau tekan lama ±0,9 detik (HP).

type Station = { jp: string; label: string; when: string; date: string };

const STATIONS: Station[] = [
  { jp: 'かな', label: 'Kana', when: "Nov '26", date: '2026-11-30' },
  { jp: 'N5', label: 'JLPT N5', when: "Jul '27", date: '2027-07-04' },
  { jp: 'N4', label: 'JLPT N4', when: "Dec '27", date: '2027-12-05' },
  { jp: 'N3', label: 'JLPT N3', when: "Jul '28", date: '2028-07-02' },
  { jp: '東京', label: 'Tokyo', when: "Oct '28", date: '2028-10-01' },
];

function currentStationIndex(now: number): number {
  const idx = STATIONS.findIndex((s) => new Date(`${s.date}T23:59:59`).getTime() >= now);
  return idx === -1 ? STATIONS.length - 1 : idx;
}

const JourneyBanner = () => {
  const [open, setOpen] = useState(false);
  const [now, setNow] = useState<number | null>(null);
  const clicks = useRef<number[]>([]);
  const pressTimer = useRef<number | null>(null);

  // Tanggal dihitung di browser supaya tidak "membeku" di tanggal build
  useEffect(() => setNow(Date.now()), []);

  const current = now === null ? -1 : currentStationIndex(now);
  const fillPct = current <= 0 ? 0 : current * 20;

  const onEyeClick = () => {
    const t = Date.now();
    clicks.current = [...clicks.current.filter((c) => t - c < 1500), t];
    if (clicks.current.length >= 3) {
      clicks.current = [];
      setOpen(true);
    }
  };
  const startPress = () => {
    pressTimer.current = window.setTimeout(() => setOpen(true), 900);
  };
  const cancelPress = () => {
    if (pressTimer.current !== null) window.clearTimeout(pressTimer.current);
    pressTimer.current = null;
  };

  return (
    <div className="glass-card bento-hover rounded-3xl md:col-span-4 lg:col-span-4 row-span-1 min-h-[352px] overflow-hidden p-0 flex flex-col md:flex-row items-stretch">
      {/* Teks + rute */}
      <div className="flex-1 p-6 md:p-10 flex flex-col justify-center gap-5 min-w-0">
        <div className="inline-flex self-start items-center gap-2 px-3 py-1 rounded-full bg-white/50 border border-white/60 text-gray-600 text-[10px] md:text-[11px] font-semibold uppercase tracking-wider shadow-sm">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#e8453c] opacity-60"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-[#e8453c]"></span>
          </span>
          Now · 2026 → 2028
        </div>

        <div>
          <h3 className="text-3xl md:text-4xl font-bold leading-tight tracking-tight text-text-main">
            On the road <span className="text-[#86868b]">to Tokyo.</span>
          </h3>
          <p className="mt-3 text-text-secondary text-sm md:text-base leading-relaxed max-w-md">
            Leveling up every day: Japanese from kana to JLPT N3, and the data structures &amp; algorithms that keep
            my engineering sharp.
          </p>
        </div>

        {/* Rute ala peta kereta */}
        <ol className="relative grid grid-cols-5 pt-1" aria-label="Learning route">
          <span aria-hidden="true" className="absolute left-[10%] right-[10%] top-[13px] h-[3px] rounded-full bg-[#e5e5ea]" />
          <span
            aria-hidden="true"
            className="absolute left-[10%] top-[13px] h-[3px] rounded-full bg-[#e8453c] transition-[width] duration-700"
            style={{ width: `${fillPct}%` }}
          />
          {STATIONS.map((s, i) => {
            const passed = current > i;
            const isNow = current === i;
            const terminus = i === STATIONS.length - 1;
            return (
              <li key={s.jp} className="relative flex flex-col items-center gap-1.5 text-center" title={s.label}>
                <span className="relative flex h-7 w-7 items-center justify-center">
                  {isNow && <span className="absolute inline-flex h-full w-full rounded-full bg-[#e8453c]/25 animate-ping" />}
                  <span
                    className={[
                      'relative rounded-full transition-colors',
                      terminus ? 'h-6 w-6 border-[3px] ring-2 ring-offset-2 ring-offset-white' : 'h-5 w-5 border-[3px]',
                      passed ? 'bg-[#e8453c] border-[#e8453c] ring-[#e8453c]' : 'bg-white',
                      isNow ? 'border-[#e8453c] ring-[#e8453c]' : '',
                      !passed && !isNow ? 'border-[#d1d1d6] ring-[#d1d1d6]' : '',
                    ].join(' ')}
                  />
                </span>
                <span className="font-jp text-sm md:text-base font-bold text-text-main leading-none">{s.jp}</span>
                <span className="text-[9px] md:text-[10px] font-semibold uppercase tracking-wide text-text-secondary leading-none">
                  {s.when}
                </span>
              </li>
            );
          })}
        </ol>
      </div>

      {/* Daruma */}
      <div className="md:w-[36%] flex flex-col items-center justify-center gap-3 pb-6 md:py-6 md:border-l border-white/40">
        <svg viewBox="0 0 200 220" className="w-36 h-40 md:w-44 md:h-48 drop-shadow-xl select-none" aria-hidden="true">
          <defs>
            <radialGradient id="daruma-body" cx="35%" cy="30%" r="80%">
              <stop offset="0%" stopColor="#f46a5f" />
              <stop offset="60%" stopColor="#e8453c" />
              <stop offset="100%" stopColor="#c2342d" />
            </radialGradient>
          </defs>
          <ellipse cx="100" cy="208" rx="62" ry="7" fill="#000" opacity="0.08" />
          <path d="M100 12 C150 12 182 58 182 112 C182 170 148 206 100 206 C52 206 18 170 18 112 C18 58 50 12 100 12 Z" fill="url(#daruma-body)" />
          <ellipse cx="66" cy="52" rx="22" ry="12" fill="#fff" opacity="0.22" transform="rotate(-25 66 52)" />
          <ellipse cx="100" cy="94" rx="54" ry="47" fill="#fff8f0" />
          <path d="M60 70 Q75 57 90 66" fill="none" stroke="#1d1d1f" strokeWidth="6" strokeLinecap="round" />
          <path d="M110 66 Q125 57 140 70" fill="none" stroke="#1d1d1f" strokeWidth="6" strokeLinecap="round" />
          {/* Mata kiri: sudah dicat (target dipasang) */}
          <circle cx="77" cy="90" r="13" fill="#fff" stroke="#1d1d1f" strokeWidth="2.5" />
          <circle cx="77" cy="90" r="8.5" fill="#1d1d1f" />
          {/* Mata kanan: masih kosong = pintu rahasia */}
          <circle cx="123" cy="90" r="13" fill="#fff" stroke="#1d1d1f" strokeWidth="2.5" />
          <circle
            cx="123"
            cy="90"
            r="17"
            fill="transparent"
            style={{ cursor: 'default', pointerEvents: 'all', WebkitTapHighlightColor: 'transparent' }}
            onClick={onEyeClick}
            onPointerDown={startPress}
            onPointerUp={cancelPress}
            onPointerLeave={cancelPress}
            onPointerCancel={cancelPress}
            onContextMenu={(e) => e.preventDefault()}
          />
          <path d="M80 114 Q90 106 100 113 Q110 106 120 114" fill="none" stroke="#3a3a3c" strokeWidth="4" strokeLinecap="round" />
          <path d="M94 124 Q100 128 106 124" fill="none" stroke="#3a3a3c" strokeWidth="3" strokeLinecap="round" />
          <text
            x="100"
            y="182"
            textAnchor="middle"
            fontSize="38"
            fontWeight="700"
            fill="#f5c04a"
            style={{ fontFamily: "'Hiragino Mincho ProN','Yu Mincho','Noto Serif JP',serif" }}
          >
            道
          </text>
        </svg>
        <p className="text-[11px] font-medium text-text-secondary text-center px-6">
          <span className="font-jp">達磨</span> · one eye painted, one to go
        </p>
      </div>

      <SecretLogin open={open} onClose={() => setOpen(false)} />
    </div>
  );
};

export default JourneyBanner;
