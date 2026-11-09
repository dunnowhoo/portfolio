// Skema Dōjō + CMS (lihat docs/dojo/03-DATA-MODEL.md).
// Satu pengguna, jadi tidak ada kolom user_id.
import { sql } from 'drizzle-orm';
import {
  bigserial,
  boolean,
  date,
  index,
  integer,
  jsonb,
  pgTable,
  primaryKey,
  real,
  smallint,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from 'drizzle-orm/pg-core';

const ts = (name: string) => timestamp(name, { withTimezone: true });
const srs = {
  srsDue: date('srs_due'),
  srsInterval: smallint('srs_interval'),
  srsEase: real('srs_ease'),
  srsReps: smallint('srs_reps').notNull().default(0),
  srsLapses: smallint('srs_lapses').notNull().default(0),
};

// ---------- auth & profil ----------
export const profile = pgTable('profile', {
  id: smallint('id').primaryKey().default(1),
  displayName: text('display_name').notNull().default('Fauzan'),
  timezone: text('timezone').notNull().default('Asia/Jakarta'),
  dayStartHour: smallint('day_start_hour').notNull().default(0),
  dailyGoalJp: smallint('daily_goal_jp').notNull().default(50),
  dailyGoalDsa: smallint('daily_goal_dsa').notNull().default(30),
  streakMinXp: smallint('streak_min_xp').notNull().default(15),
  reminderEmail: text('reminder_email'),
  reminderEnabled: boolean('reminder_enabled').notNull().default(false),
  totalXp: integer('total_xp').notNull().default(0),
  level: smallint('level').notNull().default(1),
  koban: integer('koban').notNull().default(0),
  settings: jsonb('settings').notNull().default({}),
  createdAt: ts('created_at').notNull().defaultNow(),
});

export const session = pgTable('session', {
  id: uuid('id').primaryKey().defaultRandom(),
  tokenHash: text('token_hash').notNull().unique(), // sha256 hex
  createdAt: ts('created_at').notNull().defaultNow(),
  expiresAt: ts('expires_at').notNull(),
  lastSeenAt: ts('last_seen_at').notNull().defaultNow(),
  userAgent: text('user_agent'),
  ipHash: text('ip_hash'),
});

export const loginAttempt = pgTable(
  'login_attempt',
  {
    id: bigserial('id', { mode: 'number' }).primaryKey(),
    ipHash: text('ip_hash').notNull(),
    success: boolean('success').notNull(),
    createdAt: ts('created_at').notNull().defaultNow(),
  },
  (t) => [index('login_attempt_ip_idx').on(t.ipHash, t.createdAt), index('login_attempt_time_idx').on(t.createdAt)],
);

// ---------- event & statistik harian ----------
export const activityEvent = pgTable(
  'activity_event',
  {
    id: bigserial('id', { mode: 'number' }).primaryKey(),
    occurredAt: ts('occurred_at').notNull().defaultNow(),
    localDate: date('local_date').notNull(),
    track: text('track').notNull(), // jp | dsa | general
    type: text('type').notNull(),
    refId: text('ref_id'),
    xp: integer('xp').notNull().default(0),
    minutes: integer('minutes').notNull().default(0),
    payload: jsonb('payload').notNull().default({}),
    dedupeKey: text('dedupe_key').unique(),
  },
  (t) => [index('activity_date_track_idx').on(t.localDate, t.track), index('activity_type_ref_idx').on(t.type, t.refId)],
);

export const dailyStat = pgTable(
  'daily_stat',
  {
    localDate: date('local_date').notNull(),
    track: text('track').notNull(),
    xp: integer('xp').notNull().default(0),
    minutes: integer('minutes').notNull().default(0),
    nodes: smallint('nodes').notNull().default(0),
    problems: smallint('problems').notNull().default(0),
    reviews: smallint('reviews').notNull().default(0),
    quizzes: smallint('quizzes').notNull().default(0),
    goalMet: boolean('goal_met').notNull().default(false),
    qualified: boolean('qualified').notNull().default(false),
    freezeUsed: boolean('freeze_used').notNull().default(false),
    busyDay: boolean('busy_day').notNull().default(false),
  },
  (t) => [primaryKey({ columns: [t.localDate, t.track] })],
);

export const streakState = pgTable('streak_state', {
  track: text('track').primaryKey(), // jp | dsa | both
  current: integer('current').notNull().default(0),
  longest: integer('longest').notNull().default(0),
  lastQualifiedDate: date('last_qualified_date'),
  freezes: smallint('freezes').notNull().default(1),
  repairDeadline: ts('repair_deadline'),
  lastRepairDate: date('last_repair_date'),
  updatedAt: ts('updated_at').notNull().defaultNow(),
});

export const busyDay = pgTable(
  'busy_day',
  { localDate: date('local_date').notNull(), track: text('track').notNull() },
  (t) => [primaryKey({ columns: [t.localDate, t.track] })],
);

// ---------- progres kurikulum ----------
export const nodeProgress = pgTable(
  'node_progress',
  {
    nodeId: text('node_id').primaryKey(),
    track: text('track').notNull(),
    status: text('status').notNull(), // in_progress | completed | skipped
    startedAt: ts('started_at'),
    completedAt: ts('completed_at'),
    mastery: smallint('mastery').notNull().default(0),
    confidence: smallint('confidence'),
    minutesSpent: integer('minutes_spent').notNull().default(0),
    lastReviewedAt: ts('last_reviewed_at'),
    ...srs,
  },
  (t) => [index('node_progress_due_idx').on(t.srsDue)],
);

export const problemProgress = pgTable(
  'problem_progress',
  {
    problemId: text('problem_id').primaryKey(), // lc-1
    status: text('status').notNull(), // attempted | solved
    firstSolvedAt: ts('first_solved_at'),
    attempts: smallint('attempts').notNull().default(0),
    bestMinutes: smallint('best_minutes'),
    usedHint: boolean('used_hint').notNull().default(false),
    solutionUrl: text('solution_url'),
    notesMd: text('notes_md'),
    mastery: smallint('mastery').notNull().default(0),
    ...srs,
  },
  (t) => [index('problem_progress_due_idx').on(t.srsDue)],
);

export const card = pgTable(
  'card',
  {
    id: text('id').primaryKey(), // kana:あ, kanji:日, gram:n5-g07, u:<uuid>
    deck: text('deck').notNull(),
    front: text('front').notNull(),
    back: text('back').notNull(),
    extra: jsonb('extra').notNull().default({}),
    unlockedBy: text('unlocked_by'),
    suspended: boolean('suspended').notNull().default(false),
    lastGrade: smallint('last_grade'),
    correctStreak: smallint('correct_streak').notNull().default(0),
    ...srs,
  },
  (t) => [index('card_due_idx').on(t.srsDue)],
);

export const quizSession = pgTable('quiz_session', {
  id: bigserial('id', { mode: 'number' }).primaryKey(),
  kind: text('kind').notNull(),
  refId: text('ref_id'),
  total: smallint('total').notNull(),
  correct: smallint('correct').notNull(),
  durationS: integer('duration_s').notNull(),
  items: jsonb('items').notNull(),
  createdAt: ts('created_at').notNull().defaultNow(),
});

// ---------- harian, quest, target, lencana ----------
export const dailySet = pgTable(
  'daily_set',
  {
    localDate: date('local_date').notNull(),
    track: text('track').notNull(),
    items: jsonb('items').notNull(),
    rerolled: boolean('rerolled').notNull().default(false),
    completedAt: ts('completed_at'),
  },
  (t) => [primaryKey({ columns: [t.localDate, t.track] })],
);

export const quest = pgTable(
  'quest',
  {
    localDate: date('local_date').notNull(),
    questId: text('quest_id').notNull(),
    target: smallint('target').notNull(),
    progress: smallint('progress').notNull().default(0),
    xp: smallint('xp').notNull(),
    completedAt: ts('completed_at'),
  },
  (t) => [primaryKey({ columns: [t.localDate, t.questId] })],
);

export const goal = pgTable(
  'goal',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    track: text('track').notNull(),
    period: text('period').notNull(), // week | month | custom
    periodStart: date('period_start').notNull(),
    periodEnd: date('period_end').notNull(),
    title: text('title').notNull(),
    metric: text('metric').notNull(),
    target: integer('target').notNull(),
    manualDone: boolean('manual_done'),
    rewardXp: smallint('reward_xp').notNull().default(0),
    completedAt: ts('completed_at'),
    source: text('source').notNull().default('template'),
    sort: smallint('sort').notNull().default(0),
  },
  (t) => [index('goal_period_idx').on(t.periodStart, t.periodEnd)],
);

