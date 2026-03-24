import { WalletsRepository } from "./wallets.repository";
import { WalletGroupsRepository } from "./groups/groups.repository";
import { buildPaginatedSuccess } from "@workspace/utils";

export abstract class WalletsService {
  // --- Wallet Groups ---

  static async getGroups(workspaceId: string) {
    return WalletGroupsRepository.findMany(workspaceId);
  }

  static async createGroup(workspaceId: string, data: { name: string }) {
    return WalletGroupsRepository.create({
      workspaceId,
      ...data,
    });
  }

  static async updateGroup(
    workspaceId: string,
    id: string,
    data: { name?: string; sortOrder?: number },
  ) {
    return WalletGroupsRepository.update(id, workspaceId, data);
  }

  static async deleteGroup(workspaceId: string, id: string) {
    return WalletGroupsRepository.delete(id, workspaceId);
  }

  static async reorderGroups(
    workspaceId: string,
    updates: { id: string; sortOrder: number }[],
  ) {
    return WalletGroupsRepository.reorder(workspaceId, updates);
  }

  // --- Wallets ---

  static async getWallets(
    workspaceId: string,
    filters?: { search?: string; groupId?: string; page?: number; limit?: number },
  ) {
    const { rows, total } = await WalletsRepository.findMany(workspaceId, filters);
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
  }

  static async createWallet(
    workspaceId: string,
    data: {
      name: string;
      groupId?: string | null;
      balance?: string;
      isIncludedInTotals?: boolean;
    },
  ) {
    const balance = data.balance ? parseFloat(data.balance) : 0;
    return WalletsRepository.create({
      workspaceId,
      ...data,
      balance,
    });
  }

  static async updateWallet(
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
    return WalletsRepository.update(id, workspaceId, updateData);
  }

  static async deleteWallet(workspaceId: string, id: string) {
    return WalletsRepository.delete(id, workspaceId);
  }

  static async reorderWallets(
    workspaceId: string,
    updates: { id: string; sortOrder: number; groupId?: string | null }[],
  ) {
    return WalletsRepository.reorder(workspaceId, updates);
  }
}
