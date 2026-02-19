export interface Wallet {
  id: string;
  workspaceId: string;
  groupId?: string | null;
  name: string;
  balance: number;
  isIncludedInTotals: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
}
