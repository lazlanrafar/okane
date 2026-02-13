import postgres from "postgres";
import * as dotenv from "dotenv";

dotenv.config({ path: "../../.env" });

const client = postgres(process.env.DATABASE_URL!);

async function main() {
  try {
    // Check if column exists
    const [column] = await client`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'workspace_settings' 
      AND column_name = 'monthly_start_date_weekend_handling'
    `;

    console.log("Column exists:", !!column);

    if (column) {
      console.log("Inserting missing migration records for 0001 and 0002...");
      // Insert 0001 and 0002
      await client`
         INSERT INTO "drizzle"."__drizzle_migrations" (hash, created_at)
         VALUES 
           ('0001_friendly_randall_flagg', ${Date.now()}),
           ('0002_complex_ogun', ${Date.now()})
         ON CONFLICT DO NOTHING
       `;
      console.log("Inserted missing migrations.");
    } else {
      console.log("Column does not exist. Checking if table exists...");
      // If table exists but column doesn't, maybe only 0001 was applied.
      // Check if table exists
      const [table] = await client`
          SELECT table_name FROM information_schema.tables WHERE table_name = 'workspace_settings'
       `;
      if (table) {
        console.log("Table workspace_settings exists. Inserting 0001...");
        await client`
             INSERT INTO "drizzle"."__drizzle_migrations" (hash, created_at)
             VALUES ('0001_friendly_randall_flagg', ${Date.now()})
             ON CONFLICT DO NOTHING
          `;
      } else {
        console.log(
          "Table workspace_settings does not exist. No manual intervention needed.",
        );
      }
    }

    const result = await client`SELECT * FROM "drizzle"."__drizzle_migrations"`;
    console.log("Migrations now:", result);
  } catch (error) {
    console.error("Error:", error);
  } finally {
    await client.end();
  }
}

main();
