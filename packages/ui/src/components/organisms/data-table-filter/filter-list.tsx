"use client";

import { Badge, Button, Icons, Skeleton } from "../../atoms";
import { format } from "date-fns";
import { useMemo } from "react";

export type FilterKey = "status" | "date" | "q";

export interface FilterOption {
  id: string;
  name: string;
}

interface Props {
  filters: Record<string, any>;
  loading?: boolean;
  onRemove: (key: string) => void;
  statusFilters?: FilterOption[];
}

export function FilterList({
  filters,
  loading,
  onRemove,
  statusFilters,
}: Props) {
  const renderFilterValue = (key: string, value: any) => {
    switch (key) {
      case "status":
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

    if (filters.start || filters.end) {
      list.push(["date", { from: filters.start, to: filters.end }]);
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
  }, [filters]);

  if (activeFilters.length === 0 && !loading) return null;

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
                  <Icons.Clear className="scale-0 group-hover:scale-100 transition-all w-0 group-hover:w-4" />
                  <span className="text-[11px] font-medium text-foreground/90 whitespace-nowrap">
                    {displayValue}
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
