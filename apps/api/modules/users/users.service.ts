import { usersRepository } from "./users.repository";
import { auditLogsService } from "../audit-logs/audit-logs.service";

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
    providers?: unknown;
  }) {
    // 1. Upsert user
    await usersRepository.upsert({
      id: data.id,
      email: data.email,
      name: data.name,
      oauth_provider: data.oauth_provider,
      profile_picture: data.profile_picture,
      providers: data.providers ? String(data.providers) : null,
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
};
