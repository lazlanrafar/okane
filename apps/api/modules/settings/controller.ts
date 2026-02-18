import { Elysia, t } from "elysia";
import { SettingsService } from "./service";
import { TransactionSettingsDto } from "./dto";
import { subCurrenciesController } from "./sub-currencies/controller";
import { ratesController } from "./rates.controller";
import { isAuthenticated } from "../auth/utils";
import { buildSuccess } from "@workspace/utils";

export const settingsController = new Elysia({ prefix: "/settings" })
  .use(isAuthenticated)
  .use(subCurrenciesController)
  .use(ratesController)
  .decorate("settingsService", new SettingsService())
  .get(
    "/transaction",
    async ({ settingsService, user }) => {
      const settings = await settingsService.getTransactionSettings(
        user.workspace_id,
      );
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
    async ({ settingsService, user, body }) => {
      const settings = await settingsService.updateTransactionSettings(
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
