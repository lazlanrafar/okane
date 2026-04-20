ALTER TABLE "invoices" ADD COLUMN "invoice_size" text DEFAULT 'A4' NOT NULL;--> statement-breakpoint
ALTER TABLE "invoices" ADD COLUMN "date_format" text DEFAULT 'DD/MM/YYYY' NOT NULL;--> statement-breakpoint
ALTER TABLE "invoices" ADD COLUMN "payment_terms" text DEFAULT 'Due on Receipt' NOT NULL;--> statement-breakpoint
ALTER TABLE "invoices" ADD COLUMN "template_name" text DEFAULT 'Default' NOT NULL;--> statement-breakpoint
ALTER TABLE "invoices" ADD COLUMN "invoice_settings" jsonb DEFAULT '{"salesTax":false,"vat":false,"lineItemTax":false,"discount":false,"decimals":false,"units":false,"qrCode":true}'::jsonb NOT NULL;