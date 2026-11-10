CREATE TABLE "ask_cache" (
	"key" text PRIMARY KEY NOT NULL,
	"answer" text NOT NULL,
	"items" integer DEFAULT 0 NOT NULL,
	"picked" integer DEFAULT 0 NOT NULL,
	"model" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
