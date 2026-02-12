import postgres from "postgres";
import * as dotenv from "dotenv";

dotenv.config({ path: "../../.env" });

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL is not set");
}

const client = postgres(connectionString);

async function main() {
  console.log("Running migration: add default_workspace_id to users...");
  try {
    await client`ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "default_workspace_id" uuid REFERENCES "workspaces"("id")`;
    console.log("Migration completed successfully.");
  } catch (error) {
    console.error("Migration failed:", error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

main();
