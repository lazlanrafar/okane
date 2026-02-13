CREATE TABLE "workspace_settings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"workspace_id" uuid NOT NULL,
	"monthly_start_date" integer DEFAULT 1 NOT NULL,
	"weekly_start_day" text DEFAULT 'Sunday' NOT NULL,
	"carry_over" boolean DEFAULT false NOT NULL,
	"period" text DEFAULT 'Monthly' NOT NULL,
	"income_expenses_color" text DEFAULT 'Exp.' NOT NULL,
	"autocomplete" boolean DEFAULT true NOT NULL,
	"time_input" text DEFAULT 'None' NOT NULL,
	"start_screen" text DEFAULT 'Daily' NOT NULL,
	"swipe_action" text DEFAULT 'Change Date' NOT NULL,
	"show_description" boolean DEFAULT false NOT NULL,
	"input_order" text DEFAULT 'Amount' NOT NULL,
	"note_button" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp
);
--> statement-breakpoint
ALTER TABLE "workspace_settings" ADD CONSTRAINT "workspace_settings_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE no action ON UPDATE no action;