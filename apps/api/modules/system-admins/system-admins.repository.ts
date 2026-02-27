import { db, users } from "@workspace/database";
import { ilike, or, eq, desc, asc, and, not, sql, type SQL } from "drizzle-orm";

export abstract class SystemAdminsRepository {
  static async findAll(params: {
    page: number;
    limit: number;
    search?: string;
    is_super_admin?: boolean;
    sortBy?: string;
    sortOrder?: "asc" | "desc";
  }) {
    const conditions: SQL[] = [];

    if (params.search) {
      conditions.push(
        or(
          ilike(users.name, `%${params.search}%`),
          ilike(users.email, `%${params.search}%`),
        )!,
      );
    }

    if (params.is_super_admin !== undefined) {
      if (params.is_super_admin) {
        conditions.push(eq(users.email, "lazlanrafar@gmail.com"));
      } else {
        conditions.push(not(eq(users.email, "lazlanrafar@gmail.com")));
      }
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    let orderByParam: any = desc(users.created_at);
    if (params.sortBy) {
      const col = (users as any)[params.sortBy];
      if (col) {
        orderByParam = params.sortOrder === "asc" ? asc(col) : desc(col);
      }
    }

    const query = db
      .select({
        id: users.id,
        email: users.email,
        name: users.name,
        profile_picture: users.profile_picture,
        created_at: users.created_at,
      })
      .from(users)
      .where(whereClause)
      .orderBy(orderByParam)
      .limit(params.limit)
      .offset((params.page - 1) * params.limit);

    const rows = await query;

    const countQuery = await db
      .select({ count: sql`count(*)` })
      .from(users)
      .where(whereClause);
    const totalResult = Number(countQuery[0]?.count || 0);

    return { rows, total: totalResult };
  }
}
