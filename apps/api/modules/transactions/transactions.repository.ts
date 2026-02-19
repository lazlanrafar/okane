import { db, transactions, wallets, categories } from "@workspace/database";
import type { Transaction } from "@workspace/types";
import {
  and,
  desc,
  eq,
  gt,
  gte,
  lt,
  lte,
  sql,
  aliasedTable,
} from "drizzle-orm";

export class TransactionsRepository {
  async create(data: typeof transactions.$inferInsert): Promise<Transaction> {
    const [transaction] = await db
      .insert(transactions)
      .values(data)
      .returning();

    if (!transaction) {
      throw new Error("Failed to create transaction");
    }

    // Cast to Transaction type where dates are strings
    return {
      ...transaction,
      date: transaction.date,
      createdAt: transaction.createdAt,
      updatedAt: transaction.updatedAt,
      deletedAt: transaction.deletedAt,
    } as unknown as Transaction;
  }

  async findById(
    workspaceId: string,
    id: string,
  ): Promise<Transaction | undefined> {
    const fromWallet = aliasedTable(wallets, "fromWallet");
    const toWallet = aliasedTable(wallets, "toWallet");

    const [result] = await db
      .select({
        transaction: transactions,
        wallet: { id: fromWallet.id, name: fromWallet.name },
        toWallet: { id: toWallet.id, name: toWallet.name },
        category: { id: categories.id, name: categories.name },
      })
      .from(transactions)
      .leftJoin(fromWallet, eq(transactions.walletId, fromWallet.id))
      .leftJoin(toWallet, eq(transactions.toWalletId, toWallet.id))
      .leftJoin(categories, eq(transactions.categoryId, categories.id))
      .where(
        and(
          eq(transactions.workspaceId, workspaceId),
          eq(transactions.id, id),
          sql`${transactions.deletedAt} IS NULL`,
        ),
      );

    if (!result) return undefined;

    return {
      ...result.transaction,
      date: result.transaction.date,
      createdAt: result.transaction.createdAt,
      updatedAt: result.transaction.updatedAt,
      deletedAt: result.transaction.deletedAt,
      wallet: result.wallet,
      toWallet: result.toWallet,
      category: result.category,
    } as unknown as Transaction;
  }

  async list(
    workspaceId: string,
    params: {
      page: number;
      limit: number;
      type?: string;
      walletId?: string;
      categoryId?: string;
      startDate?: string;
      endDate?: string;
    },
  ): Promise<{ data: Transaction[]; total: number }> {
    const fromWallet = aliasedTable(wallets, "fromWallet");
    const toWallet = aliasedTable(wallets, "toWallet");

    const filters = [
      eq(transactions.workspaceId, workspaceId),
      sql`${transactions.deletedAt} IS NULL`,
    ];

    if (params.type) {
      filters.push(eq(transactions.type, params.type));
    }
    if (params.walletId) {
      filters.push(eq(transactions.walletId, params.walletId));
    }
    if (params.categoryId) {
      filters.push(eq(transactions.categoryId, params.categoryId));
    }
    if (params.startDate) {
      filters.push(gte(transactions.date, params.startDate));
    }
    if (params.endDate) {
      filters.push(lte(transactions.date, params.endDate));
    }

    const [countResult] = await db
      .select({ count: sql<number>`count(*)` })
      .from(transactions)
      .where(and(...filters));

    const results = await db
      .select({
        transaction: transactions,
        wallet: { id: fromWallet.id, name: fromWallet.name },
        toWallet: { id: toWallet.id, name: toWallet.name },
        category: { id: categories.id, name: categories.name },
      })
      .from(transactions)
      .leftJoin(fromWallet, eq(transactions.walletId, fromWallet.id))
      .leftJoin(toWallet, eq(transactions.toWalletId, toWallet.id))
      .leftJoin(categories, eq(transactions.categoryId, categories.id))
      .where(and(...filters))
      .limit(params.limit)
      .offset((params.page - 1) * params.limit)
      .orderBy(desc(transactions.date), desc(transactions.createdAt));

    const data = results.map((row) => ({
      ...row.transaction,
      date: row.transaction.date,
      createdAt: row.transaction.createdAt,
      updatedAt: row.transaction.updatedAt,
      deletedAt: row.transaction.deletedAt,
      wallet: row.wallet,
      toWallet: row.toWallet,
      category: row.category,
    }));

    return {
      data: data as unknown as Transaction[],
      total: Number(countResult?.count || 0),
    };
  }

  async update(
    workspaceId: string,
    id: string,
    data: Partial<typeof transactions.$inferInsert>,
  ): Promise<Transaction | undefined> {
    const [transaction] = await db
      .update(transactions)
      .set({ ...data, updatedAt: sql`now()` })
      .where(
        and(
          eq(transactions.workspaceId, workspaceId),
          eq(transactions.id, id),
          sql`${transactions.deletedAt} IS NULL`,
        ),
      )
      .returning();

    // Re-fetch to get relations
    if (transaction) {
      return this.findById(workspaceId, id);
    }

    return undefined;
  }

  async delete(
    workspaceId: string,
    id: string,
  ): Promise<Transaction | undefined> {
    const [transaction] = await db
      .update(transactions)
      .set({ deletedAt: sql`now()` })
      .where(
        and(
          eq(transactions.workspaceId, workspaceId),
          eq(transactions.id, id),
          sql`${transactions.deletedAt} IS NULL`,
        ),
      )
      .returning();

    return transaction as unknown as Transaction | undefined;
  }
}
