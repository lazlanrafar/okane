import {
  db,
  eq,
  and,
  desc,
  asc,
  isNull,
  walletGroups,
  sql,
  inArray,
} from "@workspace/database";

export const walletGroupsRepository = {
  async create(data: { workspaceId: string; name: string }) {
    const [group] = await db.insert(walletGroups).values(data).returning();
    return group ?? null;
  },

  async createMany(data: { workspaceId: string; name: string }[]) {
    return db.insert(walletGroups).values(data).returning();
  },

  async update(
    id: string,
    workspaceId: string,
    data: Partial<{ name: string; sortOrder: number }>,
  ) {
    const [group] = await db
      .update(walletGroups)
      .set({ ...data, updatedAt: new Date().toISOString() })
      .where(
        and(eq(walletGroups.id, id), eq(walletGroups.workspaceId, workspaceId)),
      )
      .returning();
    return group ?? null;
  },

  async delete(id: string, workspaceId: string) {
    const [group] = await db
      .update(walletGroups)
      .set({ deletedAt: new Date().toISOString() })
      .where(
        and(eq(walletGroups.id, id), eq(walletGroups.workspaceId, workspaceId)),
      )
      .returning();
    return group ?? null;
  },

  async findMany(workspaceId: string) {
    return db
      .select()
      .from(walletGroups)
      .where(
        and(
          eq(walletGroups.workspaceId, workspaceId),
          isNull(walletGroups.deletedAt),
        ),
      )
      .orderBy(asc(walletGroups.sortOrder), desc(walletGroups.createdAt));
  },

  async reorder(
    workspaceId: string,
    updates: { id: string; sortOrder: number }[],
  ) {
    if (updates.length === 0) return;

    const sqlChunks = [sql`(CASE`];
    const ids: string[] = [];

    for (const update of updates) {
      sqlChunks.push(
        sql`WHEN ${walletGroups.id} = ${update.id} THEN ${update.sortOrder}`,
      );
      ids.push(update.id);
    }

    sqlChunks.push(sql`END)::integer`);

    const finalSql = sql.join(sqlChunks, sql` `);

    await db
      .update(walletGroups)
      .set({ sortOrder: finalSql, updatedAt: new Date().toISOString() })
      .where(
        and(
          inArray(walletGroups.id, ids),
          eq(walletGroups.workspaceId, workspaceId),
        ),
      );
  },
};
