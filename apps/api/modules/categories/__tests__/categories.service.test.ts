import { expect, test, describe, mock, beforeEach } from "bun:test";
import { CategoriesService } from "../categories.service";
import { CategoriesRepository } from "../categories.repository";
import { AuditLogsService } from "../../audit-logs/audit-logs.service";

mock.module("../categories.repository", () => ({
  CategoriesRepository: {
    create: mock(() =>
      Promise.resolve({ id: "c1", name: "Food", type: "expense" }),
    ),
    findById: mock(() =>
      Promise.resolve({ id: "c1", name: "Food", type: "expense" }),
    ),
    findMany: mock(() =>
      Promise.resolve([{ id: "c1", name: "Food", type: "expense" }]),
    ),
    update: mock(() =>
      Promise.resolve({ id: "c1", name: "Dining", type: "expense" }),
    ),
    reorder: mock(() => Promise.resolve()),
    delete: mock(() => Promise.resolve({ id: "c1" })),
  },
}));

mock.module("../../audit-logs/audit-logs.service", () => ({
  AuditLogsService: {
    log: mock(() => Promise.resolve()),
  },
}));

describe("CategoriesService", () => {
  beforeEach(() => {
    mock.restore();
  });

  test("should return CREATED when creating a new category", async () => {
    const result = await CategoriesService.createCategory(
      "workspace1",
      "user1",
      {
        name: "Food",
        type: "expense",
      },
    );

    expect(result.success).toBe(true);
    expect(result.code).toBe("CREATED");
    expect(result.data?.id).toBe("c1");
  });

  test("should return OK when listing categories", async () => {
    const result = await CategoriesService.getCategories("workspace1");

    expect(result.success).toBe(true);
    expect(result.data?.length).toBe(1);
  });

  test("should return OK when updating an existing category", async () => {
    const result = await CategoriesService.updateCategory(
      "workspace1",
      "user1",
      "c1",
      {
        name: "Dining",
      },
    );

    expect(result.success).toBe(true);
    expect(result.data?.name).toBe("Dining");
  });

  test("should return OK when reordering categories", async () => {
    const result = await CategoriesService.reorderCategories(
      "workspace1",
      "user1",
      {
        updates: [{ id: "c1", sortOrder: 1 }],
      },
    );

    expect(result.success).toBe(true);
  });

  test("should return OK when deleting a category", async () => {
    const result = await CategoriesService.deleteCategory(
      "workspace1",
      "user1",
      "c1",
    );

    expect(result.success).toBe(true);
    expect(result.data).toBe(null);
  });
});
