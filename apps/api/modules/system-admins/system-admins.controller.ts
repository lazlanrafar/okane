import { Elysia } from "elysia";
import { authPlugin } from "../../plugins/auth";
import { encryptionPlugin } from "../../plugins/encryption";
import { SystemAdminModel } from "./system-admins.model";
import { SystemAdminsService } from "./system-admins.service";
import { ErrorCode } from "@workspace/types";

// Admin Guard Plugin
const requireSuperAdmin = new Elysia({ name: "guard.super-admin" })
  .use(authPlugin)
  .derive(({ auth, status }) => {
    if (!auth) {
      return status(401, { success: false, code: ErrorCode.UNAUTHORIZED });
    }
    if (!auth.is_super_admin) {
      return status(403, {
        success: false,
        code: ErrorCode.FORBIDDEN,
        message: "Super admin access required.",
      });
    }
    return {}; // Passed validation
  });

export const systemAdminsController = new Elysia({ prefix: "/system-admins" })
  .use(requireSuperAdmin)
  .get(
    "/users",
    async ({ query }) => {
      const page = query.page ?? 1;
      const limit = query.limit ?? 50;

      console.log("query:", query);

      const search = query.search;
      let is_super_admin: boolean | undefined = undefined;
      if (query.is_super_admin === "true") is_super_admin = true;
      if (query.is_super_admin === "false") is_super_admin = false;
      const sortBy = query.sortBy;
      const sortOrder = query.sortOrder as "asc" | "desc" | undefined;

      const results = await SystemAdminsService.getAllUsers({
        page,
        limit,
        search,
        is_super_admin,
        sortBy,
        sortOrder,
      });

      return results;
    },
    { query: SystemAdminModel.listQuery },
  )
  .post("/users/:id/promote", async ({ params: { id } }) => {
    return await SystemAdminsService.promoteUser(id);
  })
  .post("/users/:id/revoke", async ({ params: { id } }) => {
    return await SystemAdminsService.revokeUser(id);
  });
