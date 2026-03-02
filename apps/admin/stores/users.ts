import type { Column, RowSelectionState, Updater } from "@tanstack/react-table";
import { create } from "zustand";

export type UserTab = "all" | "review";

interface RowSelectionByTab {
  all: Record<string, boolean>;
  review: Record<string, boolean>;
}

interface UsersState {
  canDelete?: boolean;
  columns: Column<any, unknown>[];
  setColumns: (columns?: Column<any, unknown>[]) => void;
  setCanDelete: (canDelete?: boolean) => void;
  // Per-tab row selection
  rowSelectionByTab: RowSelectionByTab;
  setRowSelection: (tab: UserTab, updater: Updater<RowSelectionState>) => void;
  // Helper to get row selection for a specific tab
  getRowSelection: (tab: UserTab) => Record<string, boolean>;
  // Clear selection for a specific tab
  clearRowSelection: (tab: UserTab) => void;
  lastClickedIndex: number | null;
  setLastClickedIndex: (index: number | null) => void;
}

export const useUsersStore = create<UsersState>()((set, get) => ({
  columns: [],
  canDelete: false,
  rowSelectionByTab: {
    all: {},
    review: {},
  },
  lastClickedIndex: null,
  setCanDelete: (canDelete) => set({ canDelete }),
  setColumns: (columns) => set({ columns: columns || [] }),
  setRowSelection: (tab: UserTab, updater: Updater<RowSelectionState>) =>
    set((state) => {
      const currentSelection = state.rowSelectionByTab[tab];
      const newSelection =
        typeof updater === "function" ? updater(currentSelection) : updater;
      return {
        rowSelectionByTab: {
          ...state.rowSelectionByTab,
          [tab]: newSelection,
        },
      };
    }),
  getRowSelection: (tab: UserTab) => get().rowSelectionByTab[tab],
  clearRowSelection: (tab: UserTab) =>
    set((state) => ({
      rowSelectionByTab: {
        ...state.rowSelectionByTab,
        [tab]: {},
      },
    })),
  setLastClickedIndex: (index) => set({ lastClickedIndex: index }),
}));
