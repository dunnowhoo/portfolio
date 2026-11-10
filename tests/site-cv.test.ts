import fs from 'node:fs';
import path from 'node:path';
import { extractText, getDocumentProxy } from 'unpdf';
import { describe, expect, it } from 'vitest';
import { buildContext, cleanAnswer, extractCites, retrieve } from '@/lib/site/assistant';
import { DEFAULT_CONTENT } from '@/lib/site/content';
import { chunkCv, cleanCvText } from '@/lib/site/cv-text';

const PHONE = /(?:\+?62[\s.-]?|\b0)8\d(?:[\s.-]?\d){6,11}/;
const SAMPLE = [
  'Jane Doe',
  'Jakarta | LinkedIn | +62 812-3456-7890 | jane@example.com',
  'Engineer who builds things.\u200b',
  'EDUCATION',
  'Universitas Contoh Depok',
  'Bachelor of Information Systems - GPA 3.80/4.00 2022 - 2026',
  '● Coursework: Artificial Intelligence',
  'WORK EXPERIENCE',
  'Acme Corp Jakarta',
  'Software Engineer January 2025 – March 2025',
  '● Built a very long feature description that wraps over to the next line because the PDF layout is narrow here and',
  'continues on this second line of the same bullet point.',
  '● Another bullet',
  'Beta Labs Bandung',
  'Intern June 2024 – August 2024',
  '● Did useful work',
  'SKILLS & COMPETENCIES',
  'Languages: English (C1), Bahasa Indonesia (Native)',
].join('\n');

describe('cleanCvText', () => {
  it('membuang nomor telepon, karakter tak terlihat, dan menormalkan bullet', () => {
    const t = cleanCvText(SAMPLE);
    expect(PHONE.test(t)).toBe(false);
    expect(t).not.toContain('\u200b');
    expect(t).toContain('- Coursework');
    expect(t).toContain('jane@example.com');
  });
});

describe('chunkCv', () => {
  it('memecah per bagian dan per entri, kepala entri ikut di depan', () => {
    const chunks = chunkCv(cleanCvText(SAMPLE));
    expect(chunks.map((c) => c.section)).toEqual(['Summary', 'Education', 'Work Experience', 'Work Experience', 'Skills & Competencies']);
    expect(chunks[2].text.startsWith('Acme Corp Jakarta')).toBe(true);
    expect(chunks[2].text).toContain('continues on this second line');
    expect(chunks[3].text.startsWith('Beta Labs Bandung')).toBe(true);
    expect(chunks.map((c) => c.id)).toEqual([1, 2, 3, 4, 5]);
  });
});

describe('CV asli (public/assets/profile)', async () => {
  const buf = new Uint8Array(fs.readFileSync(path.resolve(__dirname, '../public/assets/profile/CV_FauzanPutraSanjaya.pdf')));
  const { text } = await extractText(await getDocumentProxy(buf), { mergePages: true });
  const chunks = chunkCv(cleanCvText(Array.isArray(text) ? text.join('\n') : text));

  it('terbaca, terpotong, dan tanpa nomor telepon', () => {
    expect(chunks.length).toBeGreaterThan(10);
    expect(chunks.some((c) => PHONE.test(c.text))).toBe(false);
    expect(chunks.every((c) => c.text.length <= 1100)).toBe(true);
  });
  it('pertanyaan IPK/GPA mengambil potongan pendidikan', () => {
    expect(retrieve(DEFAULT_CONTENT, "What's his GPA?", 5, chunks).cvPicked[0]?.detail).toMatch(/GPA/);
    const ctx = buildContext(DEFAULT_CONTENT, 'IPK-nya berapa?', chunks);
    expect(ctx.text).toContain('## Resume excerpts');
    expect(ctx.text).toMatch(/\[\[c:\d+\]\] \(Education\)/);
    expect(PHONE.test(ctx.text)).toBe(false);
  });
  it('pertanyaan sertifikasi mengambil potongan skill', () => {
    expect(retrieve(DEFAULT_CONTENT, 'Sertifikasi apa saja yang dia punya?', 5, chunks).cvPicked.map((i) => i.detail).join(' ')).toMatch(/Certifications/);
  });
  it('tanpa CV, konteks tidak berubah (tidak ada bagian resume)', () => {
    expect(buildContext(DEFAULT_CONTENT, 'GPA').text).not.toContain('## Resume excerpts');
  });
});

describe('sitasi CV', () => {
  it('tag [[c:N]] dikenali dan dibersihkan', () => {
    expect(extractCites('GPA 3.75 [[c:2]].')).toEqual([{ kind: 'c', id: 2 }]);
    expect(cleanAnswer('His GPA is 3.75 [[c:2]].')).toBe('His GPA is 3.75.');
  });
});
