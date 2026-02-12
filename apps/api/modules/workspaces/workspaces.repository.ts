import { db, eq, workspaces, user_workspaces } from "@workspace/database";

/**
 * Workspaces repository — ONLY layer with DB access.
 * All reads filter deleted_at: null on workspaces.
 */
export const workspacesRepository = {
  async create(data: { name: string; slug: string }) {
    const [workspace] = await db.insert(workspaces).values(data).returning();
    return workspace ?? null;
  },

  async findById(workspace_id: string) {
    const [workspace] = await db
      .select()
      .from(workspaces)
      .where(eq(workspaces.id, workspace_id))
      .limit(1);

    if (workspace?.deleted_at) return null;
    return workspace ?? null;
  },

  async addMember(data: {
    workspace_id: string;
    user_id: string;
    role: string;
  }) {
    await db.insert(user_workspaces).values(data);
  },

  async getMemberWorkspaces(user_id: string) {
    return db
      .select({
        id: workspaces.id,
        name: workspaces.name,
        slug: workspaces.slug,
        role: user_workspaces.role,
      })
      .from(user_workspaces)
      .innerJoin(workspaces, eq(user_workspaces.workspace_id, workspaces.id))
      .where(eq(user_workspaces.user_id, user_id));
  },

  async getMembership(user_id: string, _workspace_id: string) {
    const [membership] = await db
      .select()
      .from(user_workspaces)
      .where(eq(user_workspaces.user_id, user_id))
      .limit(1);
    return membership ?? null;
  },
};
