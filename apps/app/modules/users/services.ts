import { axiosInstance } from "../../lib/axios";
import type { User, WorkspaceWithRole } from "@workspace/types";

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
): Promise<SyncUserResponse | null> => {
  try {
    const response = await axiosInstance.post<SyncUserResponse>(
      "users/sync",
      user,
    );
    return response.data;
  } catch (error) {
    console.error("Error syncing user to API:", error);
    throw error;
  }
};

export const getMe = async (
  token: string,
): Promise<{ user: User; workspaces: WorkspaceWithRole[] }> => {
  const response = await axiosInstance.get("users/me", {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

// Backward-compatible aliases (snake_case → camelCase)
export const sync_user = syncUser;
export const get_me = getMe;
