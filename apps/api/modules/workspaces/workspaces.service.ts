import { workspacesRepository } from "./workspaces.repository";
import { usersRepository } from "../users/users.repository";
import { auditLogsService } from "../audit-logs/audit-logs.service";
import {
  DEFAULT_INCOME_CATEGORIES,
  DEFAULT_EXPENSE_CATEGORIES,
  DEFAULT_WALLET_GROUPS,
  DEFAULT_WALLETS,
} from "@workspace/constants";
import { categoriesRepository } from "../categories/categories.repository";
import { SettingsRepository } from "../settings/repository";
import { walletGroupsRepository } from "../wallets/groups/groups.repository";
import { walletsRepository } from "../wallets/wallets.repository";

const settingsRepository = new SettingsRepository();

/**
 * Workspaces service — business logic layer.
 * Workspace validation, slug generation, membership assignment.
 * No HTTP logic. No DB access.
 */
export const workspacesService = {
  /**
   * Create a new workspace and assign creator as owner.
   */
  async createWorkspace(
    user_id: string,
    data: {
      name: string;
      mainCurrencyCode?: string;
      mainCurrencySymbol?: string;
    },
  ) {
    const { name, mainCurrencyCode, mainCurrencySymbol } = data;
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

    // 4. Populate default categories
    const defaultCategories = [
      ...DEFAULT_INCOME_CATEGORIES.map((name) => ({
        workspaceId: workspace.id,
        name,
        type: "income" as const,
      })),
      ...DEFAULT_EXPENSE_CATEGORIES.map((name) => ({
        workspaceId: workspace.id,
        name,
        type: "expense" as const,
      })),
    ];
    await categoriesRepository.createMany(defaultCategories);

    // 5. Create default workspace settings
    await settingsRepository.create(workspace.id, {
      mainCurrencyCode,
      mainCurrencySymbol,
    } as any);

    // 6. Populate default wallet groups
    const defaultGroups = await walletGroupsRepository.createMany(
      DEFAULT_WALLET_GROUPS.map((name) => ({
        workspaceId: workspace.id,
        name,
      })),
    );

    // 7. Populate default wallets
    const walletsToCreate: {
      workspaceId: string;
      groupId: string;
      name: string;
      balance: number;
      isIncludedInTotals: boolean;
    }[] = [];

    for (const groupConfig of DEFAULT_WALLETS) {
      const group = defaultGroups.find((g) => g.name === groupConfig.group);
      if (group) {
        for (const walletConfig of groupConfig.wallets) {
          walletsToCreate.push({
            workspaceId: workspace.id,
            groupId: group.id,
            name: walletConfig.name,
            balance: walletConfig.balance,
            isIncludedInTotals: walletConfig.isIncludedInTotals,
          });
        }
      }
    }

    if (walletsToCreate.length > 0) {
      await walletsRepository.createMany(walletsToCreate);
    }

    // 8. Log action
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
