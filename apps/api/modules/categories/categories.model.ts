import { t, type UnwrapSchema } from "elysia";

export const CategoryModel = {
  create: t.Object({
    name: t.String({ minLength: 1 }),
    type: t.Union([t.Literal("income"), t.Literal("expense")]),
  }),
  update: t.Object({
    name: t.Optional(t.String({ minLength: 1 })),
  }),
  reorder: t.Object({
    updates: t.Array(
      t.Object({
        id: t.String(),
        sortOrder: t.Number(),
      }),
    ),
  }),
  listQuery: t.Object({
    type: t.Optional(t.Union([t.Literal("income"), t.Literal("expense")])),
  }),
} as const;

export type CreateCategoryInput = UnwrapSchema<typeof CategoryModel.create>;
export type UpdateCategoryInput = UnwrapSchema<typeof CategoryModel.update>;
export type ReorderCategoriesInput = UnwrapSchema<typeof CategoryModel.reorder>;
export type GetCategoriesQueryInput = UnwrapSchema<
  typeof CategoryModel.listQuery
>;
