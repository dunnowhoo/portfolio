import { and, asc, eq, lte, sql } from 'drizzle-orm';
import { getDb } from '@/db/client';
import { card, nodeProgress, problemProgress } from '@/db/schema';
import QuizButton from '@/components/dojo/quiz/QuizButton';
import ReviewList, { type ReviewRow } from '@/components/dojo/review/ReviewList';
import { NODES } from '@/lib/dojo/curriculum';
import { requireDojo } from '@/lib/dojo/dal';
import { dojoToday, getProfile } from '@/lib/dojo/engine/core';
import { daysBetween } from '@/lib/dojo/engine/srs';

const DECK_LABEL: Record<string, string> = { kana: 'Kana', kanji: 'Kanji', grammar: 'Grammar', pattern: 'Tebak Pola' };

export default async function ReviewPage({ params }: { params: Promise<{ gate: string }> }) {
  const { gate } = await params;
  await requireDojo(gate);
  const db = getDb();
  const today = dojoToday(await getProfile());
  const [probs, nodes, decks] = await Promise.all([
    db.select().from(problemProgress).where(and(eq(problemProgress.status, 'solved'), lte(problemProgress.srsDue, today))).orderBy(asc(problemProgress.srsDue), asc(problemProgress.mastery)),
    db.select().from(nodeProgress).where(and(eq(nodeProgress.status, 'completed'), lte(nodeProgress.srsDue, today))).orderBy(asc(nodeProgress.srsDue)),
    db.select({ deck: card.deck, n: sql<number>`count(*)::int` }).from(card).where(and(eq(card.suspended, false), lte(card.srsDue, today))).groupBy(card.deck),
  ]);
  const rows: ReviewRow[] = [];
  for (const p of probs) {
    const n = NODES.get(p.problemId);
    if (n) rows.push({ id: n.id, title: n.title, sub: n.subtitle ?? 'Soal', track: 'dsa', due: p.srsDue!, stars: p.mastery, problem: true, overdue: daysBetween(p.srsDue!, today) });
  }
  for (const p of nodes) {
    const n = NODES.get(p.nodeId);
    if (n && !n.problem) rows.push({ id: n.id, title: n.title, sub: `Unit ${n.unitId}`, track: n.track, due: p.srsDue!, stars: p.mastery, problem: false, overdue: daysBetween(p.srsDue!, today) });
  }
  rows.sort((a, b) => b.overdue - a.overdue || a.stars - b.stars);
  return (
    <div>
      <div className="glass-card mb-6 rounded-3xl p-6 md:p-8">
        <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-text-secondary">SRS · 復習</p>
        <h1 className="text-3xl font-bold text-text-main md:text-4xl">Review</h1>
        <p className="mt-1 text-sm text-text-secondary">
          {rows.length} soal/node + {decks.reduce((a, d) => a + d.n, 0)} kartu jatuh tempo. Yang paling lama tertunda didahulukan.
        </p>
      </div>
      <section className="mb-6">
        <h2 className="mb-3 text-lg font-bold text-text-main">Kartu</h2>
        {decks.length ? (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {decks.map((d) => (
              <div key={d.deck} className="glass-card flex items-center justify-between rounded-3xl p-5">
                <div>
                  <p className="font-semibold text-text-main">{DECK_LABEL[d.deck] ?? d.deck}</p>
                  <p className="text-[13px] text-text-secondary">{d.n} kartu{d.n > 50 ? ' (50 per sesi)' : ''}</p>
                </div>
                <QuizButton source="review" id={d.deck} label="Review" />
              </div>
            ))}
          </div>
        ) : (
          <p className="rounded-3xl bg-white p-6 text-sm text-text-secondary">Belum ada kartu jatuh tempo. Kartu muncul setelah sprint dan kuis.</p>
        )}
      </section>
      <section>
        <h2 className="mb-3 text-lg font-bold text-text-main">Soal & node</h2>
        <ReviewList gate={gate} rows={rows} />
      </section>
    </div>
  );
}
