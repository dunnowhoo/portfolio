// Membuat DASHBOARD_SLUG, AUTH_SECRET, dan CRON_SECRET di .env.local kalau belum ada.
// Nilai TIDAK dicetak ke layar, hanya nama variabelnya.
import { randomBytes } from 'node:crypto';
import fs from 'node:fs';

const FILE = '.env.local';
const env = fs.existsSync(FILE) ? fs.readFileSync(FILE, 'utf8') : '';
const has = (k) => new RegExp(`^${k}=`, 'm').test(env);
const slug = () => randomBytes(24).toString('base64url').replace(/[^a-zA-Z0-9]/g, '').toLowerCase().slice(0, 22);

const add = [];
if (!has('DASHBOARD_SLUG')) add.push(['DASHBOARD_SLUG', slug()]);
if (!has('AUTH_SECRET')) add.push(['AUTH_SECRET', randomBytes(32).toString('hex')]);
if (!has('CRON_SECRET')) add.push(['CRON_SECRET', randomBytes(32).toString('hex')]);

if (add.length) {
  const sep = env && !env.endsWith('\n') ? '\n' : '';
  fs.appendFileSync(FILE, `${sep}\n# Dōjō (scripts/setup-secrets.mjs)\n${add.map(([k, v]) => `${k}=${v}`).join('\n')}\n`);
  console.log(`Ditambahkan ke ${FILE}: ${add.map(([k]) => k).join(', ')}`);
} else {
  console.log('Semua secret Dōjō sudah ada. Tidak ada yang diubah.');
}
