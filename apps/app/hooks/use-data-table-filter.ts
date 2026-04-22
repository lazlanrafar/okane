"use client";

import { useEffect, useState, useTransition } from "react";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

import type { PaginationState } from "@tanstack/react-table";

interface UseDataTableFilterOptions<T extends Record<string, any>> {
  initialFilters: T;
  pageSize?: number;
  initialPage?: number;
  debounceMs?: number;
}

export function useDataTableFilter<T extends Record<string, any>>({
  initialFilters,
  pageSize = 10,
  initialPage = 0,
  debounceMs = 500,
}: UseDataTableFilterOptions<T>) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: initialPage,
    pageSize: pageSize,
  });

  const [filters, setFilters] = useState<T>(() => {
    const currentFilters = { ...initialFilters };
    for (const key in initialFilters) {
      const paramKey = key === "q" ? "search" : key;
      const isArrayDefault = Array.isArray(initialFilters[key]);

      if (isArrayDefault) {
        const values = searchParams.getAll(paramKey);
        currentFilters[key as keyof T] = (values.length > 0 ? values : initialFilters[key]) as any;
      } else {
        const value = searchParams.get(paramKey);
        currentFilters[key as keyof T] = (value || initialFilters[key]) as any;
      }
    }
    return currentFilters;
  });

  const handleFilterChange = (newFilters: T) => {
    setFilters(newFilters);
  };

  const handlePaginationChange = (updater: any) => {
    const nextValue = typeof updater === "function" ? updater(pagination) : updater;

    setPagination(nextValue);

    const params = new URLSearchParams(searchParams.toString());
    params.set("page", (nextValue.pageIndex + 1).toString());
    params.set("limit", nextValue.pageSize.toString());

    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`);
    });
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());
      let hasChanges = false;

      for (const key in filters) {
        const value = filters[key];
        const paramKey = key === "q" ? "search" : key;
        const currentValue = params.get(paramKey);

        if (value !== undefined && value !== null && value !== "") {
          if (Array.isArray(value)) {
            const currentValues = params.getAll(paramKey);
            if (JSON.stringify([...currentValues].sort()) !== JSON.stringify([...value].map(String).sort())) {
              params.delete(paramKey);
              for (const v of value as any[]) {
                params.append(paramKey, String(v));
              }
              params.set("page", "1");
              hasChanges = true;
            }
          } else if (currentValue !== String(value)) {
            params.set(paramKey, String(value));
            params.set("page", "1");
            hasChanges = true;
          }
        } else {
          if (params.has(paramKey)) {
            params.delete(paramKey);
            params.set("page", "1");
            hasChanges = true;
          }
        }
      }

      if (hasChanges) {
        const newUrl = `${pathname}?${params.toString()}`;
        startTransition(() => {
          router.push(newUrl);
        });
      }
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [filters, pathname, router, searchParams, debounceMs]);

  return {
    filters,
    handleFilterChange,
    pagination,
    setPagination,
    handlePaginationChange,
    isPending,
  };
}
