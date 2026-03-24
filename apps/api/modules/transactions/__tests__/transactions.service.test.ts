import { expect, test, describe, mock, beforeEach } from "bun:test";
import { TransactionsService } from "../transactions.service";
import { TransactionsRepository } from "../transactions.repository";
import { WalletsRepository } from "../../wallets/wallets.repository";
import { AuditLogsService } from "../../audit-logs/audit-logs.service";

// Mock the imported dependencies
mock.module("../transactions.repository", () => ({
  TransactionsRepository: {
    create: mock(() =>
      Promise.resolve({
        id: "t1",
        amount: "100",
        type: "income",
        walletId: "w1",
      }),
    ),
    findById: mock(() =>
      Promise.resolve({
        id: "t1",
        amount: "100",
        type: "income",
        walletId: "w1",
      }),
    ),
    list: mock(() => Promise.resolve({ data: [{ id: "t1" }], total: 1 })),
    update: mock(() =>
      Promise.resolve({
        id: "t1",
        amount: "200",
        type: "income",
        walletId: "w1",
      }),
    ),
    delete: mock(() => Promise.resolve({ id: "t1" })),
  },
}));

mock.module("../../wallets/wallets.repository", () => ({
  WalletsRepository: {
    updateBalance: mock(() => Promise.resolve()),
  },
}));

mock.module("../../audit-logs/audit-logs.service", () => ({
  AuditLogsService: {
    log: mock(() => Promise.resolve()),
  },
}));

describe("TransactionsService", () => {
  beforeEach(() => {
    mock.restore();
  });

  test("should return CREATED when creating a new transaction", async () => {
    const result = await TransactionsService.create("workspace1", "user1", {
      walletId: "w1",
      amount: 100,
      date: "2024-01-01T00:00:00Z",
      type: "income",
    });

    expect(result.success).toBe(true);
    expect(result.code).toBe("CREATED");
    expect(result.data?.id).toBe("t1");
  });

  test("should return OK when listing transactions", async () => {
    const result = await TransactionsService.list("workspace1", {
      page: 1,
      limit: 10,
    });

    expect(result.success).toBe(true);
    expect(result.data?.length).toBe(1);
    expect(result.meta.pagination?.total).toBe(1);
  });

  test("should return OK when updating an existing transaction", async () => {
    const result = await TransactionsService.update(
      "workspace1",
      "user1",
      "t1",
      {
        amount: 200,
      },
    );

    expect(result.success).toBe(true);
    expect(result.data?.amount).toBe("200");
  });

  test("should return OK when deleting a transaction", async () => {
    const result = await TransactionsService.delete(
      "workspace1",
      "user1",
      "t1",
    );

    expect(result.success).toBe(true);
    expect(result.data).toBe(null);
  });
});
