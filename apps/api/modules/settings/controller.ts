import { Elysia, t } from "elysia";
import { SettingsService } from "./service";
import { TransactionSettingsDto } from "./dto";
import { isAuthenticated } from "../auth/utils";
import { buildSuccess } from "@workspace/utils";

export const settingsController = new Elysia({ prefix: "/settings" })
  .use(isAuthenticated)
  .decorate("service", new SettingsService())
  .get(
    "/transaction",
    async ({ service, user }) => {
      const settings = await service.getTransactionSettings(user.workspace_id);
      return buildSuccess(
        settings,
        "Transaction settings retrieved successfully",
      );
    },
    {
      detail: {
        summary: "Get transaction settings",
        tags: ["Settings"],
      },
    },
  )
  .patch(
    "/transaction",
    async ({ service, user, body }) => {
      const settings = await service.updateTransactionSettings(
        user.workspace_id,
        body,
      );
      return buildSuccess(
        settings,
        "Transaction settings updated successfully",
      );
    },
    {
      body: TransactionSettingsDto,
      detail: {
        summary: "Update transaction settings",
        tags: ["Settings"],
      },
    },
  );
