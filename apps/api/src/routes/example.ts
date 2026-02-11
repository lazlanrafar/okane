import { Elysia, t } from "elysia";
import { createClient } from "@workspace/supabase";

/**
 * Example CRUD routes demonstrating Supabase integration.
 * Replace "items" with your actual table name.
 */
export const exampleRoutes = new Elysia({ prefix: "/api" })
  // List items
  .get(
    "/items",
    async () => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("items")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        throw new Error(error.message);
      }

      return { data };
    },
    {
      detail: {
        summary: "List Items",
        description: "Fetch all items from the database",
        tags: ["Items"],
      },
    },
  )
  // Get item by ID
  .get(
    "/items/:id",
    async ({ params: { id } }) => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("items")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        throw new Error(error.message);
      }

      return { data };
    },
    {
      params: t.Object({
        id: t.String(),
      }),
      detail: {
        summary: "Get Item",
        description: "Fetch a single item by ID",
        tags: ["Items"],
      },
    },
  )
  // Create item
  .post(
    "/items",
    async ({ body }) => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("items")
        .insert(body)
        .select()
        .single();

      if (error) {
        throw new Error(error.message);
      }

      return { data };
    },
    {
      body: t.Object({
        name: t.String(),
        description: t.Optional(t.String()),
      }),
      detail: {
        summary: "Create Item",
        description: "Create a new item",
        tags: ["Items"],
      },
    },
  )
  // Delete item
  .delete(
    "/items/:id",
    async ({ params: { id } }) => {
      const supabase = createClient();
      const { error } = await supabase.from("items").delete().eq("id", id);

      if (error) {
        throw new Error(error.message);
      }

      return { success: true };
    },
    {
      params: t.Object({
        id: t.String(),
      }),
      detail: {
        summary: "Delete Item",
        description: "Delete an item by ID",
        tags: ["Items"],
      },
    },
  );
