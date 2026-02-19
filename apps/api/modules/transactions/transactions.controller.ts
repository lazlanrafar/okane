import { Elysia, t } from "elysia";
import { TransactionsService } from "./transactions.service";
import { TransactionsRepository } from "./transactions.repository";
import { walletsRepository } from "../wallets/wallets.repository";
import {
  CreateTransactionBody,
  GetTransactionsQuery,
  UpdateTransactionBody,
} from "./transactions.model";
import { ErrorCode } from "@workspace/types";
import { authPlugin } from "../../plugins/auth";
import { buildPaginatedSuccess, buildSuccess } from "@workspace/utils";

// Factory function to create the transactions module
export const transactions = new Elysia({ prefix: "/transactions" })
  .use(authPlugin)
  .decorate(
    "transactionsService",
    new TransactionsService(new TransactionsRepository(), walletsRepository),
  )
  .get(
    "/",
    async ({ transactionsService, query, auth }: any) => {
      if (!auth?.workspace_id) {
        throw new Error(ErrorCode.UNAUTHORIZED);
      }
      const { data, total } = await transactionsService.list(
        auth.workspace_id,
        query,
      );
      const page = Number(query.page) || 1;
      const limit = Number(query.limit) || 20;
      const total_pages = Math.ceil(total / limit);

      return buildPaginatedSuccess(
        data,
        {
          total,
          page,
          limit,
          total_pages,
        },
        "Transactions retrieved successfully",
      );
    },
    {
      query: GetTransactionsQuery,
      detail: {
        summary: "List transactions",
        tags: ["Transactions"],
      },
    },
  )
  .post(
    "/",
    async ({ transactionsService, body, auth }: any) => {
      if (!auth?.workspace_id) {
        throw new Error(ErrorCode.UNAUTHORIZED);
      }
      const transaction = await transactionsService.create(
        auth.workspace_id,
        body,
      );
      return buildSuccess(transaction, "Transaction created successfully");
    },
    {
      body: CreateTransactionBody,
      detail: {
        summary: "Create transaction",
        tags: ["Transactions"],
      },
    },
  )
  .put(
    "/:id",
    async ({ transactionsService, params: { id }, body, auth }: any) => {
      if (!auth?.workspace_id) {
        throw new Error(ErrorCode.UNAUTHORIZED);
      }
      const transaction = await transactionsService.update(
        auth.workspace_id,
        id,
        body,
      );
      return buildSuccess(transaction, "Transaction updated successfully");
    },
    {
      body: UpdateTransactionBody,
      params: t.Object({ id: t.String() }),
      detail: {
        summary: "Update transaction",
        tags: ["Transactions"],
      },
    },
  )
  .delete(
    "/:id",
    async ({ transactionsService, params: { id }, auth }: any) => {
      if (!auth?.workspace_id) {
        throw new Error(ErrorCode.UNAUTHORIZED);
      }
      await transactionsService.delete(auth.workspace_id, id);
      return buildSuccess(null, "Transaction deleted successfully");
    },
    {
      params: t.Object({ id: t.String() }),
      detail: {
        summary: "Delete transaction",
        tags: ["Transactions"],
      },
    },
  );
