// Kurva level & sabuk (docs/dojo/04-GAMIFICATION.md §3)
export const MAX_LEVEL = 50;
export const xpToReach = (level: number) => 45 * level * (level - 1); // total XP untuk mencapai level

export function levelFromXp(total: number) {
  let level = 1;
  while (level < MAX_LEVEL && xpToReach(level + 1) <= total) level++;
  const base = xpToReach(level);
  const next = level >= MAX_LEVEL ? base : xpToReach(level + 1);
  return { level, intoLevel: total - base, span: Math.max(1, next - base), nextAt: next };
}

export type Belt = { min: number; max: number; obi: string; romaji: string; title: string; titleRomaji: string; color: string; edge: string };

export const BELTS: Belt[] = [
  { min: 1, max: 5, obi: '白帯', romaji: 'Shiro-obi', title: '見習い', titleRomaji: 'Minarai', color: '#F2F2F7', edge: '#D1D1D6' },
  { min: 6, max: 10, obi: '黄帯', romaji: 'Ki-obi', title: '初心者', titleRomaji: 'Shoshinsha', color: '#FFCC00', edge: '#E0B400' },
  { min: 11, max: 15, obi: '橙帯', romaji: 'Daidai-obi', title: '修行者', titleRomaji: 'Shugyōsha', color: '#FF9500', edge: '#E08300' },
  { min: 16, max: 20, obi: '緑帯', romaji: 'Midori-obi', title: '挑戦者', titleRomaji: 'Chōsensha', color: '#34C759', edge: '#2AA84A' },
  { min: 21, max: 25, obi: '青帯', romaji: 'Ao-obi', title: '努力家', titleRomaji: 'Doryokuka', color: '#0066CC', edge: '#0057AD' },
  { min: 26, max: 30, obi: '紫帯', romaji: 'Murasaki-obi', title: '中級者', titleRomaji: 'Chūkyūsha', color: '#AF52DE', edge: '#9440C2' },
  { min: 31, max: 35, obi: '茶帯', romaji: 'Cha-obi', title: '上級者', titleRomaji: 'Jōkyūsha', color: '#A2845E', edge: '#87704F' },
  { min: 36, max: 40, obi: '黒帯・初段', romaji: 'Shodan', title: '初段', titleRomaji: 'Shodan', color: '#1D1D1F', edge: '#000000' },
  { min: 41, max: 45, obi: '黒帯・二段', romaji: 'Nidan', title: '二段', titleRomaji: 'Nidan', color: '#1D1D1F', edge: '#000000' },
  { min: 46, max: 49, obi: '黒帯・三段', romaji: 'Sandan', title: '三段', titleRomaji: 'Sandan', color: '#1D1D1F', edge: '#000000' },
  { min: 50, max: 50, obi: '紅白帯', romaji: 'Kōhaku-obi', title: '師範', titleRomaji: 'Shihan', color: '#E8453C', edge: '#C2342D' },
];

export const beltFor = (level: number): Belt => BELTS.find((b) => level >= b.min && level <= b.max) ?? BELTS[0];
