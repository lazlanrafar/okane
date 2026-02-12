import { Elysia, t } from "elysia";
import {
  db,
  users,
  workspaces,
  workspaceMembers,
  eq,
} from "@workspace/database";

export const workspacesRoutes = new Elysia({ prefix: "/workspaces" })
  .post(
    "/",
    async ({ body, headers, set }) => {
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

      // Validate token and get user
      const { createClient } = await import("@workspace/supabase/admin");
      const supabase = createClient();
      const {
        data: { user },
        error: auth_error,
      } = await supabase.auth.getUser(token);

      if (auth_error || !user) {
        set.status = 401;
        return { error: "Unauthorized" };
      }

      try {
        const { name } = body;

        // Generate slug
        const base_slug =
          name.toLowerCase().replace(/[^a-z0-9]/g, "-") || "workspace";
        const random_suffix = Math.random().toString(36).substring(2, 7);
        const slug = `${base_slug}-${random_suffix}`;

        // Create workspace
        const [new_workspace] = await db
          .insert(workspaces)
          .values({ name, slug })
          .returning();

        if (!new_workspace) {
          set.status = 500;
          return { error: "Failed to create workspace" };
        }

        // Add user as admin
        await db.insert(workspaceMembers).values({
          workspace_id: new_workspace.id,
          user_id: user.id,
          role: "admin",
        });

        // Check if user has a default workspace, if not set this one
        const [db_user] = await db
          .select({ default_workspace_id: users.default_workspace_id })
          .from(users)
          .where(eq(users.id, user.id))
          .limit(1);

        if (!db_user?.default_workspace_id) {
          await db
            .update(users)
            .set({
              default_workspace_id: new_workspace.id,
              updated_at: new Date(),
            })
            .where(eq(users.id, user.id));
        }

        return {
          status: "ok",
          workspace: {
            id: new_workspace.id,
            name: new_workspace.name,
            slug: new_workspace.slug,
          },
        };
      } catch (error) {
        set.status = 500;
        return {
          status: "error",
          message: "Failed to create workspace",
          error: error instanceof Error ? error.message : String(error),
        };
      }
    },
    {
      body: t.Object({
        name: t.String({ minLength: 1 }),
      }),
      detail: {
        summary: "Create Workspace",
        description:
          "Creates a new workspace and assigns the authenticated user as admin.",
        tags: ["Workspaces"],
      },
    },
  )
  .get(
    "/",
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

      const { createClient } = await import("@workspace/supabase/admin");
      const supabase = createClient();
      const {
        data: { user },
        error: auth_error,
      } = await supabase.auth.getUser(token);

      if (auth_error || !user) {
        set.status = 401;
        return { error: "Unauthorized" };
      }

      const user_workspaces = await db
        .select({
          id: workspaces.id,
          name: workspaces.name,
          slug: workspaces.slug,
          role: workspaceMembers.role,
        })
        .from(workspaceMembers)
        .innerJoin(workspaces, eq(workspaceMembers.workspace_id, workspaces.id))
        .where(eq(workspaceMembers.user_id, user.id));

      return { workspaces: user_workspaces };
    },
    {
      detail: {
        summary: "List Workspaces",
        description:
          "Lists all workspaces the authenticated user is a member of.",
        tags: ["Workspaces"],
      },
    },
  );
