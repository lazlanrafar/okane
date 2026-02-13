import { t } from "elysia";

export const CreateCategoryBody = t.Object({
  name: t.String({ minLength: 1 }),
  type: t.Union([t.Literal("income"), t.Literal("expense")]),
});

export const UpdateCategoryBody = t.Object({
  name: t.Optional(t.String({ minLength: 1 })),
});

export const ReorderCategoriesBody = t.Object({
  updates: t.Array(
    t.Object({
      id: t.String(),
      sortOrder: t.Number(),
    }),
  ),
});

export const GetCategoriesQuery = t.Object({
  type: t.Optional(t.Union([t.Literal("income"), t.Literal("expense")])),
});
