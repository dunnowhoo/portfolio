// Menyalin satu variabel dari .env.local ke Vercel (production + preview) sebagai sensitive, lewat stdin.
// Nilainya tidak pernah dicetak. Pemakaian: node scripts/push-env.mjs GROQ_API_KEY  (atau: npm run env:groq)
import fs from 'node:fs';
import { spawnSync } from 'node:child_process';

const name = process.argv[2];
if (!/^[A-Z][A-Z0-9_]*$/.test(name ?? '')) {
  console.error('Pemakaian: node scripts/push-env.mjs NAMA_VARIABEL');
  process.exit(1);
}
const m = fs.readFileSync('.env.local', 'utf8').match(new RegExp(`^${name}=(.*)$`, 'm'));
const value = m?.[1]?.trim().replace(/^"(.*)"$/, '$1');
if (!value) {
  console.error(`${name} tidak ada di .env.local`);
  process.exit(1);
}
for (const target of ['production', 'preview']) {
  const r = spawnSync('vercel', ['env', 'add', name, target, '--sensitive', '--force'], { input: value, stdio: ['pipe', 'inherit', 'inherit'] });
  if (r.status !== 0) process.exit(r.status ?? 1);
}
console.log(`${name} sudah ditambahkan ke Vercel (production + preview).`);
