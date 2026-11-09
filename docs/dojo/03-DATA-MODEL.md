# Data model Dōjō (Postgres/Neon + Drizzle)

Status: Draft v1 · 9 November 2026

## 1. Prinsip

- **Kurikulum dan materi ada di repo** (`curriculum/*.ts`, `content/dojo/**`). **Progres ada di DB.** Keduanya dihubungkan oleh **ID node yang stabil**.
- **Event *append-only*.** Setiap aksi yang memberi XP atau memengaruhi streak dicatat di `activity_event`. Tabel `daily_stat`, `streak_state`, dan `profile.total_xp` adalah turunan yang bisa dihitung ulang.
- **Satu pengguna**, sehingga tidak ada kolom `user_id`. Kalau suatu hari jadi multi-user, kolom itu ditambahkan dengan migrasi.
- Semua waktu disimpan sebagai `timestamptz` (UTC). Tanggal harian disimpan sebagai `local_date date`, dihitung dari zona waktu dan jam pergantian hari saat event terjadi.

## 2. Format ID kurikulum

| Entitas | Format | Contoh |
|---|---|---|
| Section | `{track}.s{n}` | `jp.s1`, `dsa.s5` |
| Unit | `{track}.s{n}.u{m}` | `jp.s1.u03` |
| Node | `{track}.s{n}.u{m}.{slug}` | `jp.s1.u03.irodori-x-l05`, `dsa.s5.u01.lesson` |
| Soal DSA | `lc-{nomor}` atau `lint-{nomor}` atau `x-{slug}` | `lc-1`, `lc-217`, `lint-659` |
| Kartu bawaan | `{deck}:{key}` | `kana:あ`, `kanji:日`, `gram:n5-g07` |
| Materi MD | frontmatter `id` | `dsa-05-arrays-hashing`, `jp-03-n5-grammar` |

**Aturan stabilitas:** ID yang sudah punya progres **tidak boleh diganti nama**. Kalau sebuah node dihapus dari kurikulum, ia ditandai `deprecated: true`. Progresnya tetap tersimpan dan XP-nya tidak hilang.

## 3. Tabel

### 3.1 Auth dan profil

```sql
profile (                        -- satu baris
  id                smallint primary key default 1 check (id = 1),
  display_name      text not null default 'Fauzan',
  timezone          text not null default 'Asia/Jakarta',
  day_start_hour    smallint not null default 0,        -- 0..4
  daily_goal_jp     smallint not null default 50,
  daily_goal_dsa    smallint not null default 30,
  streak_min_xp     smallint not null default 15,
  reminder_email    text,
  reminder_enabled  boolean not null default false,
  total_xp          integer not null default 0,          -- turunan
  level             smallint not null default 1,         -- turunan
  koban             integer not null default 0,          -- fase 2
  settings          jsonb not null default '{}',         -- tema, suara, dll
  created_at        timestamptz not null default now()
)

session (
  id            uuid primary key,
  token_hash    bytea not null unique,                   -- sha256(token)
  created_at    timestamptz not null default now(),
  expires_at    timestamptz not null,
  last_seen_at  timestamptz not null default now(),
  user_agent    text,
  ip_hash       bytea                                    -- sha256(ip + salt), bukan IP mentah
)

login_attempt (
  id          bigserial primary key,
  ip_hash     bytea not null,
  success     boolean not null,
  created_at  timestamptz not null default now()
)  -- index (ip_hash, created_at), (created_at)
```

### 3.2 Event dan statistik harian

