import { db } from "../client";
import { pricing } from "../schema/pricing";
import { eq } from "drizzle-orm";
import Stripe from "stripe";
import "dotenv/config";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: "2024-12-18.acacia" as any, // Bypass TS error for unknown API versions
});

async function main() {
  console.log("🚀 Setting up Stripe products and prices...");

  const plans = await db
    .select()
    .from(pricing)
    .where(eq(pricing.is_active, true));

  for (const plan of plans) {
    if (!plan.price_monthly && !plan.price_yearly && !plan.price_one_time) {
      console.log(`\n⏭  Skipping free plan: ${plan.name}`);
      continue;
    }

    console.log(`\n📦 Processing plan: ${plan.name}`);

    // Create or retrieve product
    let productId = plan.stripe_product_id;
    if (!productId) {
      const product = await stripe.products.create({
        name: plan.name,
        description: plan.description || undefined,
      });
      productId = product.id;
      console.log(`  ✅ Created Stripe Product: ${productId}`);
    } else {
      console.log(`  ✅ Using existing Product: ${productId}`);
    }

    let priceIdMonthly = plan.stripe_price_id_monthly;
    let priceIdYearly = plan.stripe_price_id_yearly;
    let priceIdOneTime = plan.stripe_price_id_one_time;

    // Create Monthly Price
    if (plan.price_monthly && !priceIdMonthly) {
      const price = await stripe.prices.create({
        product: productId,
        unit_amount: plan.price_monthly,
        currency: plan.currency.toLowerCase(),
        recurring: { interval: "month" },
      });
      priceIdMonthly = price.id;
      console.log(
        `  ✅ Created Monthly Price: ${priceIdMonthly} ($${(plan.price_monthly / 100).toFixed(2)})`,
      );
    }

    // Create Yearly Price
    if (plan.price_yearly && !priceIdYearly) {
      const price = await stripe.prices.create({
        product: productId,
        unit_amount: plan.price_yearly,
        currency: plan.currency.toLowerCase(),
        recurring: { interval: "year" },
      });
      priceIdYearly = price.id;
      console.log(
        `  ✅ Created Yearly Price: ${priceIdYearly} ($${(plan.price_yearly / 100).toFixed(2)})`,
      );
    }

    // Create One Time Price
    if (plan.price_one_time && !priceIdOneTime) {
      const price = await stripe.prices.create({
        product: productId,
        unit_amount: plan.price_one_time,
        currency: plan.currency.toLowerCase(),
      });
      priceIdOneTime = price.id;
      console.log(
        `  ✅ Created One-Time Price: ${priceIdOneTime} ($${(plan.price_one_time / 100).toFixed(2)})`,
      );
    }

    // Update database
    await db
      .update(pricing)
      .set({
        stripe_product_id: productId,
        stripe_price_id_monthly: priceIdMonthly,
        stripe_price_id_yearly: priceIdYearly,
        stripe_price_id_one_time: priceIdOneTime,
      })
      .where(eq(pricing.id, plan.id));

    console.log(`  💾 Updated database for ${plan.name}`);
  }

  console.log("\n✨ Done! Stripe products and database are now in sync.\n");
  process.exit(0);
}

main().catch((err) => {
  console.error("❌ Error setting up Stripe:", err);
  process.exit(1);
});
