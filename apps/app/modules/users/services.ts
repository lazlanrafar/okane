import { axiosInstance } from "../../lib/axios";

export interface SyncUserDTO {
  id: string;
  email: string;
  name?: string;
  oauth_provider?: string;
  profile_picture?: string;
  providers?: unknown;
}

export interface SyncUserResponse {
  status: string;
  has_workspace: boolean;
  default_workspace_id: string | null;
}

export const sync_user = async (
  user: SyncUserDTO,
): Promise<SyncUserResponse | null> => {
  try {
    const response = await axiosInstance.post<SyncUserResponse>(
      "/users/sync",
      user,
    );
    return response.data;
  } catch (error) {
    console.error("Error syncing user to API:", error);
    throw error;
  }
};
