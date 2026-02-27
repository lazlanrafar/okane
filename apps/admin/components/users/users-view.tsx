"use client";

import type { SystemAdminUser } from "@workspace/types";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  Badge,
  Button,
  Checkbox,
  DataTable,
  DataTableColumnHeader,
  DataTablePagination,
  DataTableViewOptions,
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
  Input,
  getInitials,
  useDataTableInstance,
} from "@workspace/ui";
import { type ColumnDef } from "@tanstack/react-table";
import { PlusCircle, Search } from "lucide-react";
import React, { useEffect, useRef, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { AdminActionsDropdown } from "./admin-actions-dropdown";

export interface UsersViewProps {
  initialUsers: SystemAdminUser[];
  initialTotal?: number;
  initialSearch?: string;
  initialRole?: string;
  initialSortBy?: string;
  initialSortOrder?: "asc" | "desc";
  pageCount?: number;
}

const columns: ColumnDef<SystemAdminUser>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
        className="translate-y-[2px]"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
        className="translate-y-[2px]"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "name",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Name" />
    ),
    cell: ({ row }) => {
      const user = row.original;
      return (
        <div className="flex items-center gap-3 w-[250px]">
          <Avatar className="h-7 w-7">
            <AvatarImage
              src={user.profile_picture || ""}
              alt={user.name || "User"}
            />
            <AvatarFallback>
              {getInitials(user.name || user.email)}
            </AvatarFallback>
          </Avatar>
          <span className="font-medium truncate">{user.name || "No name"}</span>
        </div>
      );
    },
  },
  {
    accessorKey: "is_super_admin",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Role" />
    ),
    cell: ({ row }) => {
      const isSuperAdmin = row.getValue("is_super_admin") as boolean;
      return (
        <span className="text-muted-foreground">
          {isSuperAdmin ? "System Admin" : "User"}
        </span>
      );
    },
    filterFn: (row, id, value) => {
      if (!value || value.length === 0) return true;
      return value.includes(row.getValue(id));
    },
  },
  {
    accessorKey: "email",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Email" />
    ),
    cell: ({ row }) => {
      return (
        <span className="text-muted-foreground">{row.getValue("email")}</span>
      );
    },
  },
  {
    accessorKey: "created_at",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Joined Date" />
    ),
    cell: ({ row }) => {
      return (
        <span className="text-muted-foreground whitespace-nowrap">
          {new Date(row.getValue("created_at")).toLocaleDateString()}
        </span>
      );
    },
  },
  {
    id: "actions",
    cell: ({ row }) => (
      <div className="text-right">
        <AdminActionsDropdown user={row.original} />
      </div>
    ),
    enableSorting: false,
    enableHiding: false,
  },
];

