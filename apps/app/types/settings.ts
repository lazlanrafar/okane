export interface TransactionSettings {
  id: string;
  workspaceId: string;
  monthlyStartDate: number;
  monthlyStartDateWeekendHandling:
    | "no-changes"
    | "previous-friday"
    | "following-monday";
  weeklyStartDay: string;
  carryOver: boolean;
  period: string;
  incomeExpensesColor: string;
  autocomplete: boolean;
  timeInput: string;
  startScreen: string;
  swipeAction: string;
  showDescription: boolean;
  inputOrder: string;
  noteButton: boolean;
  mainCurrencyCode: string;
  mainCurrencySymbol: string;
  mainCurrencySymbolPosition: "Front" | "Back";
  mainCurrencyDecimalPlaces: number;
}

export interface SubCurrency {
  id: string;
  workspaceId: string;
  currencyCode: string;
  createdAt: string;
}
