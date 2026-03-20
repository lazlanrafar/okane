import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { sql } from "drizzle-orm";
import * as dotenv from "dotenv";
import * as path from "path";

// Load .env from root
dotenv.config({ path: path.resolve(__dirname, "../../../.env") });

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error("❌ DATABASE_URL is not set in .env");
  process.exit(1);
}

async function main() {
  console.log("🚀 Starting database reset...");
  
  const client = postgres(DATABASE_URL!, { prepare: false });
  const db = drizzle(client);

  const tablesToClear = [
    "ai_messages",
    "ai_sessions",
    "articles",
    "audit_logs",
    "transaction_attachments",
    "transactions",
    "categories",
    "orders",
    "user_workspaces",
    "vault_files",
    "wallet_groups",
    "wallets",
    "workspace_integrations",
    "workspace_invitations",
    "workspace_settings",
    "workspace_sub_currencies",
    "users",
    "workspaces",
  ];

  try {
    for (const table of tablesToClear) {
      console.log(`🧹 Clearing table: ${table}...`);
      await db.execute(
        sql.raw(`TRUNCATE TABLE "${table}" RESTART IDENTITY CASCADE`),
      );
    }
    console.log("✅ Database reset complete (pricing preserved).");
  } catch (error) {
    console.error("❌ Database reset failed:", error);
  } finally {
    await client.end();
    process.exit(0);
  }
}

main();
