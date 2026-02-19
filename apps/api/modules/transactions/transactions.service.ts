import { TransactionsRepository } from "./transactions.repository";
import { ErrorCode, type Transaction } from "@workspace/types";
import type {
  CreateTransactionBody,
  GetTransactionsQuery,
  UpdateTransactionBody,
} from "./transactions.model";
import type { Static } from "elysia";

export class TransactionsService {
  constructor(
    private readonly transactionsRepository: TransactionsRepository,
  ) {}

  async create(
    workspaceId: string,
    body: Static<typeof CreateTransactionBody>,
  ): Promise<Transaction> {
    // TODO: Verify wallet ownership and sufficiency if we were enforcing balance checks
    // For now, fast CRUD
    const amount =
      typeof body.amount === "number" ? body.amount.toString() : body.amount;

    return this.transactionsRepository.create({
      ...body,
      workspaceId,
      amount,
    });
  }

  async list(
    workspaceId: string,
    query: Static<typeof GetTransactionsQuery>,
  ): Promise<{ data: Transaction[]; total: number }> {
    const page = query.page || 1;
    const limit = query.limit || 20;

    return this.transactionsRepository.list(workspaceId, {
      ...query,
      page,
      limit,
    });
  }

  async update(
    workspaceId: string,
    id: string,
    body: Static<typeof UpdateTransactionBody>,
  ): Promise<Transaction> {
    const transaction = await this.transactionsRepository.findById(
      workspaceId,
      id,
    );
    if (!transaction) {
      throw new Error(ErrorCode.NOT_FOUND);
    }

    const amount =
      typeof body.amount === "number" ? body.amount.toString() : body.amount;

    const data = { ...body };
    if (amount) data.amount = Number(amount);

    // Filter out undefined
    const updateData = Object.fromEntries(
      Object.entries(data).filter(([_, v]) => v !== undefined),
    );

    const updated = await this.transactionsRepository.update(
      workspaceId,
      id,
      updateData as any,
    );

    if (!updated) {
      throw new Error(ErrorCode.NOT_FOUND);
    }
    return updated;
  }

  async delete(workspaceId: string, id: string): Promise<void> {
    const transaction = await this.transactionsRepository.findById(
      workspaceId,
      id,
    );
    if (!transaction) {
      throw new Error(ErrorCode.NOT_FOUND);
    }

    await this.transactionsRepository.delete(workspaceId, id);
  }
}
