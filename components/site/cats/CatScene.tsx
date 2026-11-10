'use client';

import React, { useCallback, useEffect, useId, useRef, useState } from 'react';
import {
  Ball,
  CodeBackdrop,
  Defs,
  DevCat,
  DEV_HEAD_Y,
  FemaleCat,
  FEMALE_HEAD_Y,
  FS,
  Laser,
  LynxCat,
  LYNX_HEAD,
  LYNX_LEGS,
  MaleCat,
  MALE_BELL,
  MALE_HEAD,
  Pop,
  Shelf,
  type LegName,
} from './art';
import { TYPED, type Layout } from './layouts';

// Simulasi ringan: kursor (atau tap) menjadi titik laser. Lynx berlari & menerkam,
// betina melompat-lompat kecil mengejar, jantan terlalu malas: cuma melirik dan
// sesekali mencakar. Tanpa laser, lynx bermain bola. Posisi ditulis langsung ke DOM
// tiap frame (tanpa re-render React), dan loop hanya jalan saat adegan terlihat.

type Who = 'bell' | 'ball' | 'lynx' | 'female' | 'male' | 'dev';
type PopItem = { id: number; x: number; y: number; text: string };
type Els = Record<string, SVGElement | null>;

const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));
const n2 = (v: number) => v.toFixed(2);

function makeSim(L: Layout) {
  return {
    t: 0,
    laser: { x: 0, y: 0, on: false, until: 0 },
    lynx: { x: L.lynx.home, vx: 0, face: 1, y: 0, jumping: false, jt: 0, jdur: 0.4, jx0: 0, jx1: 0, jh: 0, gait: 0, bat: 0, cd: 1.2, land: 0 },
    female: { x: L.female.home, y: 0, hopping: false, ht: 0, hx0: 0, hx1: 0, cd: 0, land: 0 },
    male: { swat: 0, cd: 0 },
    ball: { x: L.ball.home, vx: 0, rot: 0 },
    typing: { idx: 0, chars: TYPED[0].length, phase: 1, timer: 0, shown: TYPED[0].length, shownIdx: 0 },
  };
}
type Sim = ReturnType<typeof makeSim>;

function jump(ly: Sim['lynx'], to: number, height: number, cooldown: number) {
  ly.jumping = true;
  ly.jt = 0;
  ly.jx0 = ly.x;
  ly.jx1 = to;
  ly.jh = height;
  ly.jdur = 0.34 + height / 380;
  ly.cd = cooldown;
}

