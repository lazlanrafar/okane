import { db } from "../client";
import { sql } from "drizzle-orm";

async function main() {
  console.log("Cleaning up duplicate workspace memberships...");

  // This SQL deletes duplicate rows keeping only the one with the smallest ID
  // for each user_id + workspace_id combination.
  const result = await db.execute(sql`
    DELETE FROM user_workspaces a
    USING user_workspaces b
    WHERE
        a.id > b.id AND
        a.user_id = b.user_id AND
        a.workspace_id = b.workspace_id;
  `);

  console.log("Cleanup complete.");
  process.exit(0);
}

main().catch((err) => {
  console.error("Cleanup failed:", err);
  process.exit(1);
});
