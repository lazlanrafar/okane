import { axiosInstance as api } from "@workspace/modules/server";

export async function syncMayarAction() {
  try {
    const { data } = await api.post("/mayar/sync");
    return data;
  } catch (error) {
    console.error("Failed to sync Mayar invoices:", error);
    return { success: false };
  }
}
