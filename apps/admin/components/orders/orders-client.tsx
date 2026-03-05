"use client";

import React, { useRef, useState, useEffect, useTransition } from "react";
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
import type { AdminOrderListing } from "@workspace/types";
import { useOrdersStore } from "@/stores/orders";
import { useDataTableFilter } from "@/hooks/use-data-table-filter";
import { columns as orderColumns } from "./orders-columns";

// ----------------------------------------------------------------------
// Orders Client (Main Component Export)
// ----------------------------------------------------------------------
type Props = {
  initialData: AdminOrderListing[];
  rowCount: number;
  pageCount: number;
  initialPage: number;
  pageSize: number;
};

export function OrdersClient({
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
      start: null,
      end: null,
      attachments: null,
      manual: null,
    },
    pageSize,
    initialPage,
  });

  const { columns, setColumns, openDetail } = useOrdersStore();

  const statusOptions = [
    { id: "paid", name: "Paid" },
    { id: "pending", name: "Pending" },
    { id: "failed", name: "Failed" },
    { id: "canceled", name: "Canceled" },
  ];

  return (
    <div className="flex w-full flex-col h-full space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shrink-0">
        <div>
          <h1 className="text-2xl tracking-tight">Orders</h1>
          <p className="text-sm text-muted-foreground mt-1">
            View and manage the system incoming active and historical orders.
          </p>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <DataTableFilter
          filters={filters}
          onFilterChange={handleFilterChange as any}
          statusOptions={statusOptions}
          placeholder="Search orders..."
          showAttachments
          showSource
        />

        <DataTableColumnsVisibility columns={columns} />
      </div>

      <div className="flex-1 min-h-0 relative">
        {isPending ? (
          <TableSkeleton
            columns={orderColumns}
            rowCount={pageSize}
            stickyColumnIds={["code"]}
            className="h-full"
          />
        ) : (
          <DataTable
            data={initialData}
            columns={orderColumns}
            setColumns={setColumns}
            tableId="orders"
            meta={{ onRowClick: openDetail }}
            sticky={{
              columns: ["code"],
            }}
            emptyMessage="No orders found."
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
