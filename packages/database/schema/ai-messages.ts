import { jsonb, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { aiSessions } from "./ai-sessions";

export const aiMessages = pgTable("ai_messages", {
  id: uuid("id").primaryKey().defaultRandom(),
  session_id: uuid("session_id")
    .references(() => aiSessions.id, { onDelete: "cascade" })
    .notNull(),
  workspace_id: uuid("workspace_id").notNull(),
  role: text("role", { enum: ["user", "assistant", "system"] }).notNull(),
  content: text("content").notNull(),
  attachments: jsonb("attachments"),
  created_at: timestamp("created_at").defaultNow().notNull(),
  deleted_at: timestamp("deleted_at"),
});

export type AiMessage = typeof aiMessages.$inferSelect;
export type InsertAiMessage = typeof aiMessages.$inferInsert;
