CREATE TABLE "vault_files" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"workspace_id" uuid NOT NULL,
	"name" text NOT NULL,
	"key" text NOT NULL,
	"size" bigint NOT NULL,
	"type" text NOT NULL,
	"metadata" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp
);
--> statement-breakpoint
ALTER TABLE "workspace_settings" ADD COLUMN "r2_endpoint" text;--> statement-breakpoint
ALTER TABLE "workspace_settings" ADD COLUMN "r2_access_key_id" text;--> statement-breakpoint
ALTER TABLE "workspace_settings" ADD COLUMN "r2_secret_access_key" text;--> statement-breakpoint
ALTER TABLE "workspace_settings" ADD COLUMN "r2_bucket_name" text;--> statement-breakpoint
ALTER TABLE "vault_files" ADD CONSTRAINT "vault_files_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE no action ON UPDATE no action;