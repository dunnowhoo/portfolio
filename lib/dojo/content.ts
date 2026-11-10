import 'server-only';
import fs from 'node:fs/promises';
import path from 'node:path';

// Materi MD Dōjō (content/dojo/**). Dibaca dari disk sekali per instance, lalu disimpan di memori.

export type Material = {
  id: string;
  track: 'jp' | 'dsa';
  title: string;
  order: number;
  estMinutes: number;
  xp: number;
  tags: string[];
  body: string;
};

export type Kanji = { kanji: string; batch: number; on: string; kun: string; meaning: string; examples: string };
export type GrammarPoint = { id: string; level: 'n5' | 'n4' | 'n3'; num: number; unit: string; pattern: string; meaning: string; example: string; translation: string };

const ROOT = path.join(process.cwd(), 'content', 'dojo');

function parseFrontmatter(src: string): { data: Record<string, string | string[]>; body: string } {
  const m = src.match(/^---\n([\s\S]*?)\n---\n?/);
  if (!m) return { data: {}, body: src };
  const data: Record<string, string | string[]> = {};
  for (const line of m[1].split('\n')) {
    const kv = line.match(/^(\w+):\s*(.*)$/);
    if (!kv) continue;
    const v = kv[2].trim();
    data[kv[1]] = v.startsWith('[') ? v.slice(1, -1).split(',').map((x) => x.trim()).filter(Boolean) : v.replace(/^['"]|['"]$/g, '');
  }
  return { data, body: src.slice(m[0].length) };
}

const g = globalThis as unknown as { __dojoMaterials?: Promise<Material[]> };

export function loadMaterials(): Promise<Material[]> {
  g.__dojoMaterials ??= (async () => {
    const out: Material[] = [];
    for (const track of ['jp', 'dsa'] as const) {
      const dir = path.join(ROOT, track);
      const files = (await fs.readdir(dir)).filter((f) => f.endsWith('.md')).sort();
      for (const f of files) {
        const { data, body } = parseFrontmatter(await fs.readFile(path.join(dir, f), 'utf8'));
        out.push({
          id: String(data.id ?? `${track}-${f.replace(/\.md$/, '')}`),
          track,
          title: String(data.title ?? f),
          order: Number(data.order ?? 0),
          estMinutes: Number(data.estMinutes ?? 15),
          xp: Number(data.xp ?? 20),
          tags: Array.isArray(data.tags) ? data.tags : [],
          body,
        });
      }
    }
    return out;
  })().catch((e) => {
    g.__dojoMaterials = undefined;
    throw e;
  });
  return g.__dojoMaterials;
}

export async function getMaterial(id: string): Promise<Material | undefined> {
  return (await loadMaterials()).find((m) => m.id === id);
}

const headingRe = /^(#{1,6})\s+(.*)$/;
const startsWithToken = (text: string, prefix: string) => text === prefix || text.startsWith(`${prefix} `) || text.startsWith(`${prefix}·`);

// Ambil bagian MD yang heading-nya diawali salah satu prefix (mis. "§1", "Unit 1.4", "6."),
// sampai heading berikutnya dengan level yang sama atau lebih tinggi.
export function sliceMarkdown(body: string, sections?: string[]): string {
  if (!sections?.length) return body;
  const lines = body.split('\n');
  const out: string[] = [];
  let depth = 0;
  let inFence = false;
  for (const line of lines) {
    if (line.trimStart().startsWith('```')) inFence = !inFence;
    const h = inFence ? null : line.match(headingRe);
    if (h) {
      const level = h[1].length;
      const text = h[2].replace(/\*\*/g, '').trim();
      if (sections.some((s) => startsWithToken(text, s))) {
        depth = level;
        out.push(line);
        continue;
      }
      if (depth && level <= depth) depth = 0;
    }
    if (depth) out.push(line);
  }
  return out.length ? out.join('\n') : body;
}

function tableRows(body: string, header: RegExp): string[][] {
  const lines = body.split('\n');
  const rows: string[][] = [];
  let inTable = false;
  for (const line of lines) {
    if (!line.startsWith('|')) {
      inTable = false;
      continue;
    }
    const cells = line.slice(1, line.endsWith('|') ? -1 : undefined).split('|').map((c) => c.trim());
    if (header.test(line)) {
      inTable = true;
      continue;
    }
    if (!inTable || /^-+$/.test(cells[0].replace(/:/g, ''))) continue;
    rows.push(cells);
  }
  return rows;
}

const gk = globalThis as unknown as { __dojoKanji?: Kanji[]; __dojoGrammar?: GrammarPoint[] };

export async function loadKanji(): Promise<Kanji[]> {
  if (gk.__dojoKanji) return gk.__dojoKanji;
  const m = await getMaterial('jp-04-kanji-n5');
  const out: Kanji[] = [];
  let batch = 0;
  for (const c of tableRows(m?.body ?? '', /^\|\s*Batch\s*\|\s*Kanji/)) {
    const b = c[0].replace(/\*/g, '').trim();
    if (b) batch = Number(b) || batch;
    if (!c[1]) continue;
    out.push({ kanji: c[1], batch, on: c[2] ?? '', kun: c[3] ?? '', meaning: c[4] ?? '', examples: c[5] ?? '' });
  }
  gk.__dojoKanji = out;
  return out;
}

export async function loadGrammar(): Promise<GrammarPoint[]> {
  if (gk.__dojoGrammar) return gk.__dojoGrammar;
  const files: [GrammarPoint['level'], string][] = [
    ['n5', 'jp-03-n5-grammar'],
    ['n4', 'jp-05-n4-grammar'],
    ['n3', 'jp-06-n3-grammar'],
  ];
  const out: GrammarPoint[] = [];
  for (const [level, id] of files) {
    const body = (await getMaterial(id))?.body ?? '';
    let unit = '';
    let inTable = false;
    for (const line of body.split('\n')) {
      const h = line.match(headingRe);
      if (h) {
        const u = h[2].match(/Unit\s+(\d+\.\d+)/);
        unit = u ? u[1] : unit;
        inTable = false;
        continue;
      }
      if (!line.startsWith('|')) continue;
      const cells = line.slice(1, -1).split('|').map((c) => c.trim());
      if (/^ID$/i.test(cells[0])) {
        inTable = true;
        continue;
      }
      if (!inTable) continue;
      const mm = cells[0].match(/^g(\d+)$/);
      if (!mm) continue;
      out.push({ id: `${level}-g${mm[1].padStart(2, '0')}`, level, num: Number(mm[1]), unit, pattern: cells[1] ?? '', meaning: cells[2] ?? '', example: cells[3] ?? '', translation: cells[4] ?? '' });
    }
  }
  gk.__dojoGrammar = out;
  return out;
}
