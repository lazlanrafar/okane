import { axiosInstance } from "../../lib/axios";

export interface CreateWorkspaceDTO {
  name: string;
}

export interface Workspace {
  id: string;
  name: string;
  slug: string;
  role?: string;
}

export const create_workspace = async (
  data: CreateWorkspaceDTO,
  token: string,
): Promise<{ workspace: Workspace }> => {
  const response = await axiosInstance.post("/workspaces", data, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

export const get_my_workspaces = async (
  token: string,
): Promise<{ workspaces: Workspace[] }> => {
  const response = await axiosInstance.get("/workspaces", {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

export interface UserProfile {
  id: string;
  email: string;
  name: string | null;
  profile_picture: string | null;
  default_workspace_id: string | null;
}

export const get_me = async (
  token: string,
): Promise<{ user: UserProfile; workspaces: Workspace[] }> => {
  const response = await axiosInstance.get("/users/me", {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};
