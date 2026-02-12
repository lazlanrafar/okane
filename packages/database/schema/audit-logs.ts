import { jsonb, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { users } from "./users";
import { workspaces } from "./workspaces";

export const audit_logs = pgTable("audit_logs", {
  id: uuid("id").primaryKey().defaultRandom(),
  workspace_id: uuid("workspace_id")
    .notNull()
    .references(() => workspaces.id, { onDelete: "cascade" }),
  user_id: uuid("user_id")
    .notNull()
    .references(() => users.id),
  action: text("action").notNull(), // format: "{entity}.{verb}" e.g. "invoice.deleted"
  entity: text("entity").notNull(),
  entity_id: uuid("entity_id").notNull(),
  before: jsonb("before"),
  after: jsonb("after"),
  created_at: timestamp("created_at").defaultNow().notNull(),
});
