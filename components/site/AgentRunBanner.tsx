'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import SecretLogin from './SecretLogin';

// Menggantikan kartu Spotify: replay ilustratif satu percakapan agent AI
// (pertanyaan pelanggan → tool call → jawaban di-stream per kata).
// Kursor ▍ di baris prompt terakhir adalah pintu masuk Dōjō:
// klik 3x dalam 1,5 detik, atau tekan lama ±0,9 detik (HP).

type Tool = { name: string; args: string; result: string; latency: number; start: number; end: number };

const QUESTION = 'Is the linen shirt in M still available? Can it reach Depok by Friday?';
const REPLY =
  'Yes, 14 left in M. Order before 3 pm and it reaches Depok in 1–2 days, so Friday works. Want me to reserve one?';

// start/end = milidetik sejak replay dimulai
const TOOLS: Tool[] = [
  { name: 'search_catalog', args: '"linen shirt"', result: '1 match', latency: 212, start: 450, end: 850 },
  { name: 'check_stock', args: '"LS-SAGE-M"', result: '14 left', latency: 41, start: 1000, end: 1250 },
  { name: 'kb.retrieve', args: '"shipping"', result: '3 docs', latency: 96, start: 1400, end: 1750 },
];

const WORDS = REPLY.split(' ');
const REPLY_START = 1950;
const WORD_MS = 55;
const DONE_AT = REPLY_START + WORDS.length * WORD_MS + 150;
const FINAL = Number.POSITIVE_INFINITY; // keadaan akhir: SSR, reduced motion, atau kartu sudah terlihat saat load
const HIDDEN = -1; // menunggu kartu masuk layar

const fade = (visible: boolean) => `transition-opacity duration-300 ${visible ? 'opacity-100' : 'opacity-0'}`;

