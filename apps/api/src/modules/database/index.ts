import { Elysia } from "elysia";
import { db, sql } from "@workspace/database";

export const databaseRoutes = new Elysia({ prefix: "/db" }).get(
  "/test",
  async () => {
    try {
      // Simple query to test connection
      const result = await db.execute(sql`SELECT 1 as connected`);
      return {
        status: "ok",
        message: "Database connected successfully",
        result,
      };
    } catch (error) {
      return {
        status: "error",
        message: "Database connection failed",
        error: error instanceof Error ? error.message : String(error),
      };
    }
  },
);
