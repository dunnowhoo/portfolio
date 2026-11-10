// Pemecah teks CV (dari PDF) jadi potongan untuk retrieval asisten. Fungsi murni, mudah dites.
// Nomor telepon dibuang supaya asisten tidak membagikannya; pengunjung diarahkan ke email/jadwal call.

export type CvChunk = { id: number; section: string; text: string };

const HEADING =
  /^(SUMMARY|PROFILE|ABOUT|EDUCATION|WORK EXPERIENCE|PROFESSIONAL EXPERIENCE|EXPERIENCE|INTERNSHIPS?|ORGANI[SZ]ATIONS?|ORGANI[SZ]ATIONAL EXPERIENCE|LEADERSHIP|VOLUNTEER(?:ING)?(?: EXPERIENCE)?|PROJECTS?|AWARDS?(?: & ACHIEVEMENTS)?|ACHIEVEMENTS|HONORS?(?: & AWARDS)?|SKILLS(?: & COMPETENCIES)?|TECHNICAL SKILLS|CERTIFICATIONS?|LANGUAGES|PUBLICATIONS?)$/;
const PHONE = /(?:\+?62[\s.-]?|\b0)8\d(?:[\s.-]?\d){6,11}\b/g;
const MAX_CHUNK = 900;

const titleCase = (s: string) => s.toLowerCase().replace(/(^|\s|&\s)\S/g, (m) => m.toUpperCase());

/** Bersihkan teks hasil ekstraksi: karakter tak terlihat, nomor telepon, bullet, spasi. */
export function cleanCvText(raw: string): string {
  return raw
    .replace(/[​-‍﻿]/g, '')
    .replace(PHONE, '')
    .replace(/\|\s*(?=\|)/g, '')
    .replace(/[\u25CF\u2022\u25AA\u25E6]\s*/g, '- ') // bullet: black circle, bullet, small square, white bullet
    .replace(/[ \t]{2,}/g, ' ')
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean)
    .join('\n');
}

/** Potong per bagian (heading huruf besar) lalu per entri (dua baris pendek berurutan = kepala entri). */
export function chunkCv(text: string): CvChunk[] {
  const lines = text.split('\n').map((l) => l.trim()).filter(Boolean);
  const sections: { name: string; lines: string[] }[] = [{ name: 'Summary', lines: [] }];
  for (const l of lines) {
    if (HEADING.test(l)) sections.push({ name: titleCase(l), lines: [] });
    else sections[sections.length - 1].lines.push(l);
  }

  const chunks: CvChunk[] = [];
  const push = (section: string, body: string) => {
    const t = body.replace(/\s+/g, ' ').trim();
    if (t) chunks.push({ id: chunks.length + 1, section, text: t });
  };
  const isBullet = (l?: string) => !!l && l.startsWith('- ');
  const short = (l?: string) => !!l && !isBullet(l) && l.length < 90;

  for (const s of sections) {
    // Kelompokkan baris jadi entri
    const entries: string[][] = [];
    let cur: string[] = [];
    s.lines.forEach((l, i) => {
      // Kepala entri = dua baris pendek (mis. "Perusahaan Kota" lalu "Peran Tanggal") yang langsung diikuti bullet
      const startsEntry = cur.some(isBullet) && short(l) && short(s.lines[i + 1]) && isBullet(s.lines[i + 2]);
      if (startsEntry) {
        entries.push(cur);
        cur = [];
      }
      cur.push(l);
    });
    if (cur.length) entries.push(cur);

    for (const e of entries) {
      const whole = e.join('\n');
      if (whole.length <= MAX_CHUNK) {
        push(s.name, whole);
        continue;
      }
      // Entri panjang: pecah di awal bullet, ulangi kepala entri supaya konteksnya tidak hilang
      const head = e.filter((l, i) => i < 2 && !isBullet(l)).join(' ');
      let buf = '';
      for (const l of e.slice(head ? e.findIndex(isBullet) : 0)) {
        if (isBullet(l) && buf && (buf + l).length > MAX_CHUNK) {
          push(s.name, `${head} ${buf}`);
          buf = '';
        }
        buf += `${l}\n`;
      }
      push(s.name, `${head} ${buf}`);
    }
  }
  return chunks;
}
