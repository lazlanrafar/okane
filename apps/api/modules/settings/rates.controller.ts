import { Elysia, t } from "elysia";
import { isAuthenticated } from "../auth/utils";
import { buildSuccess } from "@workspace/utils";
import { convertCurrency, getRates } from "@workspace/currencyfreaks";

export const ratesController = new Elysia({ prefix: "/rates" })
  .use(isAuthenticated)
  .get(
    "/",
    async ({ query }) => {
      const base = query.base || "USD";
      const rates = await getRates();

      // If base is USD, we can return rates directly
      if (base === "USD") {
        return buildSuccess(
          rates.rates,
          "Exchange rates retrieved successfully",
        );
      }

      // Otherwise, we need to recalculate rates relative to the new base
      const baseRate = Number(rates.rates[base]);
      if (!baseRate) {
        throw new Error(`Invalid base currency: ${base}`);
      }

      const recalculatedRates: Record<string, string> = {};
      for (const [code, rateStr] of Object.entries(rates.rates)) {
        const rate = Number(rateStr);
        recalculatedRates[code] = (rate / baseRate).toString();
      }

      return buildSuccess(
        recalculatedRates,
        "Exchange rates retrieved successfully",
      );
    },
    {
      query: t.Object({
        base: t.Optional(t.String()),
      }),
      detail: {
        summary: "Get exchange rates",
        tags: ["Settings"],
      },
    },
  )
  .get(
    "/convert",
    async ({ query }) => {
      const { amount, from, to } = query;
      const result = await convertCurrency({
        amount: Number(amount),
        from,
        to,
      });
      return buildSuccess(result, "Currency converted successfully");
    },
    {
      query: t.Object({
        amount: t.String(),
        from: t.String(),
        to: t.String(),
      }),
      detail: {
        summary: "Convert currency",
        tags: ["Settings"],
      },
    },
  );
