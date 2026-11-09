import React from 'react';
import { TYPED, type Layout, type TokKind } from './layouts';

// Gambar SVG adegan kucing. Koordinat tiap kucing lokal: (0,0) = tengah bawah, di lantai.
// Elemen yang digerakkan simulasi diberi ref lewat r(name); animasi diam (napas, kedip,
// ekor) memakai kelas CSS di globals.css supaya jalan di compositor.

export type RefFn = (name: string) => (el: SVGElement | null) => void;
type Art = { p: string; r: RefFn };

export const MALE_HEAD = { x: -50, y: -96 };
export const MALE_BELL = { x: -50, y: -44 }; // lonceng kalung = tombol rahasia
export const FS = 0.92; // kucing betina sedikit lebih kecil dari jantan
export const FEMALE_HEAD_Y = -118;
export const LYNX_HEAD = { x: 40, y: -62 };
export const DEV_HEAD_Y = -84;
export const LYNX_LEGS = { bf: [-24, -36], bn: [-16, -34], ff: [22, -36], fn: [30, -34] } as const;
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

export function Defs({ p }: { p: string }) {
  const id = (n: string) => `${p}-${n}`;
  return (
    <defs>
      {/* jantan seal point */}
      <radialGradient id={id('mb')} cx="38%" cy="28%" r="85%">
        <stop offset="0" stopColor="#fbf3e8" />
        <stop offset="0.55" stopColor="#f0e1cb" />
        <stop offset="1" stopColor="#d6bd9c" />
      </radialGradient>
      <radialGradient id={id('mh')} cx="45%" cy="32%" r="78%">
        <stop offset="0" stopColor="#fdf6ec" />
        <stop offset="0.6" stopColor="#f1e3cd" />
        <stop offset="1" stopColor="#dcc4a3" />
      </radialGradient>
      <radialGradient id={id('mm')} cx="50%" cy="50%" r="50%">
        <stop offset="0" stopColor="#3a2920" />
        <stop offset="0.5" stopColor="#3a2920" stopOpacity="0.96" />
        <stop offset="0.8" stopColor="#4e392d" stopOpacity="0.45" />
        <stop offset="1" stopColor="#4e392d" stopOpacity="0" />
      </radialGradient>
      <linearGradient id={id('mt')} x1="1" y1="0" x2="0" y2="0">
        <stop offset="0" stopColor="#6e5547" />
        <stop offset="1" stopColor="#2f2219" />
      </linearGradient>
      <radialGradient id={id('bell')} cx="38%" cy="32%" r="70%">
        <stop offset="0" stopColor="#ffe9a8" />
        <stop offset="0.55" stopColor="#f0bd4a" />
        <stop offset="1" stopColor="#b8841f" />
      </radialGradient>
      {/* betina seal point, lebih terang */}
      <radialGradient id={id('fb')} cx="40%" cy="30%" r="85%">
        <stop offset="0" stopColor="#fffbf5" />
        <stop offset="0.6" stopColor="#f7ede0" />
        <stop offset="1" stopColor="#e6d4bd" />
      </radialGradient>
      <radialGradient id={id('fm')} cx="50%" cy="50%" r="50%">
        <stop offset="0" stopColor="#8d6c58" stopOpacity="0.85" />
        <stop offset="0.55" stopColor="#8d6c58" stopOpacity="0.6" />
        <stop offset="1" stopColor="#8d6c58" stopOpacity="0" />
      </radialGradient>
      <linearGradient id={id('fl')} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#f7ede0" />
        <stop offset="0.55" stopColor="#d9c1ad" />
        <stop offset="1" stopColor="#9a7a66" />
      </linearGradient>
      <linearGradient id={id('ft')} x1="1" y1="0" x2="0" y2="0">
        <stop offset="0" stopColor="#d2b8a4" />
        <stop offset="1" stopColor="#8d6c58" />
      </linearGradient>
      {/* lynx point */}
      <radialGradient id={id('lb')} cx="45%" cy="30%" r="80%">
        <stop offset="0" stopColor="#fbf3e9" />
        <stop offset="0.6" stopColor="#f2e5d3" />
        <stop offset="1" stopColor="#dcc6aa" />
      </radialGradient>
      <radialGradient id={id('lm')} cx="50%" cy="50%" r="50%">
        <stop offset="0" stopColor="#7a5a48" stopOpacity="0.8" />
        <stop offset="0.6" stopColor="#7a5a48" stopOpacity="0.5" />
        <stop offset="1" stopColor="#7a5a48" stopOpacity="0" />
      </radialGradient>
      <linearGradient id={id('ll')} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#efe2cf" />
        <stop offset="0.5" stopColor="#c7ab93" />
        <stop offset="1" stopColor="#8a6a55" />
      </linearGradient>
      <linearGradient id={id('llf')} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#dccab3" />
        <stop offset="0.5" stopColor="#ad8f77" />
        <stop offset="1" stopColor="#6f5241" />
      </linearGradient>
      {/* kucing hitam, laptop, bola, laser, lantai */}
      <radialGradient id={id('glow')} cx="50%" cy="60%" r="50%">
        <stop offset="0" stopColor="#7cc0ff" stopOpacity="0.45" />
        <stop offset="1" stopColor="#7cc0ff" stopOpacity="0" />
      </radialGradient>
      <linearGradient id={id('lid')} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#f0f2f5" />
        <stop offset="1" stopColor="#cfd3d9" />
      </linearGradient>
      <radialGradient id={id('yarn')} cx="35%" cy="30%" r="75%">
        <stop offset="0" stopColor="#9ccdf8" />
        <stop offset="0.6" stopColor="#4f9be6" />
        <stop offset="1" stopColor="#2f72c4" />
      </radialGradient>
      <radialGradient id={id('laser')} cx="50%" cy="50%" r="50%">
        <stop offset="0" stopColor="#ff3b30" stopOpacity="0.5" />
        <stop offset="1" stopColor="#ff3b30" stopOpacity="0" />
      </radialGradient>
      <linearGradient id={id('floor')} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#efe8de" />
        <stop offset="1" stopColor="#f6f2ec" stopOpacity="0.3" />
      </linearGradient>
      {/* bentuk mata untuk clip pupil */}
      <clipPath id={id('eye-m')}>
        <path d={M_EYE} />
      </clipPath>
      <clipPath id={id('eye-f')}>
        <path d={F_EYE} />
      </clipPath>
      <clipPath id={id('eye-l')}>
        <path d={L_EYE} />
      </clipPath>
      <clipPath id={id('eye-d')}>
        <path d={D_EYE} />
      </clipPath>
    </defs>
  );
}

