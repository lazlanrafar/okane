import { t } from "elysia";

/**
 * TypeBox schemas for workspaces module input validation.
 */
export const CreateWorkspaceBody = t.Object({
  name: t.String({ minLength: 1 }),
  mainCurrencyCode: t.Optional(t.String()),
  mainCurrencySymbol: t.Optional(t.String()),
});
