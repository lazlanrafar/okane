import { axiosInstance } from "../../lib/axios";

export interface SyncUserDTO {
  id: string;
  email: string;
  name?: string;
  oauth_provider?: string;
}

export const syncUser = async (user: SyncUserDTO): Promise<void> => {
  try {
    await axiosInstance.post("/users/sync", user);
  } catch (error) {
    console.error("Error syncing user to API:", error);
    throw error;
  }
};
