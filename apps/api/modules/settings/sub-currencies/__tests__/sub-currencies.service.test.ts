import { expect, test, describe, mock, beforeEach } from "bun:test";
import { SubCurrenciesService } from "../sub-currencies.service";

mock.module("../sub-currencies.repository", () => ({
  SubCurrenciesRepository: {
    findByWorkspaceId: mock(() =>
      Promise.resolve([{ id: "sc1", currencyCode: "EUR", workspaceId: "ws1" }]),
    ),
    findById: mock(() =>
      Promise.resolve({ id: "sc1", currencyCode: "EUR", workspaceId: "ws1" }),
    ),
    findByCurrencyCode: mock(() => Promise.resolve(null)),
    create: mock(() =>
      Promise.resolve({ id: "sc2", currencyCode: "GBP", workspaceId: "ws1" }),
    ),
    delete: mock(() =>
      Promise.resolve({ id: "sc1", currencyCode: "EUR", workspaceId: "ws1" }),
    ),
  },
}));

mock.module("../../../audit-logs/audit-logs.service", () => ({
  AuditLogsService: {
    log: mock(() => Promise.resolve()),
  },
}));

describe("SubCurrenciesService", () => {
  beforeEach(() => {
    mock.restore();
  });

  test("should return OK when listing sub-currencies", async () => {
    const result = await SubCurrenciesService.list("ws1");
    expect(result.success).toBe(true);
    expect(result.data?.length).toBe(1);
  });

  test("should return CREATED when creating a sub-currency", async () => {
    const result = await SubCurrenciesService.create("ws1", "user1", {
      currencyCode: "GBP",
    });
    expect(result.success).toBe(true);
    expect(result.code).toBe("CREATED");
    expect(result.data?.currencyCode).toBe("GBP");
  });

  test("should return OK when deleting a sub-currency", async () => {
    const result = await SubCurrenciesService.delete("ws1", "user1", "sc1");
    expect(result.success).toBe(true);
    expect(result.data).toBe(null);
  });
});