function step(s: Sim, L: Layout, dt: number) {
  const S = L.s;
  const F = L.floor;
  s.t += dt;
  if (s.laser.on && s.laser.until > 0 && s.t > s.laser.until) s.laser.on = false;
  const on = s.laser.on;

  // Bola
  const b = s.ball;
  b.x += b.vx * dt;
  b.vx *= Math.exp(-1.6 * dt);
  if (Math.abs(b.vx) < 2) b.vx = 0;
  if (b.x < L.ball.min) {
    b.x = L.ball.min;
    b.vx = Math.abs(b.vx) * 0.55;
  }
  if (b.x > L.ball.max) {
    b.x = L.ball.max;
    b.vx = -Math.abs(b.vx) * 0.55;
  }
  b.rot += ((b.vx * dt) / (13 * S)) * 57.3;

  // Lynx
  const ly = s.lynx;
  ly.cd -= dt;
  ly.bat = Math.max(0, ly.bat - dt * 3.4);
  ly.land = Math.max(0, ly.land - dt);
  if (ly.jumping) {
    ly.jt += dt;
    const k = Math.min(1, ly.jt / ly.jdur);
    ly.x = ly.jx0 + (ly.jx1 - ly.jx0) * k;
    ly.y = -ly.jh * 4 * k * (1 - k);
    if (k >= 1) {
      ly.jumping = false;
      ly.y = 0;
      ly.land = 0.18;
      ly.vx *= 0.2;
    }
  } else {
    let target: number;
    let maxV: number;
    if (on) {
      target = clamp(s.laser.x, L.lynx.min, L.lynx.max);
      maxV = 430 * S;
    } else {
      const side = ly.x <= b.x ? -1 : 1;
      target = clamp(b.x + side * 46 * S, L.lynx.min, L.lynx.max);
      maxV = (Math.abs(b.vx) > 60 ? 300 : 120) * S;
    }
    const dx = target - ly.x;
    const desired = Math.sign(dx) * Math.min(maxV, Math.abs(dx) * 5);
    ly.vx += (desired - ly.vx) * Math.min(1, dt * 7);
    ly.x += ly.vx * dt;
    if (Math.abs(ly.vx) > 25 * S) ly.face = ly.vx > 0 ? 1 : -1;
    else {
      const fx = on ? s.laser.x : b.x;
      if (Math.abs(fx - ly.x) > 4) ly.face = fx > ly.x ? 1 : -1;
    }
    ly.gait += (Math.abs(ly.vx) * dt * 0.075) / S;
    if (on) {
      const ddx = s.laser.x - ly.x;
      const reach = Math.abs(ddx) < 80 * S && Math.abs(ddx) > 10 * S && Math.sign(ddx) === ly.face;
      if (reach && ly.cd <= 0 && s.laser.y > F - 190 * S) {
        jump(ly, clamp(s.laser.x, L.lynx.min, L.lynx.max), clamp(F - s.laser.y - 25 * S, 18 * S, 120 * S), 1.1);
      }
    } else if (Math.abs(dx) < 5 * S && Math.abs(b.vx) < 5 && ly.cd <= 0) {
      ly.bat = 1;
      ly.cd = 1.3 + Math.random() * 1.4;
      let v = ly.face * (70 + Math.random() * 110) * S;
      if (b.x + v * 0.65 > L.ball.max) v = -Math.abs(v);
      if (b.x + v * 0.65 < L.ball.min) v = Math.abs(v);
      b.vx = v;
    }
  }

  // Betina: lompat kecil-kecil, tidak mau jauh dari tempatnya
  const f = s.female;
  f.cd -= dt;
  f.land = Math.max(0, f.land - dt);
  const side = f.x >= s.laser.x ? 1 : -1;
  const want =
    on && s.laser.y > F - 220 * S ? clamp(s.laser.x + side * 60 * S, L.female.min, L.female.max) : L.female.home;
  if (f.hopping) {
    f.ht += dt;
    const k = Math.min(1, f.ht / 0.32);
    f.x = f.hx0 + (f.hx1 - f.hx0) * k;
    f.y = -15 * S * 4 * k * (1 - k);
    if (k >= 1) {
      f.hopping = false;
      f.y = 0;
      f.land = 0.16;
      f.cd = on ? 0.18 : 0.45;
    }
  } else if (Math.abs(want - f.x) > 8 * S && f.cd <= 0) {
    f.hopping = true;
    f.ht = 0;
    f.hx0 = f.x;
    f.hx1 = f.x + clamp(want - f.x, -40 * S, 40 * S);
  }

  // Jantan: hanya mencakar kalau laser lewat dekat wajahnya
  const m = s.male;
  m.cd -= dt;
  m.swat = Math.max(0, m.swat - dt * 2.6);
  if (on && m.cd <= 0) {
    const hx = L.male + MALE_HEAD.x * S;
    const hy = F + (MALE_HEAD.y + 30) * S;
    if (Math.hypot(s.laser.x - hx, s.laser.y - hy) < 95 * S) {
      m.swat = 1;
      m.cd = 1.5;
    }
  }

  // Baris kode yang sedang diketik
  const ty = s.typing;
  ty.timer += dt;
  const str = TYPED[ty.idx];
  if (ty.phase === 0) {
    if (ty.timer > 0.075) {
      ty.timer = 0;
      ty.chars = Math.min(str.length, ty.chars + 1);
      if (ty.chars === str.length) ty.phase = 1;
    }
  } else if (ty.phase === 1) {
    if (ty.timer > 2.8) {
      ty.timer = 0;
      ty.phase = 2;
    }
  } else if (ty.timer > 0.025) {
    ty.timer = 0;
    ty.chars = Math.max(0, ty.chars - 1);
    if (ty.chars === 0) {
      ty.phase = 0;
      ty.idx = (ty.idx + 1) % TYPED.length;
    }
  }
}

