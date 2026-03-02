"use client";

import type {
  ColumnOrderState,
  ColumnSizingState,
  VisibilityState,
} from "@tanstack/react-table";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  mergeWithDefaults,
  type TableId,
  type TableSettings,
} from "../components/organisms/data-table/data-table-settings";

const STORAGE_KEY = "table-settings";

function readFromStorage(tableId: TableId): Partial<TableSettings> | undefined {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return undefined;
    const all = JSON.parse(raw) as Record<string, Partial<TableSettings>>;
    return all[tableId];
  } catch {
    return undefined;
  }
}

function writeToStorage(tableId: TableId, settings: Partial<TableSettings>) {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const all: Record<string, Partial<TableSettings>> = raw
      ? JSON.parse(raw)
      : {};
    all[tableId] = settings;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
  } catch {
    // Storage full or unavailable — fail silently
  }
}

interface UseTableSettingsProps {
  tableId: TableId;
  initialSettings?: Partial<TableSettings>;
}

interface UseTableSettingsReturn {
  columnVisibility: VisibilityState;
  setColumnVisibility: React.Dispatch<React.SetStateAction<VisibilityState>>;
  columnSizing: ColumnSizingState;
  setColumnSizing: React.Dispatch<React.SetStateAction<ColumnSizingState>>;
  columnOrder: ColumnOrderState;
  setColumnOrder: React.Dispatch<React.SetStateAction<ColumnOrderState>>;
}

/**
 * Hook for managing table column settings (visibility, sizing, order)
 * with automatic persistence to localStorage so settings survive page refreshes.
 *
 * Hydration-safe: always initialises from defaults (matching the server render),
 * then over-writes with localStorage values after mount inside a useEffect.
 */
export function useTableSettings({
  tableId,
  initialSettings,
}: UseTableSettingsProps): UseTableSettingsReturn {
  // Always start from defaults so server HTML === client HTML (no hydration mismatch)
  const defaults = mergeWithDefaults(initialSettings, tableId);

  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>(
    defaults.columns,
  );
  const [columnSizing, setColumnSizing] = useState<ColumnSizingState>(
    defaults.sizing,
  );
  const [columnOrder, setColumnOrder] = useState<ColumnOrderState>(
    defaults.order,
  );

  // After hydration, load persisted values from localStorage (client-only)
  const hasHydrated = useRef(false);
  useEffect(() => {
    if (hasHydrated.current) return;
    hasHydrated.current = true;

    const stored = readFromStorage(tableId);
    if (!stored) return;

    if (stored.columns) setColumnVisibility(stored.columns);
    if (stored.sizing && Object.keys(stored.sizing).length > 0)
      setColumnSizing(stored.sizing);
    if (stored.order && stored.order.length > 0) setColumnOrder(stored.order);
  }, [tableId]);

  // Track initial mount to skip the very first persist
  // (the hydration useEffect above will trigger state changes; we don't want to
  //  immediately write those back as if the user changed something)
  const persistReady = useRef(false);
  useEffect(() => {
    // Mark as ready after the hydration effect has run
    const t = setTimeout(() => {
      persistReady.current = true;
    }, 0);
    return () => clearTimeout(t);
  }, []);

  // Debounce timer ref
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const persistSettings = useCallback(
    (
      visibility: VisibilityState,
      sizing: ColumnSizingState,
      order: ColumnOrderState,
    ) => {
      if (!persistReady.current) return;
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        writeToStorage(tableId, { columns: visibility, sizing, order });
      }, 300);
    },
    [tableId],
  );

  useEffect(() => {
    persistSettings(columnVisibility, columnSizing, columnOrder);
  }, [columnVisibility, columnSizing, columnOrder, persistSettings]);

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  return {
    columnVisibility,
    setColumnVisibility,
    columnSizing,
    setColumnSizing,
    columnOrder,
    setColumnOrder,
  };
}
