import { t } from "elysia";

/**
 * TypeBox schemas for users module input validation.
 */
export const SyncUserBody = t.Object({
  id: t.String(),
  email: t.String({ format: "email" }),
  name: t.Optional(t.String()),
  oauth_provider: t.Optional(t.String()),
  profile_picture: t.Optional(t.String()),
  providers: t.Optional(t.Any()),
});
