import {
  db,
  eq,
  and,
  isNull,
  workspaces,
  user_workspaces,
  workspaceInvitations,
  users,
  pricing,
} from "@workspace/database";

/**
 * Workspaces repository — ONLY layer with DB access.
 * All reads filter deleted_at: null on workspaces.
 */
export const workspacesRepository = {
  async create(
    data: {
      name: string;
      slug: string;
      country?: string | null;
      plan_id?: string | null;
      plan_status?: string;
    },
    tx: any = db,
  ) {
    const [workspace] = await tx.insert(workspaces).values(data).returning();
    return workspace ?? null;
  },

  async findById(workspace_id: string) {
    const [result] = await db
      .select({
        workspace: workspaces,
        plan: pricing,
      })
      .from(workspaces)
      .leftJoin(pricing, eq(workspaces.plan_id, pricing.id))
      .where(and(eq(workspaces.id, workspace_id), isNull(workspaces.deleted_at)))
      .limit(1);

    if (!result) return null;

    return {
      ...result.workspace,
      plan: result.plan,
    };
  },

  async addMember(
    data: {
      workspace_id: string;
      user_id: string;
      role: string;
    },
    tx: any = db,
  ) {
    await tx.insert(user_workspaces).values(data);
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
      .where(
        and(
          eq(user_workspaces.user_id, user_id),
          isNull(user_workspaces.deleted_at),
          isNull(workspaces.deleted_at),
        ),
      );
  },

  async getWorkspacesWithPlans(user_id: string) {
    return db
      .select({
        workspace: workspaces,
        plan: pricing,
        role: user_workspaces.role,
      })
      .from(user_workspaces)
      .innerJoin(workspaces, eq(user_workspaces.workspace_id, workspaces.id))
      .leftJoin(pricing, eq(workspaces.plan_id, pricing.id))
      .where(
        and(
          eq(user_workspaces.user_id, user_id),
          isNull(user_workspaces.deleted_at),
          isNull(workspaces.deleted_at),
        ),
      );
  },

  async getMembers(workspace_id: string) {
    return db
      .select({
        userId: users.id,
        name: users.name,
        email: users.email,
        profilePicture: users.profile_picture,
        role: user_workspaces.role,
        joinedAt: user_workspaces.joined_at,
      })
      .from(user_workspaces)
      .innerJoin(users, eq(user_workspaces.user_id, users.id))
      .where(
        and(
          eq(user_workspaces.workspace_id, workspace_id),
          isNull(user_workspaces.deleted_at),
        ),
      );
  },

  async getMembership(user_id: string, workspace_id: string) {
    const [membership] = await db
      .select()
      .from(user_workspaces)
      .where(
        and(
          eq(user_workspaces.user_id, user_id),
          eq(user_workspaces.workspace_id, workspace_id),
          isNull(user_workspaces.deleted_at),
        ),
      )
      .limit(1);
    return membership ?? null;
  },

  async createInvitation(data: {
    workspaceId: string;
    email: string;
    role: string;
    token: string;
    expiresAt: Date;
  }) {
    const [invitation] = await db
      .insert(workspaceInvitations)
      .values(data)
      .returning();
    return invitation;
  },

  async findInvitationByToken(token: string) {
    const [invitation] = await db
      .select()
      .from(workspaceInvitations)
      .where(
        and(
          eq(workspaceInvitations.token, token),
          eq(workspaceInvitations.status, "pending"),
          isNull(workspaceInvitations.deletedAt),
        ),
      )
      .limit(1);
    return invitation ?? null;
  },

  async findPendingInvitation(workspaceId: string, email: string) {
    const [invitation] = await db
      .select()
      .from(workspaceInvitations)
      .where(
        and(
          eq(workspaceInvitations.workspaceId, workspaceId),
          eq(workspaceInvitations.email, email),
          eq(workspaceInvitations.status, "pending"),
          isNull(workspaceInvitations.deletedAt),
        ),
      )
      .limit(1);
    return invitation ?? null;
  },

  async findPendingInvitationsByEmail(email: string) {
    return db
      .select()
      .from(workspaceInvitations)
      .where(
        and(
          eq(workspaceInvitations.email, email),
          eq(workspaceInvitations.status, "pending"),
          isNull(workspaceInvitations.deletedAt),
        ),
      );
  },

  async updateInvitationStatus(id: string, status: "accepted" | "expired") {
    await db
      .update(workspaceInvitations)
      .set({
        status,
        acceptedAt: status === "accepted" ? new Date() : null,
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(workspaceInvitations.id, id),
          isNull(workspaceInvitations.deletedAt),
        ),
      );
  },

  async getWorkspaceInvitations(workspaceId: string) {
    return db
      .select()
      .from(workspaceInvitations)
      .where(
        and(
          eq(workspaceInvitations.workspaceId, workspaceId),
          eq(workspaceInvitations.status, "pending"),
          isNull(workspaceInvitations.deletedAt),
        ),
      );
  },

  async deleteInvitation(id: string) {
    await db
      .update(workspaceInvitations)
      .set({ deletedAt: new Date(), updatedAt: new Date() })
      .where(eq(workspaceInvitations.id, id));
  },
};
