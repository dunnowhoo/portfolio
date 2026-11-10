import 'server-only';
import { asc } from 'drizzle-orm';
import { getDb } from '@/db/client';
import { countdown, daruma, jlptSession } from '@/db/schema';
import { hmacHex } from '@/lib/auth/crypto';

// Kalender, countdown, pengingat war JLPT (PRD F11)

export const JLPT_STATUS = [
  ['planned', 'Rencana'],
  ['reg_open', 'Pendaftaran buka'],
  ['registered', 'Terdaftar'],
  ['paid', 'Sudah bayar'],
  ['ticket', 'Kartu ujian'],
  ['taken', 'Sudah ujian'],
  ['passed', 'Lulus'],
  ['failed', 'Belum lulus'],
] as const;
export type JlptStatus = (typeof JLPT_STATUS)[number][0];
export const REGISTERED_OR_LATER = new Set(['registered', 'paid', 'ticket', 'taken', 'passed', 'failed']);

export const DEFAULT_WAR_CHECKLIST = [
  'Akun jlptonline.or.id siap (email & password tersimpan)',
  'Dokumen sesuai syarat terbaru',
  'Foto sesuai ketentuan',
  'Metode bayar siap',
  'Pilihan kota cadangan',
  'Alarm HP di hari H',
];

export type WarState = { session: typeof jlptSession.$inferSelect; phase: 'soon' | 'open'; opensAt: Date; closesAt: Date | null } | null;

// Banner WAR: muncul H-7 sebelum pendaftaran buka sampai tutup, selama belum terdaftar
export function warState(sessions: (typeof jlptSession.$inferSelect)[], now = new Date()): WarState {
  for (const s of sessions) {
    if (!s.regOpenAt || REGISTERED_OR_LATER.has(s.status)) continue;
    const open = s.regOpenAt.getTime();
    const close = s.regCloseAt?.getTime() ?? open + 30 * 86_400_000;
    if (now.getTime() >= open - 7 * 86_400_000 && now.getTime() < open) return { session: s, phase: 'soon', opensAt: s.regOpenAt, closesAt: s.regCloseAt };
    if (now.getTime() >= open && now.getTime() <= close) return { session: s, phase: 'open', opensAt: s.regOpenAt, closesAt: s.regCloseAt };
  }
  return null;
}

// Jadwal pengingat (untuk ditampilkan dan untuk alarm .ics)
export function reminders(sessions: (typeof jlptSession.$inferSelect)[], now = new Date()) {
  const out: { at: Date; title: string; done: boolean }[] = [];
  for (const s of sessions) {
    if (!s.regOpenAt) continue;
    const lvl = s.levelPlanned ?? 'JLPT';
    for (const d of [14, 7, 1]) out.push({ at: new Date(s.regOpenAt.getTime() - d * 86_400_000), title: `H-${d} pendaftaran ${lvl} buka (siapkan checklist)`, done: false });
    out.push({ at: s.regOpenAt, title: `Pendaftaran ${lvl} BUKA — langsung daftar`, done: REGISTERED_OR_LATER.has(s.status) });
    if (s.regCloseAt) out.push({ at: new Date(s.regCloseAt.getTime() - 86_400_000), title: `H-1 pendaftaran ${lvl} tutup`, done: REGISTERED_OR_LATER.has(s.status) });
  }
  return out.filter((r) => r.at.getTime() >= now.getTime() - 86_400_000).sort((a, b) => a.at.getTime() - b.at.getTime());
}

export function icsToken(): string {
  const secret = process.env.AUTH_SECRET;
  if (!secret) throw new Error('AUTH_SECRET belum diisi');
  return hmacHex(secret, 'dojo-ics-v1').slice(0, 40);
}