export const reflection = pgTable('reflection', {
  weekStart: date('week_start').primaryKey(),
  wentWell: text('went_well'),
  blockers: text('blockers'),
  nextWeek: text('next_week'),
  createdAt: ts('created_at').notNull().defaultNow(),
});

export const badgeAward = pgTable('badge_award', {
  badgeId: text('badge_id').primaryKey(),
  awardedAt: ts('awarded_at').notNull().defaultNow(),
  payload: jsonb('payload').notNull().default({}),
});

export const daruma = pgTable('daruma', {
  id: uuid('id').primaryKey().defaultRandom(),
  slug: text('slug').notNull().unique(), // jlpt-n5, nc150, jlpt-n4, jlpt-n3, misumi-day1
  title: text('title').notNull(),
  track: text('track').notNull(),
  dueDate: date('due_date'),
  leftEyeAt: ts('left_eye_at').notNull().defaultNow(),
  rightEyeAt: ts('right_eye_at'),
  status: text('status').notNull().default('active'), // active | achieved | released
  note: text('note'),
});

// ---------- kalender, countdown, pengingat ----------
export const jlptSession = pgTable('jlpt_session', {
  id: uuid('id').primaryKey().defaultRandom(),
  examDate: date('exam_date').notNull().unique(),
  levelPlanned: text('level_planned'),
  city: text('city'),
  regOpenAt: ts('reg_open_at'),
  regCloseAt: ts('reg_close_at'),
  isEstimate: boolean('is_estimate').notNull().default(true),
  status: text('status').notNull().default('planned'),
  score: jsonb('score'),
  sourceUrl: text('source_url').default('https://jlptonline.or.id/'),
  notes: text('notes'),
});

