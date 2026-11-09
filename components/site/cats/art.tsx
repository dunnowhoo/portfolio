import React from 'react';
import { TYPED, type Layout, type TokKind } from './layouts';

// Gambar SVG adegan kucing, gaya chibi: kepala besar, mata besar berkilau, pipi merona,
// mulut "ω", badan bulat, kaki mungil, garis tepi lembut. Koordinat tiap kucing lokal:
// (0,0) = tengah bawah, di lantai. Elemen yang digerakkan simulasi diberi ref lewat
// r(name); animasi diam (napas, kedip, ekor) memakai kelas CSS di globals.css.

export type RefFn = (name: string) => (el: SVGElement | null) => void;
type Art = { p: string; r: RefFn };

export const MALE_HEAD = { x: 0, y: -106 };
export const MALE_BELL = { x: 0, y: -54 }; // lonceng kalung = tombol rahasia
export const FS = 0.92; // kucing betina sedikit lebih kecil dari jantan
export const FEMALE_HEAD_Y = -98;
export const LYNX_HEAD = { x: 26, y: -58 };
export const DEV_HEAD_Y = -88;
export const LYNX_LEGS = { bf: [-18, -21], bn: [-11, -19], ff: [14, -21], fn: [21, -19] } as const;
export type LegName = keyof typeof LYNX_LEGS;

export const MONO = 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace';
const TOK: Record<TokKind, string> = {
  c: '#8e8e93',
  k: '#0066cc',
  s: '#b0683f',
  p: '#6e6e73',
  f: '#7b52c7',
  x: '#48484a',
};
const GITHUB =
  'M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z';

const u = (p: string, n: string) => `url(#${p}-${n})`;

function Grad({ id, stops, x2 = 0, y2 = 1 }: { id: string; stops: [number, string][]; x2?: number; y2?: number }) {
  return (
    <linearGradient id={id} x1="0" y1="0" x2={x2} y2={y2}>
      {stops.map(([o, c]) => (
        <stop key={o} offset={o} stopColor={c} />
      ))}
    </linearGradient>
  );
}

function Radial({ id, stops, cx = '42%', cy = '30%', r = '80%' }: { id: string; stops: [number, string, number?][]; cx?: string; cy?: string; r?: string }) {
  return (
    <radialGradient id={id} cx={cx} cy={cy} r={r}>
      {stops.map(([o, c, a]) => (
        <stop key={o} offset={o} stopColor={c} stopOpacity={a ?? 1} />
      ))}
    </radialGradient>
  );
}

