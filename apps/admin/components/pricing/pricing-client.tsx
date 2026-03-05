"use client";

import React, { useState, useEffect, useTransition } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import {
  cn,
  DataTable,
  TableSkeleton,
  DataTableColumnsVisibility,
  DataTableFilter,
  Icons,
} from "@workspace/ui";
import type { PaginationState } from "@tanstack/react-table";
import type { Pricing } from "@workspace/types";
import { useDataTableFilter } from "@/hooks/use-data-table-filter";
import { usePricingStore } from "@/stores/pricing";
import { pricingColumns } from "./pricing-columns";
import { PricingAddButton } from "./pricing-add-button";

type Props = {
  initialData: Pricing[];
  rowCount: number;
  pageCount: number;
  initialPage: number;
  pageSize: number;
};

export function PricingClient({
  initialData,
  rowCount,
  pageCount,
  initialPage,
  pageSize,
}: Props) {
  const {
    filters,
    handleFilterChange,
    pagination,
    handlePaginationChange,
    isPending,
  } = useDataTableFilter({
    initialFilters: {
      q: "",
      status: null,
    },
    pageSize,
    initialPage,
  });

  const { columns, setColumns, openDetail } = usePricingStore();

  const statusOptions = [
    { id: "active", name: "Active" },
    { id: "inactive", name: "Inactive" },
  ];

  return (
    <div className="flex w-full flex-col h-full space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shrink-0">
        <div>
          <h1 className="text-2xl tracking-tight">Pricing</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage system pricing plans and tiers.
          </p>
        </div>
        <div className="flex items-center gap-4">
          <DataTableFilter
            filters={filters}
            onFilterChange={handleFilterChange as any}
            statusOptions={statusOptions}
            placeholder="Search plans..."
          />

          <div className="flex items-center gap-2">
            <PricingAddButton />
            <DataTableColumnsVisibility columns={columns} />
          </div>
        </div>
      </div>

      <div className="flex-1 min-h-0 relative">
        {isPending ? (
          <TableSkeleton
            columns={pricingColumns}
            rowCount={pageSize}
            stickyColumnIds={["name"]}
            className="h-full"
          />
        ) : (
          <DataTable
            data={initialData}
            columns={pricingColumns}
            setColumns={setColumns}
            tableId="pricing"
            meta={{ onRowClick: openDetail }}
            sticky={{
              columns: ["name"],
              startFromColumn: 0,
            }}
            emptyMessage="No pricing plans found."
            manualPagination
            pagination={pagination}
            onPaginationChange={handlePaginationChange}
            rowCount={rowCount}
            pageCount={pageCount}
            hFull
          />
        )}
      </div>
    </div>
  );
}
