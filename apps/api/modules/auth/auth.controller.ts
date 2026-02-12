import { Elysia } from "elysia";
import { ErrorCode } from "@workspace/types";
import { buildSuccess, buildError } from "@workspace/utils";
import { generateJwt, authPlugin } from "../../plugins/auth";

/**
 * Auth controller — exchanges Supabase token for app JWT.
 * Route: POST /auth/token
 */
export const authController = new Elysia({ prefix: "/auth" })
  .use(authPlugin)
  .post(
    "/token",
    // biome-ignore lint/suspicious/noExplicitAny: Generic handler
    async ({ set, auth }: any) => {
      if (!auth) {
        set.status = 401;
        return buildError(ErrorCode.UNAUTHORIZED, "Invalid or expired token");
      }

      // If auth already has a workspace_id, generate JWT
      if (auth.workspace_id) {
        const token = await generateJwt(auth.user_id, auth.workspace_id);
        return buildSuccess(
          { token, user_id: auth.user_id, workspace_id: auth.workspace_id },
          "Token generated",
        );
      }

      // User has no workspace — still generate JWT but with empty workspace
      const token = await generateJwt(auth.user_id, "");
      return buildSuccess(
        { token, user_id: auth.user_id, workspace_id: null },
        "Token generated (no workspace)",
      );
    },
    {
      detail: {
        summary: "Exchange Token",
        description:
          "Exchanges a Supabase access token for an app JWT with user_id + workspace_id.",
        tags: ["Auth"],
      },
    },
  );
