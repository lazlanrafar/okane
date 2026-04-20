ALTER TABLE "vault_files" ADD COLUMN "inactive_at" timestamp;--> statement-breakpoint
ALTER TABLE "workspaces" ADD COLUMN "storage_violation_at" timestamp;