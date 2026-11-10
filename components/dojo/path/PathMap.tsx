'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useRef, useState } from 'react';
import NodeSheet, { TRACK_COLOR } from '@/components/dojo/path/NodeSheet';
import type { NodeStatus, Pace } from '@/lib/dojo/curriculum';
import { NODE_ICON, NODE_LABEL, type PathNode, type Section, type Track, type Unit } from '@/lib/dojo/curriculum/types';
import type { DojoIconName } from '@/lib/dojo/icons';
import DojoIcon from '@/components/dojo/DojoIcon';
import { Stars, Sym } from '@/components/dojo/Sym';

export type PathSide = {
  streak: { current: number; freezes: number; status: string; todayXp: number; goal: number; threshold: number; minutesLeft: number; repairTarget?: number };
  level: { level: number; intoLevel: number; span: number };
  belt: { obi: string; title: string; color: string; edge: string };
};

type Props = {
  track: Track;
  sections: Section[];
  statuses: Record<string, NodeStatus>;
  mastery: Record<string, number>;
  dueIds: string[];
  pace: Pace;
  nextId?: string;
  today: string;
  side: PathSide;
  initialNode?: string;
};

const OFFSETS = [0, 44, 72, 44, 0, -44, -72, -44];
const ROW = 108;
const BOX = 320;
const SOFT = { jp: '#fdecea', dsa: '#e6f0fa' } as const;
const fmtShort = (d?: string) => (d ? new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'short' }).format(new Date(`${d}T00:00:00`)) : '');
const daysTo = (from: string, to?: string) => (to ? Math.round((Date.parse(`${to}T00:00:00Z`) - Date.parse(`${from}T00:00:00Z`)) / 86_400_000) : null);
const STATUS_TEXT: Record<NodeStatus, string> = { locked: 'terkunci', available: 'tersedia', in_progress: 'sedang berjalan', completed: 'selesai', skipped: 'dilewati' };

function railPath(n: number): string {
  const pts = Array.from({ length: n }, (_, i) => [BOX / 2 + OFFSETS[i % 8], i * ROW + 34] as const);
  if (!pts.length) return '';
  let d = `M ${pts[0][0]} ${pts[0][1]}`;
  for (let i = 1; i < pts.length; i++) {
    const [x0, y0] = pts[i - 1];
    const [x1, y1] = pts[i];
    const my = (y0 + y1) / 2;
    d += ` C ${x0} ${my}, ${x1} ${my}, ${x1} ${y1}`;
  }
  return d;
}

function StationSign({ unit, prev, next, done, total, color }: { unit: Unit; prev?: Unit; next?: Unit; done: number; total: number; color: string }) {
  return (
    <div className="mx-auto w-full max-w-md overflow-hidden rounded-2xl border border-black/5 bg-white shadow-soft">
      <div className="flex items-center justify-between px-4 pt-3 text-[11px] text-text-secondary">
        <span className="max-w-[45%] truncate">
          {prev && (
            <>
              <Sym name="chevron_left" className="text-[14px]" /> {prev.id} {prev.title}
            </>
          )}
        </span>
        <span className="max-w-[45%] truncate text-right">
          {next && (
            <>
              {next.id} {next.title} <Sym name="chevron_right" className="text-[14px]" />
            </>
          )}
        </span>
      </div>
      <div className="px-4 pb-3 pt-1 text-center">
        <p className="font-jp text-xl font-bold text-text-main" lang="ja">{unit.jp ?? unit.title}</p>
        {unit.jp && <p className="text-[13px] text-text-secondary">{unit.title}</p>}
        <p className="mt-1 text-[12px] text-text-secondary">
          Unit {unit.id} · {done}/{total} selesai{unit.start ? ` · ${fmtShort(unit.start)}–${fmtShort(unit.end)}` : ''}
        </p>
        {unit.note && <p className="mx-auto mt-2 max-w-xs rounded-xl bg-[#f5f5f7] px-3 py-1.5 text-[12px] text-[#3a3a3c]">{unit.note}</p>}
      </div>
      <div className="h-1.5" style={{ background: color }} aria-hidden="true" />
    </div>
  );
}

