import { describe, expect, it } from 'vitest';
import { addDays, daysBetween, schedule, type SrsState } from '@/lib/dojo/engine/srs';

const fresh: SrsState = { interval: null, ease: null, reps: 0, lapses: 0, mastery: 1 };

describe('SRS', () => {
  it('interval pertama sesuai rating', () => {
    expect(schedule(fresh, 1, '2026-11-10', 'k').interval).toBe(1);
    expect(schedule(fresh, 3, '2026-11-10', 'k').interval).toBe(4);
    expect(schedule(fresh, 4, '2026-11-10', 'k').interval).toBe(7);
  });
  it('Lupa mengulang ke 1 hari dan menurunkan ease', () => {
    const s = schedule({ interval: 20, ease: 2.5, reps: 4, lapses: 0, mastery: 2 }, 1, '2026-11-10', 'k');
    expect(s).toMatchObject({ interval: 1, ease: 2.3, lapses: 1, mastery: 1, due: '2026-11-11' });
  });
  it('Baik memperpanjang interval (±5% fuzz) dan memberi bintang', () => {
    const s = schedule({ interval: 10, ease: 2.5, reps: 3, lapses: 0, mastery: 1 }, 3, '2026-11-10', 'k');
    expect(s.interval).toBeGreaterThanOrEqual(24);
    expect(s.interval).toBeLessThanOrEqual(26);
    expect(s.mastery).toBe(2);
  });
  it('ease tidak turun di bawah 1.3 dan interval maks 180 hari', () => {
    let st: SrsState = { interval: 5, ease: 1.35, reps: 5, lapses: 0, mastery: 1 };
    const low = schedule(st, 1, '2026-11-10', 'k');
    expect(low.ease).toBe(1.3);
    st = { interval: 170, ease: 2.8, reps: 9, lapses: 0, mastery: 3 };
    expect(schedule(st, 4, '2026-11-10', 'k').interval).toBe(180);
  });
  it('fuzz deterministik', () => {
    const st: SrsState = { interval: 30, ease: 2.5, reps: 5, lapses: 0, mastery: 2 };
    expect(schedule(st, 3, '2026-11-10', 'kartu-a')).toEqual(schedule(st, 3, '2026-11-10', 'kartu-a'));
  });
  it('tanggal', () => {
    expect(addDays('2026-12-31', 1)).toBe('2027-01-01');
    expect(daysBetween('2026-11-10', '2028-10-01')).toBe(691);
  });
});
