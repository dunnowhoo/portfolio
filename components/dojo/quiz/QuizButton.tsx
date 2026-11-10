'use client';

import { useRouter } from 'next/navigation';
import { useRef, useState, useTransition } from 'react';
import { startCardReview, startDailyQuiz, startNodeQuiz, type QuizPayload } from '@/app/actions/quiz';
import QuizRunner from './QuizRunner';

export default function QuizButton({ source, id, label, className, onFinished }: { source: 'node' | 'daily' | 'review'; id: string; label: string; className?: string; onFinished?: () => void }) {
  const router = useRouter();
  const [payload, setPayload] = useState<QuizPayload | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();
  // Refresh/onFinished baru dijalankan saat layar hasil DITUTUP; kalau lebih awal, item jadi
  // "selesai", tombol ini ter-unmount, dan layar hasil hilang sebelum sempat dibaca.
  const finished = useRef(false);
  return (
    <>
      <button
        type="button"
        disabled={pending}
        onClick={() =>
          start(async () => {
            try {
              setError(null);
              setPayload(source === 'node' ? await startNodeQuiz(id) : source === 'review' ? await startCardReview(id as 'kana' | 'kanji' | 'grammar' | 'pattern') : await startDailyQuiz(id));
            } catch (e) {
              setError(e instanceof Error ? e.message : 'Gagal memulai kuis.');
            }
          })
        }
        className={className ?? 'rounded-full bg-[#0066cc] px-4 py-2 text-[13px] font-semibold text-white disabled:opacity-60'}
      >
        {pending ? 'Menyiapkan…' : label}
      </button>
      {error && <span className="ml-2 text-[12px] text-[#a3271f]">{error}</span>}
      {payload && (
        <QuizRunner
          payload={payload}
          onClose={() => {
            setPayload(null);
            router.refresh();
            if (finished.current) onFinished?.();
            finished.current = false;
          }}
          onFinished={() => {
            finished.current = true;
          }}
        />
      )}
    </>
  );
}
