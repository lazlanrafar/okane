import {
  pgTable,
  text,
  timestamp,
  uuid,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { users } from "./users";
import { workspaces } from "./workspaces";

export const user_workspaces = pgTable(
  "user_workspaces",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    workspace_id: uuid("workspace_id")
      .notNull()
      .references(() => workspaces.id, { onDelete: "cascade" }),
    user_id: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    role: text("role").notNull(), // 'owner' | 'admin' | 'member'
    joined_at: timestamp("joined_at").defaultNow().notNull(),
  },
  (table) => ({
    workspaceUserIdx: uniqueIndex("workspace_user_idx").on(
      table.workspace_id,
      table.user_id,
    ),
  }),
);
