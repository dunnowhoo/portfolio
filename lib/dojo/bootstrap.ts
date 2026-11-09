import 'server-only';
import { getDb } from '@/db/client';
import { countdown, daruma, jlptSession, profile, streakState } from '@/db/schema';

// Seed idempoten (aman dipanggil berkali-kali). Tanggal JLPT 2027–2028 = PERKIRAAN.
const g = globalThis as unknown as { __dojoSeeded?: boolean };

const wib = (d: string) => new Date(`${d}+07:00`);

export async function ensureSeeded(): Promise<void> {
  if (g.__dojoSeeded) return;
  const db = getDb();
  await db.insert(profile).values({ id: 1 }).onConflictDoNothing();
  await db.insert(streakState).values([{ track: 'jp' }, { track: 'dsa' }, { track: 'both' }]).onConflictDoNothing();
  await db
    .insert(jlptSession)
    .values([
      { examDate: '2027-07-04', levelPlanned: 'N5', city: 'Jakarta', regOpenAt: wib('2027-03-01T09:00:00'), regCloseAt: wib('2027-04-30T23:59:00'), notes: 'Pendaftaran perkiraan Mar–Apr 2027' },
      { examDate: '2027-12-05', levelPlanned: 'N4', city: 'Jakarta', regOpenAt: wib('2027-08-01T09:00:00'), regCloseAt: wib('2027-09-30T23:59:00'), notes: 'Pendaftaran perkiraan Agu–Sep 2027' },
      { examDate: '2028-07-02', levelPlanned: 'N3', city: 'Jakarta', regOpenAt: wib('2028-03-01T09:00:00'), regCloseAt: wib('2028-04-30T23:59:00'), notes: 'Target utama. Pendaftaran perkiraan Mar–Apr 2028' },
      { examDate: '2028-12-03', levelPlanned: 'N3/N2', city: 'Tokyo', regOpenAt: wib('2028-08-01T09:00:00'), regCloseAt: wib('2028-09-30T23:59:00'), notes: 'Cadangan, di Jepang (JEES)', sourceUrl: 'https://www.jlpt.jp/' },
    ])
    .onConflictDoNothing({ target: jlptSession.examDate });
  await db
    .insert(countdown)
    .values([{ slug: 'misumi-day1', title: 'MISUMI Day 1', targetAt: new Date('2028-10-01T09:00:00+09:00'), kind: 'misumi', pinned: true }])
    .onConflictDoNothing({ target: countdown.slug });
  await db
    .insert(daruma)
    .values([
      { slug: 'jlpt-n5', title: 'JLPT N5', track: 'jp', dueDate: '2027-07-04' },
      { slug: 'nc150', title: 'NeetCode 150', track: 'dsa', dueDate: '2027-08-31' },
      { slug: 'jlpt-n4', title: 'JLPT N4', track: 'jp', dueDate: '2027-12-05' },
      { slug: 'jlpt-n3', title: 'JLPT N3', track: 'jp', dueDate: '2028-07-02' },
      { slug: 'misumi-day1', title: 'MISUMI Day 1', track: 'general', dueDate: '2028-10-01' },
    ])
    .onConflictDoNothing({ target: daruma.slug });
  g.__dojoSeeded = true;
}
