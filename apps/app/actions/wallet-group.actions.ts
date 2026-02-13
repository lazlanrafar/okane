"use server";

import { axiosInstance as api } from "@/lib/axios";

export interface WalletGroup {
  id: string;
  workspaceId: string;
  name: string;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateWalletGroupData {
  name: string;
}

export interface UpdateWalletGroupData {
  name?: string;
  sortOrder?: number;
}

export const getWalletGroups = async (): Promise<WalletGroup[]> => {
  const res = await api.get("/wallet-groups");
  return res.data;
};

export const createWalletGroup = async (data: CreateWalletGroupData) => {
  const res = await api.post("/wallet-groups", data);
  return res.data;
};

export const updateWalletGroup = async (
  id: string,
  data: UpdateWalletGroupData,
) => {
  const res = await api.put(`/wallet-groups/${id}`, data);
  return res.data;
};

export const reorderWalletGroups = async (
  updates: { id: string; sortOrder: number }[],
) => {
  const res = await api.put("/wallet-groups/reorder", { updates });
  return res.data;
};

export const deleteWalletGroup = async (id: string) => {
  const res = await api.delete(`/wallet-groups/${id}`);
  return res.data;
};
