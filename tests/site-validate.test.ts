import { describe, expect, it } from 'vitest';
import { DEFAULT_CONTENT, SECTION_KEYS, publicContent } from '@/lib/site/content';
import { SECTION_SCHEMAS, checkEmbed, isSafeUrl, normalizeEmbed } from '@/lib/site/validate';

const YT = '<iframe src="https://www.youtube.com/embed/x"></iframe>';

describe('konten awal (seed)', () => {
  it.each(SECTION_KEYS)('%s lolos skema', (k) => {
    expect(SECTION_SCHEMAS[k].safeParse(DEFAULT_CONTENT[k]).success).toBe(true);
  });
  it('kode embed lama tidak diubah normalisasi', () => {
    const parsed = SECTION_SCHEMAS.projects.parse(DEFAULT_CONTENT.projects);
    const before = DEFAULT_CONTENT.projects.filter((p) => p.embed).map((p) => p.embed);
    expect(parsed.filter((p) => p.embed).map((p) => p.embed)).toEqual(before);
    expect(before.length).toBeGreaterThan(0);
  });
});

describe('checkEmbed menolak kode berbahaya', () => {
  it.each([
    ['script', `<script>alert(1)</script>${YT}`],
    ['atribut event', '<iframe src="https://www.youtube.com/embed/x" onload="alert(1)"></iframe>'],
    ['host asing', '<iframe src="https://evil.example/x"></iframe>'],
    ['iframe http', '<iframe src="http://www.youtube.com/embed/x"></iframe>'],
    ['href javascript:', `${YT}<a href="javascript:alert(1)">x</a>`],
    ['entity desimal', `${YT}<a href="&#106;avascript:alert(1)">x</a>`],
    ['entity heks + &colon;', `${YT}<a href="&#x6A;avascript&colon;alert(1)">x</a>`],
    ['srcdoc', '<iframe srcdoc="x" src="https://www.youtube.com/embed/x"></iframe>'],
    ['img onerror', `<img src=x onerror=alert(1)>${YT}`],
    ['svg', `<svg>${YT}</svg>`],
    ['tanpa iframe', '<div>halo</div>'],
    ['data: URL', '<iframe src="data:text/html,x"></iframe>'],
    ['trik userinfo', '<iframe src="https://www.youtube.com@evil.example/x"></iframe>'],
  ])('%s', (_name, html) => {
    expect(checkEmbed(html)).not.toBeNull();
  });
  it('menerima iframe YouTube biasa', () => expect(checkEmbed(YT)).toBeNull());
});

describe('normalizeEmbed', () => {
  it.each([
    ['https://www.youtube.com/watch?v=cp5KDpKXKYA&t=10', 'https://www.youtube.com/embed/cp5KDpKXKYA'],
    ['https://youtu.be/cp5KDpKXKYA', 'https://www.youtube.com/embed/cp5KDpKXKYA'],
    ['https://www.canva.com/design/DAHVL4ua_i0/Q78OK3RY7mz2KY5G0o8MDw/view?utm_content=x', '/design/DAHVL4ua_i0/Q78OK3RY7mz2KY5G0o8MDw/view?embed'],
    ['https://www.figma.com/design/abc/Name?node-id=1-2', 'figma.com/embed?embed_host=share&url='],
    ['https://vimeo.com/76979871', 'https://player.vimeo.com/video/76979871'],
  ])('%s → embed valid', (url, expected) => {
    const html = normalizeEmbed(url);
    expect(html).toContain(expected);
    expect(checkEmbed(html)).toBeNull();
  });
  it('link dari host asing tidak jadi embed yang lolos', () => {
    expect(checkEmbed(normalizeEmbed('https://evil.example/x'))).not.toBeNull();
  });
  it('tanda kutip di URL tidak bisa keluar dari atribut', () => {
    const html = normalizeEmbed('https://docs.google.com/presentation/d/x/embed?a="onload=alert(1)');
    expect(html).not.toContain('"onload');
    expect(checkEmbed(html)).toBeNull();
  });
});

describe('isSafeUrl', () => {
  it.each([
    ['https://x.com/a', true],
    ['/assets/a.png', true],
    [' https://x.com ', true],
    ['//evil.com/a', false],
    ['/\\evil.com', false],
    ['javascript:alert(1)', false],
    ['JAVASCRIPT:alert(1)', false],
    ['data:text/html,x', false],
    ['ftp://x.com', false],
    ['mailto:a@b.co', false],
  ])('%s → %s', (u, want) => expect(isSafeUrl(u)).toBe(want));
  it('mailto hanya kalau diizinkan', () => expect(isSafeUrl('mailto:a@b.co', { mailto: true })).toBe(true));
});

describe('skema bagian', () => {
  const p0 = DEFAULT_CONTENT.projects[0];
  it('menolak gambar javascript:', () => expect(SECTION_SCHEMAS.projects.safeParse([{ ...p0, image: 'javascript:alert(1)' }]).success).toBe(false));
  it('menolak id ganda', () => expect(SECTION_SCHEMAS.projects.safeParse([p0, { ...p0 }]).success).toBe(false));
  it('menolak kategori asing', () => expect(SECTION_SCHEMAS.projects.safeParse([{ ...p0, category: 'Game' }]).success).toBe(false));
  it('menolak nama ikon aneh', () => expect(SECTION_SCHEMAS.achievements.safeParse([{ id: 1, title: 'x', description: '', icon: '<b>' }]).success).toBe(false));
  it('menolak email salah', () => expect(SECTION_SCHEMAS.contact.safeParse({ ...DEFAULT_CONTENT.contact, email: 'bukan email' }).success).toBe(false));
  it('link jadwal boleh kosong', () => expect(SECTION_SCHEMAS.contact.safeParse({ ...DEFAULT_CONTENT.contact, scheduleUrl: '' }).success).toBe(true));
  it('memangkas spasi', () => expect(SECTION_SCHEMAS.education.parse({ school: '  UI  ', degree: ' CS ' })).toEqual({ school: 'UI', degree: 'CS' }));
  it('mengubah link embed jadi iframe saat parse', () => {
    expect(SECTION_SCHEMAS.projects.parse([{ ...p0, embed: 'https://youtu.be/cp5KDpKXKYA' }])[0].embed?.startsWith('<iframe')).toBe(true);
  });
});

describe('publicContent', () => {
  it('membuang item tersembunyi beserta penandanya', () => {
    const c = { ...DEFAULT_CONTENT, experience: DEFAULT_CONTENT.experience.map((e, i) => ({ ...e, hidden: i === 0 })) };
    const out = publicContent(c);
    expect(out.experience).toHaveLength(DEFAULT_CONTENT.experience.length - 1);
    expect(out.experience.some((e) => e.id === DEFAULT_CONTENT.experience[0].id)).toBe(false);
    expect(out.experience.every((e) => !('hidden' in e))).toBe(true);
  });
});
