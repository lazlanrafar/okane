export interface TransactionSettings {
  id: string;
  workspaceId: string;
  monthlyStartDate: number;
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
