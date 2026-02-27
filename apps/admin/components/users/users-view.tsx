"use client";

import type { SystemAdminUser } from "@workspace/types";
import { DataTableServer } from "@workspace/ui";
import { ShieldCheck, User } from "lucide-react";

import { columns } from "./users-columns";

export interface UsersViewProps {
  initialUsers: SystemAdminUser[];
  initialTotal?: number;
  initialSearch?: string;
  initialRole?: string;
  initialSortBy?: string;
  initialSortOrder?: "asc" | "desc";
  pageCount?: number;
}

const roleFilterOptions = [
  {
    label: "Owner",
    value: "owner",
    icon: ShieldCheck,
  },
  {
    label: "Finance",
    value: "finance",
    icon: ShieldCheck,
  },
  {
    label: "User",
    value: "user",
    icon: User,
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
  // Explicitly match the backend default limit from `users/page.tsx`
  const initialLimit = 10;

  return (
    <div className="flex flex-col h-full space-y-4">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">Users</h1>
      </div>

      <div className="flex-1 min-h-0">
        <DataTableServer
          data={initialUsers}
          columns={columns}
          pageCount={pageCount as number}
          initialTotal={initialTotal}
          initialLimit={initialLimit}
          searchPlaceholder="Filter users..."
          filters={[
            {
              columnId: "system_role",
              title: "Role",
              options: roleFilterOptions,
            },
          ]}
          initialSearch={initialSearch}
          initialSortBy={initialSortBy}
          initialSortOrder={initialSortOrder}
          initialFilters={{ system_role: initialRole }}
        />
      </div>
    </div>
  );
}
