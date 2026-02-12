import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as dotenv from "dotenv";

dotenv.config({ path: "../../.env" });

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is not set");
}

const client = postgres(connectionString);
const db = drizzle(client);

async function main() {
  console.log("Running manual migration...");

  try {
    // 1. Alter users table
    console.log("Altering users table...");
    await client`ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "profile_picture" text`;
    await client`ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "providers" text[]`;

    // 2. Create workspaces table
    console.log("Creating workspaces table...");
    await client`
      CREATE TABLE IF NOT EXISTS "workspaces" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "name" text NOT NULL,
        "slug" text NOT NULL UNIQUE,
        "created_at" timestamp DEFAULT now() NOT NULL,
        "updated_at" timestamp DEFAULT now() NOT NULL
      );
    `;

    // 3. Create workspace_members table
    console.log("Creating workspace_members table...");
    await client`
      CREATE TABLE IF NOT EXISTS "workspace_members" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "workspace_id" uuid NOT NULL REFERENCES "workspaces"("id") ON DELETE CASCADE,
        "user_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
        "role" text NOT NULL,
        "created_at" timestamp DEFAULT now() NOT NULL
      );
    `;

    console.log("Migration completed successfully.");
  } catch (error) {
    console.error("Migration failed:", error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

main();
