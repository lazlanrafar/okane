import { create } from "zustand";
import type { TransactionSettings } from "@workspace/types";
import { INCOME_EXPENSES_COLOR_OPTIONS } from "@workspace/constants";
import { formatCurrency as formatCurrencyUtil } from "@workspace/utils";

interface SettingsState {
  settings: TransactionSettings | null;
  setSettings: (settings: TransactionSettings | null) => void;
  isLoading: boolean;
  setIsLoading: (isLoading: boolean) => void;
  getTransactionColor: (type: string) => string;
  formatCurrency: (amount: number) => string;
}

export const useSettingsStore = create<SettingsState>()((set, get) => ({
  settings: null,
  setSettings: (settings) => set({ settings }),
  isLoading: true,
  setIsLoading: (isLoading) => set({ isLoading }),
  getTransactionColor: (type) => {
    const { settings } = get();
    const option = INCOME_EXPENSES_COLOR_OPTIONS.find(
      (o) => o.value === settings?.incomeExpensesColor,
    );

    if (type === "income") {
      return option?.incomeColor || "text-emerald-600 dark:text-emerald-400";
    }

    if (type === "expense") {
      return option?.expensesColor || "text-red-600 dark:text-red-400";
    }

    if (type === "transfer") {
      return "text-blue-600 dark:text-blue-400";
    }

    return "text-muted-foreground";
  },
  formatCurrency: (amount) => {
    const { settings } = get();
    return formatCurrencyUtil(amount, settings);
  },
}));
