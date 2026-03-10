import {
  buildSuccess,
  buildPaginatedSuccess,
  buildError,
} from "@workspace/utils";
import { InvoicesRepository } from "./invoices.repository";
import type { CreateInvoiceInput, UpdateInvoiceInput } from "./invoices.dto";
import { ErrorCode } from "@workspace/types";

export abstract class InvoicesService {
  static async getAll(
    workspaceId: string,
    query: { page?: number; limit?: number; search?: string; status?: string },
  ) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;

    const { data, total } = await InvoicesRepository.findAll(
      workspaceId,
      page,
      limit,
      query.search,
      query.status,
    );

    return buildPaginatedSuccess(data, {
      total,
      page,
      limit,
      total_pages: Math.ceil(total / limit),
    });
  }

  static async getById(id: string, workspaceId: string) {
    const result = await InvoicesRepository.findById(id, workspaceId);

    if (!result) {
      return buildError(ErrorCode.NOT_FOUND, "Invoice not found");
    }

    return buildSuccess(result);
  }

  static async create(data: CreateInvoiceInput, workspaceId: string) {
    const result = await InvoicesRepository.create({
      ...data,
      workspaceId,
    });

    return buildSuccess(result);
  }

  static async update(
    id: string,
    workspaceId: string,
    data: UpdateInvoiceInput,
  ) {
    const result = await InvoicesRepository.update(id, workspaceId, data);

    if (!result) {
      return buildError(ErrorCode.NOT_FOUND, "Invoice not found");
    }

    return buildSuccess(result);
  }

  static async delete(id: string, workspaceId: string) {
    await InvoicesRepository.softDelete(id, workspaceId);
    return buildSuccess(null);
  }
}