```sql
activity_event (
  id           bigserial primary key,
  occurred_at  timestamptz not null default now(),
  local_date   date not null,
  track        text not null check (track in ('jp','dsa','general')),
  type         text not null,          -- lihat §4
  ref_id       text,                   -- node_id / problem_id / card_id / goal_id ...
  xp           integer not null default 0,
  minutes      integer not null default 0,
  payload      jsonb not null default '{}',
  dedupe_key   text unique             -- contoh: 'node_complete:jp.s0.u1.lesson', 'checkin_anki:2026-11-10'
)  -- index (local_date, track), (type, ref_id)

daily_stat (                           -- turunan, satu baris per tanggal per jalur
  local_date   date not null,
  track        text not null,
  xp           integer not null default 0,
  minutes      integer not null default 0,
  nodes        smallint not null default 0,
  problems     smallint not null default 0,
  reviews      smallint not null default 0,
  quizzes      smallint not null default 0,
  goal_met     boolean not null default false,  -- daily goal
  qualified    boolean not null default false,  -- ambang streak
  freeze_used  boolean not null default false,
  busy_day     boolean not null default false,
  primary key (local_date, track)
)

streak_state (                         -- turunan
  track               text primary key,  -- 'jp' | 'dsa' | 'both'
  current             integer not null default 0,
  longest             integer not null default 0,
  last_qualified_date date,
  freezes             smallint not null default 1,
  repair_deadline     timestamptz,       -- terisi ketika streak putus dan masih bisa di-repair
  last_repair_date    date,
  updated_at          timestamptz not null default now()
)

busy_day (local_date date, track text, primary key (local_date, track))
```

### 3.3 Progres kurikulum

```sql
node_progress (
  node_id          text primary key,
  track            text not null,
  status           text not null check (status in ('in_progress','completed','skipped')),
  started_at       timestamptz,
  completed_at     timestamptz,
  mastery          smallint not null default 0,      -- 0..3 (★)
  confidence       smallint,                         -- 1 Lupa, 2 Sulit, 3 Baik, 4 Mudah
  minutes_spent    integer not null default 0,
  srs_due          date,
  srs_interval     smallint,
  srs_ease         real,
  srs_reps         smallint not null default 0,
  srs_lapses       smallint not null default 0,
  last_reviewed_at timestamptz
)  -- node yang tidak punya baris = belum disentuh (status tersedia/terkunci dihitung dari kurikulum)

problem_progress (
  problem_id     text primary key,                   -- 'lc-1'
  status         text not null check (status in ('attempted','solved')),
  first_solved_at timestamptz,
  attempts       smallint not null default 0,
  best_minutes   smallint,
  used_hint      boolean not null default false,
  solution_url   text,                               -- link submission / gist
  notes_md       text,
  mastery        smallint not null default 0,
  srs_due date, srs_interval smallint, srs_ease real, srs_reps smallint default 0, srs_lapses smallint default 0
)

card (                                               -- kartu SRS 日本語 (bawaan + buatan sendiri)
  id           text primary key,                     -- 'kana:あ', 'kanji:日', 'gram:n5-g07', 'u:uuid'
  deck         text not null,                        -- kana | kanji | grammar | vocab | custom
  front        text not null,
  back         text not null,
  extra        jsonb not null default '{}',          -- bacaan, contoh, audio_url
  unlocked_by  text,                                 -- node_id yang membuka kartu
  suspended    boolean not null default false,
  srs_due date, srs_interval smallint, srs_ease real, srs_reps smallint default 0, srs_lapses smallint default 0,
  last_grade   smallint, correct_streak smallint default 0
)
-- Kartu bawaan di-seed dari content/curriculum. Kartu custom dibuat dari UI.

quiz_session (
  id          bigserial primary key,
  kind        text not null,      -- kana_sprint | kanji_sprint | grammar_recall | pattern_quiz | checkpoint
  ref_id      text,               -- node_id checkpoint / tanggal daily
  total       smallint not null,
  correct     smallint not null,
  duration_s  integer not null,
  items       jsonb not null,     -- [{card_id, ok, ms}]
  created_at  timestamptz not null default now()
)
```

### 3.4 Harian, quest, target, dan lencana

