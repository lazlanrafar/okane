import { createAdminClient } from "@workspace/supabase/admin";
import { ErrorCode } from "@workspace/types";
import {
  buildError,
  buildPaginatedSuccess,
  buildSuccess,
  buildPagination,
} from "@workspace/utils";
import { SystemAdminsRepository } from "./system-admins.repository";

export abstract class SystemAdminsService {
  static async getAllUsers(params: {
    page: number;
    limit: number;
    search?: string;
    is_super_admin?: boolean;
    sortBy?: string;
    sortOrder?: "asc" | "desc";
  }) {
    try {
      const { rows, total } = await SystemAdminsRepository.findAll(params);

      // Return Drizzle users only. We don't fetch the whole Supabase list anymore.
      // Drizzle doesn't store is_super_admin natively, so we only flag the fallback email locally
      // unless we query Supabase individually (which is too slow for lists).
      const mappedRows = rows.map((row) => ({
        ...row,
        is_super_admin: row.email === "lazlanrafar@gmail.com",
      }));

      return buildPaginatedSuccess(
        mappedRows,
        buildPagination(total, params.page, params.limit),
      );
    } catch (error: any) {
      console.error("Unhandled error fetching Drizzle users:", error);
      return buildError(ErrorCode.INTERNAL_ERROR, "Failed to fetch users");
    }
  }

  static async promoteUser(targetUserId: string) {
    const supabaseAdmin = createAdminClient();

    // 1. Fetch current user metadata
    const { data, error: userError } =
      await supabaseAdmin.auth.admin.getUserById(targetUserId);
    if (userError || !data?.user) {
      return buildError(
        ErrorCode.NOT_FOUND,
        "User not found in authentication system",
      );
    }

    // 2. Update app_metadata
    const currentMetadata = data.user.app_metadata || {};
    const { error: updateError } =
      await supabaseAdmin.auth.admin.updateUserById(targetUserId, {
        app_metadata: { ...currentMetadata, is_super_admin: true },
      });

    if (updateError) {
      return buildError(
        ErrorCode.INTERNAL_ERROR,
        "Failed to promote user: " + updateError.message,
      );
    }

    return buildSuccess(undefined);
  }

  static async revokeUser(targetUserId: string) {
    const supabaseAdmin = createAdminClient();

    // 1. Fetch current user metadata
    const { data, error: userError } =
      await supabaseAdmin.auth.admin.getUserById(targetUserId);
    if (userError || !data?.user) {
      return buildError(
        ErrorCode.NOT_FOUND,
        "User not found in authentication system",
      );
    }

    if (data.user.email === "lazlanrafar@gmail.com") {
      return buildError(
        ErrorCode.FORBIDDEN,
        "Cannot revoke the root administrator.",
      );
    }

    // 2. Update app_metadata
    const currentMetadata = data.user.app_metadata || {};
    const { error: updateError } =
      await supabaseAdmin.auth.admin.updateUserById(targetUserId, {
        app_metadata: { ...currentMetadata, is_super_admin: false },
      });

    if (updateError) {
      return buildError(
        ErrorCode.INTERNAL_ERROR,
        "Failed to revoke user: " + updateError.message,
      );
    }

    return buildSuccess(undefined);
  }
}
