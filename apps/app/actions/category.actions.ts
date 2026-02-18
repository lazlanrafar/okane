"use server";

import { axiosInstance as api } from "@/lib/axios";
import type { ActionResponse } from "@workspace/types";

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

export const getIncomeCategories = async (): Promise<
  ActionResponse<Category[]>
> => {
  try {
    const res = await api.get("/categories?type=income");
    return { success: true, data: res.data || [] };
  } catch (error: any) {
    return {
      success: false,
      error:
        error.response?.data?.message || "Failed to fetch income categories",
    };
  }
};

export const getExpenseCategories = async (): Promise<
  ActionResponse<Category[]>
> => {
  try {
    const res = await api.get("/categories?type=expense");
    return { success: true, data: res.data || [] };
  } catch (error: any) {
    return {
      success: false,
      error:
        error.response?.data?.message || "Failed to fetch expense categories",
    };
  }
};

export const createCategory = async (
  data: CreateCategoryData,
): Promise<ActionResponse<Category>> => {
  try {
    const res = await api.post("/categories", data);
    return { success: true, data: res.data };
  } catch (error: any) {
    return {
      success: false,
      error: error.response?.data?.message || "Failed to create category",
    };
  }
};

export const updateCategory = async (
  id: string,
  data: UpdateCategoryData,
): Promise<ActionResponse<Category>> => {
  try {
    const res = await api.patch(`/categories/${id}`, data);
    return { success: true, data: res.data };
  } catch (error: any) {
    return {
      success: false,
      error: error.response?.data?.message || "Failed to update category",
    };
  }
};

export const reorderCategories = async (
  updates: { id: string; sortOrder: number }[],
): Promise<ActionResponse<void>> => {
  try {
    const res = await api.put("/categories/reorder", { updates });
    return { success: true, data: res.data };
  } catch (error: any) {
    return {
      success: false,
      error: error.response?.data?.message || "Failed to reorder categories",
    };
  }
};

export const deleteCategory = async (
  id: string,
): Promise<ActionResponse<void>> => {
  try {
    const res = await api.delete(`/categories/${id}`);
    return { success: true, data: res.data };
  } catch (error: any) {
    return {
      success: false,
      error: error.response?.data?.message || "Failed to delete category",
    };
  }
};
