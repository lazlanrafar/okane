"use server";

import { axiosInstance as api } from "@/lib/axios";

export interface Wallet {
  id: string;
  workspaceId: string;
  groupId: string | null;
  name: string;
  balance: number;
  isIncludedInTotals: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateWalletData {
  name: string;
  groupId?: string | null;
  balance?: string;
  isIncludedInTotals?: boolean;
}

export interface UpdateWalletData {
  name?: string;
  groupId?: string | null;
  balance?: string;
  isIncludedInTotals?: boolean;
  sortOrder?: number;
}

export const getWallets = async (): Promise<Wallet[]> => {
  const res = await api.get("/wallets");
  return res.data;
};

export const createWallet = async (data: CreateWalletData) => {
  const res = await api.post("/wallets", data);
  return res.data;
};

export const updateWallet = async (id: string, data: UpdateWalletData) => {
  const res = await api.put(`/wallets/${id}`, data);
  return res.data;
};

export const reorderWallets = async (
  updates: { id: string; sortOrder: number; groupId?: string | null }[],
) => {
  const res = await api.put("/wallets/reorder", { updates });
  return res.data;
};

export const deleteWallet = async (id: string) => {
  const res = await api.delete(`/wallets/${id}`);
  return res.data;
};
