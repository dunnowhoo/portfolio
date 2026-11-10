CREATE TABLE "ask_log" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"ip_hash" text NOT NULL,
	"ok" boolean DEFAULT true NOT NULL,
	"ms" integer,
	"tokens" integer,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "ask_log_ip_time_idx" ON "ask_log" USING btree ("ip_hash","created_at");--> statement-breakpoint
CREATE INDEX "ask_log_time_idx" ON "ask_log" USING btree ("created_at");