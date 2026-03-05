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
import type { SystemAdminUser } from "@workspace/types";
import { useDataTableFilter } from "@/hooks/use-data-table-filter";
import { useUsersStore } from "@/stores/users";
import { userColumns } from "./user-columns";

type Props = {
  initialData: SystemAdminUser[];
  rowCount: number;
  pageCount: number;
  initialPage: number;
  pageSize: number;
};

export function UsersClient({
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
    },
    pageSize,
    initialPage,
  });

  const { columns, setColumns } = useUsersStore();

  return (
    <div className="flex w-full flex-col h-full space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shrink-0">
        <div>
          <h1 className="text-2xl tracking-tight">Users</h1>
          <p className="text-sm text-muted-foreground mt-1">
            View and manage system administrative users.
          </p>
        </div>
        <div className="flex items-center gap-4">
          <DataTableFilter
            filters={filters}
            onFilterChange={handleFilterChange as any}
            placeholder="Search users..."
          />

          <DataTableColumnsVisibility columns={columns} />
        </div>
      </div>

      <div className="flex-1 min-h-0 relative">
        {isPending ? (
          <TableSkeleton
            columns={userColumns}
            rowCount={pageSize}
            stickyColumnIds={["name"]}
            className="h-full"
          />
        ) : (
          <DataTable
            data={initialData}
            columns={userColumns}
            setColumns={setColumns}
            tableId="users"
            sticky={{
              columns: ["name"],
              startFromColumn: 0,
            }}
            emptyMessage="No users found."
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
