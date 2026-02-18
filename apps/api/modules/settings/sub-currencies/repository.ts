import { db, workspaceSubCurrencies } from "@workspace/database";
import { eq, and, isNull } from "drizzle-orm";
import type { CreateSubCurrencyDto } from "./dto";

export class SubCurrenciesRepository {
  async findByWorkspaceId(workspaceId: string) {
    return db
      .select()
      .from(workspaceSubCurrencies)
      .where(
        and(
          eq(workspaceSubCurrencies.workspaceId, workspaceId),
          isNull(workspaceSubCurrencies.deletedAt),
        ),
      );
  }

  async create(workspaceId: string, data: CreateSubCurrencyDto) {
    const [subCurrency] = await db
      .insert(workspaceSubCurrencies)
      .values({
        workspaceId,
        currencyCode: data.currencyCode,
      })
      .returning();

    return subCurrency;
  }

  async delete(workspaceId: string, id: string) {
    const [deleted] = await db
      .update(workspaceSubCurrencies)
      .set({
        deletedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(workspaceSubCurrencies.id, id),
          eq(workspaceSubCurrencies.workspaceId, workspaceId),
          isNull(workspaceSubCurrencies.deletedAt),
        ),
      )
      .returning();

    return deleted;
  }

  async findByCode(workspaceId: string, code: string) {
    const [existing] = await db
      .select()
      .from(workspaceSubCurrencies)
      .where(
        and(
          eq(workspaceSubCurrencies.workspaceId, workspaceId),
          eq(workspaceSubCurrencies.currencyCode, code),
          isNull(workspaceSubCurrencies.deletedAt),
        ),
      )
      .limit(1);

    return existing || null;
  }
}
