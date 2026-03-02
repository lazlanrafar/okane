"use client";

import { DataTable } from "@workspace/ui";
import { userColumns } from "./user-columns";
import { useEffect } from "react";
import { useUsersStore } from "@/stores/users";

type User = {
  id: number;
  name: string;
  email: string;
  role: string;
  status: string;
  createdAt: string;
};

type Props = {
  data: User[];
  onRowClick?: (user: User) => void;
};

export function UserDataTable({ data, onRowClick }: Props) {
  const {
    setRowSelection: setRowSelectionForTab,
    rowSelectionByTab,
    setColumns,
    setCanDelete,
    lastClickedIndex,
    setLastClickedIndex,
  } = useUsersStore();

  return (
    <DataTable
      data={data}
      columns={userColumns}
      setColumns={setColumns}
      tableId="users"
      meta={{ onRowClick }}
      sticky={{
        columns: ["name"],
        startFromColumn: 1,
      }}
      emptyMessage="No users found."
    />
  );
}
