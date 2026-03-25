import { Elysia } from "elysia";
import { PricingService } from "./pricing.service";

export const publicPricingController = new Elysia({
  prefix: "/public/pricing",
  name: "public-pricing.controller",
}).get(
  "/",
  async () => {
    return PricingService.getPublicPlans();
  },
  {
    detail: {
      summary: "Get Public Pricing",
      description: "Returns all active pricing plans without authentication",
      tags: ["Public"],
    },
  },
);
