import { db } from "../client";
import { sql } from "drizzle-orm";

async function main() {
  console.log("⏳ Dropping all tables and resetting database...");
  await db.execute(sql`DROP SCHEMA public CASCADE;`);
  await db.execute(sql`CREATE SCHEMA public;`);
  await db.execute(sql`GRANT ALL ON SCHEMA public TO postgres;`);
  await db.execute(sql`GRANT ALL ON SCHEMA public TO public;`);
  console.log("✅ Database reset successfully.");
  process.exit(0);
}

main().catch((err) => {
  console.error("❌ Failed to reset database:", err);
  process.exit(1);
});
