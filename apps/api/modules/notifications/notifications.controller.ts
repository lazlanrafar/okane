import { Elysia } from "elysia";
import { NotificationsService } from "./notifications.service";
import { NotificationDto } from "./notifications.dto";
import { authPlugin } from "../../plugins/auth";
import { encryptionPlugin } from "../../plugins/encryption";
import { status } from "elysia";
import { ErrorCode } from "@workspace/types";
import { buildError } from "@workspace/utils";

export const notificationsController = new Elysia({ prefix: "/notifications" })
  .use(authPlugin)
  .use(encryptionPlugin)
  .get(
    "/",
    async ({ auth, query }) => {
      if (!auth?.workspace_id) {
        throw status(401, buildError(ErrorCode.UNAUTHORIZED, "Unauthorized"));
      }
      return NotificationsService.getAll(
        auth.workspace_id,
        auth.user_id,
        query,
      );
    },
    { query: NotificationDto.listQuery },
  )
  .patch(
    "/mark-read",
    async ({ auth, body }) => {
      if (!auth?.workspace_id) {
        throw status(401, buildError(ErrorCode.UNAUTHORIZED, "Unauthorized"));
      }
      return NotificationsService.markAsRead(
        auth.workspace_id,
        auth.user_id,
        body.ids,
      );
    },
    { body: NotificationDto.markRead },
  )
  .delete(
    "/:id",
    async ({ auth, params }) => {
      if (!auth?.workspace_id) {
        throw status(401, buildError(ErrorCode.UNAUTHORIZED, "Unauthorized"));
      }
      return NotificationsService.delete(
        auth.workspace_id,
        auth.user_id,
        params.id,
      );
    },
  );
