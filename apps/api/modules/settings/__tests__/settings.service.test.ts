import { expect, test, describe, mock, beforeEach } from "bun:test";
import { SettingsService } from "../settings.service";
import { SettingsRepository } from "../settings.repository";

mock.module("../settings.repository", () => ({
  SettingsRepository: {
    findByWorkspaceId: mock(() =>
      Promise.resolve({ id: "s1", workspaceId: "ws1" }),
    ),
    create: mock(() => Promise.resolve({ id: "s1", workspaceId: "ws1" })),
    update: mock(() => Promise.resolve({ id: "s1", workspaceId: "ws1" })),
  },
}));

mock.module("../../audit-logs/audit-logs.service", () => ({
  auditLogsService: {
    log: mock(() => Promise.resolve()),
  },
}));

describe("SettingsService", () => {
  beforeEach(() => {
    mock.restore();
  });

  test("should return OK when getting settings", async () => {
    const result = await SettingsService.getTransactionSettings("ws1");
    expect(result.success).toBe(true);
    expect(result.data?.id).toBe("s1");
  });

  test("should return OK when updating settings", async () => {
    const result = await SettingsService.updateTransactionSettings(
      "ws1",
      "user1",
      {
        carryOver: true,
      },
    );
    expect(result.success).toBe(true);
    expect(result.data?.id).toBe("s1");
  });
});
