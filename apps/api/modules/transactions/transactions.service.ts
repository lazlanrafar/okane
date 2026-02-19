import { TransactionsRepository } from "./transactions.repository";
import { ErrorCode, type Transaction } from "@workspace/types";
import type {
  CreateTransactionBody,
  GetTransactionsQuery,
  UpdateTransactionBody,
} from "./transactions.model";
import type { Static } from "elysia";
import {
  walletsRepository,
  type WalletsRepository,
} from "../wallets/wallets.repository";

export class TransactionsService {
  constructor(
    private readonly transactionsRepository: TransactionsRepository,
    private readonly walletsRepository: WalletsRepository,
  ) {}

  async create(
    workspaceId: string,
    body: Static<typeof CreateTransactionBody>,
  ): Promise<Transaction> {
    // TODO: Verify wallet ownership and sufficiency if we were enforcing balance checks
    // For now, fast CRUD
    const amount =
      typeof body.amount === "number" ? body.amount.toString() : body.amount;

    // Create transaction first
    const transaction = await this.transactionsRepository.create({
      ...body,
      workspaceId,
      amount,
    });

    const val = Number(amount);

    // Update wallet balance
    if (body.type === "expense") {
      await this.walletsRepository.updateBalance(
        body.walletId,
        workspaceId,
        -val,
      );
    } else if (body.type === "income") {
      await this.walletsRepository.updateBalance(
        body.walletId,
        workspaceId,
        val,
      );
    } else if (body.type === "transfer" && body.toWalletId) {
      await this.walletsRepository.updateBalance(
        body.walletId,
        workspaceId,
        -val,
      );
      await this.walletsRepository.updateBalance(
        body.toWalletId,
        workspaceId,
        val,
      );
    }

    return transaction;
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

    // Revert old balance effect
    const oldVal = Number(transaction.amount);
    if (transaction.type === "expense") {
      await this.walletsRepository.updateBalance(
        transaction.walletId,
        workspaceId,
        oldVal,
      );
    } else if (transaction.type === "income") {
      await this.walletsRepository.updateBalance(
        transaction.walletId,
        workspaceId,
        -oldVal,
      );
    } else if (transaction.type === "transfer" && transaction.toWalletId) {
      await this.walletsRepository.updateBalance(
        transaction.walletId,
        workspaceId,
        oldVal,
      );
      await this.walletsRepository.updateBalance(
        transaction.toWalletId,
        workspaceId,
        -oldVal,
      );
    }

    const updated = await this.transactionsRepository.update(
      workspaceId,
      id,
      updateData as any,
    );

    if (!updated) {
      throw new Error(ErrorCode.NOT_FOUND);
    }

    // Apply new balance effect
    const newVal = Number(updated.amount);

    if (updated.type === "expense") {
      await this.walletsRepository.updateBalance(
        updated.walletId,
        workspaceId,
        -newVal,
      );
    } else if (updated.type === "income") {
      await this.walletsRepository.updateBalance(
        updated.walletId,
        workspaceId,
        newVal,
      );
    } else if (updated.type === "transfer" && updated.toWalletId) {
      await this.walletsRepository.updateBalance(
        updated.walletId,
        workspaceId,
        -newVal,
      );
      await this.walletsRepository.updateBalance(
        updated.toWalletId,
        workspaceId,
        newVal,
      );
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

    // Revert balance change
    const val = Number(transaction.amount);

    if (transaction.type === "expense") {
      await this.walletsRepository.updateBalance(
        transaction.walletId,
        workspaceId,
        val,
      );
    } else if (transaction.type === "income") {
      await this.walletsRepository.updateBalance(
        transaction.walletId,
        workspaceId,
        -val,
      );
    } else if (transaction.type === "transfer" && transaction.toWalletId) {
      await this.walletsRepository.updateBalance(
        transaction.walletId,
        workspaceId,
        val,
      );
      await this.walletsRepository.updateBalance(
        transaction.toWalletId,
        workspaceId,
        -val,
      );
    }
  }
}
