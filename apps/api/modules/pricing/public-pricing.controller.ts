import { db, pricing } from "@workspace/database";
import { buildSuccess } from "@workspace/utils";
import { eq, isNull } from "drizzle-orm";
import { Elysia } from "elysia";

export const publicPricingController = new Elysia({
  prefix: "/public/pricing",
  name: "public-pricing.controller",
}).get(
  "/",
  async () => {
    const plans = await db
      .select()
      .from(pricing)
      .where(eq(pricing.is_active, true));

    const formattedPlans = plans.map((plan) => ({
      id: plan.id,
      name: plan.name,
      description: plan.description,
      prices: plan.prices,
      features: plan.features,
      is_highlighted: plan.name === "Pro",
    }));

    return buildSuccess(formattedPlans, "Pricing plans retrieved");
  },
  {
    detail: {
      summary: "Get Public Pricing",
      description: "Returns all active pricing plans without authentication",
      tags: ["Public"],
    },
  },
);
