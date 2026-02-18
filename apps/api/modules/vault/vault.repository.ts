import { db, eq, and, desc, isNull, vaultFiles } from "@workspace/database";

export const vaultRepository = {
  async create(data: {
    workspaceId: string;
    name: string;
    key: string;
    size: number;
    type: string;
    metadata?: any;
  }) {
    const [file] = await db
      .insert(vaultFiles)
      .values({
        ...data,
        metadata: data.metadata ? JSON.stringify(data.metadata) : null,
      })
      .returning();
    return file ?? null;
  },

  async delete(id: string, workspaceId: string) {
    const [file] = await db
      .update(vaultFiles)
      .set({ deletedAt: new Date() })
      .where(
        and(eq(vaultFiles.id, id), eq(vaultFiles.workspaceId, workspaceId)),
      )
      .returning();
    return file ?? null;
  },

  async findMany(workspaceId: string) {
    return db
      .select()
      .from(vaultFiles)
      .where(
        and(
          eq(vaultFiles.workspaceId, workspaceId),
          isNull(vaultFiles.deletedAt),
        ),
      )
      .orderBy(desc(vaultFiles.createdAt));
  },

  async findById(id: string, workspaceId: string) {
    const [file] = await db
      .select()
      .from(vaultFiles)
      .where(
        and(
          eq(vaultFiles.id, id),
          eq(vaultFiles.workspaceId, workspaceId),
          isNull(vaultFiles.deletedAt),
        ),
      )
      .limit(1);
    return file ?? null;
  },
};
