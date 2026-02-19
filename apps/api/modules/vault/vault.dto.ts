import { t } from "elysia";

export const uploadFileBody = t.Object({
  file: t.File({
    maxSize: "10m",
  }),
});

export const vaultFileResponse = t.Object({
  id: t.String(),
  workspaceId: t.String(),
  name: t.String(),
  key: t.String(),
  size: t.Number(),
  type: t.String(),
  tags: t.Array(t.String()),
  metadata: t.Nullable(t.String()),
  url: t.Optional(t.String()),
  createdAt: t.String(),
  updatedAt: t.String(),
});

export const updateTagsBody = t.Object({
  tags: t.Array(t.String()),
});

export const getVaultFilesQuery = t.Object({
  page: t.Optional(t.Numeric()),
  limit: t.Optional(t.Numeric()),
});
