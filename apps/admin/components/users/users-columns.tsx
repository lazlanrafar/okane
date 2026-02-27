"use client";

import type { ColumnDef } from "@tanstack/react-table";
import type { SystemAdminUser } from "@workspace/types";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  Checkbox,
  DataTableColumnHeader,
  getInitials,
} from "@workspace/ui";

import { AdminActionsDropdown } from "./admin-actions-dropdown";

export const columns: ColumnDef<SystemAdminUser>[] = [
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
    accessorKey: "system_role",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Role" />
    ),
    cell: ({ row }) => {
      const role = String(row.getValue("system_role"));
      const displayRole = role.charAt(0).toUpperCase() + role.slice(1);
      return <span className="text-muted-foreground">{displayRole}</span>;
    },
    filterFn: (row, id, value: string[]) => {
      if (!value || value.length === 0) return true;
      const cellValue = String(row.getValue(id));
      return value.includes(cellValue);
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
