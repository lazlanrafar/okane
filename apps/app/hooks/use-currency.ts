import { useQuery } from "@tanstack/react-query";
import { getTransactionSettings } from "@/actions/setting.actions";
import { formatCurrency } from "@/lib/currency";
import * as React from "react";

export function useCurrency() {
  const { data: settings, isLoading } = useQuery({
    queryKey: ["transaction-settings"],
    queryFn: async () => {
      const result = await getTransactionSettings();
      if (result.success) return result.data;
      return null;
    },
    staleTime: 1000 * 60 * 60, // 1 hour
  });

  const formatAmount = React.useCallback(
    (amount: number) => {
      return formatCurrency(amount, settings);
    },
    [settings],
  );

  return {
    formatAmount,
    settings,
    isLoading,
  };
}
