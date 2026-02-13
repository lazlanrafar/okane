import { Elysia } from "elysia";
import { ErrorCode } from "@workspace/types";
import { buildSuccess, buildError } from "@workspace/utils";
import { workspacesService } from "./workspaces.service";
import { CreateWorkspaceBody } from "./workspaces.model";
import { authPlugin } from "../../plugins/auth";

/**
 * Workspaces controller — route definitions + validation + call service.
 * No DB access. No business logic.
 */
export const workspacesController = new Elysia({ prefix: "/workspaces" })
  .use(authPlugin)
  .post(
    "/",
    // biome-ignore lint/suspicious/noExplicitAny: Generic handler
    async ({ body, set, auth }: any) => {
      console.log("[WorkspacesController] Create workspace request received", {
        auth_user: auth,
        workspace_name: body.name,
      });

      if (!auth) {
        set.status = 401;
        return buildError(ErrorCode.UNAUTHORIZED, "Unauthorized");
      }

      try {
        const workspace = await workspacesService.createWorkspace(
          auth.user_id,
          body.name,
        );
        set.status = 201;
        return buildSuccess(workspace, "Workspace created successfully");
      } catch (error: any) {
        console.error("Error creating workspace:", error);
        set.status = 500;
        return buildError(
          ErrorCode.INTERNAL_ERROR,
          `Failed to create workspace: ${error.message}`,
        );
      }
    },
    {
      body: CreateWorkspaceBody,
      detail: {
        summary: "Create Workspace",
        description:
          "Creates a new workspace and assigns the authenticated user as owner.",
        tags: ["Workspaces"],
      },
    },
  )
  .get(
    "/",
    // biome-ignore lint/suspicious/noExplicitAny: Generic handler
    async ({ set, auth }: any) => {
      if (!auth) {
        set.status = 401;
        return buildError(ErrorCode.UNAUTHORIZED, "Unauthorized");
      }

      try {
        const workspaces = await workspacesService.listWorkspaces(auth.user_id);
        return buildSuccess(workspaces, "Workspaces retrieved");
      } catch (_error) {
        set.status = 500;
        return buildError(
          ErrorCode.INTERNAL_ERROR,
          "Failed to list workspaces",
        );
      }
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
