"use server";

import { axiosInstance } from "../lib/axios";
import type { User, WorkspaceWithRole, ActionResponse } from "@workspace/types";
import { cookies } from "next/headers";
import { createClient } from "@workspace/supabase/server";
import { exchangeSupabaseToken } from "./auth.actions";
import { revalidatePath } from "next/cache";

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

export const switchWorkspaceAction = async (
  workspace_id: string,
): Promise<ActionResponse<void>> => {
  try {
    // 1. Update active workspace in DB via API
    await axiosInstance.patch("users/me/workspace", { workspace_id });

    // 2. Refresh app JWT
    const supabase = await createClient();
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (session?.access_token) {
      const exchangeResult = await exchangeSupabaseToken(session.access_token);

      if (exchangeResult.success && exchangeResult.data) {
        (await cookies()).set("okane-session", exchangeResult.data.token, {
          path: "/",
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          maxAge: 60 * 60 * 24 * 7, // 7 days
        });
      }
    }

    revalidatePath("/[locale]/dashboard", "layout");
    return { success: true, data: undefined };
  } catch (error: any) {
    return {
      success: false,
      error: error.response?.data?.message || "Failed to switch workspace",
    };
  }
};
