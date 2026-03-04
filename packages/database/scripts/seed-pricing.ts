/**
 * Pricing seeder
 *
 * Usage:
 *   bun run --cwd packages/database scripts/seed-pricing.ts
 *
 * Safe to re-run — uses "INSERT ... ON CONFLICT DO NOTHING"
 * keyed on the plan `name`. Existing plans are left untouched.
 */

import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { sql } from "drizzle-orm";
import { pricing } from "../schema/pricing";

// ---------------------------------------------------------------------------
// Plan definitions
// ---------------------------------------------------------------------------

const PLANS = [
  {
    name: "Starter",
    description: "Get started with the essentials. No credit card required.",
    price_monthly: null, // free
    price_yearly: null, // free
    price_one_time: null, // free
    currency: "usd",
    max_vault_size_mb: 100,
    max_ai_tokens: 500,
    features: [
      "1 workspace",
      "Up to 3 wallets",
      "Basic transaction tracking",
      "100 transactions / month",
      "Email support",
    ],
    is_active: true,
  },
  {
    name: "Pro",
    description: "Everything you need to run a growing business.",
    price_monthly: 1200, // $12.00 in cents
    price_yearly: 11520, // $115.20 / yr in cents (~$9.60/mo, 20% off)
    price_one_time: null,
    currency: "usd",
    max_vault_size_mb: 2048,
    max_ai_tokens: 10000,
    features: [
      "3 workspaces",
      "Unlimited wallets",
      "Advanced analytics",
      "Unlimited transactions",
      "Invoice & exports",
      "Priority email support",
    ],
    is_active: true,
  },
  {
    name: "Business",
    description: "For teams that need full control and collaboration.",
    price_monthly: 3900, // $39.00 in cents
    price_yearly: 37440, // $374.40 / yr in cents (~$31.20/mo, 20% off)
    price_one_time: null,
    currency: "usd",
    max_vault_size_mb: 10240,
    max_ai_tokens: 50000,
    features: [
      "Unlimited workspaces",
      "Unlimited wallets",
      "Custom categories & reports",
      "Team members & roles",
      "Audit logs",
      "Dedicated support",
    ],
    is_active: true,
  },
] satisfies (typeof pricing.$inferInsert)[];

// ---------------------------------------------------------------------------
// Seed
// ---------------------------------------------------------------------------

async function main() {
  const client = postgres(process.env.DATABASE_URL!, { prepare: false });
  const db = drizzle(client);

  console.log("🌱 Seeding pricing plans…\n");

  for (const plan of PLANS) {
    // Check if a plan with the same name already exists (case-insensitive)
    const existing = await db.execute(
      sql`SELECT id FROM pricing WHERE lower(name) = lower(${plan.name}) AND deleted_at IS NULL LIMIT 1`,
    );

    if (existing.length > 0) {
      console.log(
        `⏭  Skipped: "${plan.name}" already exists (id: ${existing[0]!.id})`,
      );
      continue;
    }

    const [inserted] = await db
      .insert(pricing)
      .values(plan)
      .returning({ id: pricing.id, name: pricing.name });

    console.log(`✅ Inserted: "${inserted!.name}" (id: ${inserted!.id})`);
  }

  console.log("\n✨ Done.");
  await client.end();
}

main().catch((err) => {
  console.error("❌ Seeder failed:", err);
  process.exit(1);
});
