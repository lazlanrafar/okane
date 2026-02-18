CREATE TABLE "workspace_sub_currencies" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"workspace_id" uuid NOT NULL,
	"currency_code" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp
);
--> statement-breakpoint
ALTER TABLE "workspace_settings" ADD COLUMN "main_currency_code" text DEFAULT 'USD' NOT NULL;--> statement-breakpoint
ALTER TABLE "workspace_settings" ADD COLUMN "main_currency_symbol" text DEFAULT '$' NOT NULL;--> statement-breakpoint
ALTER TABLE "workspace_settings" ADD COLUMN "main_currency_symbol_position" text DEFAULT 'Front' NOT NULL;--> statement-breakpoint
ALTER TABLE "workspace_settings" ADD COLUMN "main_currency_decimal_places" integer DEFAULT 2 NOT NULL;--> statement-breakpoint
ALTER TABLE "workspace_sub_currencies" ADD CONSTRAINT "workspace_sub_currencies_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE no action ON UPDATE no action;