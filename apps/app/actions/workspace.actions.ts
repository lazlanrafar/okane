"use server";

import { axiosInstance } from "../lib/axios";
import type {
  Workspace,
  WorkspaceWithRole,
  ActionResponse,
} from "@workspace/types";

export interface CreateWorkspaceDTO {
  name: string;
  mainCurrencyCode?: string;
  mainCurrencySymbol?: string;
}

export const createWorkspace = async (
  data: CreateWorkspaceDTO,
): Promise<ActionResponse<Workspace>> => {
  try {
    const response = await axiosInstance.post("workspaces", data);
    return { success: true, data: response.data };
  } catch (error: any) {
    return {
      success: false,
      error: error.response?.data?.message || "Failed to create workspace",
    };
  }
};

export const getMyWorkspaces = async (): Promise<
  ActionResponse<WorkspaceWithRole[]>
> => {
  try {
    const response = await axiosInstance.get("workspaces");
    return { success: true, data: response.data };
  } catch (error: any) {
    return {
      success: false,
      error: error.response?.data?.message || "Failed to fetch workspaces",
    };
  }
};

// Backward-compatible aliases (snake_case → camelCase)
export const create_workspace = createWorkspace;
export const get_my_workspaces = getMyWorkspaces;

export const getWorkspaceMembers = async (
  workspaceId: string,
): Promise<ActionResponse<any>> => {
  try {
    const response = await axiosInstance.get(
      `workspaces/${workspaceId}/members`,
    );
    return { success: true, data: response.data };
  } catch (error: any) {
    return {
      success: false,
      error: error.response?.data?.message || "Failed to fetch members",
    };
  }
};

export const inviteMember = async (
  workspaceId: string,
  email: string,
  role: "admin" | "member",
): Promise<ActionResponse<any>> => {
  try {
    const response = await axiosInstance.post(
      `workspaces/${workspaceId}/invitations`,
      { email, role },
    );
    return { success: true, data: response.data };
  } catch (error: any) {
    return {
      success: false,
      error: error.response?.data?.message || "Failed to send invitation",
    };
  }
};

export const getWorkspaceInvitations = async (
  workspaceId: string,
): Promise<ActionResponse<any>> => {
  try {
    const response = await axiosInstance.get(
      `workspaces/${workspaceId}/invitations`,
    );
    return { success: true, data: response.data };
  } catch (error: any) {
    return {
      success: false,
      error: error.response?.data?.message || "Failed to fetch invitations",
    };
  }
};

export const cancelInvitation = async (
  workspaceId: string,
  invitationId: string,
): Promise<ActionResponse<any>> => {
  try {
    const response = await axiosInstance.delete(
      `workspaces/${workspaceId}/invitations/${invitationId}`,
    );
    return { success: true, data: response.data };
  } catch (error: any) {
    return {
      success: false,
      error: error.response?.data?.message || "Failed to cancel invitation",
    };
  }
};
