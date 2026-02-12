import type { ApiResponse, PaginationMeta } from "@workspace/types";

/**
 * Build a successful API response.
 */
export function buildSuccess<T>(
  data: T,
  message = "Success",
  code = "OK",
  request_id?: string,
): ApiResponse<T> {
  return {
    success: true,
    code,
    message,
    data,
    meta: {
      timestamp: Date.now(),
      ...(request_id ? { request_id } : {}),
    },
  };
}

/**
 * Build a successful paginated API response.
 */
export function buildPaginatedSuccess<T>(
  data: T,
  pagination: PaginationMeta,
  message = "Success",
  code = "OK",
  request_id?: string,
): ApiResponse<T> {
  return {
    success: true,
    code,
    message,
    data,
    meta: {
      timestamp: Date.now(),
      pagination,
      ...(request_id ? { request_id } : {}),
    },
  };
}

/**
 * Build an error API response.
 */
export function buildError(
  code: string,
  message: string,
  request_id?: string,
): ApiResponse<null> {
  return {
    success: false,
    code,
    message,
    data: null,
    meta: {
      timestamp: Date.now(),
      ...(request_id ? { request_id } : {}),
    },
  };
}
