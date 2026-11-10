'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { submitQuiz, type QuizPayload, type SubmitResult } from '@/app/actions/quiz';
import { emitAward } from '@/components/dojo/AwardToaster';

type Answer = { id: string; correct: boolean; front: string; back: string; chosen: string; prompt: string; explain?: string };
const pad2 = (n: number) => String(n).padStart(2, '0');
const fmt = (s: number) => `${pad2(Math.floor(s / 60))}:${pad2(s % 60)}`;

export default function QuizRunner({ payload, onClose, onFinished }: { payload: QuizPayload; onClose: () => void; onFinished?: (r: SubmitResult) => void }) {
  const qs = payload.questions;
  const [i, setI] = useState(0);
  const [chosen, setChosen] = useState<string | null>(null);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [elapsed, setElapsed] = useState(0);
  const [phase, setPhase] = useState<'play' | 'saving' | 'result'>('play');
  const [res, setRes] = useState<SubmitResult | null>(null);
  const started = useRef(Date.now());
  const q = qs[i];
  const remaining = payload.timeLimitS ? Math.max(0, payload.timeLimitS - elapsed) : null;

  useEffect(() => {
    if (phase !== 'play') return;
    const t = window.setInterval(() => setElapsed(Math.floor((Date.now() - started.current) / 1000)), 500);
    return () => window.clearInterval(t);
  }, [phase]);

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  const finish = useCallback(
    async (all: Answer[]) => {
      setPhase('saving');
      const durationS = Math.round((Date.now() - started.current) / 1000);
      const r = await submitQuiz({
        kind: payload.kind,
        nodeId: payload.nodeId,
        dailyItem: payload.dailyItem,
        review: payload.review,
        durationS,
        results: all.length ? all.map(({ id, correct, front, back }) => ({ id, correct, front: front.slice(0, 200), back: back.slice(0, 300) })) : [{ id: qs[0].id, correct: false, front: qs[0].prompt.slice(0, 200), back: qs[0].answer.slice(0, 300) }],
      });
      setRes(r);
      setPhase('result');
      if (r.ok && r.result) emitAward(r.result);
      onFinished?.(r);
    },
    [payload, qs, onFinished],
  );

  // Waktu habis untuk kuis ber-timer: soal yang belum dijawab dihitung salah
  useEffect(() => {
    if (phase === 'play' && remaining === 0) {
      const rest = qs.slice(answers.length).map((x) => ({ id: x.id, correct: false, front: x.prompt, back: x.answer, chosen: '—', prompt: x.prompt, explain: x.explain }));
      void finish([...answers, ...rest]);
    }
  }, [remaining, phase, answers, qs, finish]);

  const choose = useCallback(
    (opt: string) => {
      if (chosen || phase !== 'play' || !q) return;
      setChosen(opt);
      setAnswers((a) => [...a, { id: q.id, correct: opt === q.answer, front: q.prompt, back: q.answer, chosen: opt, prompt: q.prompt, explain: q.explain }]);
    },
    [chosen, phase, q],
  );

  const next = useCallback(() => {
    if (!chosen) return;
    if (i + 1 >= qs.length) {
      void finish(answers);
      return;
    }
    setI(i + 1);
    setChosen(null);
  }, [chosen, i, qs.length, finish, answers]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (phase !== 'play') {
        if (e.key === 'Escape') onClose();
        return;
      }
      if (e.key === 'Escape') onClose();
      const n = Number(e.key);
      if (n >= 1 && n <= 4 && q?.options[n - 1]) choose(q.options[n - 1]);
      if ((e.key === 'Enter' || e.key === ' ') && chosen) {
        e.preventDefault();
        next();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [phase, q, choose, chosen, next, onClose]);

  const wrong = useMemo(() => answers.filter((a) => !a.correct), [answers]);

  const body = (
    <div className="fixed inset-0 z-[75] flex flex-col bg-[#f5f5f7]" role="dialog" aria-modal="true" aria-label={payload.title}>
      <div className="flex items-center gap-3 px-4 pb-2 pt-[max(1rem,env(safe-area-inset-top))] md:px-8">
        <button type="button" onClick={onClose} className="rounded-full p-2 text-text-secondary hover:bg-black/5" aria-label="Tutup kuis">
          <span className="material-symbols-outlined">close</span>
        </button>
        <p className="min-w-0 flex-1 truncate text-sm font-semibold text-text-main">{payload.title}</p>
        <span className={`rounded-full px-3 py-1 font-mono text-[13px] tabular-nums ${remaining !== null && remaining < 30 ? 'bg-[#fdecea] text-[#a3271f]' : 'bg-white text-text-main'}`}>
          {remaining !== null ? fmt(remaining) : fmt(elapsed)}
        </span>
        {phase === 'play' && (
          <span className="text-[13px] tabular-nums text-text-secondary">
            {Math.min(i + 1, qs.length)}/{qs.length}
          </span>
        )}
      </div>
      <div className="mx-4 h-1.5 overflow-hidden rounded-full bg-black/5 md:mx-8">
        <div className="h-full rounded-full bg-[#0066cc] transition-[width] duration-300" style={{ width: `${(answers.length / qs.length) * 100}%` }} />
      </div>

      <div className="flex flex-1 items-start justify-center overflow-y-auto px-4 py-6 md:items-center">
        {phase === 'play' && q && (
          <div className="w-full max-w-xl">
            <div className="glass-card-strong rounded-3xl p-6 text-center md:p-10">
              {q.sub && <p className="text-[12px] font-semibold uppercase tracking-[0.08em] text-text-secondary">{q.sub}</p>}
              {q.mono ? (
                <pre className="mt-4 overflow-x-auto rounded-2xl bg-[#f6f8fa] p-4 text-left font-mono text-[14px] leading-relaxed text-text-main">{q.prompt}</pre>
              ) : (
                <p className={`mt-3 break-words text-text-main ${q.ja ? (q.prompt.length <= 2 ? 'font-jp text-7xl font-bold' : 'font-jp text-3xl font-bold') : 'text-xl font-semibold leading-snug'}`} lang={q.ja ? 'ja' : undefined}>
                  {q.prompt}
                </p>
              )}
            </div>
            <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
              {q.options.map((o, k) => {
                const isAns = o === q.answer;
                const isChosen = chosen === o;
                const state = !chosen ? 'idle' : isAns ? 'right' : isChosen ? 'wrong' : 'dim';
                return (
                  <button
                    key={o}
                    type="button"
                    onClick={() => choose(o)}
                    disabled={!!chosen}
                    className={`flex min-h-[56px] items-center gap-3 rounded-2xl border px-4 py-3 text-left text-[15px] font-medium transition-colors ${
                      state === 'right'
                        ? 'border-[#34c759] bg-[#eaf8ee] text-[#1f7a3a]'
                        : state === 'wrong'
                          ? 'border-[#e8453c] bg-[#fdecea] text-[#a3271f]'
                          : state === 'dim'
                            ? 'border-black/5 bg-white/60 text-text-secondary'
                            : 'border-black/10 bg-white text-text-main hover:border-[#0066cc]'
                    }`}
                  >
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-black/5 text-[12px] tabular-nums">{k + 1}</span>
                    <span className={q.kind === 'kana' || q.kind === 'kanji' ? 'font-jp' : ''}>{o}</span>
                    {state === 'right' && <span className="material-symbols-outlined ml-auto text-[20px]">check_circle</span>}
                    {state === 'wrong' && <span className="material-symbols-outlined ml-auto text-[20px]">cancel</span>}
                  </button>
                );
              })}
            </div>
            {chosen && (
              <div className="mt-4 space-y-3">
                {q.explain && <p className="rounded-2xl bg-white px-4 py-3 text-[14px] text-[#3a3a3c]">{q.explain}</p>}
                <button type="button" onClick={next} className="w-full rounded-full bg-[#0066cc] py-3.5 text-[15px] font-semibold text-white shadow-lg shadow-blue-500/20" autoFocus>
                  {i + 1 >= qs.length ? 'Lihat hasil' : 'Lanjut'} <span className="text-white/70">(Enter)</span>
                </button>
              </div>
            )}
          </div>
        )}

        {phase === 'saving' && <p className="text-sm text-text-secondary">Menyimpan hasil…</p>}

        {phase === 'result' && res && (
          <div className="w-full max-w-xl">
            <div className="glass-card-strong rounded-3xl p-8 text-center">
              {res.ok ? (
                <>
                  <p className="text-[12px] font-semibold uppercase tracking-[0.08em] text-text-secondary">{res.passed === false ? 'Belum lulus' : 'Hasil'}</p>
                  <p className={`mt-2 text-6xl font-bold tabular-nums ${res.pct >= 90 ? 'text-[#1f7a3a]' : res.pct >= 70 ? 'text-text-main' : 'text-[#c25e00]'}`}>{res.pct}%</p>
                  <p className="mt-1 text-sm text-text-secondary">
                    {res.correct}/{res.total} benar · {fmt(elapsed)}
                    {res.result && !res.result.duplicate ? ` · +${res.result.xp} XP` : ''}
                  </p>
                  <p className="mt-3 text-[15px] font-medium text-text-main">{res.message}</p>
                </>
              ) : (
                <p className="text-sm text-[#a3271f]">{res.error}</p>
              )}
            </div>
            {wrong.length > 0 && (
              <div className="mt-4 rounded-3xl bg-white p-5">
                <p className="mb-3 text-[12px] font-semibold uppercase tracking-[0.08em] text-text-secondary">Yang salah ({wrong.length})</p>
                <ul className="space-y-2.5">
                  {wrong.map((w, k) => (
                    <li key={`${w.id}-${k}`} className="text-[14px]">
                      <span className="font-jp font-semibold text-text-main">{w.prompt.length > 80 ? `${w.prompt.slice(0, 80)}…` : w.prompt}</span>
                      <span className="text-text-secondary"> → </span>
                      <span className="font-semibold text-[#1f7a3a]">{w.back}</span>
                      {w.chosen !== '—' && <span className="text-text-secondary"> (kamu: {w.chosen})</span>}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            <button type="button" onClick={onClose} className="mt-4 w-full rounded-full bg-[#1d1d1f] py-3.5 text-[15px] font-semibold text-white">
              Selesai
            </button>
          </div>
        )}
      </div>
    </div>
  );
  return createPortal(body, document.body);
}
