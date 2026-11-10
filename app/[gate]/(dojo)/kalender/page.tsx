import { asc } from 'drizzle-orm';
import { headers } from 'next/headers';
import { getDb } from '@/db/client';
import { countdown, daruma, jlptSession } from '@/db/schema';
import CalendarBoard from '@/components/dojo/calendar/CalendarBoard';
import DojoIcon from '@/components/dojo/DojoIcon';
import { DEFAULT_WAR_CHECKLIST, JLPT_STATUS, icsToken, reminders, warState } from '@/lib/dojo/calendar';
import { requireDojo } from '@/lib/dojo/dal';
import { getProfile } from '@/lib/dojo/engine/core';
import { daysUntil, shortDateId } from '@/lib/dojo/time';

const toWibInput = (d: Date | null) => (d ? new Date(d.getTime() + 7 * 3600_000).toISOString().slice(0, 16) : '');

export default async function KalenderPage({ params }: { params: Promise<{ gate: string }> }) {
  const { gate } = await params;
  await requireDojo(gate);
  const db = getDb();
  const [p, sessions, cds, darumas] = await Promise.all([
    getProfile(),
    db.select().from(jlptSession).orderBy(asc(jlptSession.examDate)),
    db.select().from(countdown).orderBy(asc(countdown.targetAt)),
    db.select().from(daruma).orderBy(asc(daruma.dueDate)),
  ]);
  const now = new Date();
  const tz = p.timezone;
  const h = await headers();
  const host = h.get('x-forwarded-host') ?? h.get('host') ?? 'www.fauzansanjaya.dev';
  const proto = h.get('x-forwarded-proto') ?? 'https';
  const icsUrl = `${proto}://${host}/api/dojo/calendar.ics?token=${icsToken()}`;
  const today = now.toISOString().slice(0, 10);
  const nextExam = sessions.find((s) => s.examDate >= today);
  const nextReg = sessions.find((s) => s.regOpenAt && s.regOpenAt > now);
  const war = warState(sessions, now);
  const misumi = cds.find((c) => c.slug === 'misumi-day1');
  const settings = p.settings as { warChecklist?: { text: string; done: boolean }[] };
  const cards = [
    misumi && { label: 'MISUMI Day 1', value: `D-${daysUntil(misumi.targetAt, tz, now)}`, sub: `${shortDateId(misumi.targetAt, 'Asia/Tokyo')} · 九段下` },
    nextExam && { label: `JLPT ${nextExam.levelPlanned ?? ''}`, value: `D-${daysUntil(new Date(`${nextExam.examDate}T09:00:00+07:00`), tz, now)}`, sub: `${shortDateId(new Date(`${nextExam.examDate}T09:00:00+07:00`), tz)}${nextExam.isEstimate ? ' · perkiraan' : ''}` },
    nextReg?.regOpenAt && { label: `Pendaftaran ${nextReg.levelPlanned ?? ''} buka`, value: `D-${daysUntil(nextReg.regOpenAt, tz, now)}`, sub: `${shortDateId(nextReg.regOpenAt, tz)}${nextReg.isEstimate ? ' · perkiraan' : ''}` },
  ].filter(Boolean) as { label: string; value: string; sub: string }[];

  return (
    <div>
      <div className="glass-card mb-6 rounded-3xl p-6 md:p-8">
        <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-text-secondary">暦 · kalender</p>
        <h1 className="text-3xl font-bold text-text-main md:text-4xl">Kalender & JLPT</h1>
        {war && (
          <p className="mt-3 rounded-2xl bg-[#fdecea] px-4 py-3 text-sm font-medium text-[#a3271f]">
            <DojoIcon name="banner" className="mr-1.5 h-5 w-5" />
            WAR {war.session.levelPlanned}: pendaftaran {war.phase === 'open' ? 'SEDANG BUKA' : `buka ${shortDateId(war.opensAt, tz)}`}. Siapkan checklist di bawah dan daftar di jlptonline.or.id.
          </p>
        )}
      </div>
      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        {cards.map((c) => (
          <div key={c.label} className="glass-card rounded-3xl p-6">
            <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-text-secondary">{c.label}</p>
            <p className="font-mono text-4xl font-bold tabular-nums text-text-main">{c.value}</p>
            <p className="text-xs text-text-secondary">{c.sub}</p>
          </div>
        ))}
      </div>
      <CalendarBoard
        sessions={sessions.map((s) => ({ id: s.id, examDate: s.examDate, levelPlanned: s.levelPlanned ?? '', city: s.city ?? '', regOpenAt: toWibInput(s.regOpenAt), regCloseAt: toWibInput(s.regCloseAt), isEstimate: s.isEstimate, status: s.status, score: (s.score as { text?: string } | null)?.text ?? '', notes: s.notes ?? '' }))}
        statuses={JLPT_STATUS}
        countdowns={cds.map((c) => ({ id: c.id, title: c.title, targetAt: c.targetAt.toISOString(), kind: c.kind, days: daysUntil(c.targetAt, tz, now) }))}
        darumas={darumas.map((d) => ({ id: d.id, title: d.title, track: d.track, dueDate: d.dueDate, status: d.status, eyes: d.rightEyeAt ? 2 : 1, note: d.note }))}
        checklist={settings.warChecklist ?? DEFAULT_WAR_CHECKLIST.map((text) => ({ text, done: false }))}
        reminders={reminders(sessions, now).map((r) => ({ ...r, at: r.at.toISOString() }))}
        icsUrl={icsUrl}
      />
    </div>
  );
}
