import { describe, expect, it } from 'vitest';
import { BELTS, MAX_LEVEL, beltFor, levelFromXp, xpToReach } from '@/lib/dojo/level';
import { DARU_GEAR, daruSrc, daruTier, nextGear } from '@/lib/dojo/daru';

describe('kurva level', () => {
  it('ambang XP', () => {
    expect(xpToReach(1)).toBe(0);
    expect(xpToReach(2)).toBe(90);
    expect(xpToReach(6)).toBe(1350);
  });
  it('levelFromXp di sekitar ambang', () => {
    expect(levelFromXp(0).level).toBe(1);
    expect(levelFromXp(89).level).toBe(1);
    expect(levelFromXp(90).level).toBe(2);
    expect(levelFromXp(1349).level).toBe(5);
    expect(levelFromXp(1350).level).toBe(6);
    expect(levelFromXp(10_000_000).level).toBe(MAX_LEVEL);
  });
});

describe('sabuk dan Daru', () => {
  it('sabuk menutup level 1–50 tanpa celah', () => {
    for (let lv = 1; lv <= MAX_LEVEL; lv++) expect(BELTS.filter((b) => lv >= b.min && lv <= b.max)).toHaveLength(1);
  });
  it('11 tingkat Daru untuk 11 sabuk', () => {
    expect(DARU_GEAR).toHaveLength(BELTS.length);
    expect(daruTier(1)).toBe(0);
    expect(daruTier(5)).toBe(0);
    expect(daruTier(6)).toBe(1);
    expect(daruTier(49)).toBe(9);
    expect(daruTier(50)).toBe(10);
    expect(beltFor(50).romaji).toBe('Kōhaku-obi');
  });
  it('path gambar di bawah /assets (diloloskan proxy)', () => {
    expect(daruSrc(0)).toBe('/assets/dojo/daru/tier-01.webp');
    expect(daruSrc(10)).toBe('/assets/dojo/daru/tier-11.webp');
  });
  it('perlengkapan berikutnya', () => {
    expect(nextGear(1)).toMatchObject({ atLevel: 6, gear: { name: 'Hachimaki' } });
    expect(nextGear(49)?.atLevel).toBe(50);
    expect(nextGear(50)).toBeNull();
  });
});