export function Defs({ p }: { p: string }) {
  const id = (n: string) => `${p}-${n}`;
  return (
    <defs>
      {/* jantan seal point */}
      <Radial id={id('mb')} stops={[[0, '#fdf6ec'], [0.6, '#f1e3cd'], [1, '#dcc4a3']]} />
      <Radial id={id('mh')} stops={[[0, '#fefaf3'], [0.6, '#f3e6d2'], [1, '#e0caab']]} cx="45%" r="75%" />
      <Radial id={id('mm')} cx="50%" cy="50%" r="50%" stops={[[0, '#3a2920'], [0.45, '#3a2920', 0.92], [0.78, '#4e392d', 0.4], [1, '#4e392d', 0]]} />
      <Grad id={id('mt')} x2={-1} y2={0} stops={[[0, '#6e5547'], [1, '#2f2219']]} />
      <Radial id={id('bell')} cx="38%" cy="32%" r="70%" stops={[[0, '#ffefb8'], [0.55, '#f2c04e'], [1, '#b8841f']]} />
      {/* betina seal point, lebih terang */}
      <Radial id={id('fb')} stops={[[0, '#fffdf8'], [0.6, '#f8efe3'], [1, '#e8d7c1']]} />
      <Radial id={id('fm')} cx="50%" cy="50%" r="50%" stops={[[0, '#8d6c58', 0.75], [0.55, '#8d6c58', 0.5], [1, '#8d6c58', 0]]} />
      <Grad id={id('ft')} x2={1} y2={0} stops={[[0, '#9a7a66'], [1, '#d8c1ae']]} />
      {/* lynx point */}
      <Radial id={id('lb')} stops={[[0, '#fcf5ec'], [0.6, '#f2e6d5'], [1, '#ddc8ad']]} />
      <Radial id={id('lm')} cx="50%" cy="50%" r="50%" stops={[[0, '#7a5a48', 0.75], [0.6, '#7a5a48', 0.45], [1, '#7a5a48', 0]]} />
      <Grad id={id('ll')} stops={[[0, '#efe2cf'], [0.5, '#c7ab93'], [1, '#8a6a55']]} />
      <Grad id={id('llf')} stops={[[0, '#dccab3'], [0.5, '#ad8f77'], [1, '#6f5241']]} />
      {/* mata (iris) */}
      <Grad id={id('im')} stops={[[0, '#2a68b3'], [0.55, '#4aa3ea'], [1, '#a6e0ff']]} />
      <Grad id={id('if')} stops={[[0, '#4a9de0'], [0.55, '#7fc8f2'], [1, '#cdeffe']]} />
      <Grad id={id('il')} stops={[[0, '#3586d1'], [0.55, '#5ab4ec'], [1, '#b2e4ff']]} />
      <Grad id={id('id')} stops={[[0, '#8eae1c'], [0.55, '#c6e05a'], [1, '#f2fb9e']]} />
      {/* kucing hitam, laptop, bola, laser, lantai */}
      <Radial id={id('glow')} cx="50%" cy="60%" r="50%" stops={[[0, '#7cc0ff', 0.45], [1, '#7cc0ff', 0]]} />
      <Grad id={id('lid')} stops={[[0, '#f0f2f5'], [1, '#cfd3d9']]} />
      <Radial id={id('yarn')} cx="35%" cy="30%" r="75%" stops={[[0, '#9ccdf8'], [0.6, '#4f9be6'], [1, '#2f72c4']]} />
      <Radial id={id('laser')} cx="50%" cy="50%" r="50%" stops={[[0, '#ff3b30', 0.5], [1, '#ff3b30', 0]]} />
      <linearGradient id={id('floor')} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#efe8de" />
        <stop offset="1" stopColor="#f6f2ec" stopOpacity="0.3" />
      </linearGradient>
      {/* bentuk mata untuk clip pupil */}
      <clipPath id={id('eye-m')}>
        <ellipse rx="14" ry="16" />
      </clipPath>
      <clipPath id={id('eye-f')}>
        <ellipse rx="13" ry="15" />
      </clipPath>
      <clipPath id={id('eye-l')}>
        <ellipse rx="10" ry="11.5" />
      </clipPath>
      <clipPath id={id('eye-d')}>
        <ellipse rx="10" ry="11.5" />
      </clipPath>
    </defs>
  );
}

type EyeProps = Art & { name: string; x: number; y: number; rx: number; ry: number; iris: string; clip: string };

// Mata chibi: iris besar bergradasi, pupil besar, dua kilau putih. Pupil+kilau bergerak
// mengikuti laser (ref), dipotong bentuk mata.
function ChibiEye({ p, r, name, x, y, rx, ry, iris, clip }: EyeProps) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <ellipse rx={rx} ry={ry} fill={u(p, iris)} />
      <g clipPath={u(p, clip)}>
        <g ref={r(name)}>
          <ellipse cy={ry * 0.08} rx={rx * 0.56} ry={ry * 0.66} fill="#141416" />
          <circle cx={-rx * 0.3} cy={-ry * 0.34} r={rx * 0.34} fill="#fff" />
          <circle cx={rx * 0.32} cy={ry * 0.3} r={rx * 0.15} fill="#fff" opacity="0.9" />
        </g>
      </g>
      <ellipse rx={rx} ry={ry} fill="none" stroke="#1d140f" strokeWidth="2.2" />
    </g>
  );
}

