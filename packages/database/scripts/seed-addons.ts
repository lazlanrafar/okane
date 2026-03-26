import * as dotenv from "dotenv";
import * as path from "path";

// Load environment variables from root
dotenv.config({ path: path.join(__dirname, "../../../.env") });

import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { pricing } from "../schema/pricing";
import { eq } from "drizzle-orm";

async function seedAddons() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error("DATABASE_URL is not set");
  }

  const client = postgres(url, { prepare: false });
  const db = drizzle(client, { schema: { pricing } });
  const addons = [
    {
      name: "AI 500k Pack",
      description: "Additional 500,000 AI tokens per month",
      addon_type: "ai" as const,
      max_ai_tokens: 500000,
      max_vault_size_mb: 0,
      prices: [
        { currency: "usd", monthly: 10, yearly: 100, stripe_monthly_id: "price_ai_500k_usd", stripe_yearly_id: "price_ai_500k_usd_yr" },
        { currency: "idr", monthly: 150000, yearly: 1500000, stripe_monthly_id: "price_ai_500k_idr", stripe_yearly_id: "price_ai_500k_idr_yr" },
        { currency: "jpy", monthly: 1500, yearly: 15000, stripe_monthly_id: "price_ai_500k_jpy", stripe_yearly_id: "price_ai_500k_jpy_yr" },
      ],
    },
    {
      name: "AI 1M Pack",
      description: "Additional 1,000,000 AI tokens per month",
      addon_type: "ai" as const,
      max_ai_tokens: 1000000,
      max_vault_size_mb: 0,
      prices: [
        { currency: "usd", monthly: 18, yearly: 180, stripe_monthly_id: "price_ai_1m_usd", stripe_yearly_id: "price_ai_1m_usd_yr" },
        { currency: "idr", monthly: 270000, yearly: 2700000, stripe_monthly_id: "price_ai_1m_idr", stripe_yearly_id: "price_ai_1m_idr_yr" },
        { currency: "jpy", monthly: 2700, yearly: 27000, stripe_monthly_id: "price_ai_1m_jpy", stripe_yearly_id: "price_ai_1m_jpy_yr" },
      ],
    },
    {
      name: "Vault 5GB Pack",
      description: "Additional 5GB storage per month",
      addon_type: "vault" as const,
      max_ai_tokens: 0,
      max_vault_size_mb: 5120,
      prices: [
        { currency: "usd", monthly: 5, yearly: 50, stripe_monthly_id: "price_vault_5gb_usd", stripe_yearly_id: "price_vault_5gb_usd_yr" },
        { currency: "idr", monthly: 75000, yearly: 750000, stripe_monthly_id: "price_vault_5gb_idr", stripe_yearly_id: "price_vault_5gb_idr_yr" },
        { currency: "jpy", monthly: 750, yearly: 7500, stripe_monthly_id: "price_vault_5gb_jpy", stripe_yearly_id: "price_vault_5gb_jpy_yr" },
      ],
    },
    {
      name: "Vault 20GB Pack",
      description: "Additional 20GB storage per month",
      addon_type: "vault" as const,
      max_ai_tokens: 0,
      max_vault_size_mb: 20480,
      prices: [
        { currency: "usd", monthly: 15, yearly: 150, stripe_monthly_id: "price_vault_20gb_usd", stripe_yearly_id: "price_vault_20gb_usd_yr" },
        { currency: "idr", monthly: 225000, yearly: 2250000, stripe_monthly_id: "price_vault_20gb_idr", stripe_yearly_id: "price_vault_20gb_idr_yr" },
        { currency: "jpy", monthly: 2250, yearly: 22500, stripe_monthly_id: "price_vault_20gb_jpy", stripe_yearly_id: "price_vault_20gb_jpy_yr" },
      ],
    },
  ];

  for (const addon of addons) {
    const existing = await db.query.pricing.findFirst({
      where: eq(pricing.name, addon.name),
    });

    if (existing) {
      await db.update(pricing).set({ ...addon, is_addon: true }).where(eq(pricing.id, existing.id));
      console.log(`Updated addon: ${addon.name}`);
    } else {
      await db.insert(pricing).values({ ...addon, is_addon: true });
      console.log(`Created addon: ${addon.name}`);
    }
  }
}

seedAddons()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
