ALTER TABLE "ai_messages" ADD COLUMN "workspace_id" uuid;--> statement-breakpoint
ALTER TABLE "ai_messages" ADD COLUMN "deleted_at" timestamp;--> statement-breakpoint
ALTER TABLE "audit_logs" ADD COLUMN "deleted_at" timestamp;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "deleted_at" timestamp;--> statement-breakpoint
ALTER TABLE "transaction_attachments" ADD COLUMN "deleted_at" timestamp;--> statement-breakpoint
ALTER TABLE "user_workspaces" ADD COLUMN "deleted_at" timestamp;--> statement-breakpoint
ALTER TABLE "workspace_invitations" ADD COLUMN "deleted_at" timestamp;