export const countdown = pgTable('countdown', {
  id: uuid('id').primaryKey().defaultRandom(),
  slug: text('slug').unique(),
  title: text('title').notNull(),
  targetAt: ts('target_at').notNull(),
  kind: text('kind').notNull(), // misumi | jlpt_exam | jlpt_reg_open | jlpt_reg_close | custom
  refId: uuid('ref_id'),
  pinned: boolean('pinned').notNull().default(false),
  alarmDays: smallint('alarm_days').array().notNull().default(sql`'{14,7,1,0}'::smallint[]`),
});

export const reminderLog = pgTable(
  'reminder_log',
  {
    kind: text('kind').notNull(),
    refId: text('ref_id').notNull(),
    forDate: date('for_date').notNull(),
    channel: text('channel').notNull(),
    sentAt: ts('sent_at').notNull().defaultNow(),
  },
  (t) => [primaryKey({ columns: [t.kind, t.refId, t.forDate, t.channel] })],
);

// ---------- catatan & sumber tambahan ----------
export const note = pgTable('note', {
  nodeId: text('node_id').primaryKey(),
  bodyMd: text('body_md').notNull().default(''),
  updatedAt: ts('updated_at').notNull().defaultNow(),
});

export const customResource = pgTable('custom_resource', {
  id: uuid('id').primaryKey().defaultRandom(),
  nodeId: text('node_id').notNull(),
  kind: text('kind').notNull(), // youtube | url | md
  title: text('title').notNull(),
  url: text('url'),
  payload: jsonb('payload').notNull().default({}),
  sort: smallint('sort').notNull().default(0),
  createdAt: ts('created_at').notNull().defaultNow(),
});

export const materialRead = pgTable('material_read', {
  materialId: text('material_id').primaryKey(),
  readAt: ts('read_at').notNull().defaultNow(),
});

// ---------- CMS ----------
export const siteSection = pgTable('site_section', {
  key: text('key').primaryKey(),
  draft: jsonb('draft').notNull(),
  published: jsonb('published').notNull(),
  version: integer('version').notNull().default(1),
  draftUpdatedAt: ts('draft_updated_at').notNull().defaultNow(),
  publishedAt: ts('published_at').notNull().defaultNow(),
});

export const siteRevision = pgTable(
  'site_revision',
  {
    id: bigserial('id', { mode: 'number' }).primaryKey(),
    key: text('key').notNull(),
    version: integer('version').notNull(),
    content: jsonb('content').notNull(),
    note: text('note'),
    createdAt: ts('created_at').notNull().defaultNow(),
  },
  (t) => [uniqueIndex('site_revision_key_version').on(t.key, t.version)],
);

export const mediaAsset = pgTable('media_asset', {
  id: uuid('id').primaryKey().defaultRandom(),
  key: text('key').notNull().unique(), // kunci objek di storage
  contentType: text('content_type').notNull(),
  width: integer('width'),
  height: integer('height'),
  bytes: integer('bytes'),
  alt: text('alt'),
  createdAt: ts('created_at').notNull().defaultNow(),
});