type Placed = Art & { x: number; floor: number; s: number };

const OUT_M = '#5c4437';
export function MaleCat({ p, r, x, floor, s }: Placed) {
  return (
    <g transform={`translate(${x} ${floor}) scale(${s})`}>
      <ellipse cx="0" cy="2" rx="94" ry="9" fill="#000" opacity="0.07" />
      {/* kaki untuk mencakar laser; tersembunyi di balik badan saat diam */}
      <g ref={r('m-swat')}>
        <path d="M-50 -48 C -58 -52 -64 -48 -66 -42" fill="none" stroke="#ead7be" strokeWidth="14" strokeLinecap="round" />
        <ellipse cx="-68" cy="-40" rx="11" ry="9" fill="#4a362b" stroke={OUT_M} strokeOpacity="0.5" strokeWidth="2" />
      </g>
      <g className="cat-breathe">
        <ellipse cx="0" cy="-46" rx="82" ry="48" fill={u(p, 'mb')} stroke={OUT_M} strokeOpacity="0.45" strokeWidth="2.5" />
        <ellipse cx="0" cy="-32" rx="46" ry="30" fill="#fdf8f0" opacity="0.85" />
      </g>
      <g className="cat-tail-m">
        <path d="M70 -36 C 104 -32 108 -2 76 2 C 60 4 46 2 34 -2" fill="none" stroke={u(p, 'mt')} strokeWidth="18" strokeLinecap="round" />
      </g>
      <g stroke={OUT_M} strokeOpacity="0.5" strokeWidth="2" fill="#4a362b">
        <ellipse cx="-28" cy="-7" rx="17" ry="11" />
        <ellipse cx="28" cy="-7" rx="17" ry="11" />
      </g>
      <path d="M-34 -10 v-4 M-28 -11 v-4 M-22 -10 v-4 M22 -10 v-4 M28 -11 v-4 M34 -10 v-4" stroke="#2c1f18" strokeWidth="1.4" strokeLinecap="round" opacity="0.6" />
      <g ref={r('m-head')} transform={`translate(${MALE_HEAD.x} ${MALE_HEAD.y})`}>
        <path d="M-44 42 Q0 62 44 42" fill="none" stroke="#24467a" strokeWidth="8" strokeLinecap="round" />
        <g stroke={OUT_M} strokeOpacity="0.45" strokeWidth="2.2" strokeLinejoin="round">
          <path d="M-62 -12 C -66 -40 -64 -62 -54 -72 C -42 -66 -28 -54 -18 -44 Z" fill="#3b2a21" />
          <path d="M62 -12 C 66 -40 64 -62 54 -72 C 42 -66 28 -54 18 -44 Z" fill="#3b2a21" />
        </g>
        <path d="M-55 -20 C -58 -38 -56 -54 -50 -60 C -42 -54 -34 -46 -28 -40 Z" fill="#9a6a5c" />
        <path d="M55 -20 C 58 -38 56 -54 50 -60 C 42 -54 34 -46 28 -40 Z" fill="#9a6a5c" />
        <path d="M-68 4 C -68 -36 -38 -56 0 -56 C 38 -56 68 -36 68 4 C 68 36 38 52 0 52 C -38 52 -68 36 -68 4 Z" fill={u(p, 'mh')} stroke={OUT_M} strokeOpacity="0.45" strokeWidth="2.5" />
        <ellipse cx="0" cy="14" rx="50" ry="40" fill={u(p, 'mm')} />
        <g className="cat-blink">
          <ChibiEye p={p} r={r} name="m-pl" x={-27} y={6} rx={14} ry={16} iris="im" clip="eye-m" />
          <ChibiEye p={p} r={r} name="m-pr" x={27} y={6} rx={14} ry={16} iris="im" clip="eye-m" />
        </g>
        <ellipse cx="-48" cy="28" rx="10" ry="6" fill="#ff9fb0" opacity="0.5" />
        <ellipse cx="48" cy="28" rx="10" ry="6" fill="#ff9fb0" opacity="0.5" />
        <path d="M-5 21 Q0 18 5 21 Q2.5 25.5 0 26.5 Q-2.5 25.5 -5 21 Z" fill="#241812" />
        <path d="M-9 30 Q-4.5 35 0 30.5 Q4.5 35 9 30" fill="none" stroke="#f3e6d6" strokeWidth="2" strokeLinecap="round" opacity="0.9" />
        <path d="M-42 22 L-64 18 M-42 28 L-64 29 M42 22 L64 18 M42 28 L64 29" stroke="#fffaf2" strokeWidth="1.5" strokeLinecap="round" opacity="0.85" />
        <g className="collar-bell" transform="translate(0 52)">
          <circle r="8.5" fill={u(p, 'bell')} stroke="#9a6b16" strokeOpacity="0.6" strokeWidth="1.2" />
          <path d="M-5 2.5 H5" stroke="#8f6213" strokeWidth="1.5" strokeLinecap="round" />
          <circle cx="0" cy="4.5" r="1.4" fill="#8f6213" />
          <circle cx="-3" cy="-3.2" r="2" fill="#fff" opacity="0.85" />
        </g>
      </g>
    </g>
  );
}

