import { usersRepository } from "./users.repository";
import { auditLogsService } from "../audit-logs/audit-logs.service";
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
};
