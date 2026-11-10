// Membuat 11 tingkat evolusi Daru (daruma polos → samurai berzirah penuh) dengan OpenAI Images.
// Tiap tingkat = EDIT dari gambar tingkat sebelumnya supaya karakternya konsisten. Hasil 1024 px
// dikecilkan ke 512 px WebP. Key dibaca dari .env.local (OPENAI_API_KEY) dan tidak pernah dicetak.
// Pemakaian: node scripts/daru-gen.mjs          (hanya tingkat yang belum ada)
//            node scripts/daru-gen.mjs 7        (buat ulang tingkat 7 dari tingkat 6)
import fs from 'node:fs';
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
const OUT = path.join(APP, 'public', 'assets', 'dojo', 'daru');
fs.mkdirSync(OUT, { recursive: true });

const STYLE =
  'Cute chibi mascot illustration of "Daru", a round daruma doll character. Vermilion red body (#E8453C) with a cream-white face area, big friendly determined eyes with sparkle highlights, rosy cheeks, small confident smile. Soft cel-shaded vector style, clean dark outlines, gentle gradients, polished and minimal like an Apple sticker. Full body, centered, front three-quarter view, generous padding, transparent background. No text, no letters, no logos.';
const KEEP = 'Keep exactly the same character, face, proportions, art style, colors, lighting, framing and transparent background. Only make this change:';

const TIERS = [
  `${STYLE} Daru wears a simple plain white belt (obi) tied around the middle. No armor, no weapons, no headband.`,
  `${KEEP} the belt becomes yellow, and Daru now wears a white hachimaki headband with a small red circle, tied at the back.`,
  `${KEEP} the belt becomes orange, and Daru holds a light wooden bokken practice sword in one hand. Keep the headband.`,
  `${KEEP} the belt becomes green, and Daru gains simple dark navy lacquered shoulder guards (sode) with thin gold trim.`,
  `${KEEP} the belt becomes blue, Daru gains a dark navy lacquered samurai chest armor (do) with gold lacing, and the wooden bokken is replaced by a katana in a black scabbard worn at the waist.`,
  `${KEEP} the belt becomes purple, and Daru gains armored arm guards (kote) with small metal plates on both arms.`,
  `${KEEP} the belt becomes brown, Daru gains armored skirt plates (kusazuri) hanging below the chest armor, and a short wakizashi sword next to the katana.`,
  `${KEEP} the belt becomes black with one thin gold stripe, and Daru now wears a samurai helmet (kabuto) with a neck guard and no crest; the face stays fully visible.`,
  `${KEEP} the belt becomes black with two thin gold stripes, and the helmet gains a golden crescent crest (kuwagata).`,
  `${KEEP} the belt becomes black with three thin gold stripes, the armor becomes more ornate with red and gold lacing and polished plates, and Daru now holds the katana drawn, blade raised confidently.`,
  `${KEEP} the belt becomes red and white, Daru stands in a heroic pose in full ornate samurai armor with golden crest and drawn katana, a small vermilion banner (sashimono) on the back, and a soft golden glow around the character. Still cute and chibi.`,
];

async function call(endpoint, init) {
  for (let attempt = 1; attempt <= 3; attempt++) {
    const res = await fetch(`https://api.openai.com/v1/images/${endpoint}`, { ...init, headers: { Authorization: `Bearer ${KEY}`, ...(init.headers ?? {}) } });
    const j = await res.json().catch(() => ({}));
    if (res.ok && j.data?.[0]?.b64_json) return Buffer.from(j.data[0].b64_json, 'base64');
    const msg = j.error?.message ?? `HTTP ${res.status}`;
    console.error(`  attempt ${attempt} failed: ${res.status} ${msg.slice(0, 160)}`);
    if (res.status === 401 || res.status === 403 || /billing|quota/i.test(msg)) process.exit(2);
    await new Promise((r) => setTimeout(r, 4000 * attempt));
  }
  process.exit(3);
}

const only = process.argv[2] ? Number(process.argv[2]) : null;
for (let i = 0; i < TIERS.length; i++) {
  const n = String(i + 1).padStart(2, '0');
  const file = path.join(OUT, `tier-${n}.webp`);
  if (only !== null && i + 1 !== only) continue;
  if (fs.existsSync(file) && only === null) {
    console.log(`tier ${n}: sudah ada, dilewati`);
    continue;
  }
  const t0 = Date.now();
  let buf;
  if (i === 0) {
    buf = await call('generations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: 'gpt-image-1.5', prompt: TIERS[0], size: '1024x1024', quality: 'medium', background: 'transparent', output_format: 'webp', output_compression: 85, n: 1 }),
    });
  } else {
    const prev = fs.readFileSync(path.join(OUT, `tier-${String(i).padStart(2, '0')}.webp`));
    const form = new FormData();
    form.append('model', 'gpt-image-1.5');
    form.append('image', new Blob([prev], { type: 'image/webp' }), `tier-${i}.webp`);
    form.append('prompt', TIERS[i]);
    form.append('size', '1024x1024');
    form.append('quality', 'medium');
    form.append('background', 'transparent');
    form.append('output_format', 'webp');
    form.append('output_compression', '85');
    if (process.env.NO_FIDELITY !== '1') form.append('input_fidelity', 'high');
    buf = await call('edits', { method: 'POST', body: form });
  }
  const small = await sharp(buf).resize(512, 512).webp({ quality: 84, alphaQuality: 90, effort: 6 }).toBuffer();
  fs.writeFileSync(file, small);
  console.log(`tier ${n}: ${Math.round(small.length / 1024)} KB in ${Math.round((Date.now() - t0) / 1000)}s`);
}
console.log('selesai');
