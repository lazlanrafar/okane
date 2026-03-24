import { sql } from "drizzle-orm";
import {
  boolean,
  integer,
  pgTable,
  serial,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";
import { users } from "./users";
import { workspaces } from "./workspaces";

export const orders = pgTable(
  "orders",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    sequence_number: serial("sequence_number").notNull(),
    workspace_id: uuid("workspace_id").references(() => workspaces.id),
    user_id: uuid("user_id").references(() => users.id),
    stripe_payment_intent_id: text("stripe_payment_intent_id"),
    stripe_invoice_id: text("stripe_invoice_id"),
    stripe_subscription_id: text("stripe_subscription_id"),
    amount: integer("amount").notNull(),
    currency: text("currency").notNull(),
    status: text("status").notNull(),
    manual: boolean("manual").default(false).notNull(),
    created_at: timestamp("created_at").defaultNow().notNull(),
    updated_at: timestamp("updated_at").defaultNow().notNull(),
    deleted_at: timestamp("deleted_at"),
  },
  (table) => [
    uniqueIndex("orders_stripe_invoice_id_unique").on(table.stripe_invoice_id),
  ],
);