const OUT_F = '#9a7a66';
export function FemaleCat({ p, r, x, floor, s }: Placed) {
  const k = s * FS;
  return (
    <>
      <g ref={r('female-shadow')} transform={`translate(${x} ${floor}) scale(${k})`}>
        <ellipse cx="0" cy="2" rx="62" ry="8" fill="#000" opacity="0.06" />
      </g>
      <g ref={r('female')} transform={`translate(${x} ${floor}) scale(${k})`}>
        <g className="cat-breathe-f">
          <ellipse cx="0" cy="-42" rx="56" ry="44" fill={u(p, 'fb')} stroke={OUT_F} strokeOpacity="0.5" strokeWidth="2.5" />
          <ellipse cx="0" cy="-32" rx="32" ry="26" fill="#fffefb" opacity="0.9" />
        </g>
        <g className="cat-tail-f">
          <path d="M-48 -30 C -78 -26 -80 0 -50 2 C -36 3 -24 1 -14 -2" fill="none" stroke={u(p, 'ft')} strokeWidth="14" strokeLinecap="round" />
        </g>
        <g stroke={OUT_F} strokeOpacity="0.5" strokeWidth="2" fill="#a8866f">
          <ellipse cx="-20" cy="-6" rx="14" ry="10" />
          <ellipse cx="20" cy="-6" rx="14" ry="10" />
        </g>
        <g ref={r('f-head')} transform={`translate(0 ${FEMALE_HEAD_Y})`}>
          <path d="M-38 38 Q0 56 38 38" fill="none" stroke="#ff8fab" strokeWidth="7" strokeLinecap="round" />
          <g stroke={OUT_F} strokeOpacity="0.5" strokeWidth="2.2" strokeLinejoin="round" fill="#9a7a66">
            <path d="M-56 -10 C -60 -36 -58 -56 -49 -65 C -38 -59 -25 -48 -16 -39 Z" />
            <path d="M56 -10 C 60 -36 58 -56 49 -65 C 38 -59 25 -48 16 -39 Z" />
          </g>
          <path d="M-49 -18 C -52 -34 -50 -48 -45 -54 C -38 -48 -31 -41 -25 -35 Z" fill="#f2c4c8" />
          <path d="M49 -18 C 52 -34 50 -48 45 -54 C 38 -48 31 -41 25 -35 Z" fill="#f2c4c8" />
          <path d="M-60 4 C -60 -32 -34 -50 0 -50 C 34 -50 60 -32 60 4 C 60 32 34 47 0 47 C -34 47 -60 32 -60 4 Z" fill={u(p, 'fb')} stroke={OUT_F} strokeOpacity="0.5" strokeWidth="2.5" />
          <ellipse cx="0" cy="12" rx="42" ry="34" fill={u(p, 'fm')} />
          <g className="cat-blink slow">
            <ChibiEye p={p} r={r} name="f-pl" x={-24} y={6} rx={13} ry={15} iris="if" clip="eye-f" />
            <ChibiEye p={p} r={r} name="f-pr" x={24} y={6} rx={13} ry={15} iris="if" clip="eye-f" />
          </g>
          <path d="M-35 -4 L-41 -8 M-34 -9 L-39 -14 M35 -4 L41 -8 M34 -9 L39 -14" stroke="#6d5243" strokeWidth="2" strokeLinecap="round" />
          <ellipse cx="-42" cy="26" rx="9.5" ry="5.5" fill="#ff8fa8" opacity="0.6" />
          <ellipse cx="42" cy="26" rx="9.5" ry="5.5" fill="#ff8fa8" opacity="0.6" />
          <path d="M-4.5 19 Q0 16.5 4.5 19 Q2.2 23 0 24 Q-2.2 23 -4.5 19 Z" fill="#e39d95" />
          <path d="M-8 27 Q-4 31.5 0 27.5 Q4 31.5 8 27" fill="none" stroke="#9a6a5f" strokeWidth="1.8" strokeLinecap="round" />
          <path d="M-36 20 L-58 16 M-36 25 L-58 26 M36 20 L58 16 M36 25 L58 26" stroke="#fff" strokeWidth="1.4" strokeLinecap="round" opacity="0.9" />
          <g transform="translate(-40 -44) rotate(-18)">
            <path d="M0 0 L-13 -8 Q-15 0 -13 8 Z M0 0 L13 -8 Q15 0 13 8 Z" fill="#ff8fab" stroke="#ff6f96" strokeWidth="1.2" strokeLinejoin="round" />
            <circle r="4" fill="#ff6f96" />
          </g>
          <path d="M0 52 C -4 47.5 -9 51 -4.5 55.5 L0 59 L4.5 55.5 C 9 51 4 47.5 0 52 Z" fill="#ffc2d1" stroke="#ff7aa0" strokeWidth="1" />
        </g>
      </g>
    </>
  );
}