const esc = (s: string) => s.replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\n/g, '\\n');
const utc = (d: Date) => d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
const dateOnly = (d: string) => d.replace(/-/g, '');
function fold(line: string): string {
  const bytes = Buffer.from(line, 'utf8');
  if (bytes.length <= 74) return line;
  const parts: string[] = [];
  let cur = '';
  for (const ch of line) {
    if (Buffer.byteLength(cur + ch, 'utf8') > (parts.length ? 73 : 74)) {
      parts.push(cur);
      cur = ch;
    } else cur += ch;
  }
  parts.push(cur);
  return parts.join('\r\n ');
}

type Ev = { uid: string; title: string; desc?: string; allDay?: string; start?: Date; alarms?: number[] };

export async function buildIcs(): Promise<string> {
  const db = getDb();
  const [sessions, cds, darumas] = await Promise.all([
    db.select().from(jlptSession).orderBy(asc(jlptSession.examDate)),
    db.select().from(countdown),
    db.select().from(daruma),
  ]);
  const evs: Ev[] = [];
  for (const s of sessions) {
    const lvl = s.levelPlanned ?? 'JLPT';
    const est = s.isEstimate ? ' (perkiraan)' : '';
    evs.push({ uid: `jlpt-exam-${s.examDate}`, title: `JLPT ${lvl}${est}`, allDay: s.examDate, desc: `${s.city ?? ''} ${s.notes ?? ''}`.trim(), alarms: [7 * 1440, 1440] });
    if (s.regOpenAt) evs.push({ uid: `jlpt-reg-open-${s.examDate}`, title: `WAR: pendaftaran JLPT ${lvl} buka${est}`, start: s.regOpenAt, desc: `Daftar di ${s.sourceUrl ?? 'https://jlptonline.or.id/'}`, alarms: [14 * 1440, 7 * 1440, 1440, 0] });
    if (s.regCloseAt) evs.push({ uid: `jlpt-reg-close-${s.examDate}`, title: `Pendaftaran JLPT ${lvl} tutup${est}`, start: s.regCloseAt, alarms: [1440] });
  }
  for (const c of cds) evs.push({ uid: `countdown-${c.id}`, title: c.title, start: c.targetAt, alarms: (c.alarmDays ?? []).map((d) => d * 1440) });
  for (const d of darumas) if (d.dueDate && d.status === 'active') evs.push({ uid: `daruma-${d.id}`, title: `達磨 target: ${d.title}`, allDay: d.dueDate, alarms: [30 * 1440, 7 * 1440] });

  const now = utc(new Date());
  const lines = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//fauzansanjaya.dev//Dojo//ID', 'CALSCALE:GREGORIAN', 'METHOD:PUBLISH', 'X-WR-CALNAME:Dōjō', 'X-WR-TIMEZONE:Asia/Jakarta'];
  for (const e of evs) {
    lines.push('BEGIN:VEVENT', `UID:${e.uid}@fauzansanjaya.dev`, `DTSTAMP:${now}`);
    if (e.allDay) {
      const next = new Date(Date.parse(`${e.allDay}T00:00:00Z`) + 86_400_000).toISOString().slice(0, 10);
      lines.push(`DTSTART;VALUE=DATE:${dateOnly(e.allDay)}`, `DTEND;VALUE=DATE:${dateOnly(next)}`);
    } else if (e.start) {
      lines.push(`DTSTART:${utc(e.start)}`, `DTEND:${utc(new Date(e.start.getTime() + 30 * 60_000))}`);
    }
    lines.push(`SUMMARY:${esc(e.title)}`);
    if (e.desc) lines.push(`DESCRIPTION:${esc(e.desc)}`);
    for (const m of e.alarms ?? []) lines.push('BEGIN:VALARM', 'ACTION:DISPLAY', `DESCRIPTION:${esc(e.title)}`, `TRIGGER:${m === 0 ? 'PT0M' : `-PT${m}M`}`, 'END:VALARM');
    lines.push('END:VEVENT');
  }
  lines.push('END:VCALENDAR');
  return lines.map(fold).join('\r\n') + '\r\n';
}
