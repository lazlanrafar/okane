import { create } from "zustand";

interface SearchStore {
  isOpen: boolean;
  setOpen: (open?: boolean) => void;
}

export const useSearchStore = create<SearchStore>((set) => ({
  isOpen: false,
  setOpen: (open) =>
    set((state) => ({
      isOpen: typeof open === "boolean" ? open : !state.isOpen,
    })),
}));
