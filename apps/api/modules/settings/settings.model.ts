import { t, type UnwrapSchema } from "elysia";

export const SettingsModel = {
  transactionSettings: t.Object({
    monthlyStartDate: t.Optional(t.Number()),
    monthlyStartDateWeekendHandling: t.Optional(t.String()),
    weeklyStartDay: t.Optional(t.String()),
    carryOver: t.Optional(t.Boolean()),
    period: t.Optional(t.String()),
    incomeExpensesColor: t.Optional(t.String()),
    autocomplete: t.Optional(t.Boolean()),
    timeInput: t.Optional(t.String()),
    startScreen: t.Optional(t.String()),
    swipeAction: t.Optional(t.String()),
    showDescription: t.Optional(t.Boolean()),
    inputOrder: t.Optional(t.String()),
    noteButton: t.Optional(t.Boolean()),
    mainCurrencyCode: t.Optional(t.String()),
    mainCurrencySymbol: t.Optional(t.String()),
    mainCurrencySymbolPosition: t.Optional(t.String()),
    mainCurrencyDecimalPlaces: t.Optional(t.Number()),
    r2Endpoint: t.Optional(t.Nullable(t.String())),
    r2AccessKeyId: t.Optional(t.Nullable(t.String())),
    r2SecretAccessKey: t.Optional(t.Nullable(t.String())),
    r2BucketName: t.Optional(t.Nullable(t.String())),
    invoiceLogoUrl: t.Optional(t.Nullable(t.String())),
  }),
} as const;

export type TransactionSettingsInput = UnwrapSchema<
  typeof SettingsModel.transactionSettings
>;