const OUT_L = '#7a5a48';
const TAIL = 'M-30 -32 C -52 -38 -58 -64 -46 -76 C -40 -82 -32 -78 -34 -71';

function Leg({ p, r, name, far = false }: Art & { name: LegName; far?: boolean }) {
  const [x, y] = LYNX_LEGS[name];
  return (
    <g ref={r(`l-${name}`)} transform={`rotate(0 ${x} ${y})`}>
      <rect x={x - 5.5} y={y - 3} width="11" height="23" rx="5.5" fill={u(p, far ? 'llf' : 'll')} stroke={OUT_L} strokeOpacity="0.35" strokeWidth="1.5" />
      <path d={`M${x - 5} ${y + 8} h10 M${x - 5} ${y + 14} h10`} stroke="#4a3529" strokeWidth="1.8" opacity={far ? 0.35 : 0.45} />
      <ellipse cx={x + 1} cy={y + 19} rx="6.5" ry="4" fill={far ? '#5d4434' : '#6f5241'} />
    </g>
  );
}

export function LynxCat({ p, r, x, floor, s, face }: Placed & { face: number }) {
  return (
    <>
      <g ref={r('lynx-shadow')} transform={`translate(${x} ${floor}) scale(${s})`}>
        <ellipse cx="4" cy="2" rx="46" ry="6" fill="#000" opacity="0.07" />
      </g>
      <g ref={r('lynx')} transform={`translate(${x} ${floor}) scale(${s * face} ${s})`}>
        <g ref={r('lynx-body')} transform="rotate(-5 20 -14)">
          <g className="cat-tail-l">
            <path d={TAIL} fill="none" stroke="#8b6b56" strokeWidth="9" strokeLinecap="round" />
            <path d={TAIL} fill="none" stroke="#3f2c22" strokeWidth="9" strokeDasharray="4 6" opacity="0.7" />
          </g>
          <Leg p={p} r={r} name="bf" far />
          <Leg p={p} r={r} name="ff" far />
          <ellipse cx="0" cy="-30" rx="34" ry="21" fill={u(p, 'lb')} stroke={OUT_L} strokeOpacity="0.45" strokeWidth="2.2" />
          <ellipse cx="4" cy="-21" rx="22" ry="8" fill="#fdf7ef" opacity="0.85" />
          <Leg p={p} r={r} name="bn" />
          <Leg p={p} r={r} name="fn" />
          <g transform={`translate(${LYNX_HEAD.x} ${LYNX_HEAD.y})`}>
            <g stroke={OUT_L} strokeOpacity="0.45" strokeWidth="2" strokeLinejoin="round" fill="#6f523f">
              <path d="M-30 -6 C -34 -26 -32 -40 -25 -46 C -16 -41 -8 -32 -4 -25 Z" />
              <path d="M30 -6 C 34 -26 32 -40 25 -46 C 16 -41 8 -32 4 -25 Z" />
            </g>
            <path d="M-25 -12 C -27 -24 -26 -34 -22 -38 C -16 -34 -11 -28 -9 -23 Z" fill="#e8bdb6" />
            <path d="M25 -12 C 27 -24 26 -34 22 -38 C 16 -34 11 -28 9 -23 Z" fill="#e8bdb6" />
            <path d="M-34 2 C -34 -22 -18 -32 0 -32 C 18 -32 34 -22 34 2 C 34 20 18 29 0 29 C -18 29 -34 20 -34 2 Z" fill={u(p, 'lb')} stroke={OUT_L} strokeOpacity="0.45" strokeWidth="2.2" />
            <ellipse cx="0" cy="8" rx="24" ry="20" fill={u(p, 'lm')} />
            <path d="M-7 -27 L-5 -18 M0 -29 L0 -19 M7 -27 L5 -18" stroke="#4a3529" strokeWidth="2" strokeLinecap="round" opacity="0.7" />
            <path d="M-34 4 L-26 5 M-33 10 L-26 10 M34 4 L26 5 M33 10 L26 10" stroke="#4a3529" strokeWidth="1.6" strokeLinecap="round" opacity="0.5" />
            <g className="cat-blink fast">
              <ChibiEye p={p} r={r} name="l-pl" x={-13} y={3} rx={10} ry={11.5} iris="il" clip="eye-l" />
              <ChibiEye p={p} r={r} name="l-pr" x={13} y={3} rx={10} ry={11.5} iris="il" clip="eye-l" />
            </g>
            <ellipse cx="-23" cy="15" rx="6" ry="3.5" fill="#ff9fb0" opacity="0.5" />
            <ellipse cx="23" cy="15" rx="6" ry="3.5" fill="#ff9fb0" opacity="0.5" />
            <path d="M-3 11 Q0 9.5 3 11 Q1.5 13.8 0 14.4 Q-1.5 13.8 -3 11 Z" fill="#c7867a" />
            <path d="M-5.5 17 Q-2.7 20 0 17.3 Q2.7 20 5.5 17" fill="none" stroke="#7a5246" strokeWidth="1.5" strokeLinecap="round" />
            <path d="M-20 12 L-38 9 M-20 16 L-38 17 M20 12 L38 9 M20 16 L38 17" stroke="#fff" strokeWidth="1.2" strokeLinecap="round" opacity="0.85" />
          </g>
        </g>
      </g>
    </>
  );
}