```sql
daily_set (
  local_date   date not null,
  track        text not null,
  items        jsonb not null,     -- [{kind:'problem'|'review'|'quiz'|'checkin'|..., ref, done:false}]
  rerolled     boolean not null default false,
  completed_at timestamptz,
  primary key (local_date, track)
)

quest (
  local_date   date not null,
  quest_id     text not null,      -- dari pool di GAMIFICATION §6
  target       smallint not null,
  progress     smallint not null default 0,
  xp           smallint not null,
  completed_at timestamptz,
  primary key (local_date, quest_id)
)

goal (
  id           uuid primary key,
  track        text not null,                      -- jp | dsa | general
  period       text not null check (period in ('week','month','custom')),
  period_start date not null,
  period_end   date not null,
  title        text not null,
  metric       text not null,                      -- xp | minutes | days_active | nodes | problems_easy|medium|hard|any
                                                   -- | reviews | irodori_lessons | anki_cards | kanji | manual
  target       integer not null,
  manual_done  boolean,                            -- untuk metric = manual
  reward_xp    smallint not null default 0,
  completed_at timestamptz,
  source       text not null default 'template',   -- template | user
  sort         smallint not null default 0
)

reflection (
  week_start  date primary key,
  went_well   text, blockers text, next_week text,
  created_at  timestamptz not null default now()
)

badge_award (
  badge_id    text primary key,
  awarded_at  timestamptz not null default now(),
  payload     jsonb not null default '{}'
)

daruma (
  id           uuid primary key,
  title        text not null,                      -- 'JLPT N3'
  track        text not null,
  due_date     date,
  left_eye_at  timestamptz not null default now(), -- dicat saat target dipasang
  right_eye_at timestamptz,                        -- dicat saat tercapai
  status       text not null default 'active',     -- active | achieved | released (dilepas)
  note         text
)
```

### 3.5 Kalender, countdown, dan pengingat

```sql
jlpt_session (
  id             uuid primary key,
  exam_date      date not null,
  level_planned  text,                        -- 'N5' | 'N4' | 'N3' | 'N2'
  city           text,                        -- 'Jakarta' / 'Tokyo'
  reg_open_at    timestamptz,
  reg_close_at   timestamptz,
  is_estimate    boolean not null default true,
  status         text not null default 'planned',
     -- planned | reg_open | registered | paid | admission_card | taken | passed | failed | skipped
  score          jsonb,                       -- {total, sections:{...}}
  source_url     text default 'https://jlptonline.or.id/',
  notes          text
)

countdown (
  id          uuid primary key,
  title       text not null,
  target_at   timestamptz not null,
  kind        text not null,                  -- misumi | jlpt_exam | jlpt_reg_open | jlpt_reg_close | custom
  ref_id      uuid,                           -- jlpt_session.id bila relevan
  pinned      boolean not null default false,
  alarm_days  smallint[] not null default '{14,7,1,0}'
)

reminder_log (
  kind      text not null,                    -- streak_risk | jlpt_reg_open | jlpt_reg_close | weekly_recap | ...
  ref_id    text not null,
  for_date  date not null,
  channel   text not null,                    -- email | banner_dismissed
  sent_at   timestamptz not null default now(),
  primary key (kind, ref_id, for_date, channel)
)
```

### 3.6 Catatan dan sumber tambahan

```sql
note (
  node_id     text primary key,               -- satu catatan MD per node (atau 'general:<uuid>')
  body_md     text not null default '',
  updated_at  timestamptz not null default now()
)

custom_resource (
  id         uuid primary key,
  node_id    text not null,
  kind       text not null check (kind in ('youtube','url','md')),
  title      text not null,
  url        text,                             -- untuk youtube disimpan video ID-nya di payload
  payload    jsonb not null default '{}',
  sort       smallint not null default 0,
  created_at timestamptz not null default now()
)

material_read (material_id text primary key, read_at timestamptz not null default now())
```

### 3.7 CMS

```sql
site_section (
  key               text primary key,
     -- profile | socials | education | experience | organizations | achievements
     -- | tech_stack | projects | spotify | contact | seo
  draft             jsonb not null,
  published         jsonb not null,
  version           integer not null default 1,
  draft_updated_at  timestamptz not null default now(),
  published_at      timestamptz not null default now()
)

site_revision (
  id          bigserial primary key,
  key         text not null,
  version     integer not null,
  content     jsonb not null,
  note        text,
  created_at  timestamptz not null default now(),
  unique (key, version)
)

media_asset (
  id          uuid primary key,
  url         text not null,
  pathname    text not null,
  width       integer, height integer, bytes integer,
  alt         text,
  created_at  timestamptz not null default now()
)
```

