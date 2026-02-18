"use server";

import { revalidatePath } from "next/cache";

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
  revalidatePath("/settings");
  return res.data;
};

export const getSubCurrencies = async () => {
  const res = await api.get("/settings/sub-currencies");
  return res.data;
};

export const addSubCurrency = async (data: { currencyCode: string }) => {
  const res = await api.post("/settings/sub-currencies", data);
  return res.data;
};

export const removeSubCurrency = async (id: string) => {
  const res = await api.delete(`/settings/sub-currencies/${id}`);
  return res.data;
};

export const getExchangeRates = async (base?: string) => {
  const res = await api.get("/settings/rates", { params: { base } });
  return res.data;
};

export const convertCurrency = async (params: {
  amount: number;
  from: string;
  to: string;
}) => {
  const res = await api.get("/settings/rates/convert", { params });
  return res.data;
};