export function Shelf({ x, y, s }: { x: number; y: number; s: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <ellipse cx="0" cy="22" rx="78" ry="7" fill="#000" opacity="0.035" />
      <path d="M-56 10 L-56 24 L-42 10 Z M56 10 L56 24 L42 10 Z" fill="#dccdbd" />
      <rect x="-84" y="0" width="168" height="10" rx="5" fill="#ece2d6" />
      <rect x="-84" y="7" width="168" height="3" rx="1.5" fill="#d9cabb" />
    </g>
  );
}

export function DevCat({ p, r, x, y, s }: Art & { x: number; y: number; s: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <path d="M-48 -60 C -54 -110 -26 -134 0 -134 C 26 -134 54 -110 48 -60 Z" fill="#0a6ccf" />
      <path d="M-42 -4 C -44 -44 -26 -64 0 -64 C 26 -64 44 -44 42 -4 Z" fill="#0066cc" />
      <g className="dev-type">
        <path d="M-38 -98 C -42 -122 -38 -138 -31 -143 C -22 -137 -13 -126 -9 -116 Z" fill="#232326" />
        <path d="M38 -98 C 42 -122 38 -138 31 -143 C 22 -137 13 -126 9 -116 Z" fill="#232326" />
        <path d="M-32 -104 C -34 -120 -32 -131 -28 -134 C -22 -129 -17 -122 -14 -116 Z" fill="#4a4a50" />
        <path d="M32 -104 C 34 -120 32 -131 28 -134 C 22 -129 17 -122 14 -116 Z" fill="#4a4a50" />
        <ellipse cx="0" cy={DEV_HEAD_Y} rx="40" ry="34" fill="#27272b" />
        <ellipse cx="-12" cy="-108" rx="15" ry="7" fill="#fff" opacity="0.07" />
        <ellipse cx="0" cy="-74" rx="30" ry="18" fill={u(p, 'glow')} />
        <g className="cat-blink">
          <ChibiEye p={p} r={r} name="d-pl" x={-15} y={-90} rx={10} ry={11.5} iris="id" clip="eye-d" />
          <ChibiEye p={p} r={r} name="d-pr" x={15} y={-90} rx={10} ry={11.5} iris="id" clip="eye-d" />
        </g>
        <ellipse cx="-27" cy="-76" rx="6" ry="3.5" fill="#ff7f9f" opacity="0.4" />
        <ellipse cx="27" cy="-76" rx="6" ry="3.5" fill="#ff7f9f" opacity="0.4" />
        <path d="M-3 -79 Q0 -81 3 -79 Q1.5 -76.5 0 -76 Q-1.5 -76.5 -3 -79 Z" fill="#f0a5a5" />
        <path d="M-5 -73 Q-2.5 -70.5 0 -72.8 Q2.5 -70.5 5 -73" fill="none" stroke="#9a9aa0" strokeWidth="1.4" strokeLinecap="round" />
        <path d="M-22 -77 L-44 -80 M-22 -73 L-44 -72 M22 -77 L44 -80 M22 -73 L44 -72" stroke="#fff" strokeWidth="1" strokeLinecap="round" opacity="0.55" />
      </g>
      <rect x="-42" y="-68" width="84" height="62" rx="7" fill={u(p, 'lid')} stroke="#b8bec6" strokeWidth="1" />
      <a href="https://github.com/dunnowhoo" target="_blank" rel="noreferrer" tabIndex={-1} className="cat-gh">
        <g transform="translate(-13.8 -50.8) scale(1.15)">
          <path d={GITHUB} fill="#1d1d1f" fillRule="evenodd" clipRule="evenodd" opacity="0.82" />
        </g>
      </a>
      <rect x="-50" y="-7" width="100" height="7" rx="3.5" fill="#c9cdd3" />
      <g fontFamily={MONO} fontSize="10" fontWeight="600" pointerEvents="none">
        <text className="dev-bit" x="-66" y="-66" fill="#0066cc">{'{ }'}</text>
        <text className="dev-bit d2" x="52" y="-68" fill="#b0683f">;</text>
        <text className="dev-bit d3" x="-60" y="-72" fill="#7b52c7">=&gt;</text>
        <text className="dev-bit d4" x="48" y="-64" fill="#0066cc">&lt;/&gt;</text>
      </g>
    </g>
  );
}

