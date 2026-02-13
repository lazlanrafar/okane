import { categoriesRepository } from "./categories.repository";

export const categoriesService = {
  async createCategory(
    workspaceId: string,
    data: { name: string; type: "income" | "expense" },
  ) {
    return categoriesRepository.create({
      workspaceId,
      name: data.name,
      type: data.type,
    });
  },

  async updateCategory(
    workspaceId: string,
    id: string,
    data: { name?: string },
  ) {
    const category = await categoriesRepository.findById(workspaceId, id);
    if (!category) {
      throw new Error("Category not found");
    }
    return categoriesRepository.update(id, workspaceId, data);
  },

  async reorderCategories(
    workspaceId: string,
    updates: { id: string; sortOrder: number }[],
  ) {
    return categoriesRepository.reorder(workspaceId, updates);
  },

  async deleteCategory(workspaceId: string, id: string) {
    const category = await categoriesRepository.findById(workspaceId, id);
    if (!category) {
      throw new Error("Category not found");
    }
    return categoriesRepository.delete(id, workspaceId);
  },

  async getCategories(workspaceId: string, type?: "income" | "expense") {
    return categoriesRepository.findMany(workspaceId, type);
  },
};
