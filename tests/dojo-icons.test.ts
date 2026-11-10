import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { DOJO_ICON_NAMES, dojoIconSrc } from '@/lib/dojo/icons';
import { NODE_ICON } from '@/lib/dojo/curriculum/types';
import { DARU_GEAR, daruSrc } from '@/lib/dojo/daru';

const ROOT = path.resolve(__dirname, '..');
const publicFile = (url: string) => path.join(ROOT, 'public', url);

describe('aset ikon', () => {
  it.each(DOJO_ICON_NAMES)('%s ada di public/assets', (name) => {
    expect(dojoIconSrc(name).startsWith('/assets/')).toBe(true); // proxy hanya meloloskan /assets
    expect(fs.existsSync(publicFile(dojoIconSrc(name)))).toBe(true);
  });
  it('setiap tipe node memakai ikon yang terdaftar', () => {
    for (const icon of Object.values(NODE_ICON)) expect(DOJO_ICON_NAMES).toContain(icon);
  });
  it('11 gambar Daru ada', () => {
    DARU_GEAR.forEach((_, i) => expect(fs.existsSync(publicFile(daruSrc(i)))).toBe(true));
  });
});

describe('tanpa emoji di UI', () => {
  // Emoji/pictograph (termasuk ★ ✓ ▶ yang bisa tampil sebagai emoji di iOS). © di footer boleh.
  const EMOJI = /[\p{Extended_Pictographic}✓✔️]/u;
  const files: string[] = [];
  const walk = (p: string) => {
    for (const f of fs.readdirSync(p, { withFileTypes: true })) {
      const full = path.join(p, f.name);
      if (f.isDirectory()) walk(full);
      else if (/\.(tsx?|css)$/.test(f.name)) files.push(full);
    }
  };
  ['app', 'components', 'lib'].forEach((d) => walk(path.join(ROOT, d)));

  it('kode di app/, components/, lib/ tidak memakai emoji (komentar dikecualikan)', () => {
    const hits: string[] = [];
    for (const f of files) {
      fs.readFileSync(f, 'utf8')
        .split('\n')
        .forEach((line, i) => {
          const code = line.replace(/\/\*.*?\*\//g, '').replace(/(^|[^:])\/\/.*$/, '$1').replace(/©/g, '');
          if (EMOJI.test(code)) hits.push(`${path.relative(ROOT, f)}:${i + 1}`);
        });
    }
    expect(hits).toEqual([]);
  });
});
