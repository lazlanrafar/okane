import { t } from "elysia";

export const CreateSubCurrencyDto = t.Object({
  currencyCode: t.String(),
});

export type CreateSubCurrencyDto = typeof CreateSubCurrencyDto.static;
