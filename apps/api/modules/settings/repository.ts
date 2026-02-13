import { db, workspaceSettings } from "@workspace/database";
import { eq, and, isNull } from "drizzle-orm";
import type { TransactionSettingsDto } from "./dto";

export class SettingsRepository {
  async findByWorkspaceId(workspaceId: string) {
    const [settings] = await db
      .select()
      .from(workspaceSettings)
      .where(
        and(
          eq(workspaceSettings.workspaceId, workspaceId),
          isNull(workspaceSettings.deletedAt),
        ),
      )
      .limit(1);

    return settings || null;
  }

  async create(workspaceId: string, data?: TransactionSettingsDto) {
    const [settings] = await db
      .insert(workspaceSettings)
      .values({
        workspaceId,
        ...data,
      })
      .returning();

    return settings;
  }

  async update(workspaceId: string, data: TransactionSettingsDto) {
    const [settings] = await db
      .update(workspaceSettings)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(workspaceSettings.workspaceId, workspaceId),
          isNull(workspaceSettings.deletedAt),
        ),
      )
      .returning();

    return settings;
  }
}
