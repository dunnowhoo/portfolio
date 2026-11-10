// Struktur jalur: Section → Unit → Node (docs/dojo/01-PRD.md F3–F5, curriculum/*.md)

export type Track = 'jp' | 'dsa';

export type NodeType =
  | 'materi' // 📖 MD Dōjō
  | 'video' // 🎬 YouTube
  | 'irodori' // 📗 pelajaran Irodori
  | 'latihan' // 🎯 kuis bawaan (sprint, recall, tebak pola)
  | 'duolingo' // 🟢 target Duolingo
  | 'anki' // 🃏 target Anki
  | 'checkpoint' // 🏯 kuis penutup unit
  | 'boss' // 👹 set ber-timer / simulasi
  | 'milestone' // 🎌 ujian / war pendaftaran / hari H
  | 'refleksi' // ✍️ catatan singkat / checklist tulis
  | 'soal' // 🎯 satu soal DSA
  | 'bicara'; // 🗣️ sesi bicara

export type Level = 'E' | 'M' | 'H';

export type Problem = {
  lc: number;
  slug: string;
  title: string;
  level: Level;
  pattern: string; // label taksonomi (Tebak Pola)
  summary: string; // parafrase singkat buatan sendiri
  idea: string;
  lintcode?: number; // untuk soal premium LeetCode
  topic: string; // id topik, mis. d1
};

export type KanaSet = 'hira-a-no' | 'hira-ha-n' | 'hira-all' | 'hira-var' | 'kata-basic' | 'kata-full' | 'kana-all';

export type QuizSpec =
  | { kind: 'kana'; set: KanaSet }
  | { kind: 'kanji'; batches: number[] }
  | { kind: 'grammar'; level: 'n5' | 'n4' | 'n3'; from: number; to: number }
  | { kind: 'pattern'; topics: string[] }
  | { kind: 'bigo' }
  | { kind: 'mix'; parts: QuizSpec[] };

export type Irodori = { book: 'X' | 'Y' | 'Z' | 'ZZ'; lesson: number; title: string; pdf: string; audio?: string };

export type PathNode = {
  id: string;
  track: Track;
  sectionId: string;
  unitId: string;
  type: NodeType;
  title: string;
  subtitle?: string;
  minutes: number;
  xp: number;
  targetDate?: string; // YYYY-MM-DD, untuk garis pace
  required: boolean;
  big?: boolean; // boss section (150 XP)
  material?: { id: string; sections?: string[] };
  video?: { query: string; youtubeId?: string };
  irodori?: Irodori;
  problem?: Problem;
  quiz?: QuizSpec;
  passPct?: number; // checkpoint / boss: ambang lulus
  timeLimitS?: number;
  checklist?: string[];
  links?: { label: string; url: string }[];
  milestone?: 'jlpt-reg' | 'jlpt-exam' | 'misumi';
  note?: string;
};

export type Unit = {
  id: string; // mis. 1.4 atau d6
  sectionId: string;
  title: string;
  jp?: string;
  start?: string;
  end?: string;
  note?: string;
  nodes: PathNode[];
};

export type Section = {
  id: string;
  track: Track;
  title: string;
  jp?: string;
  start?: string;
  end?: string;
  optional?: boolean;
  units: Unit[];
};

export const NODE_ICON: Record<NodeType, string> = {
  materi: '📖',
  video: '🎬',
  irodori: '📗',
  latihan: '🎯',
  duolingo: '🟢',
  anki: '🃏',
  checkpoint: '🏯',
  boss: '👹',
  milestone: '🎌',
  refleksi: '✍️',
  soal: '🎯',
  bicara: '🗣️',
};

export const NODE_LABEL: Record<NodeType, string> = {
  materi: 'Materi',
  video: 'Video',
  irodori: 'Irodori',
  latihan: 'Latihan',
  duolingo: 'Duolingo',
  anki: 'Anki',
  checkpoint: 'Checkpoint',
  boss: 'Boss',
  milestone: 'Milestone',
  refleksi: 'Refleksi',
  soal: 'Soal',
  bicara: 'Sesi bicara',
};

// Tabel XP node (04-GAMIFICATION §2.1)
export const PROBLEM_XP: Record<Level, number> = { E: 10, M: 20, H: 40 };
export function baseXp(type: NodeType, opts: { level?: Level; big?: boolean; milestone?: PathNode['milestone'] } = {}): number {
  switch (type) {
    case 'materi':
      return 20;
    case 'video':
      return 10;
    case 'irodori':
      return 40;
    case 'latihan':
      return 10;
    case 'duolingo':
    case 'anki':
      return 30;
    case 'checkpoint':
      return 50;
    case 'boss':
      return opts.big ? 150 : 80;
    case 'milestone':
      return opts.milestone === 'jlpt-exam' ? 300 : opts.milestone === 'jlpt-reg' ? 100 : 100;
    case 'refleksi':
      return 20;
    case 'bicara':
      return 40;
    case 'soal':
      return PROBLEM_XP[opts.level ?? 'E'];
  }
}

// Bagi rata tanggal unit ke node-node di dalamnya (04-GAMIFICATION §9)
export function spreadDates(start: string, end: string, count: number): string[] {
  const s = Date.parse(`${start}T00:00:00Z`);
  const e = Date.parse(`${end}T00:00:00Z`);
  const span = Math.max(0, Math.round((e - s) / 86_400_000));
  return Array.from({ length: count }, (_, i) => {
    const offset = count <= 1 ? span : Math.round((span * (i + 1)) / count);
    return new Date(s + offset * 86_400_000).toISOString().slice(0, 10);
  });
}
