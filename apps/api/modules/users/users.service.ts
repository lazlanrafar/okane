import { usersRepository } from "./users.repository";
import { auditLogsService } from "../audit-logs/audit-logs.service";
import { createClient } from "@workspace/supabase/server";
import * as fs from "node:fs";
import * as path from "node:path";

/**
 * Users service — business logic layer.
 * Handles workspace validation, calls repository.
 * No HTTP logic. No DB access.
 */
export const usersService = {
  /**
   * Sync a user from Supabase Auth to the internal database.
   * Returns workspace status.
   */
  async syncUser(data: {
    id: string;
    email: string;
    name?: string | null;
    oauth_provider?: string | null;
    profile_picture?: string | null;
    providers?: string[] | null;
  }) {
    const log_file = path.join(process.cwd(), "debug-sync.log");
    try {
      // 1. Validate ID format (must be UUID)
      const uuidRegex =
        /^[0-9a-f]{8}-[0-9a-f]{4}-[4][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      if (!uuidRegex.test(data.id)) {
        throw new Error(`Invalid UUID format for provider ID: ${data.id}`);
      }

      // Ensure providers is an array if provided
      const providers = Array.isArray(data.providers) ? data.providers : null;

      // 2. Upsert user
      await usersRepository.upsert({
        id: data.id,
        email: data.email,
        name: data.name,
        oauth_provider: data.oauth_provider,
        profile_picture: data.profile_picture,
        providers: providers,
      });

      // 2. Check workspace membership
      const memberships = await usersRepository.getMemberships(data.id);
      const has_workspace = memberships.length > 0;
      let workspace_id: string | null = null;

      if (has_workspace) {
        const current_workspace_id = await usersRepository.getWorkspaceId(
          data.id,
        );
        workspace_id =
          current_workspace_id ?? memberships[0]?.workspace_id ?? null;
      }

      // 3. Log action (only if workspace_id found)
      if (workspace_id) {
        await auditLogsService.log({
          workspace_id,
          user_id: data.id,
          action: "user.synced",
          entity: "user",
          entity_id: data.id,
        });
      }

      return { has_workspace, workspace_id };
    } catch (error: any) {
      fs.appendFileSync(
        log_file,
        `[${new Date().toISOString()}] Sync Error: ${error.message}\nStack: ${error.stack}\nData: ${JSON.stringify(data)}\n\n`,
      );
      throw error;
    }
  },

  /**
   * Get current user profile with workspaces.
   */
  async getProfile(user_id: string) {
    const user = await usersRepository.findById(user_id);
    if (!user) return null;

    const workspaces = await usersRepository.getWorkspacesWithRole(user_id);

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        profile_picture: user.profile_picture,
        workspace_id: user.workspace_id,
      },
      workspaces,
    };
  },
  /**
   * Update the user's active workspace.
   */
  async updateActiveWorkspace(user_id: string, workspace_id: string) {
    // 1. Verify membership
    const memberships = await usersRepository.getMemberships(user_id);
    const isMember = memberships.some((m) => m.workspace_id === workspace_id);

    if (!isMember) {
      throw new Error("User is not a member of this workspace");
    }

    // 2. Update active workspace
    await usersRepository.setWorkspaceId(user_id, workspace_id);

    // 3. Log action
    await auditLogsService.log({
      workspace_id,
      user_id,
      action: "user.workspace_switched",
      entity: "user",
      entity_id: user_id,
    });
  },

  /**
   * Update user profile.
   */
  async updateProfile(user_id: string, data: { name?: string; bio?: string }) {
    await usersRepository.update(user_id, data);
  },

  /**
   * Get linked providers.
   */
  async getProviders(user_id: string) {
    const supabase = await createClient();
    const {
      data: { user },
      error,
    } = await supabase.auth.admin.getUserById(user_id);

    if (error || !user) {
      throw new Error(error?.message || "User not found in Supabase");
    }

    return {
      providers: user.app_metadata.providers || [],
      identities: user.identities || [],
    };
  },

  /**
   * Disconnect a provider.
   */
  async disconnectProvider(user_id: string, provider: string) {
    const supabase = await createClient();

    // 1. Get user to find identity ID for this provider
    const {
      data: { user },
      error: getError,
    } = await supabase.auth.admin.getUserById(user_id);

    if (getError || !user) {
      throw new Error(getError?.message || "User not found");
    }

    const identity = user.identities?.find((i: any) => i.provider === provider);
    if (!identity) {
      throw new Error(`Provider ${provider} not linked`);
    }

    // 2. Unlink identity
    // Supabase admin SDK might not have "unlink" directly in all versions.
    // However, if we are on a version that supports it:
    if ("unlinkIdentity" in supabase.auth.admin) {
      // @ts-ignore
      const { error: unlinkErr } = await supabase.auth.admin.unlinkIdentity(
        identity.id,
      );
      if (unlinkErr) throw unlinkErr;
    } else {
      throw new Error("Unlink identity not supported by this SDK version");
    }

    // 3. Update internal providers list
    const updatedProviders =
      user.app_metadata.providers?.filter((p: string) => p !== provider) || [];
    await usersRepository.update(user_id, { providers: updatedProviders });
  },
};
