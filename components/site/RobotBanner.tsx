'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import SecretLogin from './SecretLogin';
import type { SiteContent } from '@/lib/site/content';
import { cleanAnswer, extractCites, type ChatTurn, type Cite } from '@/lib/site/assistant';

// Robot asisten "Tanya portfolio": obrolan di kiri, robot melayang di kanan mengikuti kursor.
// Jawaban di-stream dari /api/ask (Groq); item yang disebut jawaban "diantar" robot sebagai kartu.
// Pintu masuk Dōjō: ujung antena robot, klik 3x dalam 1,5 detik atau tekan lama ±0,9 detik.

type Pose = 'idle' | 'wave' | 'think' | 'talk' | 'carry' | 'sleep';
const POSES: Pose[] = ['idle', 'wave', 'think', 'talk', 'carry', 'sleep'];
type Status = 'searching' | 'streaming' | 'done' | 'error';
type Msg = { id: number; role: 'user' | 'assistant'; raw: string; status?: Status; items?: number; picked?: number; cites?: Cite[]; note?: string };

const ANTENNA = { x: 0.55, y: 0.08, r: 0.12 }; // posisi ujung antena relatif terhadap kotak gambar
const ERR: Record<string, string> = {
  rate_limited: "You've asked a lot. Give me a few minutes and try again.",
  busy: "I'm catching my breath. Try again in a few seconds.",
};

function scrollToSection(id: string) {
  const el = document.getElementById(id);
  if (el) window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 100, behavior: 'smooth' });
}

function Answer({ text }: { text: string }) {
  const lines = text.split('\n').filter((l) => l.trim());
  const bullets = lines.filter((l) => /^\s*[-•]\s+/.test(l));
  if (bullets.length >= 2) {
    const intro = lines.filter((l) => !/^\s*[-•]\s+/.test(l));
    return (
      <>
        {intro.map((l, i) => (
          <p key={`i${i}`}>{l}</p>
        ))}
        <ul className="mt-1 list-disc space-y-0.5 pl-4">
          {bullets.map((l, i) => (
            <li key={i}>{l.replace(/^\s*[-•]\s+/, '')}</li>
          ))}
        </ul>
      </>
    );
  }
  return <p className="whitespace-pre-line">{text}</p>;
}

