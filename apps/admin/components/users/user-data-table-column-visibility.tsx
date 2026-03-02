"use client";

import { useUsersStore } from "@/stores/users";
import { DataTableColumnsVisibility } from "@workspace/ui";

export default function UserDataTableColumnVisibility() {
  const { columns } = useUsersStore();

  return <DataTableColumnsVisibility columns={columns} />;
}
