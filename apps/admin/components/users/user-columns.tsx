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
  },
  {
    accessorKey: "email",
    header: "Email",
    size: 260,
  },
  {
    accessorKey: "role",
    header: "Role",
    size: 120,
    cell: ({ getValue }) => {
      const role = getValue<User["role"]>();
      return (
        <span
          className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
            role === "ADMIN"
              ? "bg-violet-100 text-violet-700"
              : "bg-slate-100 text-slate-600"
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
    cell: ({ getValue }) => {
      const status = getValue<User["status"]>();
      return (
        <span
          className={`inline-flex items-center gap-1.5 text-xs font-medium ${
            status === "ACTIVE" ? "text-emerald-600" : "text-slate-400"
          }`}
        >
          <span
            className={`size-1.5 rounded-full ${
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
    size: 180,
    cell: ({ getValue }) =>
      new Date(getValue<string>()).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      }),
  },
];
