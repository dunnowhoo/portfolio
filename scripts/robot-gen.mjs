// Membuat pose maskot robot "Bit" untuk banner portfolio dengan OpenAI Images.
// Pose 'idle' dibuat dari nol; pose lain = EDIT dari 'idle' supaya karakternya identik.
// Hasil: public/assets/robot/<pose>.webp (512 px, transparan). Key dibaca dari .env.local, tidak dicetak.
// Pemakaian: node scripts/robot-gen.mjs          (hanya pose yang belum ada)
//            node scripts/robot-gen.mjs think    (buat ulang pose tertentu)
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import nextEnv from '@next/env';
import sharp from 'sharp';

const APP = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
nextEnv.loadEnvConfig(APP);
const KEY = process.env.OPENAI_API_KEY;
if (!KEY) {
  console.error('OPENAI_API_KEY belum ada di .env.local');
  process.exit(1);
}
const OUT = path.join(APP, 'public', 'assets', 'robot');
const SRC = path.join(os.tmpdir(), 'robot-src'); // salinan 1024 px; edit selalu dari idle 1024 px
fs.mkdirSync(OUT, { recursive: true });
fs.mkdirSync(SRC, { recursive: true });

const BASE =
  'Cute chibi mascot illustration of "Bit", a small friendly hovering robot assistant. Glossy white rounded body shaped like a soft capsule with a big rounded head, a dark navy glass visor face showing two friendly cyan-blue LED eyes (simple rounded rectangles) and a tiny smile line, small round arms with simple mitten hands, no legs: instead a small glowing blue hover thruster ring under the body. A short antenna on top with a glowing blue ball tip. Accent color Apple blue (#0066CC) on the round ear discs and a small chest light. Soft cel-shaded vector style, clean dark-navy outlines of consistent thickness, gentle gradients, one highlight, polished and minimal like an Apple sticker. Full body, centered, front three-quarter view facing slightly to the left, arms relaxed at the sides, generous padding, transparent background. No text, no letters, no numbers, no logos.';
const KEEP = 'Keep exactly the same robot character, proportions, colors, art style, outline thickness, lighting, size and position on the canvas, and the transparent background. Only change the pose and expression:';

export const POSES = {
  idle: null,
  wave: `${KEEP} it raises its right arm high and waves hello, LED eyes curved happily like upside-down U shapes.`,
  think: `${KEEP} it touches its chin with one hand as if thinking, LED eyes looking up to the side, and three small glowing cyan dots float above its head.`,
  talk: `${KEEP} it holds one arm out to the side with an open hand as if explaining something, LED eyes bright and friendly, the smile line slightly open as if speaking.`,
  carry: `${KEEP} it holds a blank white rounded rectangle card with a light blue border in both hands in front of its body, as if delivering it, LED eyes happy.`,
  sleep: `${KEEP} its LED eyes are closed (two small curved lines), the antenna ball is dim grey, its arms rest on its body, and two small light-blue bubbles float near its head.`,
};

async function call(endpoint, init) {
  for (let attempt = 1; attempt <= 4; attempt++) {
    const res = await fetch(`https://api.openai.com/v1/images/${endpoint}`, { ...init, headers: { Authorization: `Bearer ${KEY}`, ...(init.headers ?? {}) } });
    const j = await res.json().catch(() => ({}));
    if (res.ok && j.data?.[0]?.b64_json) return Buffer.from(j.data[0].b64_json, 'base64');
    const msg = j.error?.message ?? `HTTP ${res.status}`;
    console.error(`  attempt ${attempt} failed: ${res.status} ${msg.slice(0, 140)}`);
    if (res.status === 401 || res.status === 403 || /billing|quota/i.test(msg)) process.exit(2);
    await new Promise((r) => setTimeout(r, 5000 * attempt));
  }
  throw new Error('gagal');
}

async function save(name, png) {
  fs.writeFileSync(path.join(SRC, `${name}.png`), png);
  const out = await sharp(png).resize(512, 512).webp({ quality: 86, alphaQuality: 95, effort: 6 }).toBuffer();
  fs.writeFileSync(path.join(OUT, `${name}.webp`), out);
  return out.length;
}

const only = process.argv.slice(2);
const want = (n) => (only.length ? only.includes(n) : !fs.existsSync(path.join(OUT, `${n}.webp`)));

const idleSrc = path.join(SRC, 'idle.png');
if (want('idle') || !fs.existsSync(idleSrc)) {
  const t0 = Date.now();
  const png = await call('generations', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ model: 'gpt-image-1.5', prompt: BASE, size: '1024x1024', quality: 'high', background: 'transparent', output_format: 'png', n: 1 }),
  });
  console.log(`idle: ${Math.round((await save('idle', png)) / 1024)} KB in ${Math.round((Date.now() - t0) / 1000)}s`);
}
const base = fs.readFileSync(idleSrc);
await Promise.all(
  Object.entries(POSES)
    .filter(([n, p]) => p && want(n))
    .map(async ([name, prompt]) => {
      const t0 = Date.now();
      const form = new FormData();
      form.append('model', 'gpt-image-1.5');
      form.append('image', new Blob([base], { type: 'image/png' }), 'idle.png');
      form.append('prompt', prompt);
      form.append('size', '1024x1024');
      form.append('quality', 'high');
      form.append('background', 'transparent');
      form.append('output_format', 'png');
      form.append('input_fidelity', 'high');
      const png = await call('edits', { method: 'POST', body: form });
      console.log(`${name}: ${Math.round((await save(name, png)) / 1024)} KB in ${Math.round((Date.now() - t0) / 1000)}s`);
    }),
);
console.log('selesai');
