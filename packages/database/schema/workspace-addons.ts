import {
  integer,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import { workspaces } from "./workspaces";
import { pricing } from "./pricing";

export const workspaceAddons = pgTable("workspace_addons", {
  id: uuid("id").primaryKey().defaultRandom(),
  workspace_id: uuid("workspace_id")
    .references(() => workspaces.id)
    .notNull(),
  addon_id: uuid("addon_id")
    .references(() => pricing.id)
    .notNull(),
  stripe_subscription_id: text("stripe_subscription_id").unique().notNull(),
  status: text("status").$type<"active" | "cancelled" | "past_due" | "unpaid">().default("active").notNull(),
  amount: integer("amount").notNull(),
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at").defaultNow().notNull(),
  deleted_at: timestamp("deleted_at"),
});
