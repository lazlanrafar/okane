import { db, aiMessages, aiSessions, eq } from "../index";

async function populateWorkspaceId() {
  console.log("Fetching sessions...");
  const sessions = await db.select().from(aiSessions);
  console.log(`Found ${sessions.length} sessions.`);

  for (const session of sessions) {
    console.log(`Updating messages for session ${session.id} with workspace ${session.workspace_id}...`);
    await db
      .update(aiMessages)
      .set({ workspace_id: session.workspace_id })
      .where(eq(aiMessages.session_id, session.id));
  }

  console.log("Done.");
}

populateWorkspaceId().catch(console.error);
