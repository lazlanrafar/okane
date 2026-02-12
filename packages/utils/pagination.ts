import type { PaginationMeta, PaginationQuery } from "@workspace/types";

const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;

/**
 * Parse and clamp pagination query parameters.
 */
export function parsePaginationQuery(query: PaginationQuery): {
  page: number;
  limit: number;
  offset: number;
} {
  const page = Math.max(1, query.page ?? 1);
  const limit = Math.min(MAX_LIMIT, Math.max(1, query.limit ?? DEFAULT_LIMIT));
  const offset = (page - 1) * limit;

  return { page, limit, offset };
}

/**
 * Build pagination meta from total count and current query.
 */
export function buildPagination(
  total: number,
  page: number,
  limit: number,
): PaginationMeta {
  return {
    total,
    page,
    limit,
    total_pages: Math.ceil(total / limit),
  };
}
