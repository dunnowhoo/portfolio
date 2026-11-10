import { describe, expect, it } from 'vitest';
import { FREE_TYPES, NODES, ORDERED, computeStatuses, nextNode, type ProgressMap } from '@/lib/dojo/curriculum';

const empty: ProgressMap = new Map();

describe('kurikulum', () => {
  it('ID node unik di kedua jalur', () => {
    expect(NODES.size).toBe(ORDERED.jp.length + ORDERED.dsa.length);
  });
  it('jumlah node sesuai dokumen', () => {
    expect(ORDERED.jp).toHaveLength(271);
    expect(ORDERED.dsa).toHaveLength(332);
  });
  it.each(['jp', 'dsa'] as const)('%s: progres kosong → node wajib pertama tersedia', (track) => {
    const st = computeStatuses(track, empty);
    const first = nextNode(track, st);
    expect(first).toBeDefined();
    expect(st.get(first!.id)).toBe('available');
  });
  it.each(['jp', 'dsa'] as const)('%s: target eksternal & milestone tidak pernah terkunci', (track) => {
    const st = computeStatuses(track, empty);
    for (const n of ORDERED[track]) if (FREE_TYPES.has(n.type)) expect(st.get(n.id)).not.toBe('locked');
  });
  it('menyelesaikan node wajib pertama membuka node wajib berikutnya', () => {
    const st0 = computeStatuses('jp', empty);
    const first = nextNode('jp', st0)!;
    const st1 = computeStatuses('jp', new Map([[first.id, { status: 'completed', mastery: 1, srsDue: null }]]));
    const second = nextNode('jp', st1)!;
    expect(second.id).not.toBe(first.id);
    expect(st1.get(second.id)).toBe('available');
  });
});
