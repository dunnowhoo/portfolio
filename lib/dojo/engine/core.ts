import "server-only";
import { and, eq, sql } from "drizzle-orm";
import { getDb } from "@/db/client";
import {
  activityEvent,
  busyDay,
  dailyStat,
  profile,
  streakState,
} from "@/db/schema";
import { levelFromXp } from "@/lib/dojo/level";
import { localDate, localHour } from "@/lib/dojo/time";
import { addDays, daysBetween } from "./srs";

// Mesin XP + streak (docs/dojo/04-GAMIFICATION.md §2–4). Semua aktivitas = event append-only.

export type TrackKey = "jp" | "dsa";
export type AnyTrack = TrackKey | "general";
type Db = ReturnType<typeof getDb>;
type Tx = Parameters<Parameters<Db["transaction"]>[0]>[0];
type Profile = typeof profile.$inferSelect;

export const STREAK_MILESTONES: [number, number][] = [
  [7, 50],
  [14, 70],
  [30, 150],
  [50, 200],
  [100, 500],
  [200, 800],
  [365, 1500],
  [500, 2000],
  [700, 3000],
];

// ---------- waktu ----------
function tzOffsetMinutes(tz: string, at: Date): number {
  const name =
    new Intl.DateTimeFormat("en-US", {
      timeZone: tz,
      timeZoneName: "longOffset",
    })
      .formatToParts(at)
      .find((p) => p.type === "timeZoneName")?.value ?? "GMT";
  const m = name.match(/GMT([+-])(\d{2}):?(\d{2})?/);
  if (!m) return 0;
  return (m[1] === "-" ? -1 : 1) * (Number(m[2]) * 60 + Number(m[3] ?? 0));
}

export function dojoToday(
  p: Pick<Profile, "timezone" | "dayStartHour">,
  now = new Date(),
): string {
  return localDate(
    new Date(now.getTime() - p.dayStartHour * 3_600_000),
    p.timezone,
  );
}

// Akhir "hari Dōjō" (memperhitungkan jam pergantian hari) sebagai Date
export function dayEnd(
  date: string,
  p: Pick<Profile, "timezone" | "dayStartHour">,
): Date {
  const hh = String(p.dayStartHour).padStart(2, "0");
  const naive = Date.parse(`${addDays(date, 1)}T${hh}:00:00Z`);
  return new Date(
    naive - tzOffsetMinutes(p.timezone, new Date(naive)) * 60_000 - 1000,
  );
}

export async function getProfile(db: Db | Tx = getDb()): Promise<Profile> {
  const [p] = await db.select().from(profile).where(eq(profile.id, 1));
  if (p) return p;
  await db.insert(profile).values({ id: 1 }).onConflictDoNothing();
  const [q] = await db.select().from(profile).where(eq(profile.id, 1));
  return q;
}

// ---------- streak ----------
async function streakRow(tx: Tx, track: string) {
  const [row] = await tx
    .select()
    .from(streakState)
    .where(eq(streakState.track, track));
  if (row) return row;
  const [ins] = await tx
    .insert(streakState)
    .values({ track })
    .onConflictDoNothing()
    .returning();
  return (
    ins ??
    (await tx.select().from(streakState).where(eq(streakState.track, track)))[0]
  );
}

async function statRow(tx: Tx, date: string, track: string) {
  const [row] = await tx
    .select()
    .from(dailyStat)
    .where(and(eq(dailyStat.localDate, date), eq(dailyStat.track, track)));
  return row;
}

// Terapkan pergantian hari secara malas: freeze otomatis, status retak, atau putus.
export async function syncStreaks(
  tx: Tx,
  p: Profile,
  today: string,
  now = new Date(),
) {
  const yesterday = addDays(today, -1);
  let rows = await tx.select().from(streakState);
  if (rows.length < 3) {
    await tx
      .insert(streakState)
      .values([{ track: "jp" }, { track: "dsa" }, { track: "both" }])
      .onConflictDoNothing();
    rows = await tx.select().from(streakState);
  }
  for (const track of ["jp", "dsa"] as const) {
    const st = rows.find((r) => r.track === track)!;
    let { current, freezes, lastQualifiedDate, repairDeadline } = st;
    let changed = false;

    // Jendela repair sudah lewat tanpa dipulihkan
    if (repairDeadline && now > repairDeadline) {
      const windowDate = dojoToday(p, repairDeadline);
      const q = (await statRow(tx, windowDate, track))?.qualified ?? false;
      current = q ? 1 : 0;
      if (q) lastQualifiedDate = windowDate;
      repairDeadline = null;
      changed = true;
    }

    if (
      !repairDeadline &&
      current > 0 &&
      lastQualifiedDate &&
      lastQualifiedDate < yesterday
    ) {
      let end = lastQualifiedDate;
      while (end < yesterday && freezes > 0) {
        end = addDays(end, 1);
        freezes -= 1;
        await tx
          .insert(dailyStat)
          .values({ localDate: end, track, freezeUsed: true })
          .onConflictDoUpdate({
            target: [dailyStat.localDate, dailyStat.track],
            set: { freezeUsed: true },
          });
      }
      if (end < yesterday) {
        const uncovered = daysBetween(end, yesterday);
        const repairOk =
          !st.lastRepairDate || daysBetween(st.lastRepairDate, today) >= 30;
        if (uncovered === 1 && repairOk) repairDeadline = dayEnd(today, p);
        else current = 0;
      }
      lastQualifiedDate = end;
      changed = true;
    }

    if (changed) {
      await tx
        .update(streakState)
        .set({
          current,
          freezes,
          lastQualifiedDate,
          repairDeadline,
          updatedAt: new Date(),
        })
        .where(eq(streakState.track, track));
    }
  }
  const both = rows.find((r) => r.track === "both")!;
  if (
    both.current > 0 &&
    both.lastQualifiedDate &&
    both.lastQualifiedDate < yesterday
  ) {
    await tx
      .update(streakState)
      .set({ current: 0, updatedAt: new Date() })
      .where(eq(streakState.track, "both"));
  }
}

