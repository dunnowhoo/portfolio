// Indeks kurikulum + aturan buka node + pace (PRD F3/F4, GAMIFICATION §9).
import { DSA_SECTIONS } from './dsa';
import { JP_SECTIONS } from './jp';
import type { PathNode, Section, Track, Unit } from './types';

export * from './types';

export const CURRICULUM: Record<Track, Section[]> = { jp: JP_SECTIONS, dsa: DSA_SECTIONS };

export const UNITS: Record<Track, Unit[]> = {
  jp: JP_SECTIONS.flatMap((s) => s.units),
  dsa: DSA_SECTIONS.flatMap((s) => s.units),
};

export const ORDERED: Record<Track, PathNode[]> = {
  jp: UNITS.jp.flatMap((u) => u.nodes),
  dsa: UNITS.dsa.flatMap((u) => u.nodes),
};

export const NODES = new Map<string, PathNode>([...ORDERED.jp, ...ORDERED.dsa].map((n) => [n.id, n]));
export const UNIT_INDEX = new Map<string, Unit>([...UNITS.jp, ...UNITS.dsa].map((u) => [`${u.nodes[0]?.track ?? 'jp'}:${u.id}`, u]));
export const unitOf = (n: PathNode) => UNIT_INDEX.get(`${n.track}:${n.unitId}`)!;

export type NodeStatus = 'locked' | 'available' | 'in_progress' | 'completed' | 'skipped';
export type ProgressRow = { status: string; mastery: number; srsDue: string | null };
export type ProgressMap = Map<string, ProgressRow>;

const doneish = (p?: ProgressRow) => p?.status === 'completed' || p?.status === 'skipped';
// Target eksternal & milestone bertanggal: tidak pernah dikunci dan tidak menghalangi node lain
export const FREE_TYPES = new Set(['milestone', 'anki', 'duolingo']);
const gating = (n: PathNode) => n.required && !FREE_TYPES.has(n.type);

// Unit terbuka kalau unit sebelumnya "tuntas": checkpoint-nya lulus, atau semua node wajibnya selesai.
function unitCleared(u: Unit, progress: ProgressMap): boolean {
  const cp = u.nodes.find((n) => n.type === 'checkpoint');
  if (cp && doneish(progress.get(cp.id))) return true;
  return u.nodes.filter(gating).every((n) => doneish(progress.get(n.id)));
}

export function computeStatuses(track: Track, progress: ProgressMap): Map<string, NodeStatus> {
  const out = new Map<string, NodeStatus>();
  let prevCleared = true;
  for (const sec of CURRICULUM[track]) {
    for (const u of sec.units) {
      const touched = u.nodes.some((n) => progress.has(n.id));
      // Section opsional (mis. system design) selalu terbuka dan tidak mengunci yang lain
      const open = sec.optional || prevCleared || touched;
      let blocked = !open;
      for (const n of u.nodes) {
        const p = progress.get(n.id);
        if (p?.status === 'completed') out.set(n.id, 'completed');
        else if (p?.status === 'skipped') out.set(n.id, 'skipped');
        else if (blocked && !FREE_TYPES.has(n.type)) out.set(n.id, 'locked');
        else out.set(n.id, p?.status === 'in_progress' ? 'in_progress' : 'available');
        // Node berikutnya baru terbuka setelah node wajib ini selesai
        if (gating(n) && !doneish(p) && !sec.optional) blocked = true;
      }
      if (!sec.optional) prevCleared = unitCleared(u, progress);
    }
  }
  return out;
}

// Syarat membuka node terkunci, untuk ditampilkan di panel
export function lockReason(node: PathNode, statuses: Map<string, NodeStatus>): string | null {
  if (statuses.get(node.id) !== 'locked') return null;
  const u = unitOf(node);
  const firstOpen = u.nodes.find((n) => n.required && statuses.get(n.id) !== 'completed' && statuses.get(n.id) !== 'skipped');
  if (firstOpen && firstOpen.id !== node.id && statuses.get(firstOpen.id) !== 'locked') return `Selesaikan dulu "${firstOpen.title}".`;
  const units = UNITS[node.track];
  const idx = units.findIndex((x) => x.id === u.id);
  const prev = units[idx - 1];
  return prev ? `Tuntaskan unit ${prev.id} (${prev.title}) dulu, atau lulus checkpoint unit ini untuk melompat.` : null;
}

export function nextNode(track: Track, statuses: Map<string, NodeStatus>): PathNode | undefined {
  return ORDERED[track].find((n) => gating(n) && (statuses.get(n.id) === 'available' || statuses.get(n.id) === 'in_progress'));
}

export type Pace = { expected: number; actual: number; diff: number; label: string; tone: 'ok' | 'ahead' | 'behind'; plan?: string; markerId?: string; total: number };

export function computePace(track: Track, progress: ProgressMap, today: string): Pace {
  const req = ORDERED[track].filter((n) => n.required && n.targetDate);
  const expected = req.filter((n) => n.targetDate! <= today).length;
  const actual = req.filter((n) => doneish(progress.get(n.id))).length;
  const diff = actual - expected;
  const marker = req.find((n) => n.targetDate! > today);
  if (Math.abs(diff) <= 1) return { expected, actual, diff, label: 'Tepat waktu', tone: 'ok', markerId: marker?.id, total: req.length };
  if (diff > 0) return { expected, actual, diff, label: `Unggul ${diff}`, tone: 'ahead', markerId: marker?.id, total: req.length };
  const behind = -diff;
  return {
    expected,
    actual,
    diff,
    label: `Tertinggal ${behind}`,
    tone: 'behind',
    plan: `Kejar ${Math.ceil(behind / 7)} node tambahan per hari selama 7 hari.`,
    markerId: marker?.id,
    total: req.length,
  };
}

// Node yang ikut terlewati kalau checkpoint unit ini lulus sebagai tes lompat
export function skippedBy(checkpoint: PathNode, progress: ProgressMap): PathNode[] {
  const units = UNITS[checkpoint.track];
  const idx = units.findIndex((u) => u.id === checkpoint.unitId);
  return units
    .slice(0, idx + 1)
    .flatMap((u) => u.nodes)
    .filter((n) => n.required && n.id !== checkpoint.id && !doneish(progress.get(n.id)) && n.type !== 'milestone');
}
