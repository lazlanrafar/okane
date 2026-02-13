import { Elysia } from "elysia";
import { ErrorCode } from "@workspace/types";
import { buildSuccess, buildError } from "@workspace/utils";
import { usersService } from "./users.service";
import { SyncUserBody } from "./users.model";
import { authPlugin } from "../../plugins/auth";

/**
 * Users controller — route definitions + TypeBox validation + call service.
 * No DB access. No business logic.
 */
export const usersController = new Elysia({ prefix: "/users" })
  .use(authPlugin)
  .post(
    "/sync",
    async ({ body, set }) => {
      try {
        const result = await usersService.syncUser(body);
        return buildSuccess(result, "User synced successfully");
      } catch (error) {
        console.error("Error in syncUser:", error);
        set.status = 500;
        return buildError(ErrorCode.INTERNAL_ERROR, "Failed to sync user");
      }
    },
    {
      body: SyncUserBody,
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
    // biome-ignore lint/suspicious/noExplicitAny: Generic handler
    async ({ set, auth }: any) => {
      if (!auth) {
        set.status = 401;
        return buildError(ErrorCode.UNAUTHORIZED, "Unauthorized");
      }

      try {
        const profile = await usersService.getProfile(auth.user_id);

        if (!profile) {
          set.status = 404;
          return buildError(ErrorCode.USER_NOT_FOUND, "User not found");
        }

        return buildSuccess(profile, "User profile retrieved");
      } catch (_error) {
        set.status = 500;
        return buildError(
          ErrorCode.INTERNAL_ERROR,
          "Failed to get user profile",
        );
      }
    },
    {
      detail: {
        summary: "Get Current User",
        description: "Returns the authenticated user's profile and workspaces.",
        tags: ["Users"],
      },
    },
  );