export function Ball({ p, r, x, floor, s }: Placed) {
  return (
    <>
      <g ref={r('ball-shadow')} transform={`translate(${x} ${floor}) scale(${s})`}>
        <ellipse cx="0" cy="1.5" rx="13" ry="3.2" fill="#000" opacity="0.1" />
      </g>
      <g ref={r('ball')} transform={`translate(${x} ${floor - 13 * s}) scale(${s})`}>
        <g ref={r('ball-rot')}>
          <circle r="13" fill={u(p, 'yarn')} stroke="#2a66b0" strokeOpacity="0.4" strokeWidth="1.5" />
          <path
            d="M-12 -4 C -4 -11 6 -11 12 -5 M-12.5 3 C -3 -5 7 -5 12.5 2 M-10 8.5 C -2 3 6 3 10.5 8 M-5 -12 C 2 -4 2 6 -4 12.5"
            fill="none"
            stroke="#2a66b0"
            strokeWidth="1.2"
            opacity="0.65"
          />
        </g>
        <path d="M11 6 C 18 9 20 4 26 6" fill="none" stroke="#4f9be6" strokeWidth="1.4" strokeLinecap="round" />
      </g>
    </>
  );
}

export function Laser({ p, r }: Art) {
  return (
    <g ref={r('laser')} opacity="0" pointerEvents="none">
      <circle r="18" fill={u(p, 'laser')} />
      <circle r="5.5" fill="#ff3b30" />
      <circle r="2.2" fill="#fff" opacity="0.85" />
    </g>
  );
}

