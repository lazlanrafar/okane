export function formatCurrency(
  amount: number,
  settings?: {
    mainCurrencySymbol?: string;
    mainCurrencySymbolPosition?: string;
    mainCurrencyDecimalPlaces?: number;
  } | null,
  options?: {
    compact?: boolean;
  },
) {
  if (!settings) {
    return amount.toLocaleString("en-US", {
      style: "currency",
      currency: "USD",
      notation: options?.compact ? "compact" : "standard",
    });
  }

  const {
    mainCurrencySymbol = "$",
    mainCurrencySymbolPosition = "Front",
    mainCurrencyDecimalPlaces = 2,
  } = settings;

  const formattedAmount = Math.abs(amount).toLocaleString(undefined, {
    minimumFractionDigits: options?.compact ? 0 : mainCurrencyDecimalPlaces,
    maximumFractionDigits: options?.compact ? 1 : mainCurrencyDecimalPlaces,
    notation: options?.compact ? "compact" : "standard",
  });

  const sign = amount < 0 ? "-" : "";

  if (mainCurrencySymbolPosition === "Front") {
    return `${sign}${mainCurrencySymbol}${formattedAmount}`;
  }

  return `${sign}${formattedAmount}${mainCurrencySymbol}`;
}