function paint(s: Sim, L: Layout, E: Els) {
  const S = L.s;
  const F = L.floor;
  const tf = (k: string, v: string) => E[k]?.setAttribute('transform', v);

  const lz = E.laser;
  if (lz) {
    lz.setAttribute('opacity', s.laser.on ? '1' : '0');
    if (s.laser.on) lz.setAttribute('transform', `translate(${n2(s.laser.x)} ${n2(s.laser.y)})`);
  }

  tf('ball', `translate(${n2(s.ball.x)} ${n2(F - 13 * S)}) scale(${S})`);
  tf('ball-rot', `rotate(${n2(s.ball.rot % 360)})`);
  tf('ball-shadow', `translate(${n2(s.ball.x)} ${F}) scale(${S})`);

  const ly = s.lynx;
  const runK = ly.jumping ? 0 : Math.min(1, Math.abs(ly.vx) / (240 * S));
  const sq = ly.land > 0 ? ly.land / 0.18 : 0;
  tf('lynx', `translate(${n2(ly.x)} ${F}) scale(${n2(S * ly.face)} ${S})`);
  tf('lynx-shadow', `translate(${n2(ly.x)} ${F}) scale(${n2(S * (1 + ly.y / (220 * S)))} ${S})`);
  let tilt = -5 * (1 - Math.min(1, runK / 0.15)); // jongkok main: pantat naik
  if (ly.jumping) tilt = -20 + 34 * Math.min(1, ly.jt / ly.jdur);
  const bob = -Math.abs(Math.sin(ly.gait)) * 4 * runK;
  tf('lynx-body', `translate(0 ${n2(ly.y / S + bob)}) rotate(${n2(tilt)} 20 -14) scale(${n2(1 + sq * 0.07)} ${n2(1 - sq * 0.09)})`);
  const A = 40 * runK;
  const g = ly.gait;
  const legs: Record<LegName, number> = ly.jumping
    ? { fn: -58, ff: -48, bn: 44, bf: 36 }
    : { fn: A * Math.sin(g), ff: A * Math.sin(g + 0.8), bn: A * Math.sin(g + Math.PI), bf: A * Math.sin(g + Math.PI + 0.8) };
  if (ly.bat > 0) legs.fn = -80 * Math.sin(Math.PI * (1 - ly.bat));
  (Object.keys(legs) as LegName[]).forEach((k) => {
    const [px, py] = LYNX_LEGS[k];
    tf(`l-${k}`, `rotate(${n2(legs[k])} ${px} ${py})`);
  });

  const f = s.female;
  const fk = S * FS;
  const fsq = f.land > 0 ? f.land / 0.16 : 0;
  tf('female', `translate(${n2(f.x)} ${n2(F + f.y)}) scale(${n2(fk * (1 + fsq * 0.06))} ${n2(fk * (1 - fsq * 0.08))})`);
  tf('female-shadow', `translate(${n2(f.x)} ${F}) scale(${n2(fk * (1 + f.y / (160 * S)))} ${n2(fk)})`);

  const sw = s.male.swat > 0 ? Math.sin(Math.PI * (1 - s.male.swat)) : 0;
  tf('m-swat', `translate(${n2(-44 * sw)} ${n2(-30 * sw)}) rotate(${n2(-25 * sw)} -56 -44)`);

  // Mata (dan kepala) mengikuti laser; tanpa laser, masing-masing punya tontonan sendiri
  const T = s.laser.on ? s.laser : null;
  const look = (pre: string, hx: number, hy: number, max: number, dx0: number, dy0: number, flip = 1) => {
    const dx = (T ? T.x : dx0) - hx;
    const dy = (T ? T.y : dy0) - hy;
    const d = Math.hypot(dx, dy) || 1;
    const k = Math.min(max, d * 0.05);
    const v = `translate(${n2((dx / d) * k * flip)} ${n2((dy / d) * k * 0.75)})`;
    tf(`${pre}l`, v);
    tf(`${pre}r`, v);
    return dx;
  };
  const mdx = look('m-p', L.male + MALE_HEAD.x * S, F + MALE_HEAD.y * S, 4.2, s.ball.x, F - 10);
  tf('m-head', `translate(${MALE_HEAD.x} ${MALE_HEAD.y}) rotate(${n2(clamp(mdx * 0.012, -5, 5))})`);
  const fdx = look('f-p', f.x, F + f.y + FEMALE_HEAD_Y * fk, 3.8, ly.x, F - 40 * S);
  tf('f-head', `translate(0 ${FEMALE_HEAD_Y}) rotate(${n2(clamp(fdx * 0.03, -10, 10))})`);
  look('l-p', ly.x + LYNX_HEAD.x * S * ly.face, F + ly.y + LYNX_HEAD.y * S, 3, s.ball.x, F - 12, ly.face);
  look('d-p', L.shelf.x, L.shelf.y + DEV_HEAD_Y * S, 3.2, L.shelf.x, L.shelf.y + 60);

  const ty = s.typing;
  if (ty.shown !== ty.chars || ty.shownIdx !== ty.idx) {
    ty.shown = ty.chars;
    ty.shownIdx = ty.idx;
    const str = TYPED[ty.idx];
    const el = E.typed;
    if (el) {
      el.textContent = str.slice(0, ty.chars);
      el.setAttribute('fill', str.startsWith('//') ? '#8e8e93' : '#48484a');
    }
    E.caret?.setAttribute('x', n2(L.code.x + ty.chars * L.code.size * 0.6 + 1));
  }
}

