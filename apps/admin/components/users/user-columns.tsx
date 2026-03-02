"use client";

import type { ColumnDef } from "@tanstack/react-table";

type User = {
  id: number;
  name: string;
  email: string;
  role: string;
  status: string;
  createdAt: string;
};

export const userColumns: ColumnDef<User>[] = [
  {
    accessorKey: "name",
    header: "Name",
    size: 200,
    minSize: 120,
    maxSize: 400,
    enableResizing: true,
    meta: {
      sticky: true,
      headerLabel: "Name",
      className:
        "w-[200px] min-w-[120px] md:sticky md:left-[var(--stick-left)] bg-background group-hover:bg-[#F2F1EF] group-hover:dark:bg-[#0f0f0f] z-10",
    },
    cell: ({ getValue }) => (
      <span className="truncate font-medium">{getValue<string>()}</span>
    ),
  },
  {
    accessorKey: "email",
    header: "Email",
    size: 260,
    minSize: 160,
    maxSize: 500,
    enableResizing: true,
    meta: {
      headerLabel: "Email",
      className: "w-[260px] min-w-[160px]",
    },
    cell: ({ getValue }) => (
      <span className="truncate text-muted-foreground">
        {getValue<string>()}
      </span>
    ),
  },
  {
    accessorKey: "role",
    header: "Role",
    size: 120,
    minSize: 80,
    maxSize: 200,
    enableResizing: true,
    meta: {
      headerLabel: "Role",
      className: "w-[120px] min-w-[80px]",
    },
    cell: ({ getValue }) => {
      const role = getValue<User["role"]>();
      return (
        <span
          className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
            role === "ADMIN"
              ? "bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400"
              : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
          }`}
        >
          {role}
        </span>
      );
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    size: 120,
    minSize: 80,
    maxSize: 200,
    enableResizing: true,
    meta: {
      headerLabel: "Status",
      className: "w-[120px] min-w-[80px]",
    },
    cell: ({ getValue }) => {
      const status = getValue<User["status"]>();
      return (
        <span
          className={`inline-flex items-center gap-1.5 text-xs font-medium ${
            status === "ACTIVE" ? "text-emerald-600" : "text-slate-400"
          }`}
        >
          <span
            className={`size-1.5 rounded-full flex-shrink-0 ${
              status === "ACTIVE" ? "bg-emerald-500" : "bg-slate-300"
            }`}
          />
          {status}
        </span>
      );
    },
  },
  {
    accessorKey: "createdAt",
    header: "Created At",
    size: 160,
    minSize: 120,
    maxSize: 260,
    enableResizing: true,
    meta: {
      headerLabel: "Created At",
      className: "w-[160px] min-w-[120px]",
    },
    cell: ({ getValue }) =>
      new Date(getValue<string>()).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      }),
  },
];
