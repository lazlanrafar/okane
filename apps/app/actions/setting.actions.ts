"use server";

import { axiosInstance as api } from "@/lib/axios";
import type { TransactionSettings } from "@/types/settings";

export const getTransactionSettings = async () => {
  const res = await api.get("/settings/transaction");
  return res.data;
};

export const updateTransactionSettings = async (
  data: Partial<TransactionSettings>,
) => {
  const res = await api.patch("/settings/transaction", data);
  return res.data;
};
