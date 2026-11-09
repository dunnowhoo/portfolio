// Tata letak adegan kucing. WIDE dipakai mulai md (kartu lebar), NARROW untuk HP.
// Semua angka dalam satuan viewBox SVG; lantai (floor) adalah garis tempat kucing berpijak.

export type TokKind = 'c' | 'k' | 's' | 'p' | 'f' | 'x';
export type Tok = [string, TokKind];

export type Range = { home: number; min: number; max: number };

export type Layout = {
  w: number;
  h: number;
  floor: number;
  s: number; // skala karakter
  male: number;
  female: Range;
  lynx: Range;
  ball: Range;
  shelf: { x: number; y: number };
  code: { x: number; y: number; size: number; lh: number; lines: Tok[][] };
};

// Baris terakhir yang "diketik" kucing hitam, bergantian.
export const TYPED = ["await cat.push('origin', 'main');", '// TODO: refill the treat bowl'];

const row = (coat: string, job: string, size?: string): Tok[] => [
  ['\u00a0\u00a0{ ', 'x'],
  ['coat', 'p'],
  [': ', 'x'],
  [`'${coat}'`, 's'],
  [', ', 'x'],
  ...(size ? ([['size', 'p'], [': ', 'x'], [`'${size}'`, 's'], [', ', 'x']] as Tok[]) : []),
  ['job', 'p'],
  [': ', 'x'],
  [`'${job}'`, 's'],
  [' },', 'x'],
];

const head: Tok[][] = [
  [['// the team behind every commit', 'c']],
  [['const', 'k'], [' team = [', 'x']],
];

const tail = (short: boolean): Tok[][] => [
  [['];', 'x']],
  [
    ['while', 'k'],
    [' (awake) team.', 'x'],
    ['forEach', 'f'],
    [short ? '((c) => c.' : '((cat) => cat.', 'x'],
    ['play', 'f'],
    ['());', 'x'],
  ],
];

export const WIDE: Layout = {
  w: 800,
  h: 440,
  floor: 392,
  s: 1,
  male: 215,
  female: { home: 405, min: 300, max: 530 },
  lynx: { home: 585, min: 70, max: 748 },
  ball: { home: 645, min: 560, max: 762 },
  shelf: { x: 642, y: 236 },
  code: {
    x: 58,
    y: 34,
    size: 13.5,
    lh: 20,
    lines: [
      ...head,
      row('seal point', 'senior napper', 'XL'),
      row('seal point', 'code reviewer', 'L'),
      row('seal lynx point', 'chaos engineer', 'M'),
      row('black', 'pushes to main', 'S'),
      ...tail(false),
    ],
  },
};

export const NARROW: Layout = {
  w: 520,
  h: 440,
  floor: 392,
  s: 0.86,
  male: 110,
  female: { home: 284, min: 205, max: 360 },
  lynx: { home: 420, min: 40, max: 492 },
  ball: { home: 470, min: 372, max: 500 },
  shelf: { x: 432, y: 230 },
  code: {
    x: 40,
    y: 62,
    size: 12,
    lh: 19,
    lines: [
      ...head,
      row('seal point', 'senior napper'),
      row('seal point', 'code reviewer'),
      row('lynx point', 'chaos engineer'),
      row('black', 'pushes to main'),
      ...tail(true),
    ],
  },
};
