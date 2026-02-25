import { Elysia } from "elysia";
import { authPlugin } from "../../plugins/auth";
import { buildSuccess, buildError } from "@workspace/utils";
import { ErrorCode } from "@workspace/types";
import { AiService } from "./ai.service";
import { ChatRequestDto } from "./ai.dto";

export const aiController = new Elysia({ prefix: "/ai" })
  .use(authPlugin)
  .derive(({ auth }) => ({
    workspaceId: auth?.workspace_id,
  }))
  .onBeforeHandle(({ auth, set }) => {
    if (!auth) {
      set.status = 401;
      return buildError(ErrorCode.UNAUTHORIZED, "Unauthorized");
    }
  })
  .get(
    "/sessions",
    async ({ workspaceId }) => {
      const sessions = await AiService.getSessions(workspaceId!);
      return buildSuccess(sessions, "Sessions retrieved");
    },
    { detail: { tags: ["AI"] } },
  )
  .get(
    "/sessions/:id",
    async ({ params: { id }, workspaceId }) => {
      const messages = await AiService.getSessionMessages(id, workspaceId!);
      return buildSuccess(messages, "Session messages retrieved");
    },
    { detail: { tags: ["AI"] } },
  )
  .post(
    "/chat",
    async ({ body, workspaceId, set }) => {
      try {
        const response = await AiService.chat(
          body.messages,
          workspaceId!,
          body.sessionId,
        );
        return buildSuccess(response, "Chat response generated");
      } catch (error: any) {
        set.status = 500;
        return buildError(
          ErrorCode.INTERNAL_ERROR,
          error?.message ?? "Failed to generate AI response",
        );
      }
    },
    { body: ChatRequestDto, detail: { tags: ["AI"] } },
  );
