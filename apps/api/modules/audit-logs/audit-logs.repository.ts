import { db, audit_logs } from "@workspace/database";

/**
 * Audit logs repository — append-only.
 * Never update or delete audit logs.
 */
export const auditLogsRepository = {
  async create(data: {
    workspace_id: string;
    user_id: string;
    action: string;
    entity: string;
    entity_id: string;
    before?: unknown;
    after?: unknown;
  }) {
    await db.insert(audit_logs).values({
      workspace_id: data.workspace_id,
      user_id: data.user_id,
      action: data.action,
      entity: data.entity,
      entity_id: data.entity_id,
      before: data.before ?? null,
      after: data.after ?? null,
    });
  },
};