function NodeButton({ node, status, stars, due, isNext, color, soft, onOpen, nextRef }: { node: PathNode; status: NodeStatus; stars: number; due: boolean; isNext: boolean; color: string; soft: string; onOpen: () => void; nextRef?: React.Ref<HTMLButtonElement> }) {
  const big = node.type === 'boss' || node.type === 'milestone';
  const size = big ? 72 : 62;
  const done = status === 'completed' || status === 'skipped';
  const locked = status === 'locked';
  const shape = node.type === 'checkpoint' ? 'polygon(25% 3%, 75% 3%, 100% 50%, 75% 97%, 25% 97%, 0% 50%)' : undefined;
  const bg = done ? color : locked ? '#e5e5ea' : '#ffffff';
  return (
    <button
      ref={nextRef}
      type="button"
      onClick={onOpen}
      aria-label={`${NODE_LABEL[node.type]} ${node.title}, ${STATUS_TEXT[status]}, ${node.xp} XP`}
      className="group relative flex flex-col items-center focus:outline-none"
      style={{ width: 150 }}
    >
      {isNext && !done && (
        <span className="absolute -top-7 z-10 rounded-full px-2.5 py-0.5 text-[11px] font-bold text-white shadow motion-safe:animate-bounce" style={{ background: color }}>
          MULAI
        </span>
      )}
      <span className="relative flex items-center justify-center">
        {isNext && !done && <span className="absolute inset-0 rounded-full motion-safe:animate-ping" style={{ background: `${color}33` }} aria-hidden="true" />}
        <span
          className="relative flex items-center justify-center text-2xl shadow-sm ring-offset-2 transition-transform group-hover:scale-105 group-focus-visible:ring-2 group-focus-visible:ring-[#0066cc]"
          style={{
            width: size,
            height: size,
            background: bg,
            borderRadius: shape ? 0 : 9999,
            clipPath: shape,
            border: shape ? undefined : `3px solid ${locked ? '#d1d1d6' : color}`,
            boxShadow: !done && !locked ? `0 0 0 4px ${soft}` : undefined,
            filter: locked ? 'grayscale(1)' : undefined,
            opacity: locked ? 0.75 : 1,
          }}
        >
          {done ? <Sym name="check" bold className="text-[30px] text-white" /> : <DojoIcon name={NODE_ICON[node.type]} className="h-[60%] w-[60%]" />}
        </span>
        {locked && (
          <span className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-white text-[#8e8e93] shadow" aria-hidden="true">
            <span className="material-symbols-outlined text-[15px]">lock</span>
          </span>
        )}
        {due && (
          <span className="absolute -right-0.5 -top-0.5 h-3.5 w-3.5 rounded-full border-2 border-white bg-[#ff9500]" title="Perlu review" aria-hidden="true" />
        )}
      </span>
      {stars > 0 && <Stars n={stars} size="text-[14px]" className="mt-0.5" />}
      <span className={`mt-1 line-clamp-2 rounded-md bg-[#f5f5f7]/90 px-1.5 text-center text-[12px] leading-tight ${locked ? 'text-[#8e8e93]' : 'text-text-main'}`}>{node.title}</span>
    </button>
  );
}

export default function PathMap({ track, sections, statuses, mastery, dueIds, pace, nextId, today, side, initialNode }: Props) {
  const router = useRouter();
  const color = TRACK_COLOR[track];
  const soft = SOFT[track];
  const due = useMemo(() => new Set(dueIds), [dueIds]);
  const [open, setOpen] = useState<PathNode | null>(() => (initialNode ? (sections.flatMap((s) => s.units.flatMap((u) => u.nodes)).find((n) => n.id === initialNode) ?? null) : null));
  const nextRef = useRef<HTMLButtonElement>(null);
  const [nextVisible, setNextVisible] = useState(true);
  const units = useMemo(() => sections.flatMap((s) => s.units), [sections]);
  const currentSection = sections.find((s) => s.units.some((u) => u.nodes.some((n) => n.id === nextId)))?.id ?? sections[0]?.id;
  const [expanded, setExpanded] = useState<Set<string>>(() => new Set([currentSection]));

  useEffect(() => {
    const el = nextRef.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setNextVisible(e.isIntersecting), { rootMargin: '-80px 0px -80px 0px' });
    io.observe(el);
    return () => io.disconnect();
  }, [expanded, nextId]);

  const scrollToNext = () => {
    if (currentSection && !expanded.has(currentSection)) setExpanded((s) => new Set(s).add(currentSection));
    window.setTimeout(() => nextRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 60);
  };

  const sectionStats = (s: Section) => {
    const req = s.units.flatMap((u) => u.nodes).filter((n) => n.required);
    const done = req.filter((n) => statuses[n.id] === 'completed' || statuses[n.id] === 'skipped').length;
    return { done, total: req.length };
  };

  const levelPct = Math.round((side.level.intoLevel / side.level.span) * 100);
  const goalPct = Math.min(100, Math.round((side.streak.todayXp / side.streak.goal) * 100));

  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_300px]">
      <div className="min-w-0">
        {/* header jalur */}
        <div className="glass-card rounded-3xl p-6 md:p-8">
          <p className="text-[11px] font-semibold uppercase tracking-[0.08em]" style={{ color }}>
            Peta jalur
          </p>
          <div className="mt-1 flex flex-wrap items-end justify-between gap-3">
            <h1 className="font-jp text-3xl font-bold text-text-main md:text-4xl" lang={track === 'jp' ? 'ja' : undefined}>
              {track === 'jp' ? '日本語' : 'DSA'}
              <span className="ml-2 font-display text-lg font-medium text-text-secondary">{track === 'jp' ? 'kana → N3 → kerja' : 'fondasi → NeetCode 150 → interview'}</span>
            </h1>
            <span
              className={`rounded-full px-3 py-1 text-[13px] font-semibold ${pace.tone === 'behind' ? 'bg-[#fff4e0] text-[#9a5b00]' : pace.tone === 'ahead' ? 'bg-[#eaf8ee] text-[#1f7a3a]' : 'bg-[#f2f2f7] text-[#3a3a3c]'}`}
            >
              <Sym name={pace.tone === 'ok' ? 'check' : pace.tone === 'ahead' ? 'trending_up' : 'trending_down'} className="mr-1 text-[16px]" />
              {pace.label}
            </span>
          </div>
          <div className="mt-4 h-2 overflow-hidden rounded-full bg-black/5" aria-hidden="true">
            <div className="h-full rounded-full" style={{ width: `${Math.round((pace.actual / Math.max(1, pace.total)) * 100)}%`, background: color }} />
          </div>
          <p className="mt-2 text-[13px] text-text-secondary">
            {pace.actual}/{pace.total} node wajib · target sampai hari ini {pace.expected}
            {pace.plan ? ` · ${pace.plan}` : ''}
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            {nextId && (
              <button type="button" onClick={scrollToNext} className="rounded-full px-5 py-2.5 text-sm font-semibold text-white shadow-lg" style={{ background: color }}>
                Lanjutkan
              </button>
            )}
            <span className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[12px] text-text-secondary">
              {(
                [
                  ['materi', 'materi'],
                  ['video', 'video'],
                  track === 'jp' ? ['irodori', 'Irodori'] : ['target', 'soal'],
                  ['castle', 'checkpoint'],
                  ['oni', 'boss'],
                  ['banner', 'milestone'],
                ] as [DojoIconName, string][]
              ).map(([icon, text]) => (
                <span key={text} className="inline-flex items-center gap-1">
                  <DojoIcon name={icon} className="h-4 w-4" />
                  {text}
                </span>
              ))}
            </span>
          </div>
        </div>

        {/* section */}
        {sections.map((s) => {
          const st = sectionStats(s);
          const isOpen = expanded.has(s.id);
          const dLeft = daysTo(today, s.end);
          return (
            <section key={s.id} className="mt-8" aria-labelledby={`sec-${s.id}`}>
              <div className="glass-card flex flex-wrap items-center justify-between gap-3 rounded-3xl px-5 py-4">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-text-secondary">
                    Section {s.id.replace(/^S/, '')} {s.optional ? '· opsional' : ''}
                  </p>
                  <h2 id={`sec-${s.id}`} className="text-lg font-bold text-text-main">
                    {s.jp && <span className="font-jp mr-1.5" lang="ja">{s.jp}</span>}
                    {s.title}
                  </h2>
                  <p className="text-[12px] text-text-secondary">
                    {st.done}/{st.total} selesai
                    {s.end && dLeft !== null && dLeft >= 0 ? ` · berakhir ${fmtShort(s.end)} (D-${dLeft})` : ''}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="h-2 w-28 overflow-hidden rounded-full bg-black/5" aria-hidden="true">
                    <div className="h-full rounded-full" style={{ width: `${Math.round((st.done / Math.max(1, st.total)) * 100)}%`, background: color }} />
                  </div>
                  <button
                    type="button"
                    onClick={() => setExpanded((e) => { const n = new Set(e); if (n.has(s.id)) n.delete(s.id); else n.add(s.id); return n; })}
                    className="rounded-full border border-black/10 bg-white px-3 py-1.5 text-[13px] font-medium text-text-main"
                    aria-expanded={isOpen}
                  >
                    {isOpen ? 'Tutup' : `Tampilkan ${s.units.length} unit`}
                  </button>
                </div>
              </div>

              {isOpen &&
                s.units.map((u) => {
                  const idx = units.indexOf(u);
                  const req = u.nodes.filter((n) => n.required);
                  const done = req.filter((n) => statuses[n.id] === 'completed' || statuses[n.id] === 'skipped').length;
                  const markerIdx = pace.markerId === nextId ? -1 : u.nodes.findIndex((n) => n.id === pace.markerId);
                  return (
                    <div key={u.id} className="mt-8 [content-visibility:auto] [contain-intrinsic-size:auto_900px]">
                      <StationSign unit={u} prev={units[idx - 1]} next={units[idx + 1]} done={done} total={req.length} color={color} />
                      <div className="relative mx-auto mt-10" style={{ width: BOX, height: u.nodes.length * ROW }}>
                        <svg className="pointer-events-none absolute inset-0" width={BOX} height={u.nodes.length * ROW} aria-hidden="true">
                          <path d={railPath(u.nodes.length)} fill="none" stroke={color} strokeOpacity="0.35" strokeWidth="3" strokeDasharray="6 8" strokeLinecap="round" />
                        </svg>
                        {markerIdx >= 0 && (
                          <div className="absolute left-1/2 z-0 flex w-[min(92vw,560px)] -translate-x-1/2 items-center gap-2" style={{ top: markerIdx * ROW - 40 }} aria-label="Seharusnya di sini hari ini">
                            <span className="h-px flex-1 border-t border-dashed border-[#ff9500]" />
                            <span className="whitespace-nowrap rounded-full bg-[#fff4e0] px-2 py-0.5 text-[11px] font-semibold text-[#9a5b00]">Seharusnya di sini hari ini</span>
                            <span className="h-px flex-1 border-t border-dashed border-[#ff9500]" />
                          </div>
                        )}
                        {u.nodes.map((n, i) => (
                          <div key={n.id} className="absolute z-[1]" style={{ top: i * ROW, left: BOX / 2 + OFFSETS[i % 8] - 75 }}>
                            <NodeButton
                              node={n}
                              status={statuses[n.id] ?? 'locked'}
                              stars={mastery[n.id] ?? 0}
                              due={due.has(n.id)}
                              isNext={n.id === nextId}
                              color={color}
                              soft={soft}
                              onOpen={() => setOpen(n)}
                              nextRef={n.id === nextId ? nextRef : undefined}
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
            </section>
          );
        })}
      </div>

      {/* panel samping (layar lebar) */}
      <aside className="hidden xl:block">
        <div className="sticky top-28 space-y-4">
          <div className="glass-card rounded-3xl p-5">
            <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-text-secondary">Streak {track === 'jp' ? '日本語' : 'DSA'}</p>
            <p className="mt-1 flex items-center gap-2 text-4xl font-bold tabular-nums text-text-main">
              <DojoIcon name={track === 'jp' ? 'flame' : 'flame-blue'} className="h-9 w-9" muted={side.streak.status !== 'aman' && side.streak.status !== 'berisiko'} />
              {side.streak.current}
              <span className="text-base font-medium text-text-secondary">hari</span>
            </p>
            <p className="mt-1 flex flex-wrap items-center gap-1 text-[13px] text-text-secondary">
              {side.streak.status === 'aman' ? (
                <>
                  Aman hari ini <Sym name="check" className="text-[16px] text-[#1f7a3a]" />
                </>
              ) : side.streak.status === 'retak' ? (
                `Retak: capai ${side.streak.repairTarget} XP hari ini`
              ) : (
                `Butuh ${Math.max(0, side.streak.threshold - side.streak.todayXp)} XP lagi`
              )}
              <span aria-hidden="true">·</span>
              <DojoIcon name="ice" className="h-4 w-4" label="freeze" />
              {side.streak.freezes}
            </p>
          </div>
          <div className="glass-card rounded-3xl p-5">
            <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-text-secondary">Daily goal</p>
            <p className="mt-1 text-2xl font-bold tabular-nums text-text-main">
              {side.streak.todayXp}
              <span className="text-base font-medium text-text-secondary">/{side.streak.goal} XP</span>
            </p>
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-black/5">
              <div className="h-full rounded-full" style={{ width: `${goalPct}%`, background: goalPct >= 100 ? '#34c759' : color }} />
            </div>
          </div>
          <div className="glass-card rounded-3xl p-5">
            <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-text-secondary">Level</p>
            <p className="mt-1 text-lg font-bold text-text-main">
              Lv {side.level.level} · <span className="font-jp" lang="ja">{side.belt.obi}</span>
            </p>
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-black/5">
              <div className="h-full rounded-full bg-[#ffb800]" style={{ width: `${levelPct}%` }} />
            </div>
            <p className="mt-1 text-[12px] text-text-secondary tabular-nums">
              {side.level.intoLevel}/{side.level.span} XP ke level berikutnya
            </p>
          </div>
        </div>
      </aside>

      {!nextVisible && nextId && (
        <button type="button" onClick={scrollToNext} className="fixed bottom-24 right-5 z-40 inline-flex items-center gap-1 rounded-full px-4 py-2.5 text-sm font-semibold text-white shadow-xl md:bottom-8" style={{ background: color }}>
          Lanjutkan <span className="material-symbols-outlined text-[18px]">arrow_downward</span>
        </button>
      )}

      {open && <NodeSheet node={open} onClose={() => setOpen(null)} onChanged={() => router.refresh()} />}
    </div>
  );
}