export async function syncNow(): Promise<void> {
  const db = getDb();
  await db.transaction(async (tx) => {
    const p = await getProfile(tx);
    await syncStreaks(tx, p, dojoToday(p));
  });
}

// ---------- award ----------
export type AwardInput = {
  track: AnyTrack;
  type: string;
  refId?: string;
  xp: number;
  minutes?: number;
  payload?: Record<string, unknown>;
  dedupeKey?: string;
  counters?: Partial<
    Record<"nodes" | "problems" | "reviews" | "quizzes", number>
  >;
};

export type AwardEvent = { type: string; xp: number; label: string };
export type AwardResult = {
  duplicate: boolean;
  xp: number;
  events: AwardEvent[];
  totalXp: number;
  level: number;
  prevLevel: number;
  goalMet?: TrackKey;
  qualified?: TrackKey;
  repaired?: TrackKey;
  streak?: { track: TrackKey; current: number };
  nitoryu?: number;
};

const LABELS: Record<string, string> = {
  daily_goal: "Daily goal tercapai",
  streak_milestone: "Milestone streak",
  streak_repair: "Streak dipulihkan 七転び八起き",
};

async function applyEvent(tx: Tx, today: string, e: AwardInput) {
  const inserted = await tx
    .insert(activityEvent)
    .values({
      localDate: today,
      track: e.track,
      type: e.type,
      refId: e.refId,
      xp: e.xp,
      minutes: e.minutes ?? 0,
      payload: e.payload ?? {},
      dedupeKey: e.dedupeKey,
    })
    .onConflictDoNothing({ target: activityEvent.dedupeKey })
    .returning({ id: activityEvent.id });
  if (!inserted.length) return null;
  const c = e.counters ?? {};
  const [stat] = await tx
    .insert(dailyStat)
    .values({
      localDate: today,
      track: e.track,
      xp: e.xp,
      minutes: e.minutes ?? 0,
      nodes: c.nodes ?? 0,
      problems: c.problems ?? 0,
      reviews: c.reviews ?? 0,
      quizzes: c.quizzes ?? 0,
    })
    .onConflictDoUpdate({
      target: [dailyStat.localDate, dailyStat.track],
      set: {
        xp: sql`${dailyStat.xp} + excluded.xp`,
        minutes: sql`${dailyStat.minutes} + excluded.minutes`,
        nodes: sql`${dailyStat.nodes} + excluded.nodes`,
        problems: sql`${dailyStat.problems} + excluded.problems`,
        reviews: sql`${dailyStat.reviews} + excluded.reviews`,
        quizzes: sql`${dailyStat.quizzes} + excluded.quizzes`,
      },
    })
    .returning();
  if (e.xp)
    await tx
      .update(profile)
      .set({ totalXp: sql`${profile.totalXp} + ${e.xp}` })
      .where(eq(profile.id, 1));
  return stat;
}

type Stat = typeof dailyStat.$inferSelect;

async function advanceStreak(
  tx: Tx,
  track: string,
  today: string,
): Promise<number> {
  const st = await streakRow(tx, track);
  if (st.lastQualifiedDate === today) return st.current;
  const current =
    st.lastQualifiedDate === addDays(today, -1) ? st.current + 1 : 1;
  await tx
    .update(streakState)
    .set({
      current,
      longest: Math.max(st.longest, current),
      lastQualifiedDate: today,
      updatedAt: new Date(),
    })
    .where(eq(streakState.track, track));
  return current;
}

