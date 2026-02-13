import {
  db,
  eq,
  and,
  desc,
  isNull,
  categories,
  sql,
  inArray,
} from "@workspace/database";

export const categoriesRepository = {
  async create(data: {
    workspaceId: string;
    name: string;
    type: "income" | "expense";
  }) {
    const [category] = await db.insert(categories).values(data).returning();
    return category ?? null;
  },

  async createMany(
    data: {
      workspaceId: string;
      name: string;
      type: "income" | "expense";
    }[],
  ) {
    if (data.length === 0) return [];
    return db.insert(categories).values(data).returning();
  },

  async update(
    id: string,
    workspaceId: string,
    data: Partial<{ name: string }>,
  ) {
    const [category] = await db
      .update(categories)
      .set({ ...data, updatedAt: new Date() })
      .where(
        and(eq(categories.id, id), eq(categories.workspaceId, workspaceId)),
      )
      .returning();
    return category ?? null;
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
        sql`WHEN ${categories.id} = ${update.id} THEN ${update.sortOrder}`,
      );
      ids.push(update.id);
    }

    sqlChunks.push(sql`END)::integer`);

    const finalSql = sql.join(sqlChunks, sql` `);

    await db
      .update(categories)
      .set({ sortOrder: finalSql, updatedAt: new Date() })
      .where(
        and(
          inArray(categories.id, ids),
          eq(categories.workspaceId, workspaceId),
        ),
      );
  },

  async delete(id: string, workspaceId: string) {
    const [category] = await db
      .update(categories)
      .set({ deletedAt: new Date() })
      .where(
        and(eq(categories.id, id), eq(categories.workspaceId, workspaceId)),
      )
      .returning();
    return category ?? null;
  },

  async findMany(workspaceId: string, type?: "income" | "expense") {
    const conditions = [
      eq(categories.workspaceId, workspaceId),
      isNull(categories.deletedAt),
    ];

    if (type) {
      conditions.push(eq(categories.type, type));
    }

    return (
      db
        .select()
        .from(categories)
        .where(and(...conditions))
        // Order by sortOrder ASC, then createdAt DESC as secondary
        .orderBy(categories.sortOrder, desc(categories.createdAt))
    );
  },

  async findById(workspaceId: string, id: string) {
    const [category] = await db
      .select()
      .from(categories)
      .where(
        and(eq(categories.id, id), eq(categories.workspaceId, workspaceId)),
      )
      .limit(1);

    if (category?.deletedAt) return null;
    return category ?? null;
  },
};
