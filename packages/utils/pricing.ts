import type { Pricing } from "@workspace/types";
import { formatCurrency } from "./currency";

export function isFree(plan: Pricing) {
  return !plan.price_monthly && !plan.price_yearly && !plan.price_one_time;
}

export function annualSavingsPct(plan: Pricing): number | null {
  if (!plan.price_monthly || !plan.price_yearly) return null;
  return Math.round(
    ((plan.price_monthly * 12 - plan.price_yearly) /
      (plan.price_monthly * 12)) *
      100,
  );
}

export function getStripePrice(
  plan: Pricing,
  billing: "monthly" | "annual",
): string | null {
  if (isFree(plan)) return null;
  if (billing === "annual" && plan.stripe_price_id_yearly)
    return plan.stripe_price_id_yearly;
  if (plan.stripe_price_id_monthly) return plan.stripe_price_id_monthly;
  if (plan.stripe_price_id_yearly) return plan.stripe_price_id_yearly;
  if (plan.stripe_price_id_one_time) return plan.stripe_price_id_one_time;
  return null;
}

export function displayPrice(
  plan: Pricing,
  billing: "monthly" | "annual",
  opts?: {
    showCents?: boolean;
    currencySymbol?: string;
  },
): {
  label: string;
  note?: string;
} {
  const { showCents = false, currencySymbol = "$" } = opts ?? {};

  if (isFree(plan)) return { label: "Free" };

  if (billing === "annual" && plan.price_yearly != null) {
    const perMonth = Math.round(plan.price_yearly / 12);
    return {
      label: formatCurrency(perMonth / 100, {
        mainCurrencySymbol: currencySymbol,
        mainCurrencyDecimalPlaces: showCents ? 2 : 0,
      }),
      note: "/ mo, billed annually",
    };
  }
  if (plan.price_monthly != null) {
    return {
      label: formatCurrency(plan.price_monthly / 100, {
        mainCurrencySymbol: currencySymbol,
        mainCurrencyDecimalPlaces: showCents ? 2 : 0,
      }),
      note: "/ month",
    };
  }
  if (plan.price_one_time != null) {
    return {
      label: formatCurrency(plan.price_one_time / 100, {
        mainCurrencySymbol: currencySymbol,
        mainCurrencyDecimalPlaces: showCents ? 2 : 0,
      }),
      note: "one-time",
    };
  }
  return { label: "Free" };
}

export function getPlanLimits(plan: Pricing) {
  return {
    vaultLimitBytes: (plan.max_vault_size_mb || 0) * 1024 * 1024,
    aiLimitTokens: plan.max_ai_tokens || 0,
  };
}
