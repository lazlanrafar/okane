import { walletsRepository } from "./wallets.repository";
import { walletGroupsRepository } from "./groups/groups.repository";
import { buildPaginatedSuccess } from "@workspace/utils";

export const walletsService = {
  // --- Wallet Groups ---

  async getGroups(workspaceId: string) {
    return walletGroupsRepository.findMany(workspaceId);
  },

  async createGroup(workspaceId: string, data: { name: string }) {
    return walletGroupsRepository.create({
      workspaceId,
      ...data,
    });
  },

  async updateGroup(
    workspaceId: string,
    id: string,
    data: { name?: string; sortOrder?: number },
  ) {
    return walletGroupsRepository.update(id, workspaceId, data);
  },

  async deleteGroup(workspaceId: string, id: string) {
    return walletGroupsRepository.delete(id, workspaceId);
  },

  async reorderGroups(
    workspaceId: string,
    updates: { id: string; sortOrder: number }[],
  ) {
    return walletGroupsRepository.reorder(workspaceId, updates);
  },

  // --- Wallets ---

  async getWallets(
    workspaceId: string,
    filters?: { search?: string; groupId?: string; page?: number; limit?: number },
  ) {
    const { rows, total } = await walletsRepository.findMany(workspaceId, filters);
    const page = filters?.page ?? 1;
    const limit = filters?.limit ?? 20;

    return buildPaginatedSuccess(
      rows,
      {
        total,
        page,
        limit,
        total_pages: Math.ceil(total / limit),
      },
      "Wallets retrieved successfully",
    );
  },

  async createWallet(
    workspaceId: string,
    data: {
      name: string;
      groupId?: string | null;
      balance?: string;
      isIncludedInTotals?: boolean;
    },
  ) {
    const balance = data.balance ? parseFloat(data.balance) : 0;
    return walletsRepository.create({
      workspaceId,
      ...data,
      balance,
    });
  },

  async updateWallet(
    workspaceId: string,
    id: string,
    data: {
      name?: string;
      groupId?: string | null;
      balance?: string;
      isIncludedInTotals?: boolean;
      sortOrder?: number;
    },
  ) {
    const updateData: any = { ...data };
    if (data.balance !== undefined) {
      updateData.balance = parseFloat(data.balance);
    }
    return walletsRepository.update(id, workspaceId, updateData);
  },

  async deleteWallet(workspaceId: string, id: string) {
    return walletsRepository.delete(id, workspaceId);
  },

  async reorderWallets(
    workspaceId: string,
    updates: { id: string; sortOrder: number; groupId?: string | null }[],
  ) {
    return walletsRepository.reorder(workspaceId, updates);
  },
};
