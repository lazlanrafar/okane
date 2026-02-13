"use server";

import { axiosInstance as api } from "@/lib/axios";

export interface Category {
  id: string;
  name: string;
  type: "income" | "expense";
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCategoryData {
  name: string;
  type: "income" | "expense";
}

export interface UpdateCategoryData {
  name?: string;
}

export const getIncomeCategories = async (): Promise<Category[]> => {
  const res = await api.get("/categories?type=income");
  return res.data || [];
};

export const getExpenseCategories = async (): Promise<Category[]> => {
  const res = await api.get("/categories?type=expense");
  return res.data || [];
};

export const createCategory = async (data: CreateCategoryData) => {
  const res = await api.post("/categories", data);
  return res.data;
};

export const updateCategory = async (id: string, data: UpdateCategoryData) => {
  const res = await api.patch(`/categories/${id}`, data);
  return res.data;
};

export const reorderCategories = async (
  updates: { id: string; sortOrder: number }[],
) => {
  const res = await api.put("/categories/reorder", { updates });
  return res.data;
};

export const deleteCategory = async (id: string) => {
  const res = await api.delete(`/categories/${id}`);
  return res.data;
};