async function afterTrackXp(
  tx: Tx,
  p: Profile,
  today: string,
  now: Date,
  track: TrackKey,
  stat: Stat,
  res: AwardResult,
) {
  const goal = track === "jp" ? p.dailyGoalJp : p.dailyGoalDsa;
  const [busy] = await tx
    .select()
    .from(busyDay)
    .where(and(eq(busyDay.localDate, today), eq(busyDay.track, track)));
  const threshold = busy ? 5 : p.streakMinXp;
  let xpToday = stat.xp;

  if (xpToday >= goal && !stat.goalMet) {
    await tx
      .update(dailyStat)
      .set({ goalMet: true })
      .where(and(eq(dailyStat.localDate, today), eq(dailyStat.track, track)));
    const bonus = await applyEvent(tx, today, {
      track,
      type: "daily_goal",
      xp: 10,
      dedupeKey: `goal:${today}:${track}`,
    });
    if (bonus) {
      res.xp += 10;
      xpToday += 10;
      res.events.push({ type: "daily_goal", xp: 10, label: LABELS.daily_goal });
      res.goalMet = track;
    }
  }

  const st = await streakRow(tx, track);
  const inRepairWindow = !!st.repairDeadline && now <= st.repairDeadline;

  if (xpToday >= threshold && !stat.qualified) {
    await tx
      .update(dailyStat)
      .set({ qualified: true, busyDay: !!busy })
      .where(and(eq(dailyStat.localDate, today), eq(dailyStat.track, track)));
    if (!inRepairWindow) {
      const current = await advanceStreak(tx, track, today);
      res.qualified = track;
      res.streak = { track, current };
      for (const [n, bonusXp] of STREAK_MILESTONES) {
        if (current !== n) continue;
        const b = await applyEvent(tx, today, {
          track,
          type: "streak_milestone",
          refId: String(n),
          xp: bonusXp,
          dedupeKey: `streak:${track}:${n}:${today}`,
        });
        if (b) {
          res.xp += bonusXp;
          res.events.push({
            type: "streak_milestone",
            xp: bonusXp,
            label: `Streak ${n} hari`,
          });
        }
      }
    }
    // 二刀流: kedua jalur aman di tanggal yang sama
    const other = await statRow(tx, today, track === "jp" ? "dsa" : "jp");
    if (other?.qualified) res.nitoryu = await advanceStreak(tx, "both", today);
  }

  // Repair: capai 2× daily goal di hari setelah bolong
  if (inRepairWindow && xpToday >= goal * 2) {
    const missed = addDays(today, -1);
    const current = st.current + 2;
    await tx
      .update(streakState)
      .set({
        current,
        longest: Math.max(st.longest, current),
        lastQualifiedDate: today,
        repairDeadline: null,
        lastRepairDate: today,
        updatedAt: new Date(),
      })
      .where(eq(streakState.track, track));
    await tx
      .insert(dailyStat)
      .values({ localDate: missed, track, qualified: true })
      .onConflictDoUpdate({
        target: [dailyStat.localDate, dailyStat.track],
        set: { qualified: true },
      });
    await applyEvent(tx, today, {
      track,
      type: "streak_repair",
      xp: 0,
      dedupeKey: `repair:${track}:${today}`,
    });
    res.events.push({
      type: "streak_repair",
      xp: 0,
      label: LABELS.streak_repair,
    });
    res.repaired = track;
    res.streak = { track, current };
  }
}

export async function award(input: AwardInput): Promise<AwardResult> {
  const db = getDb();
  return db.transaction(async (tx) => {
    const now = new Date();
    const p = await getProfile(tx);
    const today = dojoToday(p, now);
    const prevLevel = levelFromXp(p.totalXp).level;
    await syncStreaks(tx, p, today, now);

    const res: AwardResult = {
      duplicate: false,
      xp: 0,
      events: [],
      totalXp: p.totalXp,
      level: prevLevel,
      prevLevel,
    };
    const stat = await applyEvent(tx, today, input);
    if (!stat) return { ...res, duplicate: true };
    res.xp += input.xp;

    if (input.track === "jp" || input.track === "dsa")
      await afterTrackXp(tx, p, today, now, input.track, stat, res);

    const [after] = await tx
      .select({ totalXp: profile.totalXp })
      .from(profile)
      .where(eq(profile.id, 1));
    const level = levelFromXp(after.totalXp).level;
    if (level !== p.level)
      await tx.update(profile).set({ level }).where(eq(profile.id, 1));
    return { ...res, totalXp: after.totalXp, level };
  });
}

