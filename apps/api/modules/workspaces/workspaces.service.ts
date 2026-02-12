import { workspacesRepository } from "./workspaces.repository";
import { usersRepository } from "../users/users.repository";
import { auditLogsService } from "../audit-logs/audit-logs.service";

/**
 * Workspaces service — business logic layer.
 * Workspace validation, slug generation, membership assignment.
 * No HTTP logic. No DB access.
 */
export const workspacesService = {
  /**
   * Create a new workspace and assign creator as owner.
   */
  async createWorkspace(user_id: string, name: string) {
    // Generate slug
    const base_slug =
      name.toLowerCase().replace(/[^a-z0-9]/g, "-") || "workspace";
    const random_suffix = Math.random().toString(36).substring(2, 7);
    const slug = `${base_slug}-${random_suffix}`;

    // Create workspace
    const workspace = await workspacesRepository.create({ name, slug });
    if (!workspace) {
      throw new Error("Failed to create workspace");
    }

    // Add user as owner (not admin — per rules, creator = owner)
    await workspacesRepository.addMember({
      workspace_id: workspace.id,
      user_id,
      role: "owner",
    });

    // Set as user's active workspace if they don't have one
    const current_workspace_id = await usersRepository.getWorkspaceId(user_id);
    if (!current_workspace_id) {
      await usersRepository.setWorkspaceId(user_id, workspace.id);
    }

    // 4. Log action
    await auditLogsService.log({
      workspace_id: workspace.id,
      user_id,
      action: "workspace.created",
      entity: "workspace",
      entity_id: workspace.id,
      after: {
        name: workspace.name,
        slug: workspace.slug,
      },
    });

    return {
      id: workspace.id,
      name: workspace.name,
      slug: workspace.slug,
    };
  },

  /**
   * List all workspaces the user is a member of.
   */
  async listWorkspaces(user_id: string) {
    return workspacesRepository.getMemberWorkspaces(user_id);
  },
};
