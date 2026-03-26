import * as dotenv from "dotenv";
import * as path from "path";
import postgres from "postgres";

dotenv.config({ path: path.join(__dirname, "../../../.env") });

async function debugFulfillment() {
  const url = process.env.DATABASE_URL;
  if (!url) return;

  const sql = postgres(url);
  const workspaceId = "0cc11537-62d9-45fb-95b4-88910934c338";
  
  const workspace = await sql`SELECT * FROM workspaces WHERE id = ${workspaceId}`;
  console.log("Workspace Details:", JSON.stringify(workspace, null, 2));

  const addons = await sql`SELECT * FROM workspace_addons WHERE workspace_id = ${workspaceId}`;
  console.log("Workspace Addons:", JSON.stringify(addons, null, 2));

  const webhookEvents = await sql`SELECT * FROM webhook_events ORDER BY processed_at DESC LIMIT 5`;
  console.log("Recent Webhook Events:", JSON.stringify(webhookEvents, null, 2));

  await sql.end();
}

debugFulfillment();
