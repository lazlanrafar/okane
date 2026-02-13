import { axiosInstance } from "../lib/axios";
import type { Workspace, WorkspaceWithRole } from "@workspace/types";

export interface CreateWorkspaceDTO {
  name: string;
}

export const createWorkspace = async (
  data: CreateWorkspaceDTO,
  token?: string,
): Promise<Workspace> => {
  const headers = token ? { Authorization: `Bearer ${token}` } : {};
  const response = await axiosInstance.post("workspaces", data, {
    headers,
  });
  return response.data;
};

export const getMyWorkspaces = async (
  token?: string,
): Promise<WorkspaceWithRole[]> => {
  const headers = token ? { Authorization: `Bearer ${token}` } : {};
  const response = await axiosInstance.get("workspaces", {
    headers,
  });
  return response.data;
};

/**
 * Exchange a Supabase token for an app JWT.
 */
export const exchangeToken = async (
  supabase_token: string,
): Promise<{ token: string; user_id: string; workspace_id: string | null }> => {
  const response = await axiosInstance.post(
    "auth/token",
    {},
    { headers: { Authorization: `Bearer ${supabase_token}` } },
  );
  return response.data;
};

// Backward-compatible aliases (snake_case → camelCase)
export const create_workspace = createWorkspace;
export const get_my_workspaces = getMyWorkspaces;

// Re-export get_me from users/services for backward compatibility
export { get_me, getMe } from "./user.actions";
