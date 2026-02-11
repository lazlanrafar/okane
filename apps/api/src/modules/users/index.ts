import { Elysia, t } from "elysia";
import { db, users } from "@workspace/database";

export const usersRoutes = new Elysia({ prefix: "/users" })
  .post(
    "/sync",
    async ({ body, set }) => {
      try {
        await db.insert(users).values({
            id: body.id,
            email: body.email,
            name: body.name,
            oauth_provider: body.oauth_provider,
        }).onConflictDoUpdate({
            target: users.id,
            set: {
                email: body.email,
                name: body.name,
                updated_at: new Date()
            }
        });

        return { status: "ok" };
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
      }),
      detail: {
        summary: "Sync User",
        description: "Syncs a user from Supabase Auth to the internal database",
        tags: ["Users"],
      },
    },
  );
