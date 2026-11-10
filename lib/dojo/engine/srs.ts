// SRS varian SM-2 (docs/dojo/04-GAMIFICATION.md §7). Fungsi murni, mudah dites.

export type Rating = 1 | 2 | 3 | 4; // 1 Lupa · 2 Sulit · 3 Baik · 4 Mudah
export const RATING_LABEL: Record<Rating, string> = { 1: 'Lupa', 2: 'Sulit', 3: 'Baik', 4: 'Mudah' };

export type SrsState = { interval: number | null; ease: number | null; reps: number; lapses: number; mastery: number };
export type SrsNext = { due: string; interval: number; ease: number; reps: number; lapses: number; mastery: number };

const MIN_EASE = 1.3;
const MAX_INTERVAL = 180;
const FIRST_INTERVAL: Record<Rating, number> = { 1: 1, 2: 2, 3: 4, 4: 7 };

export function addDays(date: string, days: number): string {
  const t = Date.parse(`${date}T00:00:00Z`) + days * 86_400_000;
  return new Date(t).toISOString().slice(0, 10);
}

export function daysBetween(a: string, b: string): number {
  return Math.round((Date.parse(`${b}T00:00:00Z`) - Date.parse(`${a}T00:00:00Z`)) / 86_400_000);
}

// Fuzz deterministik ±5% supaya review tidak menumpuk di hari yang sama
function fuzz(key: string, interval: number): number {
  if (interval < 3) return interval;
  let h = 2166136261;
  for (let i = 0; i < key.length; i++) h = Math.imul(h ^ key.charCodeAt(i), 16777619);
  const r = ((h >>> 0) % 1000) / 1000; // 0..1
  return Math.max(1, Math.round(interval * (0.95 + r * 0.1)));
}

export function schedule(prev: SrsState, rating: Rating, today: string, key: string, opts: { quickRecall?: boolean } = {}): SrsNext {
  let ease = prev.ease ?? 2.5;
  let interval: number;
  let lapses = prev.lapses;
  let mastery = Math.max(1, prev.mastery);
  const isNew = prev.reps === 0 || prev.interval == null;

  if (isNew) {
    interval = FIRST_INTERVAL[rating];
  } else {
    const cur = prev.interval ?? 1;
    if (rating === 1) {
      interval = 1;
      ease -= 0.2;
      lapses += 1;
      mastery = Math.max(1, mastery - 1);
    } else if (rating === 2) {
      interval = Math.max(2, Math.round(cur * 1.2));
      ease -= 0.15;
    } else if (rating === 3) {
      interval = Math.round(cur * ease);
    } else {
      interval = Math.round(cur * ease * 1.3);
      ease += 0.15;
    }
  }

  ease = Math.max(MIN_EASE, Math.round(ease * 100) / 100);
  interval = Math.min(MAX_INTERVAL, Math.max(1, fuzz(`${key}:${today}`, interval)));

  // Bintang: ★2 saat review berhasil dengan interval ≥ 7, ★3 dengan interval ≥ 30 (bukan mode recall cepat)
  if (!isNew && rating >= 3) {
    if (interval >= 30 && !opts.quickRecall) mastery = Math.max(mastery, 3);
    else if (interval >= 7) mastery = Math.max(mastery, 2);
  }

  return { due: addDays(today, interval), interval, ease, reps: prev.reps + 1, lapses, mastery };
}
