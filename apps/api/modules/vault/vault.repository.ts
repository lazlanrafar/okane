import {
  db,
  eq,
  and,
  desc,
  isNull,
  vaultFiles,
  count,
  sql,
  pricing,
  workspaces,
  ilike,
} from "@workspace/database";

export abstract class VaultRepository {
  static async count(workspaceId: string, data?: { search?: string }) {
    const [result] = await db
      .select({ value: count() })
      .from(vaultFiles)
      .where(
        and(
          eq(vaultFiles.workspaceId, workspaceId),
          isNull(vaultFiles.deletedAt),
          ...(data?.search
            ? [ilike(vaultFiles.name, `%${data.search}%`)]
            : []),
        ),
      );
    return result?.value ?? 0;
  }

  static async create(data: {
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
  }

  static async delete(id: string, workspaceId: string) {
    const [file] = await db
      .update(vaultFiles)
      .set({ deletedAt: new Date() })
      .where(
        and(eq(vaultFiles.id, id), eq(vaultFiles.workspaceId, workspaceId)),
      )
      .returning();
    return file ?? null;
  }

  static async findMany(
    workspaceId: string,
    limit: number = 20,
    offset: number = 0,
    search?: string,
  ) {
    return db
      .select()
      .from(vaultFiles)
      .where(
        and(
          eq(vaultFiles.workspaceId, workspaceId),
          isNull(vaultFiles.deletedAt),
          ...(search ? [ilike(vaultFiles.name, `%${search}%`)] : []),
        ),
      )
      .orderBy(desc(vaultFiles.createdAt))
      .limit(limit)
      .offset(offset);
  }

  static async findById(id: string, workspaceId: string) {
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
  }

  static async updateTags(id: string, workspaceId: string, tags: string[]) {
    const [file] = await db
      .update(vaultFiles)
      .set({ tags, updatedAt: new Date() })
      .where(
        and(eq(vaultFiles.id, id), eq(vaultFiles.workspaceId, workspaceId)),
      )
      .returning();
    return file ?? null;
  }

  static async getUsageAndQuota(workspaceId: string) {
    const [usageData] = await db
      .select({
        used: workspaces.vault_size_used_bytes,
        maxMb: pricing.max_vault_size_mb,
      })
      .from(workspaces)
      .leftJoin(pricing, eq(workspaces.plan_id, pricing.id))
      .where(eq(workspaces.id, workspaceId))
      .limit(1);
    return usageData;
  }

  static async updateVaultSize(workspaceId: string, newSize: number) {
    await db
      .update(workspaces)
      .set({ vault_size_used_bytes: newSize })
      .where(eq(workspaces.id, workspaceId));
  }
}
