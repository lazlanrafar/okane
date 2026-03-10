import { Elysia } from "elysia";
import { authPlugin } from "../../plugins/auth";
import { InvoicesService } from "./invoices.service";
import { buildError } from "@workspace/utils";
import { ErrorCode } from "@workspace/types";
import {
  CreateInvoiceDto,
  UpdateInvoiceDto,
  InvoiceListQuery,
} from "./invoices.dto";

export const invoicesController = new Elysia({ prefix: "/invoices" })
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
    "/",
    async ({ workspaceId, query }) => {
      return InvoicesService.getAll(workspaceId!, query);
    },
    {
      query: InvoiceListQuery,
      detail: { summary: "Get Invoices", tags: ["Invoices"] },
    },
  )
  .get(
    "/:id",
    async ({ workspaceId, params: { id } }) => {
      return InvoicesService.getById(id, workspaceId!);
    },
    {
      detail: { summary: "Get Invoice by ID", tags: ["Invoices"] },
    },
  )
  .post(
    "/",
    async ({ workspaceId, body, set }) => {
      set.status = 201;
      return InvoicesService.create(body, workspaceId!);
    },
    {
      body: CreateInvoiceDto,
      detail: { summary: "Create Invoice", tags: ["Invoices"] },
    },
  )
  .patch(
    "/:id",
    async ({ workspaceId, params: { id }, body }) => {
      return InvoicesService.update(id, workspaceId!, body);
    },
    {
      body: UpdateInvoiceDto,
      detail: { summary: "Update Invoice", tags: ["Invoices"] },
    },
  )
  .delete(
    "/:id",
    async ({ workspaceId, params: { id } }) => {
      return InvoicesService.delete(id, workspaceId!);
    },
    {
      detail: { summary: "Delete Invoice", tags: ["Invoices"] },
    },
  );
