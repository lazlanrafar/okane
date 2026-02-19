import { t } from "elysia";

export const CreateTransactionBody = t.Object({
  walletId: t.String(),
  toWalletId: t.Optional(t.String()),
  categoryId: t.Optional(t.String()),
  amount: t.Numeric(), // Will need to handle string/number conversion carefully if decimal
  date: t.String(), // ISO string
  type: t.Union([
    t.Literal("income"),
    t.Literal("expense"),
    t.Literal("transfer"),
  ]),
  description: t.Optional(t.String()),
  note: t.Optional(t.String()),
});

export const UpdateTransactionBody = t.Object({
  walletId: t.Optional(t.String()),
  toWalletId: t.Optional(t.String()),
  categoryId: t.Optional(t.String()),
  amount: t.Optional(t.Numeric()),
  date: t.Optional(t.String()),
  type: t.Optional(
    t.Union([t.Literal("income"), t.Literal("expense"), t.Literal("transfer")]),
  ),
  description: t.Optional(t.String()),
  note: t.Optional(t.String()),
});

export const GetTransactionsQuery = t.Object({
  page: t.Optional(t.Numeric()), // integer
  limit: t.Optional(t.Numeric()), // integer
  type: t.Optional(
    t.Union([t.Literal("income"), t.Literal("expense"), t.Literal("transfer")]),
  ),
  walletId: t.Optional(t.String()),
  categoryId: t.Optional(t.String()),
  startDate: t.Optional(t.String()),
  endDate: t.Optional(t.String()),
});
