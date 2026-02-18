"use server";

import { axiosInstance } from "../lib/axios";
import type { User, WorkspaceWithRole, ActionResponse } from "@workspace/types";

export interface SyncUserDTO {
  id: string;
  email: string;
  name?: string;
  oauth_provider?: string;
  profile_picture?: string;
  providers?: unknown;
}

export interface SyncUserResponse {
  has_workspace: boolean;
  workspace_id: string | null;
}

export const syncUser = async (
  user: SyncUserDTO,
): Promise<ActionResponse<SyncUserResponse>> => {
  try {
    const response = await axiosInstance.post<SyncUserResponse>(
      "users/sync",
      user,
    );
    return { success: true, data: response.data };
  } catch (error: any) {
    return {
      success: false,
      error: error.response?.data?.message || "Failed to sync user",
    };
  }
};

export const getMe = async (): Promise<
  ActionResponse<{ user: User; workspaces: WorkspaceWithRole[] }>
> => {
  try {
    // Note: token is handled by axiosInstance interceptor from okane-session cookie
    const response = await axiosInstance.get("users/me");
    return { success: true, data: response.data };
  } catch (error: any) {
    return {
      success: false,
      error: error.response?.data?.message || "Failed to fetch user data",
    };
  }
};

// Backward-compatible aliases (snake_case → camelCase)
export const sync_user = syncUser;
export const get_me = getMe;
