"use client";

import { Badge, Button, Icons, Skeleton } from "../../atoms";
import { format } from "date-fns";
import { useMemo } from "react";

import { DataTableFilterFacet } from "./data-table-filter";

export type FilterKey = "status" | "date" | "q";

export interface FilterOption {
  id: string;
  name: string;
  colorClass?: string;
}

interface Props {
  filters: Record<string, any>;
  loading?: boolean;
  onRemove: (key: string) => void;
  facets?: DataTableFilterFacet[];
  statusFilters?: FilterOption[];
  statusKey?: string;
  excludeKeys?: string[];
}

export function FilterList({
  filters,
  loading,
  onRemove,
  facets,
  statusFilters,
  statusKey = "status",
  excludeKeys,
}: Props) {
  const renderFilterValue = (key: string, value: any) => {
    // Check facets first
    if (facets) {
      const facet = facets.find((f) => f.id === key);
      if (facet) {
        if (Array.isArray(value)) {
          return value
            .map((v) => facet.options.find((o) => o.id === v)?.name || v)
            .join(", ");
        }
        return facet.options.find((o) => o.id === value)?.name || value;
      }
    }

    switch (key) {
      case "status":
      case statusKey:
        return statusFilters?.find((f) => f.id === value)?.name || value;
      case "date":
        if (value?.from && value?.to) {
          return `${format(new Date(value.from), "MMM d")} - ${format(new Date(value.to), "MMM d, yyyy")}`;
        }
        if (value?.from) return format(new Date(value.from), "MMM d, yyyy");
        return null;
      default:
        return value;
    }
  };

  const activeFilters = useMemo(() => {
    const list: [string, any][] = [];
    const processedKeys = new Set<string>();

    if (excludeKeys) {
      for (const key of excludeKeys) {
        processedKeys.add(key);
      }
    }

    if (filters.start || filters.end) {
      if (!processedKeys.has("start") && !processedKeys.has("end")) {
        list.push(["date", { from: filters.start, to: filters.end }]);
      }
      processedKeys.add("start");
      processedKeys.add("end");
    }

    Object.entries(filters).forEach(([key, value]) => {
      if (
        !processedKeys.has(key) &&
        value !== null &&
        value !== undefined &&
        value !== "" &&
        key !== "q" &&
        key !== "page" &&
        key !== "limit"
      ) {
        list.push([key, value]);
      }
    });

    return list;
  }, [filters, excludeKeys]);

  if (activeFilters.length === 0 && !loading) return null;

  // _ to be space weAre to be We Are
  const textCapitalize = (text: string) => {
    return text
      .replace(/_/g, " ")
      .replace(/\b\w/g, (char) => char.toUpperCase());
  };

  return (
    <div className="flex items-center gap-2 overflow-x-auto scrollbar-none py-1">
      {loading ? (
        <div className="flex gap-2">
          <Skeleton className="h-9 w-24 rounded-none" />
          <Skeleton className="h-9 w-20 rounded-none" />
        </div>
      ) : (
        <ul className="flex gap-2">
          {activeFilters.map(([key, value]) => {
            const displayValue = renderFilterValue(key, value);
            if (!displayValue) return null;

            return (
              <li key={key}>
                <Button
                  variant="secondary"
                  className="h-9 px-2 bg-secondary hover:bg-secondary font-normal flex space-x-1 items-center group rounded-none"
                  onClick={() => onRemove(key)}
                >
                  <Icons.Clear className="scale-0 size-auto group-hover:scale-100 transition-all w-0 group-hover:w-4" />
                  <span className="text-[11px] font-medium text-foreground/90 whitespace-nowrap">
                    {textCapitalize(key)}: {textCapitalize(displayValue)}
                  </span>
                </Button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
