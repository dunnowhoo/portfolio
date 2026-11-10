// Membuat ikon Dōjō (pengganti emoji) dengan OpenAI Images, gaya sama dengan maskot Daru.
// Hasil: public/assets/dojo/icons/<nama>.webp (128 px, transparan, ukuran visual dinormalkan).
// Key dibaca dari .env.local (OPENAI_API_KEY) dan tidak pernah dicetak.
// Pemakaian: node scripts/icon-gen.mjs            (hanya ikon yang belum ada)
//            node scripts/icon-gen.mjs flame ice  (buat ulang ikon tertentu)
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
const OUT = path.join(APP, 'public', 'assets', 'dojo', 'icons');
const SRC = path.join(os.tmpdir(), 'dojo-icon-src'); // salinan 1024 px untuk dicek/di-crop ulang
fs.mkdirSync(OUT, { recursive: true });
fs.mkdirSync(SRC, { recursive: true });

const STYLE =
  'A single icon in the style of a cute sticker set for a Japanese-study app, matching a chibi daruma mascot: soft cel-shaded vector illustration, bold clean dark-brown outlines of consistent thickness, gentle gradients and one small highlight, warm palette (vermilion #E8453C, gold #FFB800, deep navy #1D3557, cream #FFF8F0) unless the subject needs its own color. Chunky simple shapes that stay readable at 24 pixels, minimal detail, nothing thin or tiny. Centered, front view, filling about 80% of the square canvas, no drop shadow, no background shape, transparent background. No text, no letters, no numbers, no logos.';

export const ICONS = {
  materi: 'an open book with cream pages and a vermilion bookmark ribbon',
  video: 'a cute movie clapperboard, deep navy board with a cream and vermilion striped clapper on top, slightly open',
  irodori: 'a closed green textbook standing upright, with a simple cream flower emblem on the cover',
  target: 'an archery target with vermilion and cream rings and a short arrow stuck in the bullseye',
  duolingo: 'a friendly bright green smartphone showing a white speech bubble with a check mark',
  anki: 'a fanned stack of three cream flashcards, the front card has a vermilion corner',
  castle: 'a cute Japanese castle keep (tenshukaku) with white walls, dark navy curved roofs and gold roof ornaments',
  oni: 'a cute round red oni mask with two small cream horns, bushy navy eyebrows and a playful grin, not scary',
  banner: 'a vertical Japanese nobori banner flag on a wooden pole, white cloth with a big red circle and red edge',
  brush: 'a Japanese calligraphy brush with a wooden handle drawing a bold black ink stroke on a cream sheet of paper',
  speech: 'two overlapping rounded speech bubbles, one vermilion and one cream',
  flame: 'a single plump flame, vermilion outside, orange and gold inside',
  'flame-blue': 'a single plump flame, deep blue outside, light blue and white inside',
  ice: 'a translucent light-blue ice cube with soft white highlights and a tiny sparkle',
  medal: 'a round gold medal hanging from a vermilion and white ribbon, with a simple star embossed in the middle',
  lock: 'a chunky closed padlock, light grey body with a darker shackle and a keyhole',
  briefcase: 'a navy briefcase with a gold clasp and a short handle',
};

async function generate(name) {
  const prompt = `${STYLE} Subject: ${ICONS[name]}.`;
  for (let attempt = 1; attempt <= 4; attempt++) {
    const res = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: { Authorization: `Bearer ${KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: 'gpt-image-1.5', prompt, size: '1024x1024', quality: 'medium', background: 'transparent', output_format: 'png', n: 1 }),
    });
    const j = await res.json().catch(() => ({}));
    if (res.ok && j.data?.[0]?.b64_json) return Buffer.from(j.data[0].b64_json, 'base64');
    const msg = j.error?.message ?? `HTTP ${res.status}`;
    console.error(`  ${name}: attempt ${attempt} failed: ${res.status} ${msg.slice(0, 140)}`);
    if (res.status === 401 || res.status === 403 || /billing|quota/i.test(msg)) process.exit(2);
    await new Promise((r) => setTimeout(r, 5000 * attempt));
  }
  throw new Error(`gagal membuat ${name}`);
}

// Pangkas tepi transparan lalu pasang di kanvas 128 px dengan isi maks 116 px, supaya ukuran visual seragam.
async function normalize(png) {
  const trimmed = await sharp(png).trim({ threshold: 1 }).toBuffer();
  const fitted = await sharp(trimmed).resize(116, 116, { fit: 'inside', kernel: 'lanczos3' }).toBuffer();
  return sharp({ create: { width: 128, height: 128, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } } })
    .composite([{ input: fitted, gravity: 'center' }])
    .webp({ quality: 90, alphaQuality: 100, effort: 6 })
    .toBuffer();
}

const only = process.argv.slice(2);
const todo = Object.keys(ICONS).filter((n) => (only.length ? only.includes(n) : !fs.existsSync(path.join(OUT, `${n}.webp`))));
const unknown = only.filter((n) => !ICONS[n]);
if (unknown.length) {
  console.error('ikon tidak dikenal:', unknown.join(', '));
  process.exit(1);
}
console.log(`membuat ${todo.length} ikon → ${path.relative(APP, OUT)}`);

let i = 0;
async function worker() {
  while (i < todo.length) {
    const name = todo[i++];
    const t0 = Date.now();
    const png = await generate(name);
    fs.writeFileSync(path.join(SRC, `${name}.png`), png);
    const out = await normalize(png);
    fs.writeFileSync(path.join(OUT, `${name}.webp`), out);
    console.log(`${name}: ${Math.round(out.length / 1024)} KB in ${Math.round((Date.now() - t0) / 1000)}s`);
  }
}
await Promise.all(Array.from({ length: Math.min(4, todo.length) }, worker));
console.log('selesai');
