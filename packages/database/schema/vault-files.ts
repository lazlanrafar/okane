import { pgTable, text, timestamp, uuid, bigint } from "drizzle-orm/pg-core";
import { workspaces } from "./workspaces";

export const vaultFiles = pgTable("vault_files", {
  id: uuid("id").defaultRandom().primaryKey(),
  workspaceId: uuid("workspace_id")
    .references(() => workspaces.id)
    .notNull(),
  name: text("name").notNull(),
  key: text("key").notNull(),
  size: bigint("size", { mode: "number" }).notNull(),
  type: text("type").notNull(),
  metadata: text("metadata"), // JSON string
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  deletedAt: timestamp("deleted_at"),
});
