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
    prices: [
      { currency: "usd", monthly: 0, yearly: 0 },
      { currency: "eur", monthly: 0, yearly: 0 },
      { currency: "idr", monthly: 0, yearly: 0 },
    ],
    max_vault_size_mb: 100,
    max_ai_tokens: 5000, // Bumped slightly (see notes)
    features: [
      "1 workspace",
      "Up to 3 wallets",
      "Basic transaction tracking",
      "5,000 AI tokens / month",
      "Limited storage (100MB)",
      "Email support",
    ],
    is_active: true,
  },
  {
    name: "Pro",
    description: "Everything you need to run a growing business.",
    prices: [
      { currency: "usd", monthly: 1500, yearly: 15000 }, // $15/mo or $150/yr
      { currency: "eur", monthly: 1500, yearly: 15000 },
      { currency: "idr", monthly: 149000, yearly: 1490000 }, // Adjusted for PPP and .99 psychology
    ],
    max_vault_size_mb: 5120, // 5GB
    max_ai_tokens: 50000,
    features: [
      "5 workspaces",
      "Unlimited wallets",
      "Advanced analytics",
      "Unlimited transactions",
      "Custom categories",
      "Invoice & exports",
      "Priority email support",
    ],
    is_active: true,
  },
  {
    name: "Business",
    description: "For teams that need full control and collaboration.",
    prices: [
      { currency: "usd", monthly: 4900, yearly: 49000 }, // $49/mo or $490/yr
      { currency: "eur", monthly: 4900, yearly: 49000 },
      { currency: "idr", monthly: 499000, yearly: 4990000 },
    ],
    max_vault_size_mb: 20480, // 20GB
    max_ai_tokens: 250000,
    features: [
      "Unlimited workspaces",
      "Unlimited wallets",
      "Full cooperation features",
      "Custom roles & permissions",
      "Audit logs",
      "API access",
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