// Banyak event satu jalur dalam satu transaksi (mis. node yang dilewati tes lompat).
// Dedupe tetap per event; hanya yang benar-benar baru yang dihitung.
export async function awardBatch(
  track: TrackKey,
  items: { type: string; refId: string; xp: number; dedupeKey: string }[],
): Promise<AwardResult> {
  const db = getDb();
  return db.transaction(async (tx) => {
    const now = new Date();
    const p = await getProfile(tx);
    const today = dojoToday(p, now);
    const prevLevel = levelFromXp(p.totalXp).level;
    const res: AwardResult = {
      duplicate: false,
      xp: 0,
      events: [],
      totalXp: p.totalXp,
      level: prevLevel,
      prevLevel,
    };
    if (!items.length) return { ...res, duplicate: true };
    await syncStreaks(tx, p, today, now);
    const inserted = await tx
      .insert(activityEvent)
      .values(
        items.map((it) => ({
          localDate: today,
          track,
          type: it.type,
          refId: it.refId,
          xp: it.xp,
          dedupeKey: it.dedupeKey,
        })),
      )
      .onConflictDoNothing({ target: activityEvent.dedupeKey })
      .returning({ xp: activityEvent.xp });
    if (!inserted.length) return { ...res, duplicate: true };
    const sum = inserted.reduce((a, r) => a + r.xp, 0);
    const [stat] = await tx
      .insert(dailyStat)
      .values({ localDate: today, track, xp: sum, nodes: inserted.length })
      .onConflictDoUpdate({
        target: [dailyStat.localDate, dailyStat.track],
        set: {
          xp: sql`${dailyStat.xp} + excluded.xp`,
          nodes: sql`${dailyStat.nodes} + excluded.nodes`,
        },
      })
      .returning();
    if (sum)
      await tx
        .update(profile)
        .set({ totalXp: sql`${profile.totalXp} + ${sum}` })
        .where(eq(profile.id, 1));
    res.xp = sum;
    await afterTrackXp(tx, p, today, now, track, stat, res);
    const [after] = await tx
      .select({ totalXp: profile.totalXp })
      .from(profile)
      .where(eq(profile.id, 1));
    const level = levelFromXp(after.totalXp).level;
    if (level !== p.level)
      await tx.update(profile).set({ level }).where(eq(profile.id, 1));
    return { ...res, totalXp: after.totalXp, level };
  });
}

// ---------- tampilan ----------
export type StreakStatus = "aman" | "belum" | "berisiko" | "retak" | "sibuk";
export type StreakView = {
  track: TrackKey;
  current: number;
  longest: number;
  freezes: number;
  todayXp: number;
  goal: number;
  threshold: number;
  status: StreakStatus;
  goalMet: boolean;
  frozenYesterday: boolean;
  minutesLeft: number;
  repairTarget?: number;
};

export async function getTodayState() {
  const db = getDb();
  const now = new Date();
  return db.transaction(async (tx) => {
    const p = await getProfile(tx);
    const today = dojoToday(p, now);
    await syncStreaks(tx, p, today, now);
    const end = dayEnd(today, p);
    const minutesLeft = Math.max(
      0,
      Math.round((end.getTime() - now.getTime()) / 60_000),
    );
    const hour = localHour(now, p.timezone);
    const rows = await tx
      .select()
      .from(dailyStat)
      .where(eq(dailyStat.localDate, today));
    const yRows = await tx
      .select()
      .from(dailyStat)
      .where(eq(dailyStat.localDate, addDays(today, -1)));
    const busy = await tx
      .select()
      .from(busyDay)
      .where(eq(busyDay.localDate, today));
    const streaks: Record<TrackKey, StreakView> = {} as Record<
      TrackKey,
      StreakView
    >;
    for (const track of ["jp", "dsa"] as const) {
      const st = await streakRow(tx, track);
      const row = rows.find((r) => r.track === track);
      const isBusy = busy.some((b) => b.track === track);
      const goal = track === "jp" ? p.dailyGoalJp : p.dailyGoalDsa;
      const threshold = isBusy ? 5 : p.streakMinXp;
      const xp = row?.xp ?? 0;
      const retak = !!st.repairDeadline && now <= st.repairDeadline;
      let status: StreakStatus = row?.qualified
        ? "aman"
        : hour >= 18
          ? "berisiko"
          : "belum";
      if (retak) status = "retak";
      else if (isBusy && !row?.qualified) status = "sibuk";
      streaks[track] = {
        track,
        current: st.current,
        longest: st.longest,
        freezes: st.freezes,
        todayXp: xp,
        goal,
        threshold,
        status,
        goalMet: row?.goalMet ?? false,
        frozenYesterday: yRows.some((r) => r.track === track && r.freezeUsed),
        minutesLeft,
        repairTarget: retak ? goal * 2 : undefined,
      };
    }
    const both = await streakRow(tx, "both");
    const lv = levelFromXp(p.totalXp);
    return {
      profile: p,
      today,
      hour,
      streaks,
      nitoryu: both.current,
      level: lv,
      generalXp: rows.find((r) => r.track === "general")?.xp ?? 0,
    };
  });
}
