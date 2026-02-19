export interface Transaction {
  id: string;
  workspaceId: string;
  walletId: string;
  toWalletId?: string | null;
  categoryId?: string | null;
  amount: string; // Decimal is string in JS
  date: string;
  type: string; // 'income' | 'expense' | 'transfer'
  description?: string | null;
  note?: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
  wallet?: { id: string; name: string };
  toWallet?: { id: string; name: string } | null;
  category?: { id: string; name: string } | null;
}
