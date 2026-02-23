import { t, type UnwrapSchema } from "elysia";

export const SubCurrenciesModel = {
  create: t.Object({
    currencyCode: t.String({
      minLength: 3,
      maxLength: 3,
      error: "Currency code must be exactly 3 characters",
    }),
  }),
} as const;

export type CreateSubCurrencyInput = UnwrapSchema<
  typeof SubCurrenciesModel.create
>;
