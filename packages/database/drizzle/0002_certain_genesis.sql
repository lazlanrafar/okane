ALTER TABLE "transactions" ADD COLUMN "is_ready" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "transactions" ADD COLUMN "is_exported" boolean DEFAULT false NOT NULL;