export function UsersView({
  initialUsers,
  initialTotal = 0,
  initialSearch,
  initialRole,
  initialSortBy,
  initialSortOrder,
  pageCount,
}: UsersViewProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const isInitialMount = useRef(true);
  const [isPending, startTransition] = useTransition();

  // Parse SSR initial URL state back into TanStack structure
  const defaultSorting = initialSortBy
    ? [{ id: initialSortBy, desc: initialSortOrder === "desc" }]
    : [];

  const defaultColumnFilters = initialRole
    ? [
        {
          id: "is_super_admin",
          value: initialRole === "true" ? [true] : [false],
        },
      ]
    : [];

  const totalPages = pageCount ?? Math.ceil(initialTotal / 50);

  // Determine starting page offset from URL via searchParams or default to 1
  const currentPageParams = searchParams.get("page");
  const startingPageIndex = currentPageParams
    ? parseInt(currentPageParams) - 1
    : 0;
  const currentLimitParams = searchParams.get("limit");
  const startingPageSize = currentLimitParams
    ? parseInt(currentLimitParams)
    : 50;

  const table = useDataTableInstance({
    data: initialUsers,
    columns,
    enableRowSelection: true,
    manualSorting: true,
    manualFiltering: true,
    manualPagination: true,
    pageCount: totalPages,
    defaultSorting,
    defaultColumnFilters,
    defaultGlobalFilter: initialSearch,
    defaultPageIndex: startingPageIndex,
    defaultPageSize: startingPageSize,
    defaultColumnVisibility: {
      select: false,
    },
  });

  // Local state for debounced searching
  const [searchValue, setSearchValue] = React.useState(initialSearch ?? "");

  // Debounce global filter to prevent rapid router.replace during typing
  useEffect(() => {
    const timeout = setTimeout(() => {
      table.setGlobalFilter(searchValue);
    }, 300);
    return () => clearTimeout(timeout);
  }, [searchValue, table]);

  // Sync Table state bounds directly to Next Router changes
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    const params = new URLSearchParams(searchParams.toString());

    // Sync Sorting
    const sortState = table.getState().sorting;
    if (sortState.length > 0) {
      params.set("sortBy", sortState[0]?.id || "");
      params.set("sortOrder", sortState[0]?.desc ? "desc" : "asc");
    } else {
      params.delete("sortBy");
      params.delete("sortOrder");
    }

    // Sync Search
    const search = table.getState().globalFilter;
    if (search) {
      params.set("search", search as string);
      // Reset to page 1 to ensure user searches from start of results
      params.delete("page");
    } else {
      params.delete("search");
    }

    // Sync Custom Filters
    const roleFilter = table.getColumn("is_super_admin")?.getFilterValue() as
      | boolean[]
      | undefined;
    if (roleFilter && roleFilter.length === 1) {
      // Set if exactly one mode is selected, else let DB query both
      params.set("is_super_admin", roleFilter[0] ? "true" : "false");
    } else {
      params.delete("is_super_admin");
    }

    // Sync Pagination
    const pageIndex = table.getState().pagination.pageIndex;
    if (pageIndex > 0) {
      params.set("page", (pageIndex + 1).toString());
    } else {
      params.delete("page");
    }

    const pageSize = table.getState().pagination.pageSize;
    if (pageSize !== 50) {
      params.set("limit", pageSize.toString());
    } else {
      params.delete("limit");
    }

    const currentUrl = `${pathname}?${params.toString()}`;
    startTransition(() => {
      router.replace(currentUrl, { scroll: false });
    });
  }, [
    table.getState().sorting,
    table.getState().globalFilter,
    table.getState().columnFilters,
    table.getState().pagination,
  ]);

  return (
    <div className="flex flex-col h-full space-y-4">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">Users</h1>
      </div>

      {/* Toolbar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search users..."
              value={searchValue}
              onChange={(event) => setSearchValue(event.target.value)}
              className="h-9 w-[150px] lg:w-[250px] pl-8 bg-background"
            />
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="h-9 border-dashed hidden sm:flex"
              >
                <PlusCircle className="mr-2 h-4 w-4" />
                Status
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-[150px]">
              <DropdownMenuCheckboxItem
                checked={
                  (
                    table.getColumn("status")?.getFilterValue() as
                      | boolean[]
                      | undefined
                  )?.includes(true) ?? false
                }
                onCheckedChange={(checked) => {
                  const val =
                    (table
                      .getColumn("status")
                      ?.getFilterValue() as boolean[]) ?? [];
                  const set = new Set(val);
                  if (checked) set.add(true);
                  else set.delete(true);
                  table
                    .getColumn("status")
                    ?.setFilterValue(
                      Array.from(set).length ? Array.from(set) : undefined,
                    );
                }}
              >
                Active
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={
                  (
                    table.getColumn("status")?.getFilterValue() as
                      | boolean[]
                      | undefined
                  )?.includes(false) ?? false
                }
                onCheckedChange={(checked) => {
                  const val =
                    (table
                      .getColumn("status")
                      ?.getFilterValue() as boolean[]) ?? [];
                  const set = new Set(val);
                  if (checked) set.add(false);
                  else set.delete(false);
                  table
                    .getColumn("status")
                    ?.setFilterValue(
                      Array.from(set).length ? Array.from(set) : undefined,
                    );
                }}
              >
                Pending
              </DropdownMenuCheckboxItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="h-9 border-dashed hidden sm:flex"
              >
                <PlusCircle className="mr-2 h-4 w-4" />
                Role
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-[150px]">
              <DropdownMenuCheckboxItem
                checked={
                  (
                    table.getColumn("is_super_admin")?.getFilterValue() as
                      | boolean[]
                      | undefined
                  )?.includes(true) ?? false
                }
                onCheckedChange={(checked) => {
                  const val =
                    (table
                      .getColumn("is_super_admin")
                      ?.getFilterValue() as boolean[]) ?? [];
                  const set = new Set(val);
                  if (checked) set.add(true);
                  else set.delete(true);
                  table
                    .getColumn("is_super_admin")
                    ?.setFilterValue(
                      Array.from(set).length ? Array.from(set) : undefined,
                    );
                }}
              >
                System Admin
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={
                  (
                    table.getColumn("is_super_admin")?.getFilterValue() as
                      | boolean[]
                      | undefined
                  )?.includes(false) ?? false
                }
                onCheckedChange={(checked) => {
                  const val =
                    (table
                      .getColumn("is_super_admin")
                      ?.getFilterValue() as boolean[]) ?? [];
                  const set = new Set(val);
                  if (checked) set.add(false);
                  else set.delete(false);
                  table
                    .getColumn("is_super_admin")
                    ?.setFilterValue(
                      Array.from(set).length ? Array.from(set) : undefined,
                    );
                }}
              >
                User
              </DropdownMenuCheckboxItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <div className="flex items-center space-x-2">
          <DataTableViewOptions table={table} />
        </div>
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
