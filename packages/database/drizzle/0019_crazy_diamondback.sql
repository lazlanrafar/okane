ALTER TABLE "workspaces" ADD COLUMN "extra_ai_tokens" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "workspaces" ADD COLUMN "extra_vault_size_mb" integer DEFAULT 0 NOT NULL;