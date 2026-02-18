import { Elysia, t } from "elysia";
import { SubCurrenciesService } from "./service";
import { CreateSubCurrencyDto } from "./dto";
import { isAuthenticated } from "../../auth/utils";
import { buildSuccess } from "@workspace/utils";

export const subCurrenciesController = new Elysia({ prefix: "/sub-currencies" })
  .use(isAuthenticated)
  .decorate("subCurrenciesService", new SubCurrenciesService())
  .get(
    "/",
    async ({ subCurrenciesService, user }) => {
      const subCurrencies = await subCurrenciesService.getSubCurrencies(
        user.workspace_id,
      );
      return buildSuccess(
        subCurrencies,
        "Sub-currencies retrieved successfully",
      );
    },
    {
      detail: {
        summary: "Get sub-currencies",
        tags: ["Settings"],
      },
    },
  )
  .post(
    "/",
    async ({ subCurrenciesService, user, body }) => {
      const subCurrency = await subCurrenciesService.addSubCurrency(
        user.workspace_id,
        body,
      );
      return buildSuccess(subCurrency, "Sub-currency added successfully");
    },
    {
      body: CreateSubCurrencyDto,
      detail: {
        summary: "Add sub-currency",
        tags: ["Settings"],
      },
    },
  )
  .delete(
    "/:id",
    async ({ subCurrenciesService, user, params }) => {
      const deleted = await subCurrenciesService.removeSubCurrency(
        user.workspace_id,
        params.id,
      );
      return buildSuccess(deleted, "Sub-currency removed successfully");
    },
    {
      params: t.Object({ id: t.String() }),
      detail: {
        summary: "Remove sub-currency",
        tags: ["Settings"],
      },
    },
  );
