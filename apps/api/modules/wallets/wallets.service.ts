import { walletsRepository } from "./wallets.repository";
import { walletGroupsRepository } from "./groups/groups.repository";

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

  async getWallets(workspaceId: string) {
    return walletsRepository.findMany(workspaceId);
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