**Skema konten (zod)** mengikuti `types.ts` yang sudah ada, ditambah `id` string (uuid), `hidden: boolean`, dan `sort: number` di setiap item:

- `profile`: `{ name, nameAccent, headline, highlights[], tagline, availability:{show,label}, resumeUrl, photoUrl, photoCaption:{name,location} }`
- `socials`: `[{ id, kind:'github'|'linkedin'|'upwork'|'instagram'|'email'|'x'|'other', label, url, hidden, sort }]`
- `education`: `{ institution, program, label }`
- `experience`: `[{ id, role, company, period, description, tech[], link?, hidden, sort }]`
- `organizations`: `[{ id, role, org, period, description, category, link?, hidden, sort }]`
- `achievements`: `[{ id, title, description, icon, hidden, sort }]`
- `tech_stack`: `string[]` (slug ikon yang dipakai `TechIcon.tsx`)
- `projects`: `[{ id, title, description, image, images[], embed?, category:'Web'|'Mobile'|'AI/Data'|'Smart City', techStack[], links:[{type,url}], featured?, hidden, sort }]`
- `spotify`: `{ trackId, startAt, title, subtitle }`
- `contact`: `{ email, scheduleUrl?, heading, body }`
- `seo`: `{ title, description, ogImage? }`

## 4. Tipe event `activity_event.type`

| Tipe | Jalur | ref_id | XP (lihat GAMIFICATION §2) | dedupe_key |
|---|---|---|---|---|
| `node_complete` | jp/dsa | node_id | sesuai tipe node | `node_complete:{node}` |
| `node_review` | jp/dsa | node_id | 5 | tidak ada |
| `problem_solve` | dsa | problem_id | 10 / 20 / 40 | `problem_solve:{id}` (solve pertama) |
| `problem_review` | dsa | problem_id | 10 | `problem_review:{id}:{date}` |
| `quiz_session` | jp/dsa | quiz_session.id | 10 (+5 kalau akurasi ≥ 90%) | tidak ada (dibatasi 6× per hari per jenis) |
| `card_review` | jp | card_id | 1 per kartu, maks. 30 per hari | tidak ada |
| `checkin_anki` | jp | tanggal | 15 | `checkin_anki:{date}` |
| `checkin_duolingo` | jp | tanggal | 10 | `checkin_duolingo:{date}` |
| `time_log` | jp/dsa | node_id? | 1 per 3 menit, maks. 40 per hari per jalur | tidak ada |
| `daily_goal` | jp/dsa | tanggal | +10 | `daily_goal:{track}:{date}` |
| `perfect_day` | general | tanggal | +20 | `perfect_day:{date}` |
| `quest_complete` | general | quest_id | sesuai quest | `quest:{date}:{id}` |
| `goal_complete` | jp/dsa | goal_id | 100 / 300 | `goal:{id}` |
| `streak_milestone` | jp/dsa | hari ke-n | lihat tabel | `streak_ms:{track}:{n}:{start}` |
| `badge` | general | badge_id | sesuai lencana | `badge:{id}` |
| `reflection` | general | week_start | 20 | `reflection:{week}` |
| `jlpt` | jp | session_id | 100 terdaftar / 300 ikut ujian / 1.000 lulus | `jlpt:{id}:{status}` |
| `level_up` | general | level | 0 (hanya catatan) | `level:{L}` |

## 5. Indeks dan ukuran

- Perkiraan: ±40 event per hari × 700 hari ≈ 28.000 baris. Untuk Neon ini kecil sekali.
- Indeks yang dibutuhkan:
  - `activity_event(local_date, track)` untuk heatmap dan statistik;
  - `activity_event(type, ref_id)` untuk lencana;
  - `card(srs_due)`, `problem_progress(srs_due)`, dan `node_progress(srs_due)` untuk antrian review.