export function CodeBackdrop({ r, code }: { r: RefFn; code: Layout['code'] }) {
  const n = code.lines.length;
  const ty = code.y + n * code.lh;
  const cw = code.size * 0.6;
  return (
    <g fontFamily={MONO} fontSize={code.size} opacity="0.5" pointerEvents="none" style={{ whiteSpace: 'pre' }}>
      {code.lines.map((line, i) => (
        <g key={i}>
          <text x={code.x - 14} y={code.y + i * code.lh} textAnchor="end" fill="#b8b8be">
            {i + 1}
          </text>
          <text x={code.x} y={code.y + i * code.lh}>
            {line.map(([t, k], j) => (
              <tspan key={j} fill={TOK[k]}>
                {t}
              </tspan>
            ))}
          </text>
        </g>
      ))}
      <text x={code.x - 14} y={ty} textAnchor="end" fill="#b8b8be">
        {n + 1}
      </text>
      <text ref={r('typed')} x={code.x} y={ty} fill={TOK.x}>
        {TYPED[0]}
      </text>
      <rect
        ref={r('caret')}
        className="code-caret"
        x={code.x + TYPED[0].length * cw + 1}
        y={ty - code.size + 2}
        width={cw * 0.85}
        height={code.size + 1}
        rx="1"
        fill="#0066cc"
      />
    </g>
  );
}

export function Pop({ x, y, text }: { x: number; y: number; text: string }) {
  return (
    <g transform={`translate(${x.toFixed(1)} ${y.toFixed(1)})`} pointerEvents="none">
      <g className="cat-pop">
        <path d="M0 4 C -6 -3 -13 3 -6 9 L0 14 L6 9 C 13 3 6 -3 0 4 Z" fill="#ff6b8b" />
        <text y="-5" textAnchor="middle" fontSize="12" fontWeight="600" fill="#6e6e73">
          {text}
        </text>
      </g>
    </g>
  );
}
