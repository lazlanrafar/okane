CREATE TABLE "workspace_addons" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"workspace_id" uuid NOT NULL,
	"addon_id" uuid NOT NULL,
	"stripe_subscription_id" text NOT NULL,
	"status" text DEFAULT 'active' NOT NULL,
	"amount" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp,
	CONSTRAINT "workspace_addons_stripe_subscription_id_unique" UNIQUE("stripe_subscription_id")
);
--> statement-breakpoint
ALTER TABLE "pricing" ADD COLUMN "is_addon" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "pricing" ADD COLUMN "addon_type" text;--> statement-breakpoint
ALTER TABLE "workspace_addons" ADD CONSTRAINT "workspace_addons_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workspace_addons" ADD CONSTRAINT "workspace_addons_addon_id_pricing_id_fk" FOREIGN KEY ("addon_id") REFERENCES "public"."pricing"("id") ON DELETE no action ON UPDATE no action;