export default function RobotBanner({ content }: { content: SiteContent }) {
  const a = content.assistant;
  const name = a.name || 'Bit';
  const first = content.profile.firstName.split(' ')[0];
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [input, setInput] = useState('');
  const [pose, setPose] = useState<Pose>('idle');
  const [busy, setBusy] = useState(false);
  const [login, setLogin] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const botRef = useRef<HTMLDivElement>(null);
  const tiltRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const pointer = useRef<{ x: number; y: number } | null>(null);
  const hoverBot = useRef(false); // kursor di atas robot → robot diam supaya antena mudah diklik
  const deliver = useRef<{ until: number; y: number } | null>(null);
  const poseTimer = useRef<number | undefined>(undefined);
  const greeted = useRef(false);
  const abortRef = useRef<AbortController | null>(null);
  const idRef = useRef(0);
  const taps = useRef<number[]>([]);
  const press = useRef<number | undefined>(undefined);

  const setPoseFor = useCallback((p: Pose, ms?: number, after: Pose = 'idle') => {
    window.clearTimeout(poseTimer.current);
    setPose(p);
    if (ms) poseTimer.current = window.setTimeout(() => setPose(after), ms);
  }, []);

  // ---------- Gerak robot (pegas menuju kursor, dibatasi ke zona kanan) ----------
  useEffect(() => {
    const card = cardRef.current;
    const bot = botRef.current;
    const tilt = tiltRef.current;
    if (!card || !bot || !tilt) return;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let x = -1;
    let y = -1;
    let vx = 0;
    let vy = 0;
    let raf = 0;
    const tick = () => {
      const w = card.clientWidth;
      const h = card.clientHeight;
      const s = bot.offsetWidth;
      const wide = window.innerWidth >= 640; // sama dengan breakpoint sm di CSS
      const zone = wide ? { x0: w * 0.6, x1: w - s - 4, y0: 8, y1: h - s - 8 } : { x0: w - s - 6, x1: w - s - 6, y0: 4, y1: 4 };
      const home = { x: (zone.x0 + zone.x1) / 2, y: wide ? (zone.y0 + zone.y1) / 2 : zone.y0 };
      let tx = home.x;
      let ty = home.y;
      const now = performance.now();
      if (deliver.current && now < deliver.current.until && wide) {
        tx = zone.x0 - s * 0.35;
        ty = Math.min(zone.y1, Math.max(zone.y0, deliver.current.y - s * 0.55));
      } else if (hoverBot.current && x >= 0) {
        tx = x;
        ty = y;
      } else if (pointer.current && wide && !reduce) {
        tx = Math.min(zone.x1, Math.max(zone.x0, pointer.current.x - s / 2));
        ty = Math.min(zone.y1, Math.max(zone.y0, pointer.current.y - s / 2));
      }
      if (x < 0 || reduce) {
        x = tx;
        y = ty;
      }
      vx = (vx + (tx - x) * 0.018) * 0.85;
      vy = (vy + (ty - y) * 0.018) * 0.85;
      x += vx;
      y += vy;
      bot.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0)`;
      // Gambar menghadap ke kiri; balik kalau kursor ada di kanan robot
      const face = pointer.current && wide && pointer.current.x > x + s * 0.75 ? -1 : 1;
      const deg = Math.max(-9, Math.min(9, vx * 1.6));
      tilt.style.transform = `scaleX(${face}) rotate(${(deg * face).toFixed(2)}deg)`;
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  const onPointerMove = (e: React.PointerEvent) => {
    if (e.pointerType !== 'mouse') return;
    const r = cardRef.current?.getBoundingClientRect();
    if (!r) return;
    pointer.current = { x: e.clientX - r.left, y: e.clientY - r.top };
    if (!greeted.current) {
      greeted.current = true;
      setPoseFor('wave', 1600);
    }
  };

  // ---------- Pintu rahasia di antena ----------
  const onAntenna = (e: React.PointerEvent<HTMLImageElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    const dx = (e.clientX - r.left) / r.width - ANTENNA.x;
    const dy = (e.clientY - r.top) / r.height - ANTENNA.y;
    return Math.hypot(dx, dy) <= ANTENNA.r;
  };
  const onBotDown = (e: React.PointerEvent<HTMLImageElement>) => {
    if (!onAntenna(e)) return;
    const now = Date.now();
    taps.current = [...taps.current.filter((t) => now - t < 1500), now];
    if (taps.current.length >= 3) {
      taps.current = [];
      setLogin(true);
      return;
    }
    window.clearTimeout(press.current);
    press.current = window.setTimeout(() => setLogin(true), 900);
  };
  const onBotUp = () => window.clearTimeout(press.current);
  const onBotClick = (e: React.MouseEvent<HTMLImageElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    const onTip = Math.hypot((e.clientX - r.left) / r.width - ANTENNA.x, (e.clientY - r.top) / r.height - ANTENNA.y) <= ANTENNA.r;
    if (!onTip && !busy) setPoseFor('wave', 1400);
  };

  // ---------- Tanya ----------
  const update = (id: number, patch: Partial<Msg> | ((m: Msg) => Partial<Msg>)) =>
    setMsgs((ms) => ms.map((m) => (m.id === id ? { ...m, ...(typeof patch === 'function' ? patch(m) : patch) } : m)));

  const ask = async (q: string) => {
    const question = q.trim().slice(0, 400);
    if (!question || busy) return;
    const history: ChatTurn[] = msgs
      .filter((m) => m.raw && m.status !== 'error')
      .slice(-6)
      .map((m) => ({ role: m.role, content: m.raw.slice(0, 1500) }));
    const uid = ++idRef.current;
    const aid = ++idRef.current;
    setMsgs((ms) => [...ms, { id: uid, role: 'user', raw: question }, { id: aid, role: 'assistant', raw: '', status: 'searching' }]);
    setInput('');
    setBusy(true);
    setPoseFor('think');
    const ctrl = new AbortController();
    abortRef.current = ctrl;
    try {
      const res = await fetch('/api/ask', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ question, history }), signal: ctrl.signal });
      if (!res.ok || !res.body) {
        const j = (await res.json().catch(() => ({}))) as { error?: string };
        update(aid, { status: 'error', note: ERR[j.error ?? ''] ?? `I can't answer right now. You can email ${first} at ${content.contact.email}.` });
        setPoseFor('sleep', 4000);
        return;
      }
      const reader = res.body.getReader();
      const dec = new TextDecoder();
      let buf = '';
      let raw = '';
      let failed = false;
      let finished = false;
      // Selesai begitu sinyal "end" datang (server masih mencatat log/cache sebelum menutup stream)
      const finish = () => {
        if (finished) return;
        finished = true;
        setBusy(false);
        if (failed || !raw.trim()) {
          update(aid, { status: 'error', note: `Something went wrong. You can email ${first} at ${content.contact.email}.` });
          setPoseFor('sleep', 4000);
          return;
        }
        const cites = extractCites(raw).slice(0, 4);
        update(aid, { status: 'done', cites });
        if (cites.length) {
          // Robot terbang ke deretan kartu lalu kembali
          const list = listRef.current;
          const card = cardRef.current;
          const y = list && card ? Math.min(list.getBoundingClientRect().bottom, card.getBoundingClientRect().bottom - 60) - card.getBoundingClientRect().top - 40 : 200;
          deliver.current = { until: performance.now() + 2200, y };
          setPoseFor('carry', 2400);
        } else setPoseFor('idle');
      };
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        buf += dec.decode(value, { stream: true });
        let i: number;
        while ((i = buf.indexOf('\n')) >= 0) {
          const line = buf.slice(0, i);
          buf = buf.slice(i + 1);
          if (!line.trim()) continue;
          const ev = JSON.parse(line) as { t: string; v?: string; items?: number; picked?: number };
          if (ev.t === 'meta') update(aid, { items: ev.items, picked: ev.picked });
          else if (ev.t === 'd' && ev.v) {
            if (!raw) setPoseFor('talk');
            raw += ev.v;
            update(aid, { raw, status: 'streaming' });
          } else if (ev.t === 'err') failed = true;
          else if (ev.t === 'end') finish();
        }
      }
      finish();
    } catch (e) {
      if ((e as Error).name !== 'AbortError') {
        update(aid, { status: 'error', note: `I can't answer right now. You can email ${first} at ${content.contact.email}.` });
        setPoseFor('sleep', 4000);
      }
    } finally {
      setBusy(false);
      abortRef.current = null;
    }
  };

  useEffect(() => () => abortRef.current?.abort(), []);
  useEffect(() => {
    const el = listRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [msgs]);

  const reset = () => {
    abortRef.current?.abort();
    setMsgs([]);
    setBusy(false);
    setPoseFor('wave', 1200);
  };

  // ---------- Kartu yang diantar robot ----------
  const cardFor = (c: Cite) => {
    if (c.kind === 'p') {
      const p = content.projects.find((x) => x.id === c.id);
      if (!p) return null;
      return {
        key: `p${p.id}`,
        title: p.title,
        sub: `${p.category} project`,
        thumb: p.image,
        icon: 'deployed_code',
        go: () => {
          scrollToSection('projects');
          window.dispatchEvent(new CustomEvent('site:open-project', { detail: p.id }));
        },
      };
    }
    if (c.kind === 'e') {
      const e = content.experience.find((x) => x.id === c.id);
      return e ? { key: `e${e.id}`, title: e.role, sub: e.company, icon: 'work', go: () => scrollToSection('experience') } : null;
    }
    if (c.kind === 'o') {
      const o = content.organization.find((x) => x.id === c.id);
      return o ? { key: `o${o.id}`, title: o.role, sub: o.org, icon: 'groups', go: () => scrollToSection('organization') } : null;
    }
    if (c.kind === 'c') {
      const cv = content.profile.resumeUrl;
      return cv ? { key: 'cv', title: 'Resume (PDF)', sub: 'Download CV', icon: 'description', go: () => window.open(cv, '_blank', 'noopener') } : null;
    }
    const x = content.achievements.find((y) => y.id === c.id);
    return x ? { key: `a${x.id}`, title: x.title, sub: 'Achievement', icon: x.icon || 'emoji_events', go: () => scrollToSection('achievements') } : null;
  };
  type Card = NonNullable<ReturnType<typeof cardFor>>;
  // Beberapa potongan CV → satu kartu "Resume"; kartu unik per kunci
  const uniqueCards = (cites: Cite[]): Card[] => {
    const seen = new Set<string>();
    return cites.map(cardFor).filter((x): x is Card => !!x && !seen.has(x.key) && !!seen.add(x.key));
  };

  return (
    <div
      ref={cardRef}
      onPointerMove={onPointerMove}
      onPointerLeave={() => (pointer.current = null)}
      className="glass-card bento-hover rounded-3xl md:col-span-4 lg:col-span-4 row-span-1 relative overflow-hidden p-0 h-[560px] md:h-[400px] lg:h-[420px]"
    >
      <p className="sr-only">Interactive assistant: ask {name} questions about {first}&apos;s work. Answers are generated from this portfolio.</p>

      <div className="relative z-10 flex h-full flex-col p-5 md:p-6 sm:pr-[40%]">
        <div className="flex min-h-[86px] items-start justify-between gap-2 pr-[112px] sm:min-h-0 sm:pr-0">
          <div>
            <p className="flex items-center gap-2 text-[15px] font-semibold text-text-main">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full rounded-full bg-[#34c759] opacity-60 motion-safe:animate-ping" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-[#34c759]" />
              </span>
              Ask {name}
            </p>
            <p className="mt-0.5 text-[12px] text-text-secondary">AI assistant · answers from this portfolio</p>
          </div>
          {msgs.length > 0 && (
            <button type="button" onClick={reset} className="shrink-0 whitespace-nowrap rounded-full px-2.5 py-1 text-[12px] font-medium text-text-secondary transition-colors hover:bg-black/5 hover:text-text-main">
              New chat
            </button>
          )}
        </div>

        <div ref={listRef} className="mt-3 flex-1 space-y-3 overflow-y-auto overscroll-contain pr-1" aria-live="polite">
          {msgs.length === 0 ? (
            <>
              <div className="max-w-[92%] rounded-2xl rounded-tl-md border border-black/5 bg-white px-4 py-2.5 text-[14px] leading-relaxed text-text-main shadow-sm">{a.greeting}</div>
              <div className="flex flex-wrap gap-2">
                {a.suggestions.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => ask(s)}
                    className="rounded-full border border-[#0066cc]/20 bg-white/80 px-3 py-1.5 text-left text-[12.5px] font-medium text-[#0066cc] transition-colors hover:bg-[#0066cc] hover:text-white"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </>
          ) : (
            msgs.map((m) =>
              m.role === 'user' ? (
                <div key={m.id} className="ml-auto w-fit max-w-[85%] rounded-2xl rounded-tr-md bg-[#0066cc] px-4 py-2 text-[14px] leading-relaxed text-white">
                  {m.raw}
                </div>
              ) : (
                <div key={m.id} className="space-y-2">
                  <div className="w-fit max-w-[92%] rounded-2xl rounded-tl-md border border-black/5 bg-white px-4 py-2.5 text-[14px] leading-relaxed text-text-main shadow-sm">
                    {m.status === 'error' ? (
                      <p className="text-text-secondary">{m.note}</p>
                    ) : m.raw ? (
                      <Answer text={cleanAnswer(m.raw)} />
                    ) : (
                      <p className="flex items-center gap-2 text-text-secondary">
                        <span className="inline-flex gap-1" aria-hidden="true">
                          {[0, 1, 2].map((i) => (
                            <span key={i} className="h-1.5 w-1.5 rounded-full bg-[#0066cc]/60 motion-safe:animate-[bot-dot_1s_ease-in-out_infinite]" style={{ animationDelay: `${i * 0.15}s` }} />
                          ))}
                        </span>
                        {m.items ? `Searched ${m.items} portfolio items · ${m.picked} relevant` : 'Searching the portfolio'}
                      </p>
                    )}
                  </div>
                  {m.status === 'done' && !!m.cites?.length && (
                    <ul className="flex flex-wrap gap-2" aria-label="Related items">
                      {uniqueCards(m.cites).map((card, i) => {
                        return (
                          <li key={card.key} className="motion-safe:animate-[bot-drop_0.45s_cubic-bezier(.2,1.2,.4,1)_both]" style={{ animationDelay: `${0.25 + i * 0.12}s` }}>
                            <button type="button" onClick={card.go} className="flex w-[180px] items-center gap-2.5 rounded-2xl border border-black/5 bg-white p-2 text-left shadow-sm transition-transform hover:-translate-y-0.5">
                              {'thumb' in card && card.thumb ? (
                                <img src={card.thumb} alt="" className="h-10 w-10 shrink-0 rounded-xl bg-[#f5f5f7] object-cover" />
                              ) : (
                                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#e8f1fb] text-[#0066cc]">
                                  <span className="material-symbols-outlined text-[20px]" aria-hidden="true">
                                    {card.icon}
                                  </span>
                                </span>
                              )}
                              <span className="min-w-0">
                                <span className="block truncate text-[12.5px] font-semibold text-text-main">{card.title}</span>
                                <span className="block truncate text-[11px] text-text-secondary">{card.sub}</span>
                              </span>
                            </button>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </div>
              ),
            )
          )}
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            void ask(input);
          }}
          className="mt-3 flex items-center gap-2 rounded-full border border-black/10 bg-white py-1.5 pl-4 pr-1.5 shadow-sm focus-within:border-[#0066cc] focus-within:ring-2 focus-within:ring-[#0066cc]/15"
        >
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            maxLength={400}
            placeholder={`Ask ${name} about ${first}…`}
            aria-label={`Ask a question about ${first}`}
            className="min-w-0 flex-1 border-0 bg-transparent p-0 text-[14px] text-text-main placeholder:text-text-secondary/70 focus:outline-none focus:ring-0"
          />
          <button
            type="submit"
            disabled={busy || !input.trim()}
            aria-label="Send question"
            className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[#0066cc] text-white transition-opacity disabled:opacity-35"
          >
            <span className="material-symbols-outlined text-[20px]" aria-hidden="true">
              arrow_upward
            </span>
          </button>
        </form>
        <p className="mt-2 text-[10.5px] text-text-secondary">Answers are generated from this portfolio and may be imperfect.</p>
      </div>

      <div ref={botRef} className="pointer-events-none absolute left-0 top-0 z-20 h-[104px] w-[104px] will-change-transform sm:h-[190px] sm:w-[190px]" style={{ transform: 'translate3d(-9999px,0,0)' }}>
        <div className="h-full w-full drop-shadow-[0_12px_18px_rgba(0,58,140,0.18)] motion-safe:animate-[bot-float_3.4s_ease-in-out_infinite]">
          <div ref={tiltRef} className="relative h-full w-full">
            {POSES.map((p) => (
              <img
                key={p}
                src={`/assets/robot/${p}.webp`}
                alt=""
                width={512}
                height={512}
                draggable={false}
                decoding="async"
                onPointerDown={p === pose ? onBotDown : undefined}
                onPointerUp={onBotUp}
                onPointerEnter={() => (hoverBot.current = true)}
                onPointerLeave={() => {
                  hoverBot.current = false;
                  onBotUp();
                }}
                onClick={p === pose ? onBotClick : undefined}
                className={`absolute inset-0 h-full w-full select-none object-contain transition-opacity duration-200 ${p === pose ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'}`}
              />
            ))}
          </div>
        </div>
      </div>

      <SecretLogin open={login} onClose={() => setLogin(false)} />
    </div>
  );
}
