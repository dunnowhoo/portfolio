import 'server-only';
import { PATTERNS, PROBLEMS, WARMUP_PROBLEMS } from '@/lib/dojo/curriculum/dsa';
import type { QuizSpec } from '@/lib/dojo/curriculum/types';
import { loadGrammar, loadKanji } from '@/lib/dojo/content';
import { BIGO, KANA_SETS } from './data';

export type QuizKind = 'kana' | 'kanji' | 'grammar' | 'pattern' | 'bigo';
export type Question = {
  id: string; // id kartu (kana:あ, kanji:日, gram:n5-g07, pat:lc-217, bigo:3)
  kind: QuizKind;
  prompt: string;
  sub?: string;
  ja?: boolean;
  mono?: boolean;
  options: string[];
  answer: string;
  explain?: string;
};

// PRNG ber-seed (mulberry32) supaya set harian sama di semua perangkat
export function rng(seed: string): () => number {
  let h = 1779033703 ^ seed.length;
  for (let i = 0; i < seed.length; i++) {
    h = Math.imul(h ^ seed.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  let a = h >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function shuffle<T>(arr: T[], rand: () => number): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function options(answer: string, pool: string[], rand: () => number, n = 4): string[] {
  const others = shuffle([...new Set(pool.filter((p) => p && p !== answer))], rand).slice(0, n - 1);
  return shuffle([answer, ...others], rand);
}

const firstReading = (s: string) => s.split(/[,、]/)[0]?.replace(/[()（）]/g, '').trim() ?? '';

export type BuildOpts = { count?: number; seed?: string; prefer?: string[]; learnedTopics?: string[] };

export async function buildQuiz(spec: QuizSpec, opts: BuildOpts = {}): Promise<Question[]> {
  const rand = rng(opts.seed ?? `${Date.now()}:${Math.random()}`);
  switch (spec.kind) {
    case 'kana': {
      const set = KANA_SETS[spec.set] ?? [];
      const count = opts.count ?? 20;
      const prefer = new Set(opts.prefer ?? []);
      // utamakan kartu lemah/jatuh tempo (prefer), sisanya acak
      const weak = shuffle(set.filter((k) => prefer.has(k.id)), rand);
      const rest = shuffle(set.filter((k) => !prefer.has(k.id)), rand);
      let picked = [...weak.slice(0, Math.ceil(count * 0.6)), ...rest].slice(0, count);
      while (picked.length < count && set.length) picked = [...picked, ...shuffle(set, rand)].slice(0, count);
      const romaji = set.map((k) => k.romaji);
      return shuffle(picked, rand).map((k) => ({ id: k.id, kind: 'kana', prompt: k.kana, ja: true, sub: 'Bacaannya?', options: options(k.romaji, romaji, rand), answer: k.romaji }));
    }
    case 'kanji': {
      const all = await loadKanji();
      const pool = all.filter((k) => spec.batches.includes(k.batch));
      const count = opts.count ?? Math.min(20, pool.length * 2);
      const meanings = all.map((k) => k.meaning);
      const readings = all.map((k) => firstReading(k.on) || firstReading(k.kun));
      const qs: Question[] = [];
      const order = shuffle(pool, rand);
      for (let i = 0; qs.length < count && order.length; i++) {
        const k = order[i % order.length];
        const asReading = Math.floor(i / order.length) % 2 === 1 ? rand() < 0.7 : rand() < 0.4;
        const reading = firstReading(k.on) || firstReading(k.kun);
        if (asReading && reading) {
          qs.push({ id: `kanji:${k.kanji}`, kind: 'kanji', prompt: k.kanji, ja: true, sub: 'Bacaannya?', options: options(reading, readings, rand), answer: reading, explain: `${k.meaning} · ON ${k.on || '—'} · kun ${k.kun || '—'} · ${k.examples}` });
        } else {
          qs.push({ id: `kanji:${k.kanji}`, kind: 'kanji', prompt: k.kanji, ja: true, sub: 'Artinya?', options: options(k.meaning, meanings, rand), answer: k.meaning, explain: `ON ${k.on || '—'} · kun ${k.kun || '—'} · ${k.examples}` });
        }
      }
      return qs;
    }
    case 'grammar': {
      const all = await loadGrammar();
      const level = all.filter((g) => g.level === spec.level);
      const pool = level.filter((g) => g.num >= spec.from && g.num <= spec.to);
      const prefer = new Set(opts.prefer ?? []);
      const count = Math.min(opts.count ?? Math.min(10, pool.length), pool.length);
      const picked = [...shuffle(pool.filter((g) => prefer.has(`gram:${g.id}`)), rand), ...shuffle(pool.filter((g) => !prefer.has(`gram:${g.id}`)), rand)].slice(0, count);
      const meanings = level.map((g) => g.meaning);
      return shuffle(picked, rand).map((g) => ({
        id: `gram:${g.id}`,
        kind: 'grammar',
        prompt: g.pattern,
        ja: true,
        sub: 'Apa artinya?',
        options: options(g.meaning, meanings, rand),
        answer: g.meaning,
        explain: `${g.example} — ${g.translation}`,
      }));
    }
    case 'pattern': {
      const topics = new Set(spec.topics);
      const pool = PROBLEMS.filter((p) => topics.has(p.topic));
      const learned = new Set(opts.learnedTopics ?? spec.topics);
      const patPool = [...new Set(PROBLEMS.filter((p) => learned.has(p.topic)).map((p) => p.pattern))];
      const allPats = Object.values(PATTERNS) as string[];
      const count = opts.count ?? 5;
      return shuffle(pool, rand)
        .slice(0, count)
        .map((p) => ({
          id: `pat:lc-${p.lc}`,
          kind: 'pattern',
          prompt: p.summary,
          sub: 'Pola apa yang cocok?',
          options: options(p.pattern, patPool.length >= 4 ? patPool : allPats, rand),
          answer: p.pattern,
          explain: `${p.title} (#${p.lc}) · Kenapa: ${p.idea}`,
        }));
    }
    case 'bigo': {
      return BIGO.map((b, i) => ({ id: `bigo:${i}`, kind: 'bigo', prompt: b.q, mono: true, sub: 'Kompleksitas waktunya?', options: shuffle(b.options, rand), answer: b.a, explain: b.why }));
    }
    case 'mix': {
      const parts = await Promise.all(spec.parts.map((p, i) => buildQuiz(p, { ...opts, count: p.kind === 'kana' ? 15 : undefined, seed: `${opts.seed ?? ''}:${i}` })));
      return parts.flat();
    }
  }
}

export function quizKind(spec: QuizSpec): QuizKind {
  return spec.kind === 'mix' ? (spec.parts[0].kind === 'mix' ? 'kana' : quizKind(spec.parts[0])) : spec.kind;
}

export const ALL_PROBLEMS = [...WARMUP_PROBLEMS, ...PROBLEMS];