function hitTest(s: Sim, L: Layout, x: number, y: number): Who | null {
  const S = L.s;
  const F = L.floor;
  if (Math.hypot(x - (L.male + MALE_BELL.x * S), y - (F + MALE_BELL.y * S)) < 15 * S) return 'bell';
  if (Math.hypot(x - s.ball.x, y - (F - 13 * S)) < 21 * S) return 'ball';
  if (Math.abs(x - (s.lynx.x + 10 * S * s.lynx.face)) < 50 * S && y > F + s.lynx.y - 112 * S && y < F + 6) return 'lynx';
  const fk = S * FS;
  if (Math.abs(x - s.female.x) < 62 * fk && y > F + s.female.y - 168 * fk && y < F + 6) return 'female';
  if (x > L.male - 92 * S && x < L.male + 108 * S && y > F - 182 * S && y < F + 6) return 'male';
  if (Math.abs(x - L.shelf.x) < 44 * S && y > L.shelf.y - 140 * S && y < L.shelf.y - 66 * S) return 'dev';
  return null;
}

type Props = { layout: Layout; className?: string; onSecret: () => void; onInteract: () => void };

export default function CatScene({ layout: L, className = '', onSecret, onInteract }: Props) {
  const p = 'c' + useId().replace(/[^a-zA-Z0-9]/g, '');
  const svgRef = useRef<SVGSVGElement>(null);
  const els = useRef<Els>({});
  const refFns = useRef(new Map<string, (el: SVGElement | null) => void>());
  const r = useCallback((name: string) => {
    let fn = refFns.current.get(name);
    if (!fn) {
      fn = (el: SVGElement | null) => {
        els.current[name] = el;
      };
      refFns.current.set(name, fn);
    }
    return fn;
  }, []);
  const [sim] = useState(() => makeSim(L));
  const [pops, setPops] = useState<PopItem[]>([]);
  const live = useRef(false);
  const press = useRef<number | null>(null);
  const clicks = useRef<number[]>([]);
  const popId = useRef(0);

  useEffect(() => {
    const svg = svgRef.current;
    if (!svg || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    let raf = 0;
    let last = 0;
    let visible = false;
    const tick = (now: number) => {
      const dt = Math.min(0.05, Math.max(0, (now - last) / 1000));
      last = now;
      step(sim, L, dt);
      paint(sim, L, els.current);
      raf = visible ? requestAnimationFrame(tick) : 0;
    };
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      live.current = visible;
      svg.classList.toggle('live', visible);
      if (!visible) sim.laser.on = false;
      if (visible && !raf) {
        last = performance.now();
        raf = requestAnimationFrame(tick);
      }
    });
    io.observe(svg);
    return () => {
      io.disconnect();
      if (raf) cancelAnimationFrame(raf);
      live.current = false;
    };
  }, [L, sim]);

  useEffect(
    () => () => {
      if (press.current !== null) window.clearTimeout(press.current);
    },
    [],
  );

  const toScene = (cx: number, cy: number) => {
    const m = svgRef.current?.getScreenCTM();
    if (!m) return null;
    const pt = new DOMPoint(cx, cy).matrixTransform(m.inverse());
    return { x: pt.x, y: pt.y };
  };

  const aim = (x: number, y: number, until: number) => {
    sim.laser.x = x;
    sim.laser.y = y;
    sim.laser.on = true;
    sim.laser.until = until;
    const lz = els.current.laser;
    if (lz) {
      lz.setAttribute('opacity', '1');
      lz.setAttribute('transform', `translate(${n2(x)} ${n2(y)})`);
    }
  };

  const cancelPress = () => {
    if (press.current !== null) window.clearTimeout(press.current);
    press.current = null;
  };

  const onPointerMove = (e: React.PointerEvent<SVGSVGElement>) => {
    const pt = toScene(e.clientX, e.clientY);
    if (!pt) return;
    if (press.current !== null && hitTest(sim, L, pt.x, pt.y) !== 'bell') cancelPress();
    if (!live.current) return;
    if (e.pointerType === 'touch') {
      if (e.buttons) aim(pt.x, pt.y, sim.t + 2.2);
    } else {
      aim(pt.x, pt.y, 0);
      onInteract();
    }
  };

  const onPointerLeave = (e: React.PointerEvent<SVGSVGElement>) => {
    if (e.pointerType !== 'touch') sim.laser.on = false;
    cancelPress();
  };

  const onPointerDown = (e: React.PointerEvent<SVGSVGElement>) => {
    onInteract();
    const pt = toScene(e.clientX, e.clientY);
    if (!pt) return;
    if (live.current && e.pointerType === 'touch') aim(pt.x, pt.y, sim.t + 2.2);
    if (hitTest(sim, L, pt.x, pt.y) === 'bell') {
      cancelPress();
      press.current = window.setTimeout(() => {
        press.current = null;
        onSecret();
      }, 900);
    }
  };

  const pet = (who: Exclude<Who, 'bell' | 'ball'>) => {
    const S = L.s;
    const F = L.floor;
    const spots: Record<typeof who, [number, number, string]> = {
      male: [L.male + MALE_HEAD.x * S, F + (MALE_HEAD.y - 80) * S, 'purrr'],
      female: [sim.female.x, F + sim.female.y + (FEMALE_HEAD_Y - 70) * S * FS, 'mrrp?'],
      lynx: [sim.lynx.x + LYNX_HEAD.x * S * sim.lynx.face, F + sim.lynx.y + (LYNX_HEAD.y - 54) * S, 'mew!'],
      dev: [L.shelf.x, L.shelf.y + (DEV_HEAD_Y - 62) * S, 'git push!'],
    };
    const [x, y, text] = spots[who];
    const id = ++popId.current;
    setPops((ps) => [...ps.slice(-5), { id, x, y, text }]);
    window.setTimeout(() => setPops((ps) => ps.filter((q) => q.id !== id)), 1300);
    if (who === 'lynx' && live.current && !sim.lynx.jumping) jump(sim.lynx, sim.lynx.x, 34 * S, 0.6);
  };

  const onClick = (e: React.MouseEvent<SVGSVGElement>) => {
    const pt = toScene(e.clientX, e.clientY);
    if (!pt) return;
    const who = hitTest(sim, L, pt.x, pt.y);
    if (who === 'bell') {
      const t = Date.now();
      clicks.current = [...clicks.current.filter((c) => t - c < 1500), t];
      if (clicks.current.length >= 3) {
        clicks.current = [];
        onSecret();
      }
      return;
    }
    if (who === 'ball') {
      sim.ball.vx = (sim.ball.x >= pt.x ? 1 : -1) * 340 * L.s;
      return;
    }
    if (who) pet(who);
  };

  return (
    <svg
      ref={svgRef}
      viewBox={`0 0 ${L.w} ${L.h}`}
      preserveAspectRatio="xMidYMax meet"
      className={`cat-scene absolute inset-0 h-full w-full select-none ${className}`}
      aria-hidden="true"
      style={{ touchAction: 'pan-y', WebkitTapHighlightColor: 'transparent' }}
      onPointerMove={onPointerMove}
      onPointerEnter={onPointerMove}
      onPointerLeave={onPointerLeave}
      onPointerDown={onPointerDown}
      onPointerUp={cancelPress}
      onPointerCancel={cancelPress}
      onClick={onClick}
      onContextMenu={(e) => e.preventDefault()}
    >
      <Defs p={p} />
      <rect x={-L.w} y={L.floor} width={L.w * 3} height="240" fill={`url(#${p}-floor)`} />
      <rect x={-L.w} y={L.floor} width={L.w * 3} height="1.5" fill="#fff" opacity="0.8" />
      <CodeBackdrop r={r} code={L.code} />
      <Shelf x={L.shelf.x} y={L.shelf.y} s={L.s} />
      <DevCat p={p} r={r} x={L.shelf.x} y={L.shelf.y} s={L.s} />
      <MaleCat p={p} r={r} x={L.male} floor={L.floor} s={L.s} />
      <FemaleCat p={p} r={r} x={L.female.home} floor={L.floor} s={L.s} />
      <LynxCat p={p} r={r} x={L.lynx.home} floor={L.floor} s={L.s} face={1} />
      <Ball p={p} r={r} x={L.ball.home} floor={L.floor} s={L.s} />
      <g>
        {pops.map((q) => (
          <Pop key={q.id} x={q.x} y={q.y} text={q.text} />
        ))}
      </g>
      <Laser p={p} r={r} />
    </svg>
  );
}
