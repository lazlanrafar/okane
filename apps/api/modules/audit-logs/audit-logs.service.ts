import { AuditLogsRepository } from "./audit-logs.repository";

/**
 * Audit logs service — called by other service layers after successful mutations.
 * `before`/`after` MUST NOT include passwords or secrets.
 * `action` format: "{entity}.{verb}" e.g. "workspace.created"
 */
export abstract class AuditLogsService {
  static async log(data: {
    workspace_id: string;
    user_id: string;
    action: string;
    entity: string;
    entity_id: string;
    before?: unknown;
    after?: unknown;
  }) {
    // Strip any sensitive fields from before/after
    const sanitized_before = this.sanitize(data.before);
    const sanitized_after = this.sanitize(data.after);

    await AuditLogsRepository.create({
      ...data,
      before: sanitized_before,
      after: sanitized_after,
    });
  }

  /**
   * Remove sensitive fields from audit log payloads.
   */
  private static sanitize(obj: unknown): unknown {
    if (!obj || typeof obj !== "object") return obj;

    const sensitive_keys = [
      "password",
      "secret",
      "token",
      "api_key",
      "encryption_key",
    ];
    const result = { ...(obj as Record<string, unknown>) };

    for (const key of sensitive_keys) {
      if (key in result) {
        result[key] = "[REDACTED]";
      }
    }

    return result;
  }
}
