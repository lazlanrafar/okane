export const WEEKLY_START_DAY_OPTIONS = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
] as const;

export const PERIOD_OPTIONS = ["Monthly", "Weekly", "Daily", "Yearly"] as const;

export const INCOME_EXPENSES_COLOR_OPTIONS = [
  { label: "Exp.", value: "Exp." },
  { label: "Inc.", value: "Inc." },
] as const;

export const TIME_INPUT_OPTIONS = [
  { label: "None", value: "None" },
  { label: "None, Desc.", value: "None, Desc." },
  { label: "Time", value: "Time" },
] as const;

export const START_SCREEN_OPTIONS = [
  "Daily",
  "Calendar",
  "Weekly",
  "Monthly",
  "Summary",
] as const;

export const SWIPE_ACTION_OPTIONS = ["Change Date", "Delete", "None"] as const;

export const INPUT_ORDER_OPTIONS = [
  { label: "From Amount", value: "Amount" },
  { label: "From Category", value: "Category" },
] as const;
