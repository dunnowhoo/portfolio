CREATE TABLE "activity_event" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"occurred_at" timestamp with time zone DEFAULT now() NOT NULL,
	"local_date" date NOT NULL,
	"track" text NOT NULL,
	"type" text NOT NULL,
	"ref_id" text,
	"xp" integer DEFAULT 0 NOT NULL,
	"minutes" integer DEFAULT 0 NOT NULL,
	"payload" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"dedupe_key" text,
	CONSTRAINT "activity_event_dedupe_key_unique" UNIQUE("dedupe_key")
);
--> statement-breakpoint
CREATE TABLE "badge_award" (
	"badge_id" text PRIMARY KEY NOT NULL,
	"awarded_at" timestamp with time zone DEFAULT now() NOT NULL,
	"payload" jsonb DEFAULT '{}'::jsonb NOT NULL
);
--> statement-breakpoint
CREATE TABLE "busy_day" (
	"local_date" date NOT NULL,
	"track" text NOT NULL,
	CONSTRAINT "busy_day_local_date_track_pk" PRIMARY KEY("local_date","track")
);
--> statement-breakpoint
CREATE TABLE "card" (
	"id" text PRIMARY KEY NOT NULL,
	"deck" text NOT NULL,
	"front" text NOT NULL,
	"back" text NOT NULL,
	"extra" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"unlocked_by" text,
	"suspended" boolean DEFAULT false NOT NULL,
	"last_grade" smallint,
	"correct_streak" smallint DEFAULT 0 NOT NULL,
	"srs_due" date,
	"srs_interval" smallint,
	"srs_ease" real,
	"srs_reps" smallint DEFAULT 0 NOT NULL,
	"srs_lapses" smallint DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "countdown" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" text,
	"title" text NOT NULL,
	"target_at" timestamp with time zone NOT NULL,
	"kind" text NOT NULL,
	"ref_id" uuid,
	"pinned" boolean DEFAULT false NOT NULL,
	"alarm_days" smallint[] DEFAULT '{14,7,1,0}'::smallint[] NOT NULL,
	CONSTRAINT "countdown_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "custom_resource" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"node_id" text NOT NULL,
	"kind" text NOT NULL,
	"title" text NOT NULL,
	"url" text,
	"payload" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"sort" smallint DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "daily_set" (
	"local_date" date NOT NULL,
	"track" text NOT NULL,
	"items" jsonb NOT NULL,
	"rerolled" boolean DEFAULT false NOT NULL,
	"completed_at" timestamp with time zone,
	CONSTRAINT "daily_set_local_date_track_pk" PRIMARY KEY("local_date","track")
);
--> statement-breakpoint
CREATE TABLE "daily_stat" (
	"local_date" date NOT NULL,
	"track" text NOT NULL,
	"xp" integer DEFAULT 0 NOT NULL,
	"minutes" integer DEFAULT 0 NOT NULL,
	"nodes" smallint DEFAULT 0 NOT NULL,
	"problems" smallint DEFAULT 0 NOT NULL,
	"reviews" smallint DEFAULT 0 NOT NULL,
	"quizzes" smallint DEFAULT 0 NOT NULL,
	"goal_met" boolean DEFAULT false NOT NULL,
	"qualified" boolean DEFAULT false NOT NULL,
	"freeze_used" boolean DEFAULT false NOT NULL,
	"busy_day" boolean DEFAULT false NOT NULL,
	CONSTRAINT "daily_stat_local_date_track_pk" PRIMARY KEY("local_date","track")
);
--> statement-breakpoint
CREATE TABLE "daruma" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" text NOT NULL,
	"title" text NOT NULL,
	"track" text NOT NULL,
	"due_date" date,
	"left_eye_at" timestamp with time zone DEFAULT now() NOT NULL,
	"right_eye_at" timestamp with time zone,
	"status" text DEFAULT 'active' NOT NULL,
	"note" text,
	CONSTRAINT "daruma_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "goal" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"track" text NOT NULL,
	"period" text NOT NULL,
	"period_start" date NOT NULL,
	"period_end" date NOT NULL,
	"title" text NOT NULL,
	"metric" text NOT NULL,
	"target" integer NOT NULL,
	"manual_done" boolean,
	"reward_xp" smallint DEFAULT 0 NOT NULL,
	"completed_at" timestamp with time zone,
	"source" text DEFAULT 'template' NOT NULL,
	"sort" smallint DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "jlpt_session" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"exam_date" date NOT NULL,
	"level_planned" text,
	"city" text,
	"reg_open_at" timestamp with time zone,
	"reg_close_at" timestamp with time zone,
	"is_estimate" boolean DEFAULT true NOT NULL,
	"status" text DEFAULT 'planned' NOT NULL,
	"score" jsonb,
	"source_url" text DEFAULT 'https://jlptonline.or.id/',
	"notes" text,
	CONSTRAINT "jlpt_session_exam_date_unique" UNIQUE("exam_date")
);
--> statement-breakpoint
CREATE TABLE "login_attempt" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"ip_hash" text NOT NULL,
	"success" boolean NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "material_read" (
	"material_id" text PRIMARY KEY NOT NULL,
	"read_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "media_asset" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"key" text NOT NULL,
	"content_type" text NOT NULL,
	"width" integer,
	"height" integer,
	"bytes" integer,
	"alt" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "media_asset_key_unique" UNIQUE("key")
);
--> statement-breakpoint
CREATE TABLE "node_progress" (
	"node_id" text PRIMARY KEY NOT NULL,
	"track" text NOT NULL,
	"status" text NOT NULL,
	"started_at" timestamp with time zone,
	"completed_at" timestamp with time zone,
	"mastery" smallint DEFAULT 0 NOT NULL,
	"confidence" smallint,
	"minutes_spent" integer DEFAULT 0 NOT NULL,
	"last_reviewed_at" timestamp with time zone,
	"srs_due" date,
	"srs_interval" smallint,
	"srs_ease" real,
	"srs_reps" smallint DEFAULT 0 NOT NULL,
	"srs_lapses" smallint DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "note" (
	"node_id" text PRIMARY KEY NOT NULL,
	"body_md" text DEFAULT '' NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "problem_progress" (
	"problem_id" text PRIMARY KEY NOT NULL,
	"status" text NOT NULL,
	"first_solved_at" timestamp with time zone,
	"attempts" smallint DEFAULT 0 NOT NULL,
	"best_minutes" smallint,
	"used_hint" boolean DEFAULT false NOT NULL,
	"solution_url" text,
	"notes_md" text,
	"mastery" smallint DEFAULT 0 NOT NULL,
	"srs_due" date,
	"srs_interval" smallint,
	"srs_ease" real,
	"srs_reps" smallint DEFAULT 0 NOT NULL,
	"srs_lapses" smallint DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "profile" (
	"id" smallint PRIMARY KEY DEFAULT 1 NOT NULL,
	"display_name" text DEFAULT 'Fauzan' NOT NULL,
	"timezone" text DEFAULT 'Asia/Jakarta' NOT NULL,
	"day_start_hour" smallint DEFAULT 0 NOT NULL,
	"daily_goal_jp" smallint DEFAULT 50 NOT NULL,
	"daily_goal_dsa" smallint DEFAULT 30 NOT NULL,
	"streak_min_xp" smallint DEFAULT 15 NOT NULL,
	"reminder_email" text,
	"reminder_enabled" boolean DEFAULT false NOT NULL,
	"total_xp" integer DEFAULT 0 NOT NULL,
	"level" smallint DEFAULT 1 NOT NULL,
	"koban" integer DEFAULT 0 NOT NULL,
	"settings" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "quest" (
	"local_date" date NOT NULL,
	"quest_id" text NOT NULL,
	"target" smallint NOT NULL,
	"progress" smallint DEFAULT 0 NOT NULL,
	"xp" smallint NOT NULL,
	"completed_at" timestamp with time zone,
	CONSTRAINT "quest_local_date_quest_id_pk" PRIMARY KEY("local_date","quest_id")
);
--> statement-breakpoint
CREATE TABLE "quiz_session" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"kind" text NOT NULL,
	"ref_id" text,
	"total" smallint NOT NULL,
	"correct" smallint NOT NULL,
	"duration_s" integer NOT NULL,
	"items" jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "reflection" (
	"week_start" date PRIMARY KEY NOT NULL,
	"went_well" text,
	"blockers" text,
	"next_week" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "reminder_log" (
	"kind" text NOT NULL,
	"ref_id" text NOT NULL,
	"for_date" date NOT NULL,
	"channel" text NOT NULL,
	"sent_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "reminder_log_kind_ref_id_for_date_channel_pk" PRIMARY KEY("kind","ref_id","for_date","channel")
);
--> statement-breakpoint
CREATE TABLE "session" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"token_hash" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"last_seen_at" timestamp with time zone DEFAULT now() NOT NULL,
	"user_agent" text,
	"ip_hash" text,
	CONSTRAINT "session_token_hash_unique" UNIQUE("token_hash")
);
--> statement-breakpoint
CREATE TABLE "site_revision" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"key" text NOT NULL,
	"version" integer NOT NULL,
	"content" jsonb NOT NULL,
	"note" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "site_section" (
	"key" text PRIMARY KEY NOT NULL,
	"draft" jsonb NOT NULL,
	"published" jsonb NOT NULL,
	"version" integer DEFAULT 1 NOT NULL,
	"draft_updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"published_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "streak_state" (
	"track" text PRIMARY KEY NOT NULL,
	"current" integer DEFAULT 0 NOT NULL,
	"longest" integer DEFAULT 0 NOT NULL,
	"last_qualified_date" date,
	"freezes" smallint DEFAULT 1 NOT NULL,
	"repair_deadline" timestamp with time zone,
	"last_repair_date" date,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "activity_date_track_idx" ON "activity_event" USING btree ("local_date","track");--> statement-breakpoint
CREATE INDEX "activity_type_ref_idx" ON "activity_event" USING btree ("type","ref_id");--> statement-breakpoint
CREATE INDEX "card_due_idx" ON "card" USING btree ("srs_due");--> statement-breakpoint
CREATE INDEX "goal_period_idx" ON "goal" USING btree ("period_start","period_end");--> statement-breakpoint
CREATE INDEX "login_attempt_ip_idx" ON "login_attempt" USING btree ("ip_hash","created_at");--> statement-breakpoint
CREATE INDEX "login_attempt_time_idx" ON "login_attempt" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "node_progress_due_idx" ON "node_progress" USING btree ("srs_due");--> statement-breakpoint
CREATE INDEX "problem_progress_due_idx" ON "problem_progress" USING btree ("srs_due");--> statement-breakpoint
CREATE UNIQUE INDEX "site_revision_key_version" ON "site_revision" USING btree ("key","version");