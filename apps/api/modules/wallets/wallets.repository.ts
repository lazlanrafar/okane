import {
  db,
  eq,
  and,
  desc,
  asc,
  isNull,
  wallets,
  sql,
  inArray,
} from "@workspace/database";

export type WalletsRepository = typeof walletsRepository;

export const walletsRepository = {
  async create(data: {
    workspaceId: string;
    groupId?: string | null;
    name: string;
    balance: number;
    isIncludedInTotals?: boolean;
  }) {
    const [wallet] = await db
      .insert(wallets)
      .values({
        ...data,
        balance: data.balance.toString(),
      })
      .returning();
    return wallet ?? null;
  },

  async createMany(
    data: {
      workspaceId: string;
      groupId?: string | null;
      name: string;
      balance: number;
      isIncludedInTotals?: boolean;
    }[],
  ) {
    return db
      .insert(wallets)
      .values(
        data.map((w) => ({
          ...w,
          balance: w.balance.toString(),
        })),
      )
      .returning();
  },

  async update(
    id: string,
    workspaceId: string,
    data: Partial<{
      name: string;
      groupId: string | null;
      balance: number;
      isIncludedInTotals: boolean;
      sortOrder: number;
    }>,
  ) {
    const updateData: any = { ...data, updatedAt: new Date().toISOString() };
    if (data.balance !== undefined) {
      updateData.balance = data.balance.toString();
    }

    const [wallet] = await db
      .update(wallets)
      .set(updateData)
      .where(and(eq(wallets.id, id), eq(wallets.workspaceId, workspaceId)))
      .returning();
    return wallet ?? null;
  },

  async delete(id: string, workspaceId: string) {
    const [wallet] = await db
      .update(wallets)
      .set({ deletedAt: new Date().toISOString() })
      .where(and(eq(wallets.id, id), eq(wallets.workspaceId, workspaceId)))
      .returning();
    return wallet ?? null;
  },

  async findMany(workspaceId: string) {
    const result = await db
      .select()
      .from(wallets)
      .where(
        and(eq(wallets.workspaceId, workspaceId), isNull(wallets.deletedAt)),
      )
      .orderBy(asc(wallets.sortOrder), desc(wallets.createdAt));

    return result.map((wallet) => ({
      ...wallet,
      balance: Number(wallet.balance),
    }));
  },

  async findById(workspaceId: string, id: string) {
    const [wallet] = await db
      .select()
      .from(wallets)
      .where(and(eq(wallets.id, id), eq(wallets.workspaceId, workspaceId)))
      .limit(1);

    if (wallet?.deletedAt) return null;
    if (!wallet) return null;

    return {
      ...wallet,
      balance: Number(wallet.balance),
    };
  },

  async reorder(
    workspaceId: string,
    updates: { id: string; sortOrder: number; groupId?: string | null }[],
  ) {
    if (updates.length === 0) return;

    // For simple reordering within same group context or mixed
    // We can use a transaction or just simple updates if we construct the CASE properly
    // But since groupId might also change, providing a single SQL update for both is tricky if we use CASE for everything
    // However, usually reorder touches sortOrder. If groupId changes, it's a "move" + "reorder".
    // Let's handle sortOrder via CASE, and if groupId is present in update, we might need separate updates or a complex query.
    // For simplicity and performance of drag & drop which sends batch updates:
    // We'll construct a query that updates sortOrder ALL the time, and groupId IF present in the update object.

    const sqlChunksSort = [sql`(CASE`];
    const sqlChunksGroup = [sql`(CASE`];
    const ids: string[] = [];
    let hasGroupUpdates = false;

    for (const update of updates) {
      sqlChunksSort.push(
        sql`WHEN ${wallets.id} = ${update.id} THEN ${update.sortOrder}`,
      );
      if (update.groupId !== undefined) {
        hasGroupUpdates = true;
        // Handle null explicit
        if (update.groupId === null) {
          sqlChunksGroup.push(sql`WHEN ${wallets.id} = ${update.id} THEN NULL`);
        } else {
          sqlChunksGroup.push(
            sql`WHEN ${wallets.id} = ${update.id} THEN ${update.groupId}::uuid`,
          );
        }
      }
      ids.push(update.id);
    }

    sqlChunksSort.push(sql`END)::integer`);
    sqlChunksGroup.push(sql`ELSE ${wallets.groupId} END)`);
    // ELSE keep current value if not specified in update.
    // Actually, if we use CASE for group, we must cover all IDs in the IN clause.
    // If an ID is in IN clause but not in WHEN, it hits ELSE.
    // So "ELSE groupId" is correct to preserve existing values for rows being updated by sortOrder but not groupId.

    const updateSet: any = {
      sortOrder: sql.join(sqlChunksSort, sql` `),
      updatedAt: new Date().toISOString(),
    };

    if (hasGroupUpdates) {
      updateSet.groupId = sql.join(sqlChunksGroup, sql` `);
    }

    const finalSql = sql.join(sqlChunksSort, sql` `);

    await db
      .update(wallets)
      .set(updateSet)
      .where(
        and(inArray(wallets.id, ids), eq(wallets.workspaceId, workspaceId)),
      );
  },

  async updateBalance(id: string, workspaceId: string, amount: number) {
    const [wallet] = await db
      .update(wallets)
      .set({
        balance: sql`${wallets.balance} + ${amount}`,
        updatedAt: new Date().toISOString(),
      })
      .where(and(eq(wallets.id, id), eq(wallets.workspaceId, workspaceId)))
      .returning();
    return wallet ?? null;
  },
};
