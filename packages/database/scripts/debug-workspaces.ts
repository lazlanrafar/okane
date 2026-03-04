import { db } from "../client";
import { workspaces } from "../schema/workspaces";

async function main() {
  const result = await db.select().from(workspaces);
  console.log(JSON.stringify(result, null, 2));
  process.exit(0);
}

main().catch(console.error);