const M_EYE = 'M-12 0 Q0 -13 12 0 Q0 11 -12 0 Z';
const F_EYE = 'M-10 0 Q0 -13 10 0 Q0 11 -10 0 Z';
const L_EYE = 'M-7 0 Q0 -9 7 0 Q0 8 -7 0 Z';
const D_EYE = 'M-6.5 0 A6.5 7 0 1 0 6.5 0 A6.5 7 0 1 0 -6.5 0 Z';

type EyeProps = Art & {
  name: string;
  x: number;
  y: number;
  rot?: number;
  shape: string;
  clip: string;
  iris: string;
  prx: number;
  pry: number;
};

function Eye({ p, r, name, x, y, rot = 0, shape, clip, iris, prx, pry }: EyeProps) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot})`}>
      <path d={shape} fill={iris} />
      <g clipPath={u(p, clip)}>
        <g ref={r(name)}>
          <ellipse rx={prx} ry={pry} fill="#121214" />
          <circle cx={-prx * 0.55} cy={-pry * 0.5} r={Math.max(1.3, prx * 0.55)} fill="#fff" opacity="0.92" />
        </g>
      </g>
      <path d={shape} fill="none" stroke="#1d140f" strokeOpacity="0.3" strokeWidth="1" />
    </g>
  );
}

type Placed = Art & { x: number; floor: number; s: number };

export function MaleCat({ p, r, x, floor, s }: Placed) {
  return (
    <g transform={`translate(${x} ${floor}) scale(${s})`}>
      <ellipse cx="0" cy="2" rx="114" ry="9" fill="#000" opacity="0.07" />
      {/* kaki untuk mencakar laser; tersembunyi di balik badan saat diam */}
      <g ref={r('m-swat')}>
        <path d="M-66 -32 C -76 -34 -84 -30 -88 -24" fill="none" stroke="#ead7be" strokeWidth="15" strokeLinecap="round" />
        <ellipse cx="-90" cy="-22" rx="11" ry="8.5" fill="#4a362b" />
      </g>
      <g className="cat-breathe">
        <path d="M-104 0 C -113 -64 -64 -120 10 -120 C 86 -120 118 -66 106 0 Z" fill={u(p, 'mb')} />
        <ellipse cx="-44" cy="-36" rx="46" ry="30" fill="#fdf7ee" opacity="0.8" />
      </g>
      <g className="cat-tail-m">
        <path d="M98 -16 C 116 -4 102 8 74 8 C 48 8 24 6 6 3" fill="none" stroke={u(p, 'mt')} strokeWidth="17" strokeLinecap="round" />
      </g>
      <ellipse cx="-76" cy="-5" rx="16" ry="8.5" fill="#4a362b" />
      <ellipse cx="-36" cy="-5" rx="16" ry="8.5" fill="#4a362b" />
      <path d="M-84 -9 v4 M-76 -10 v4 M-68 -9 v4 M-44 -9 v4 M-36 -10 v4 M-28 -9 v4" stroke="#2c1f18" strokeWidth="1.2" opacity="0.45" />
      <g ref={r('m-head')} transform={`translate(${MALE_HEAD.x} ${MALE_HEAD.y})`}>
        <path d="M-38 38 Q0 56 38 38" fill="none" stroke="#24467a" strokeWidth="7" strokeLinecap="round" />
        <path d="M-50 -16 L-48 -68 Q-46 -76 -38 -72 L-12 -44 Z" fill="#3b2a21" />
        <path d="M-43 -24 L-42 -60 L-21 -42 Z" fill="#6f4e3f" />
        <path d="M50 -16 L48 -68 Q46 -76 38 -72 L12 -44 Z" fill="#3b2a21" />
        <path d="M43 -24 L42 -60 L21 -42 Z" fill="#6f4e3f" />
        <path d="M-62 6 C -64 -30 -35 -53 0 -53 C 35 -53 64 -30 62 6 C 60 33 33 49 0 49 C -33 49 -60 33 -62 6 Z" fill={u(p, 'mh')} />
        <ellipse cx="0" cy="10" rx="41" ry="37" fill={u(p, 'mm')} />
        <g className="cat-blink">
          <Eye p={p} r={r} name="m-pl" x={-20} y={2} rot={-8} shape={M_EYE} clip="eye-m" iris="#4b9be2" prx={3.4} pry={6.2} />
          <Eye p={p} r={r} name="m-pr" x={20} y={2} rot={8} shape={M_EYE} clip="eye-m" iris="#4b9be2" prx={3.4} pry={6.2} />
        </g>
        <path d="M-6 21 Q0 18 6 21 Q3 26 0 27 Q-3 26 -6 21 Z" fill="#1b120d" />
        <path d="M0 27 Q-4 32 -9 30 M0 27 Q4 32 9 30" fill="none" stroke="#1b120d" strokeWidth="1.6" strokeLinecap="round" />
        <path d="M-22 23 L-60 16 M-22 28 L-60 30 M22 23 L60 16 M22 28 L60 30" stroke="#fffaf2" strokeWidth="1.2" strokeLinecap="round" opacity="0.8" />
        <g className="collar-bell" transform="translate(0 52)">
          <circle r="7.5" fill={u(p, 'bell')} />
          <path d="M-4.5 2 H4.5" stroke="#8f6213" strokeWidth="1.4" strokeLinecap="round" />
          <circle cx="0" cy="3.8" r="1.3" fill="#8f6213" />
          <circle cx="-2.6" cy="-2.8" r="1.7" fill="#fff" opacity="0.85" />
        </g>
      </g>
    </g>
  );
}

export function FemaleCat({ p, r, x, floor, s }: Placed) {
  const k = s * FS;
  return (
    <>
      <g ref={r('female-shadow')} transform={`translate(${x} ${floor}) scale(${k})`}>
        <ellipse cx="0" cy="2" rx="62" ry="8" fill="#000" opacity="0.06" />
      </g>
      <g ref={r('female')} transform={`translate(${x} ${floor}) scale(${k})`}>
        <g className="cat-breathe-f">
          <path d="M-56 0 C -68 -42 -50 -100 0 -104 C 50 -100 68 -42 56 0 Z" fill={u(p, 'fb')} />
          <ellipse cx="0" cy="-62" rx="27" ry="31" fill="#fffdf9" opacity="0.9" />
        </g>
        <rect x="-21" y="-60" width="15" height="60" rx="7.5" fill={u(p, 'fl')} />
        <rect x="6" y="-60" width="15" height="60" rx="7.5" fill={u(p, 'fl')} />
        <ellipse cx="-13.5" cy="-3" rx="10.5" ry="6" fill="#8d6c58" />
        <ellipse cx="13.5" cy="-3" rx="10.5" ry="6" fill="#8d6c58" />
        <g className="cat-tail-f">
          <path d="M52 -14 C 68 -4 54 7 24 7 C 0 7 -18 4 -32 -1" fill="none" stroke={u(p, 'ft')} strokeWidth="13" strokeLinecap="round" />
        </g>
        <g ref={r('f-head')} transform={`translate(0 ${FEMALE_HEAD_Y})`}>
          <path d="M-30 31 Q0 43 30 31" fill="none" stroke="#ff8fab" strokeWidth="6" strokeLinecap="round" />
          <path d="M-40 -14 L-38 -58 Q-36 -65 -29 -61 L-10 -38 Z" fill="#8d6c58" />
          <path d="M-34 -21 L-33 -51 L-17 -37 Z" fill="#d9b5a6" />
          <path d="M40 -14 L38 -58 Q36 -65 29 -61 L10 -38 Z" fill="#8d6c58" />
          <path d="M34 -21 L33 -51 L17 -37 Z" fill="#d9b5a6" />
          <path d="M-48 5 C -50 -26 -28 -44 0 -44 C 28 -44 50 -26 48 5 C 46 27 26 39 0 39 C -26 39 -46 27 -48 5 Z" fill={u(p, 'fb')} />
          <ellipse cx="0" cy="8" rx="31" ry="28" fill={u(p, 'fm')} />
          <g className="cat-blink slow">
            <Eye p={p} r={r} name="f-pl" x={-16} y={1} rot={-6} shape={F_EYE} clip="eye-f" iris="#7fc8f2" prx={3.2} pry={6} />
            <Eye p={p} r={r} name="f-pr" x={16} y={1} rot={6} shape={F_EYE} clip="eye-f" iris="#7fc8f2" prx={3.2} pry={6} />
          </g>
          <path d="M-25 -3 L-29 -7 M-24 -6 L-27 -11 M25 -3 L29 -7 M24 -6 L27 -11" stroke="#6d5243" strokeWidth="1.5" strokeLinecap="round" />
          <path d="M-5 17 Q0 14.5 5 17 Q2.5 21 0 22 Q-2.5 21 -5 17 Z" fill="#d0948a" />
          <path d="M0 22 Q-3.5 26 -7.5 24.5 M0 22 Q3.5 26 7.5 24.5" stroke="#8a5f55" strokeWidth="1.4" fill="none" strokeLinecap="round" />
          <path d="M-18 19 L-50 13 M-18 23 L-50 25 M18 19 L50 13 M18 23 L50 25" stroke="#fff" strokeWidth="1.1" strokeLinecap="round" opacity="0.85" />
          <path d="M0 43.5 C -4 39 -9 42.5 -4.5 47 L0 50.5 L4.5 47 C 9 42.5 4 39 0 43.5 Z" fill="#ffc2d1" stroke="#ff7aa0" strokeWidth="1" />
        </g>
      </g>
    </>
  );
}

const TAIL = 'M-38 -46 C -60 -54 -70 -84 -55 -97 C -47 -104 -38 -99 -40 -91';

function Leg({ p, r, name, far = false }: Art & { name: LegName; far?: boolean }) {
  const [x, y] = LYNX_LEGS[name];
  return (
    <g ref={r(`l-${name}`)} transform={`rotate(0 ${x} ${y})`}>
      <rect x={x - 6} y={y - 4} width="12" height="38" rx="6" fill={u(p, far ? 'llf' : 'll')} />
      <path d={`M${x - 5} ${y + 13} h10 M${x - 5} ${y + 20} h10 M${x - 5} ${y + 27} h10`} stroke="#4a3529" strokeWidth="1.8" opacity={far ? 0.35 : 0.45} />
      <ellipse cx={x + 1.5} cy={y + 33} rx="7" ry="4.2" fill={far ? '#5d4434' : '#6f5241'} />
    </g>
  );
}

export function LynxCat({ p, r, x, floor, s, face }: Placed & { face: number }) {
  return (
    <>
      <g ref={r('lynx-shadow')} transform={`translate(${x} ${floor}) scale(${s})`}>
        <ellipse cx="0" cy="2" rx="50" ry="6" fill="#000" opacity="0.07" />
      </g>
      <g ref={r('lynx')} transform={`translate(${x} ${floor}) scale(${s * face} ${s})`}>
        <g ref={r('lynx-body')} transform="rotate(-5 30 -20)">
          <g className="cat-tail-l">
            <path d={TAIL} fill="none" stroke="#8b6b56" strokeWidth="10" strokeLinecap="round" />
            <path d={TAIL} fill="none" stroke="#3f2c22" strokeWidth="10" strokeDasharray="4 7" opacity="0.7" />
          </g>
          <Leg p={p} r={r} name="bf" far />
          <Leg p={p} r={r} name="ff" far />
          <ellipse cx="0" cy="-39" rx="43" ry="25" fill={u(p, 'lb')} />
          <ellipse cx="6" cy="-24" rx="30" ry="9" fill="#fdf7ef" opacity="0.85" />
          <Leg p={p} r={r} name="bn" />
          <Leg p={p} r={r} name="fn" />
          <g transform={`translate(${LYNX_HEAD.x} ${LYNX_HEAD.y})`}>
            <path d="M-21 -8 L-19 -37 Q-17 -42 -12 -39 L-3 -21 Z" fill="#6f523f" />
            <path d="M-17 -13 L-16 -32 L-7 -22 Z" fill="#caa792" />
            <path d="M21 -8 L19 -37 Q17 -42 12 -39 L3 -21 Z" fill="#6f523f" />
            <path d="M17 -13 L16 -32 L7 -22 Z" fill="#caa792" />
            <ellipse rx="25" ry="22" fill={u(p, 'lb')} />
            <ellipse cx="0" cy="4" rx="19" ry="17" fill={u(p, 'lm')} />
            <path d="M-6 -19 L-4 -9 M0 -21 L0 -10 M6 -19 L4 -9" stroke="#4a3529" strokeWidth="1.6" strokeLinecap="round" opacity="0.7" />
            <path d="M-24 2 L-15 3 M-24 7 L-16 7 M24 2 L15 3 M24 7 L16 7" stroke="#4a3529" strokeWidth="1.4" strokeLinecap="round" opacity="0.5" />
            <g className="cat-blink fast">
              <Eye p={p} r={r} name="l-pl" x={-9} y={-1} shape={L_EYE} clip="eye-l" iris="#56aee6" prx={2.4} pry={4.4} />
              <Eye p={p} r={r} name="l-pr" x={9} y={-1} shape={L_EYE} clip="eye-l" iris="#56aee6" prx={2.4} pry={4.4} />
            </g>
            <path d="M-3.5 7 Q0 5.5 3.5 7 Q2 10 0 10.5 Q-2 10 -3.5 7 Z" fill="#b67f72" />
            <path d="M0 10.5 Q-2.5 13.5 -5.5 12.5 M0 10.5 Q2.5 13.5 5.5 12.5" stroke="#6f4e44" strokeWidth="1.2" fill="none" strokeLinecap="round" />
            <path d="M-12 9 L-34 5 M-12 12 L-34 13 M12 9 L34 5 M12 12 L34 13" stroke="#fff" strokeWidth="1" strokeLinecap="round" opacity="0.8" />
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
      <path d="M-35 -58 C -41 -93 -22 -114 0 -114 C 22 -114 41 -93 35 -58 Z" fill="#0a6ccf" />
      <path d="M-38 -4 C -40 -40 -24 -60 0 -60 C 24 -60 40 -40 38 -4 Z" fill="#0066cc" />
      <g className="dev-type">
        <path d="M-27 -96 L-25 -124 Q-23 -130 -17 -126 L-7 -106 Z" fill="#232326" />
        <path d="M-22 -101 L-21 -119 L-11 -106 Z" fill="#45454b" />
        <path d="M27 -96 L25 -124 Q23 -130 17 -126 L7 -106 Z" fill="#232326" />
        <path d="M22 -101 L21 -119 L11 -106 Z" fill="#45454b" />
        <ellipse cx="0" cy={DEV_HEAD_Y} rx="29" ry="25" fill="#27272b" />
        <ellipse cx="-9" cy="-97" rx="12" ry="6" fill="#fff" opacity="0.06" />
        <ellipse cx="0" cy="-74" rx="26" ry="16" fill={u(p, 'glow')} />
        <g className="cat-blink">
          <Eye p={p} r={r} name="d-pl" x={-11} y={-86} shape={D_EYE} clip="eye-d" iris="#cde46e" prx={2.3} pry={5.2} />
          <Eye p={p} r={r} name="d-pr" x={11} y={-86} shape={D_EYE} clip="eye-d" iris="#cde46e" prx={2.3} pry={5.2} />
        </g>
        <path d="M-3 -75 Q0 -77 3 -75 Q1.5 -72.5 0 -72 Q-1.5 -72.5 -3 -75 Z" fill="#e8a0a0" />
        <path d="M-12 -73 L-36 -77 M-12 -70 L-36 -69 M12 -73 L36 -77 M12 -70 L36 -69" stroke="#fff" strokeWidth="1" strokeLinecap="round" opacity="0.5" />
      </g>
      <rect x="-42" y="-68" width="84" height="62" rx="7" fill={u(p, 'lid')} stroke="#b8bec6" strokeWidth="1" />
      <a href="https://github.com/dunnowhoo" target="_blank" rel="noreferrer" tabIndex={-1} className="cat-gh">
        <g transform="translate(-13.8 -50.8) scale(1.15)">
          <path d={GITHUB} fill="#1d1d1f" fillRule="evenodd" clipRule="evenodd" opacity="0.82" />
        </g>
      </a>
      <rect x="-50" y="-7" width="100" height="7" rx="3.5" fill="#c9cdd3" />
      <g fontFamily={MONO} fontSize="10" fontWeight="600" pointerEvents="none">
        <text className="dev-bit" x="-56" y="-66" fill="#0066cc">{'{ }'}</text>
        <text className="dev-bit d2" x="44" y="-68" fill="#b0683f">;</text>
        <text className="dev-bit d3" x="-50" y="-72" fill="#7b52c7">=&gt;</text>
        <text className="dev-bit d4" x="38" y="-64" fill="#0066cc">&lt;/&gt;</text>
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
          <circle r="13" fill={u(p, 'yarn')} />
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
