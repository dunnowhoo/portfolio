'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';

export type DayXp = { jp: number; dsa: number; general: number };
type Mode = 'all' | 'jp' | 'dsa';
const COLORS: Record<Mode, string> = { all: '#0066cc', jp: '#e8453c', dsa: '#0066cc' };
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
const CELL = 11;
const GAP = 3;

function level(xp: number): number {
  if (xp <= 0) return 0;
  if (xp < 15) return 1;
  if (xp < 50) return 2;
  if (xp < 100) return 3;
  return 4;
}

export default function Heatmap({ year, data, years, basePath, compact = false }: { year: number; data: Record<string, DayXp>; years?: number[]; basePath?: string; compact?: boolean }) {
  const [mode, setMode] = useState<Mode>('all');
  const { weeks, monthCols, total, active } = useMemo(() => {
    const start = new Date(Date.UTC(year, 0, 1));
    const offset = (start.getUTCDay() + 6) % 7; // Senin = 0
    const days: { date: string; xp: number }[] = [];
    for (let d = new Date(start); d.getUTCFullYear() === year; d.setUTCDate(d.getUTCDate() + 1)) {
      const key = d.toISOString().slice(0, 10);
      const v = data[key];
      const xp = !v ? 0 : mode === 'all' ? v.jp + v.dsa + v.general : v[mode];
      days.push({ date: key, xp });
    }
    const cells: ({ date: string; xp: number } | null)[] = [...Array(offset).fill(null), ...days];
    const weeks: ({ date: string; xp: number } | null)[][] = [];
    for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));
    const monthCols: { m: number; col: number }[] = [];
    weeks.forEach((w, col) => {
      const first = w.find((c) => c && c.date.endsWith('-01'));
      if (first) monthCols.push({ m: Number(first.date.slice(5, 7)) - 1, col });
    });
    return { weeks, monthCols, total: days.reduce((a, d) => a + d.xp, 0), active: days.filter((d) => d.xp > 0).length };
  }, [data, year, mode]);

  const color = COLORS[mode];
  const width = weeks.length * (CELL + GAP);
  const height = 7 * (CELL + GAP) + 16;
  const fill = (lv: number) => (lv === 0 ? '#ebebf0' : color);
  const opacity = (lv: number) => (lv === 0 ? 1 : [0, 0.28, 0.5, 0.75, 1][lv]);

  return (
    <div>
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div className="flex gap-1 rounded-full bg-white p-1 shadow-sm" role="tablist" aria-label="Pilih jalur heatmap">
          {(['all', 'jp', 'dsa'] as const).map((m) => (
            <button key={m} type="button" role="tab" aria-selected={mode === m} onClick={() => setMode(m)} className={`rounded-full px-3 py-1 text-[12px] font-medium ${mode === m ? 'bg-[#0066cc]/10 text-[#0066cc]' : 'text-text-secondary'}`}>
              {m === 'all' ? 'Gabungan' : m === 'jp' ? '日本語' : 'DSA'}
            </button>
          ))}
        </div>
        <p className="text-[12px] text-text-secondary tabular-nums">
          {active} hari aktif · {total.toLocaleString('id-ID')} XP di {year}
        </p>
        {years && years.length > 1 && basePath && (
          <div className="flex gap-1">
            {years.map((y) => (
              <Link key={y} href={`${basePath}?year=${y}`} className={`rounded-full px-2.5 py-1 text-[12px] ${y === year ? 'bg-[#1d1d1f] text-white' : 'text-text-secondary hover:bg-black/5'}`}>
                {y}
              </Link>
            ))}
          </div>
        )}
      </div>
      <div className="overflow-x-auto no-scrollbar">
        <svg width={width} height={height} role="img" aria-label={`Heatmap aktivitas ${year}`} className={compact ? 'max-w-none' : ''}>
          {monthCols.map(({ m, col }) => (
            <text key={`${m}-${col}`} x={col * (CELL + GAP)} y={10} fontSize="10" fill="#86868b">
              {MONTHS[m]}
            </text>
          ))}
          {weeks.map((w, col) =>
            w.map((c, row) =>
              c ? (
                <rect key={c.date} x={col * (CELL + GAP)} y={16 + row * (CELL + GAP)} width={CELL} height={CELL} rx={2.5} fill={fill(level(c.xp))} fillOpacity={opacity(level(c.xp))}>
                  <title>{`${c.date}: ${c.xp} XP`}</title>
                </rect>
              ) : null,
            ),
          )}
        </svg>
      </div>
      <div className="mt-2 flex items-center justify-end gap-1 text-[11px] text-text-secondary">
        Sedikit
        {[0, 1, 2, 3, 4].map((lv) => (
          <span key={lv} className="inline-block h-[11px] w-[11px] rounded-[2.5px]" style={{ background: fill(lv), opacity: opacity(lv) }} />
        ))}
        Banyak
      </div>
    </div>
  );
}
