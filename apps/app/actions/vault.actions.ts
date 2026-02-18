"use server";

import { axiosInstance as api } from "@/lib/axios";
import type { ActionResponse } from "@workspace/types";

export interface VaultFile {
  id: string;
  workspaceId: string;
  name: string;
  key: string;
  size: number;
  type: string;
  metadata: string | null;
  url: string;
  createdAt: string;
  updatedAt: string;
}

export const getVaultFiles = async (): Promise<ActionResponse<VaultFile[]>> => {
  try {
    const res = await api.get("/vault");
    return { success: true, data: res.data };
  } catch (error: any) {
    return {
      success: false,
      error: error.response?.data?.message || "Failed to fetch vault files",
    };
  }
};

export const uploadVaultFile = async (
  formData: FormData,
): Promise<ActionResponse<VaultFile>> => {
  try {
    const res = await api.post("/vault/upload", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return { success: true, data: res.data };
  } catch (error: any) {
    return {
      success: false,
      error: error.response?.data?.message || "Upload failed",
    };
  }
};

export const deleteVaultFile = async (
  id: string,
): Promise<ActionResponse<void>> => {
  try {
    const res = await api.delete(`/vault/${id}`);
    return { success: true, data: res.data };
  } catch (error: any) {
    return {
      success: false,
      error: error.response?.data?.message || "Failed to delete file",
    };
  }
};

export const getVaultDownloadUrl = async (
  id: string,
): Promise<ActionResponse<{ url: string }>> => {
  try {
    const res = await api.get(`/vault/${id}/download`);
    return { success: true, data: res.data };
  } catch (error: any) {
    return {
      success: false,
      error: error.response?.data?.message || "Failed to generate download URL",
    };
  }
};
