export interface Category {
  id: string;
  workspaceId: string;
  name: string;
  type: "income" | "expense";
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
}