const AgentRunBanner = () => {
  const [open, setOpen] = useState(false);
  const [ms, setMs] = useState<number>(FINAL);
  const cardRef = useRef<HTMLDivElement>(null);
  const raf = useRef<number | null>(null);
  const clicks = useRef<number[]>([]);
  const pressTimer = useRef<number | null>(null);

  const play = useCallback(() => {
    const t0 = performance.now();
    const step = (now: number) => {
      const t = now - t0;
      if (t >= DONE_AT) {
        raf.current = null;
        setMs(FINAL);
        return;
      }
      setMs(t);
      raf.current = requestAnimationFrame(step);
    };
    raf.current = requestAnimationFrame(step);
  }, []);

  // Replay diputar sekali saat kartu masuk layar. Kalau kartu sudah terlihat saat load
  // (atau pengguna memilih reduced motion), langsung tampil keadaan akhir tanpa kedip.
  useEffect(() => {
    const el = cardRef.current;
    if (!el || typeof IntersectionObserver === 'undefined') return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const r = el.getBoundingClientRect();
    if (r.top < window.innerHeight && r.bottom > 0) return;
    setMs(HIDDEN);
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          io.disconnect();
          play();
        }
      },
      { threshold: 0.45 },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      if (raf.current !== null) cancelAnimationFrame(raf.current);
    };
  }, [play]);

  const done = ms >= DONE_AT;
  const wordsShown = ms >= REPLY_START ? Math.min(WORDS.length, Math.floor((ms - REPLY_START) / WORD_MS) + 1) : 0;

  const onCaretClick = () => {
    if (!done) return;
    const t = Date.now();
    clicks.current = [...clicks.current.filter((c) => t - c < 1500), t];
    if (clicks.current.length >= 3) {
      clicks.current = [];
      setOpen(true);
    }
  };
  const startPress = () => {
    if (!done) return;
    pressTimer.current = window.setTimeout(() => setOpen(true), 900);
  };
  const cancelPress = () => {
    if (pressTimer.current !== null) window.clearTimeout(pressTimer.current);
    pressTimer.current = null;
  };

  return (
    <div
      ref={cardRef}
      className="glass-card bento-hover rounded-3xl md:col-span-4 lg:col-span-4 row-span-1 min-h-[352px] overflow-hidden p-0 flex flex-col md:flex-row items-stretch"
    >
      {/* Teks */}
      <div className="flex-1 p-6 md:p-10 md:pr-6 flex flex-col justify-center gap-3 min-w-0">
        <h3 className="text-3xl md:text-4xl font-bold leading-tight tracking-tight text-text-main max-w-sm">
          Agents that answer while the shop sleeps.
        </h3>
        <p className="text-text-secondary text-sm md:text-base leading-relaxed max-w-md">
          I build LLM agents for online stores on WhatsApp, Shopee and Instagram. They search the store’s own
          catalog, check stock through real tools, and reply in seconds.
        </p>
        <p className="text-[11px] font-medium text-[#a1a1a6]">Illustrative run, based on my work at Halo AI.</p>
      </div>

      {/* Replay agent */}
      <div className="md:w-[54%] px-4 pb-4 md:py-6 md:pl-0 md:pr-6 flex items-center">
        <div className="w-full rounded-2xl bg-white/75 border border-white shadow-soft overflow-hidden">
          <div className="flex items-center justify-between px-4 py-2.5 border-b border-black/[0.06]">
            <span className="font-mono text-[12px] font-semibold text-text-main">sales-agent</span>
            <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-text-secondary">
              <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-[#34c759]" />
              WhatsApp
            </span>
          </div>

          <div className="px-4 py-3.5 space-y-3 text-[13px] leading-[1.45]">
            <div className={`pl-3 border-l-2 border-black/10 ${fade(ms >= 0)}`}>
              <p className="text-[11px] font-semibold text-text-secondary mb-0.5">Customer</p>
              <p className="text-text-main">{QUESTION}</p>
            </div>

            <ul className="space-y-1 pl-3 font-mono text-[11px] md:text-[11.5px]" aria-label="Tool calls">
              {TOOLS.map((t) => {
                const state = ms >= t.end ? 'done' : ms >= t.start ? 'running' : 'waiting';
                return (
                  <li key={t.name} className={`flex items-center gap-2 ${fade(state !== 'waiting')}`}>
                    {state === 'done' ? (
                      <svg viewBox="0 0 16 16" className="h-3.5 w-3.5 shrink-0 text-[#34c759]" aria-hidden="true">
                        <circle cx="8" cy="8" r="7" fill="currentColor" />
                        <path d="M4.8 8.3l2.1 2.1 4.3-4.6" fill="none" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    ) : (
                      <svg viewBox="0 0 16 16" className="h-3.5 w-3.5 shrink-0 animate-spin text-[#86868b]" aria-hidden="true">
                        <circle cx="8" cy="8" r="6" fill="none" stroke="currentColor" strokeOpacity="0.25" strokeWidth="2" />
                        <path d="M14 8a6 6 0 0 0-6-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                      </svg>
                    )}
                    <span className="min-w-0 flex-1 truncate">
                      <span className="text-[#0066cc]">{t.name}</span>
                      <span className="text-[#6e6e73]">({t.args})</span>
                    </span>
                    <span className={`hidden sm:inline text-text-main ${state === 'done' ? '' : 'invisible'}`}>{t.result}</span>
                    <span className={`w-12 shrink-0 text-right tabular-nums text-[#86868b] ${state === 'done' ? '' : 'invisible'}`}>
                      {t.latency} ms
                    </span>
                  </li>
                );
              })}
            </ul>

            <div className={`pl-3 border-l-2 border-[#0066cc]/70 ${fade(ms >= REPLY_START)}`}>
              <p className="text-[11px] font-semibold text-[#0066cc] mb-0.5">Agent</p>
              <p className="text-text-main">
                {WORDS.map((w, i) => (
                  <span key={i} className={`transition-opacity duration-150 ${i < wordsShown ? 'opacity-100' : 'opacity-0'}`}>
                    {w}
                    {i < WORDS.length - 1 ? ' ' : ''}
                  </span>
                ))}
              </p>
            </div>

            <div aria-hidden="true" className={`flex items-center gap-2 font-mono text-[12px] select-none ${fade(done)}`}>
              <span className="text-[#0066cc]">❯</span>
              <span
                className="-ml-1.5 inline-flex h-6 w-6 items-center justify-center"
                style={{ cursor: 'default', touchAction: 'manipulation', WebkitTapHighlightColor: 'transparent', WebkitTouchCallout: 'none' }}
                onClick={onCaretClick}
                onPointerDown={startPress}
                onPointerUp={cancelPress}
                onPointerLeave={cancelPress}
                onPointerCancel={cancelPress}
                onContextMenu={(e) => e.preventDefault()}
              >
                <span className="caret-blink block h-[15px] w-[7px] rounded-[1px] bg-[#1d1d1f]/80" />
              </span>
            </div>
          </div>
        </div>
      </div>

      <SecretLogin open={open} onClose={() => setOpen(false)} />
    </div>
  );
};

export default AgentRunBanner;
