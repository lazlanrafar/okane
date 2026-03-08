export const TRANSACTION_TYPES = {
  INCOME: "income",
  EXPENSE: "expense",
  TRANSFER: "transfer",
  TRANSFER_IN: "transfer-in",
  TRANSFER_OUT: "transfer-out",
} as const;

export type TransactionType =
  (typeof TRANSACTION_TYPES)[keyof typeof TRANSACTION_TYPES];

export const TRANSACTION_TYPE_LABELS: Record<TransactionType, string> = {
  [TRANSACTION_TYPES.INCOME]: "Income",
  [TRANSACTION_TYPES.EXPENSE]: "Exp.",
  [TRANSACTION_TYPES.TRANSFER]: "Transfer",
  [TRANSACTION_TYPES.TRANSFER_IN]: "Transfer-In",
  [TRANSACTION_TYPES.TRANSFER_OUT]: "Transfer-Out",
};

export const TRANSACTION_TYPE_MAP: Record<TransactionType, string[]> = {
  [TRANSACTION_TYPES.INCOME]: [
    "income",
    "pemasukan",
    "incm",
    "in",
    "credit",
    "cr",
  ],
  [TRANSACTION_TYPES.EXPENSE]: [
    "expense",
    "pengeluaran",
    "exp",
    "exp.",
    "out",
    "debit",
    "dr",
  ],
  [TRANSACTION_TYPES.TRANSFER]: ["transfer", "pindahan"],
  [TRANSACTION_TYPES.TRANSFER_IN]: [
    "transfer-in",
    "pindahan-masuk",
    "transfer in",
  ],
  [TRANSACTION_TYPES.TRANSFER_OUT]: [
    "transfer-out",
    "pindahan-keluar",
    "transfer out",
  ],
};
