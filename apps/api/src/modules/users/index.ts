import { Elysia, t } from "elysia";
import {
  db,
  users,
  workspaces,
  workspaceMembers,
  eq,
} from "@workspace/database";

export const usersRoutes = new Elysia({ prefix: "/users" })
  .post(
    "/sync",
    async ({ body, set }) => {
      try {
        const { id, email, name, oauth_provider, profile_picture, providers } =
          body;

        // 1. Upsert User
        await db
          .insert(users)
          .values({
            id,
            email,
            name,
            oauth_provider,
            profile_picture,
            providers: providers ? JSON.stringify(providers) : (null as any),
          })
          .onConflictDoUpdate({
            target: users.id,
            set: {
              email,
              name,
              profile_picture,
              providers: providers ? JSON.stringify(providers) : (null as any),
              updated_at: new Date(),
            },
          });

        // 2. Check for existing workspace membership
        const existing_memberships = await db
          .select()
          .from(workspaceMembers)
          .where(eq(workspaceMembers.user_id, id))
          .limit(1);

        const has_workspace = existing_memberships.length > 0;
        let default_workspace_id_value: string | null = null;

        if (!has_workspace) {
          // No workspace yet — don't auto-create, let user create via form
        } else {
          // Get user's default workspace
          const [found_user] = await db
            .select({ default_workspace_id: users.default_workspace_id })
            .from(users)
            .where(eq(users.id, id))
            .limit(1);
          default_workspace_id_value =
            found_user?.default_workspace_id ??
            existing_memberships[0]?.workspace_id ??
            null;
        }

        return {
          status: "ok",
          has_workspace,
          default_workspace_id: default_workspace_id_value,
        };
      } catch (error) {
        set.status = 500;
        return {
          status: "error",
          message: "Failed to sync user",
          error: error instanceof Error ? error.message : String(error),
        };
      }
    },
    {
      body: t.Object({
        id: t.String(),
        email: t.String({ format: "email" }),
        name: t.Optional(t.String()),
        oauth_provider: t.Optional(t.String()),
        profile_picture: t.Optional(t.String()),
        providers: t.Optional(t.Any()),
      }),
      detail: {
        summary: "Sync User",
        description:
          "Syncs a user from Supabase Auth to the internal database. Returns workspace status.",
        tags: ["Users"],
      },
    },
  )
  .get(
    "/me",
    async ({ headers, set }) => {
      const authorization = headers["authorization"];
      if (!authorization) {
        set.status = 401;
        return { error: "Unauthorized" };
      }

      const token = authorization.split(" ")[1];
      if (!token) {
        set.status = 401;
        return { error: "Unauthorized" };
      }

      // Validate token and get user ID
      const { createClient } = await import("@workspace/supabase/admin");
      const supabase = createClient();
      const {
        data: { user: auth_user },
        error,
      } = await supabase.auth.getUser(token);

      if (error || !auth_user) {
        set.status = 401;
        return { error: "Unauthorized" };
      }

      // Get user from our DB
      const [db_user] = await db
        .select()
        .from(users)
        .where(eq(users.id, auth_user.id))
        .limit(1);

      if (!db_user) {
        set.status = 404;
        return { error: "User not found" };
      }

      // Get user's workspaces
      const user_workspaces = await db
        .select({
          id: workspaces.id,
          name: workspaces.name,
          slug: workspaces.slug,
          role: workspaceMembers.role,
        })
        .from(workspaceMembers)
        .innerJoin(workspaces, eq(workspaceMembers.workspace_id, workspaces.id))
        .where(eq(workspaceMembers.user_id, auth_user.id));

      return {
        user: {
          id: db_user.id,
          email: db_user.email,
          name: db_user.name,
          profile_picture: db_user.profile_picture,
          default_workspace_id: db_user.default_workspace_id,
        },
        workspaces: user_workspaces,
      };
    },
    {
      detail: {
        summary: "Get Current User",
        description: "Returns the authenticated user's profile and workspaces.",
        tags: ["Users"],
      },
    },
  );
