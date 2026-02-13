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
}
