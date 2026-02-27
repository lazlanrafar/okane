"use client";

import {
  type ColumnDef,
  type ColumnFiltersState,
  type SortingState,
  type VisibilityState,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { Search, X } from "lucide-react";
import React, { useCallback, useEffect, useRef, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { Button } from "../../atoms/button";
import { Input } from "../../atoms/input";
import { DataTable } from "./data-table";
import { DataTableFacetedFilter } from "./data-table-faceted-filter";
import { DataTablePagination } from "./data-table-pagination";
import { DataTableViewOptions } from "./data-table-view-options";

export interface FacetedFilterOption {
  label: string;
  value: string;
  icon?: React.ComponentType<{ className?: string }>;
}

export interface FacetedFilterConfig {
  columnId: string;
  title: string;
  options: FacetedFilterOption[];
}

export interface DataTableServerProps<TData, TValue> {
  data: TData[];
  columns: ColumnDef<TData, TValue>[];
  pageCount: number;
  searchPlaceholder?: string;
  filters?: FacetedFilterConfig[];

  initialSearch?: string;
  initialSortBy?: string;
  initialSortOrder?: "asc" | "desc";
  /** Map of columnId -> comma-separated string of selected values */
  initialFilters?: Record<string, string | undefined>;
  initialLimit?: number;
  initialTotal?: number;
}

export function DataTableServer<TData, TValue>({
  data,
  columns,
  pageCount,
  searchPlaceholder = "Search...",
  filters = [],
  initialSearch = "",
  initialSortBy,
  initialSortOrder,
  initialFilters = {},
  initialLimit = 10,
  initialTotal = 0,
}: DataTableServerProps<TData, TValue>) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const [, startTransition] = useTransition();

  const syncToUrl = useCallback(
    (updates: Record<string, string | undefined>) => {
      const url = new URL(window.location.href);
      const params = new URLSearchParams(url.search);

      for (const [key, value] of Object.entries(updates)) {
        if (value === undefined || value === "") {
          params.delete(key);
        } else {
          params.set(key, value);
        }
      }

      queueMicrotask(() => {
        startTransition(() => {
          router.replace(`${pathname}?${params.toString()}`, { scroll: false });
        });
      });
    },
    [pathname, router],
  );

  // Parse initial filters into ColumnFiltersState
  const getInitialColumnFilters = useCallback(() => {
    return Object.entries(initialFilters)
      .filter(([_, value]) => value !== undefined && value !== "")
      .map(([id, value]) => ({
        id,
        value: decodeURIComponent(value as string).split(","),
      }));
  }, [initialFilters]);

  const [sorting, setSorting] = React.useState<SortingState>(
    initialSortBy
      ? [{ id: initialSortBy, desc: initialSortOrder === "desc" }]
      : [],
  );

  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    getInitialColumnFilters(),
  );

  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({ select: false });

  const [rowSelection, setRowSelection] = React.useState({});

  const [globalFilter, setGlobalFilter] = React.useState(initialSearch);

  const currentPageParams = searchParams.get("page");
  const startingPageIndex = currentPageParams
    ? Number.parseInt(currentPageParams) - 1
    : 0;
  const currentLimitParams = searchParams.get("limit");
  const startingPageSize = currentLimitParams
    ? Number.parseInt(currentLimitParams)
    : initialLimit;

  const [pagination, setPagination] = React.useState({
    pageIndex: startingPageIndex,
    pageSize: startingPageSize,
  });

  const computedPageCount =
    pageCount ?? Math.ceil(initialTotal / pagination.pageSize);

  const handleSortingChange = useCallback(
    (updaterOrValue: SortingState | ((old: SortingState) => SortingState)) => {
      const next =
        typeof updaterOrValue === "function"
          ? updaterOrValue(sorting)
          : updaterOrValue;
      setSorting(next);
      queueMicrotask(() => {
        if (next.length > 0) {
          syncToUrl({
            sortBy: next[0]?.id || "",
            sortOrder: next[0]?.desc ? "desc" : "asc",
          });
        } else {
          syncToUrl({ sortBy: undefined, sortOrder: undefined });
        }
      });
    },
    [sorting, syncToUrl],
  );

  const handleColumnFiltersChange = useCallback(
    (
      updaterOrValue:
        | ColumnFiltersState
        | ((old: ColumnFiltersState) => ColumnFiltersState),
    ) => {
      const next =
        typeof updaterOrValue === "function"
          ? updaterOrValue(columnFilters)
          : updaterOrValue;
      setColumnFilters(next);
    },
    [columnFilters],
  );

  const handleFacetedFilterChange = useCallback(
    (columnId: string, values: string[]) => {
      if (values.length > 0) {
        setColumnFilters((prev) => {
          const existing = prev.filter((f) => f.id !== columnId);
          return [...existing, { id: columnId, value: values }];
        });
        syncToUrl({ [columnId]: values.join(",") });
      } else {
        setColumnFilters((prev) => prev.filter((f) => f.id !== columnId));
        syncToUrl({ [columnId]: undefined });
      }
    },
    [syncToUrl],
  );

  const handlePaginationChange = useCallback(
    (
      updaterOrValue:
        | typeof pagination
        | ((old: typeof pagination) => typeof pagination),
    ) => {
      const next =
        typeof updaterOrValue === "function"
          ? updaterOrValue(pagination)
          : updaterOrValue;
      setPagination(next);
      queueMicrotask(() => {
        syncToUrl({
          page:
            next.pageIndex > 0 ? (next.pageIndex + 1).toString() : undefined,
          limit: next.pageSize !== 50 ? next.pageSize.toString() : undefined,
        });
      });
    },
    [pagination, syncToUrl],
  );

  const [searchValue, setSearchValue] = React.useState(initialSearch);
  const isInitialMount = useRef(true);

  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    const timeout = setTimeout(() => {
      setGlobalFilter(searchValue);
      const updates: Record<string, string | undefined> = {
        search: searchValue || undefined,
      };
      if (searchValue) {
        updates.page = undefined;
        setPagination((prev) => ({ ...prev, pageIndex: 0 }));
      }
      syncToUrl(updates);
    }, 300);
    return () => clearTimeout(timeout);
  }, [searchValue, syncToUrl]);

  // Sync incoming initial filters on URL change (Server Component nav)
  // biome-ignore lint/correctness/useExhaustiveDependencies: Intentional stringification to prevent infinite loops from parent object literals
  useEffect(() => {
    // Only update if the stringified dependencies actually changed
    // to prevent unnecessary re-renders when data arrives
    setColumnFilters(getInitialColumnFilters());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(initialFilters)]);

  const isFiltered = columnFilters.length > 0;

  const table = useReactTable({
    data,
    columns,
    pageCount: computedPageCount,
    manualPagination: true,
    manualSorting: true,
    manualFiltering: true,
    state: {
      sorting,
      columnVisibility,
      rowSelection,
      columnFilters,
      pagination,
      globalFilter,
    },
    onGlobalFilterChange: setGlobalFilter,
    enableRowSelection: true,
    autoResetPageIndex: false,
    autoResetExpanded: false,
    // @ts-ignore - Prevent TanStack table from resetting filters to initial mount values on every data fetch
    autoResetColumnFilters: false,
    // @ts-ignore
    getRowId: (row) => row.id?.toString(),
    onRowSelectionChange: setRowSelection,
    onSortingChange: handleSortingChange,
    onColumnFiltersChange: handleColumnFiltersChange,
    onColumnVisibilityChange: setColumnVisibility,
    onPaginationChange: handlePaginationChange,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
  });

  return (
    <div className="flex flex-col h-full space-y-4">
      {/* Toolbar */}
      <div className="flex items-center justify-between">
        <div className="flex flex-1 items-center space-x-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={searchPlaceholder}
              value={searchValue}
              onChange={(event) => setSearchValue(event.target.value)}
              className="h-8 w-[150px] lg:w-[250px] pl-8 bg-background"
            />
          </div>
          {filters.map((filter) => {
            const tableCol = table.getColumn(filter.columnId);
            if (!tableCol) return null;
            return (
              <DataTableFacetedFilter
                key={filter.columnId}
                column={tableCol}
                title={filter.title}
                options={filter.options}
                onFilterChange={(values) =>
                  handleFacetedFilterChange(filter.columnId, values)
                }
                filterValues={
                  columnFilters.find((f) => f.id === filter.columnId)?.value as
                    | string[]
                    | undefined
                }
              />
            );
          })}
          {isFiltered && (
            <Button
              variant="ghost"
              onClick={() => {
                table.resetColumnFilters();
                const resets = filters.reduce<Record<string, undefined>>(
                  (acc, f) => {
                    acc[f.columnId] = undefined;
                    return acc;
                  },
                  {},
                );
                syncToUrl(resets);
              }}
              className="h-8 px-2 lg:px-3"
            >
              Reset
              <X className="ml-2 h-4 w-4" />
            </Button>
          )}
        </div>
        <DataTableViewOptions table={table} />
      </div>

      {/* Table Area */}
      <div className="rounded border bg-background flex-1 overflow-auto min-h-[400px]">
        <DataTable table={table} columns={columns} />
      </div>

      {/* Footer */}
      <DataTablePagination table={table} />
    </div>
  );
}
