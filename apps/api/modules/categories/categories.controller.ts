import { Elysia, t } from "elysia";
import { authPlugin } from "../../plugins/auth";
import { buildSuccess, buildError } from "@workspace/utils";
import { ErrorCode } from "@workspace/types";
import { categoriesService } from "./categories.service";
import {
  CreateCategoryBody,
  UpdateCategoryBody,
  GetCategoriesQuery,
  ReorderCategoriesBody,
} from "./categories.model";

export const categoriesController = new Elysia({ prefix: "/categories" })
  .use(authPlugin)
  .get(
    "/",
    async ({ query, auth, set }: any) => {
      if (!auth) {
        set.status = 401;
        return buildError(ErrorCode.UNAUTHORIZED, "Unauthorized");
      }

      try {
        const categories = await categoriesService.getCategories(
          auth.workspace_id,
          query.type as "income" | "expense" | undefined,
        );
        return buildSuccess(categories, "Categories retrieved");
      } catch (error: any) {
        set.status = 500;
        return buildError(
          ErrorCode.INTERNAL_ERROR,
          `Failed to retrieve categories: ${error.message}`,
        );
      }
    },
    {
      query: GetCategoriesQuery,
      detail: {
        summary: "List Categories",
        tags: ["Categories"],
      },
    },
  )
  .post(
    "/",
    async ({ body, auth, set }: any) => {
      if (!auth) {
        set.status = 401;
        return buildError(ErrorCode.UNAUTHORIZED, "Unauthorized");
      }

      try {
        const category = await categoriesService.createCategory(
          auth.workspace_id,
          body,
        );
        set.status = 201;
        return buildSuccess(category, "Category created successfully");
      } catch (error: any) {
        console.error("Create Category Error:", error);
        set.status = 500;
        return buildError(
          ErrorCode.INTERNAL_ERROR,
          `Failed to create category: ${error.message}`,
        );
      }
    },
    {
      body: CreateCategoryBody,
      detail: {
        summary: "Create Category",
        tags: ["Categories"],
      },
    },
  )
  .patch(
    "/:id",
    async ({ params, body, auth, set }: any) => {
      if (!auth) {
        set.status = 401;
        return buildError(ErrorCode.UNAUTHORIZED, "Unauthorized");
      }

      try {
        const category = await categoriesService.updateCategory(
          auth.workspace_id,
          params.id,
          body,
        );
        return buildSuccess(category, "Category updated successfully");
      } catch (error: any) {
        if (error.message === "Category not found") {
          set.status = 404;
          return buildError(ErrorCode.NOT_FOUND, "Category not found");
        }
        set.status = 500;
        return buildError(
          ErrorCode.INTERNAL_ERROR,
          `Failed to update category: ${error.message}`,
        );
      }
    },
    {
      body: UpdateCategoryBody,
      params: t.Object({
        id: t.String(),
      }),
      detail: {
        summary: "Update Category",
        tags: ["Categories"],
      },
    },
  )
  .put(
    "/reorder",
    async ({ body, auth, set }: any) => {
      if (!auth) {
        set.status = 401;
        return buildError(ErrorCode.UNAUTHORIZED, "Unauthorized");
      }

      try {
        await categoriesService.reorderCategories(
          auth.workspace_id,
          body.updates,
        );
        return buildSuccess(null, "Categories reordered successfully");
      } catch (error: any) {
        console.error("Reorder Categories Error:", error);
        set.status = 500;
        return buildError(
          ErrorCode.INTERNAL_ERROR,
          `Failed to reorder categories: ${error.message}`,
        );
      }
    },
    {
      body: ReorderCategoriesBody,
      detail: {
        summary: "Reorder Categories",
        tags: ["Categories"],
      },
    },
  )
  .delete(
    "/:id",
    async ({ params, auth, set }: any) => {
      if (!auth) {
        set.status = 401;
        return buildError(ErrorCode.UNAUTHORIZED, "Unauthorized");
      }

      try {
        await categoriesService.deleteCategory(auth.workspace_id, params.id);
        return buildSuccess(null, "Category deleted successfully");
      } catch (error: any) {
        if (error.message === "Category not found") {
          set.status = 404;
          return buildError(ErrorCode.NOT_FOUND, "Category not found");
        }
        set.status = 500;
        return buildError(
          ErrorCode.INTERNAL_ERROR,
          `Failed to delete category: ${error.message}`,
        );
      }
    },
    {
      params: t.Object({
        id: t.String(),
      }),
      detail: {
        summary: "Delete Category",
        tags: ["Categories"],
      },
    },
  );
