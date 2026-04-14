ALTER TABLE "invoices" ADD COLUMN "payment_details" text;--> statement-breakpoint
ALTER TABLE "invoices" ADD COLUMN "logo_url" text;--> statement-breakpoint
ALTER TABLE "workspace_settings" ADD COLUMN "invoice_logo_url" text;