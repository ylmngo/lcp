CREATE TABLE IF NOT EXISTS "rooms" (
	"id" uuid PRIMARY KEY NOT NULL,
	"key" text DEFAULT '',
	"email" text NOT NULL,
	"user_id" integer,
	"members" integer[] NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "rooms" ADD CONSTRAINT "rooms_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
