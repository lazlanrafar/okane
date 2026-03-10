import type { Column } from "@tanstack/react-table";
import { create } from "zustand";

interface InvoicesState {
  columns: Column<any, unknown>[];
  setColumns: (columns?: Column<any, unknown>[]) => void;
}

export const useInvoicesStore = create<InvoicesState>()((set) => ({
  columns: [],
  setColumns: (columns) => set({ columns: columns || [] }),
}));
