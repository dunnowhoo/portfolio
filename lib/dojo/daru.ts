// Evolusi Daru: satu tingkat per sabuk (11 tingkat ↔ 11 sabuk di level.ts).
// Gambar: public/assets/dojo/daru/tier-NN.webp (512px, latar transparan, dibuat sekali dengan OpenAI Images).
import { BELTS, beltFor, type Belt } from './level';

export type Gear = { name: string; note: string };

export const DARU_GEAR: Gear[] = [
  { name: 'Daruma polos', note: 'Awal perjalanan dengan sabuk putih' },
  { name: 'Hachimaki', note: 'Ikat kepala tanda tekad' },
  { name: 'Bokken', note: 'Pedang kayu untuk latihan' },
  { name: 'Sode', note: 'Pelindung bahu pertama' },
  { name: 'Dō dan katana', note: 'Zirah dada dan pedang sungguhan' },
  { name: 'Kote', note: 'Pelindung lengan berlapis logam' },
  { name: 'Kusazuri dan wakizashi', note: 'Rok zirah dan pedang pendek' },
  { name: 'Kabuto', note: 'Helm samurai' },
  { name: 'Kuwagata', note: 'Jambul emas di helm' },
  { name: 'Katana terhunus', note: 'Zirah berornamen merah-emas' },
  { name: 'Zirah lengkap dan sashimono', note: 'Bendera di punggung, gelar Shihan' },
];

export const daruTier = (level: number) => Math.max(0, BELTS.indexOf(beltFor(level)));
export const daruSrc = (tier: number) => `/assets/dojo/daru/tier-${String(tier + 1).padStart(2, '0')}.webp`;

/** Perlengkapan berikutnya dan level saat terbuka (null kalau sudah tingkat terakhir). */
export function nextGear(level: number): { gear: Gear; belt: Belt; atLevel: number } | null {
  const t = daruTier(level) + 1;
  if (t >= BELTS.length) return null;
  return { gear: DARU_GEAR[t], belt: BELTS[t], atLevel: BELTS[t].min };
}
