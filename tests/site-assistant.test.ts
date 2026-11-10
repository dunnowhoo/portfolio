import { describe, expect, it } from 'vitest';
import { DEFAULT_CONTENT, publicContent, type SiteContent } from '@/lib/site/content';
import { buildContext, cleanAnswer, extractCites, normalizeQuestion, retrieve, systemPrompt } from '@/lib/site/assistant';
import { SECTION_SCHEMAS } from '@/lib/site/validate';

const C = DEFAULT_CONTENT;
const tags = (q: string) => retrieve(C, q).picked.map((i) => `${i.kind}:${i.id}`);
const titleOf = (tag: string) => {
  const [k, id] = tag.split(':');
  const n = Number(id);
  if (k === 'p') return C.projects.find((p) => p.id === n)?.title ?? '';
  if (k === 'e') return `${C.experience.find((e) => e.id === n)?.role} ${C.experience.find((e) => e.id === n)?.company}`;
  return '';
};

describe('retrieval', () => {
  it('pertanyaan AI mengambil proyek AI', () => {
    const picked = tags('What AI projects has he built?');
    expect(picked.length).toBeGreaterThan(0);
    expect(picked.every((t) => t.startsWith('p:') || t.startsWith('e:'))).toBe(true);
    expect(picked.map(titleOf).join(' ')).toMatch(/Dermato|Rekap|Stance|AI/i);
  });
  it('pertanyaan berbahasa Indonesia tentang mobile mengambil pengalaman/proyek mobile', () => {
    const picked = tags('Pengalaman mobile-nya apa saja?');
    expect(picked.some((t) => t.startsWith('e:'))).toBe(true);
    expect(picked.map(titleOf).join(' ')).toMatch(/Mobile|Flutter|TVRI|Saka/i);
  });
  it('pertanyaan kontak tidak mengambil item (cukup profil)', () => {
    expect(tags('how can I contact him')).toEqual([]);
  });
  it('maksimal 5 item detail', () => {
    expect(retrieve(C, 'flutter react python ai web mobile data backend project').picked.length).toBeLessThanOrEqual(5);
  });
});

describe('konteks', () => {
  it('katalog berisi semua item, detail hanya yang relevan, dengan tag', () => {
    const ctx = buildContext(C, 'AI projects');
    const total = C.experience.length + C.projects.length + C.organization.length + C.achievements.length;
    expect(ctx.items).toBe(total);
    expect(ctx.picked).toBeGreaterThan(0);
    expect(ctx.text).toContain('## Catalog');
    expect(ctx.text).toContain('## Details');
    expect(ctx.text).toMatch(/\[\[p:\d+\]\]/);
    expect(ctx.text).toContain(C.contact.email);
  });
  it('item tersembunyi tidak ikut sama sekali', () => {
    const hiddenId = C.projects[0].id;
    const c: SiteContent = { ...C, projects: C.projects.map((p) => (p.id === hiddenId ? { ...p, hidden: true } : p)) };
    const ctx = buildContext(c, C.projects[0].title);
    expect(ctx.text).not.toContain(`[[p:${hiddenId}]]`);
    expect(ctx.text).not.toContain(C.projects[0].title);
  });
  it('catatan asisten ikut di konteks, tapi tidak dikirim ke browser', () => {
    const c: SiteContent = { ...C, assistant: { ...C.assistant, notes: 'Open to remote roles in Singapore.' } };
    expect(buildContext(c, 'remote').text).toContain('Open to remote roles in Singapore.');
    expect(publicContent(c).assistant.notes).toBe('');
  });
  it('prompt sistem memuat aturan penting', () => {
    const p = systemPrompt(C, 'DATA');
    expect(p).toMatch(/language of the visitor/);
    expect(p).toMatch(/Never reveal/);
    expect(p).toMatch(/\[\[p:3\]\]/);
    expect(p.endsWith('DATA')).toBe(true);
  });
});

describe('sitasi', () => {
  it('extractCites unik dan berurutan', () => {
    expect(extractCites('A [[p:3]] B [[e:1]] C [[p:3]] D [o:2]')).toEqual([
      { kind: 'p', id: 3 },
      { kind: 'e', id: 1 },
      { kind: 'o', id: 2 },
    ]);
  });
  it('cleanAnswer membuang tag lengkap, tag setengah jadi di akhir, dan bold', () => {
    expect(cleanAnswer('He built **DermatoAI** [[p:13]], a triage agent.')).toBe('He built DermatoAI, a triage agent.');
    expect(cleanAnswer('He built DermatoAI [[p:1')).toBe('He built DermatoAI');
    expect(cleanAnswer('He built DermatoAI [')).toBe('He built DermatoAI');
    expect(cleanAnswer('- Saka [[p:3]]\n- MoodTune [[p:10]]')).toBe('- Saka\n- MoodTune');
  });
  it('normalizeQuestion untuk kunci cache', () => {
    expect(normalizeQuestion('  What AI projects has he built?? ')).toBe('what ai projects has he built');
  });
});

describe('skema CMS asisten', () => {
  it('nilai bawaan valid', () => expect(SECTION_SCHEMAS.assistant.safeParse(C.assistant).success).toBe(true));
  it('menolak varian asing dan lebih dari 6 contoh pertanyaan', () => {
    expect(SECTION_SCHEMAS.assistant.safeParse({ ...C.assistant, variant: 'dog' }).success).toBe(false);
    expect(SECTION_SCHEMAS.assistant.safeParse({ ...C.assistant, suggestions: Array.from({ length: 7 }, (_, i) => `q${i}`) }).success).toBe(false);
  });
});
