"use server";

import { userColumns } from "@/components/users/user-columns";
import { UserDataTable } from "@/components/users/user-data-table";
import UserDataTableColumnVisibility from "@/components/users/user-data-table-column-visibility";
import UserSearchFilter from "@/components/users/user-search-filter";
import {
  getInitialTableSettings,
  ScrollableContent,
  TableSkeleton,
} from "@workspace/ui";
import { Suspense } from "react";

export default async function UsersPage(props: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const mockUsers = Array.from({ length: 100 }).map((_, i) => ({
    id: i + 1,
    name: `User ${i + 1}`,
    email: `user${i + 1}@example.com`,
    role: i % 2 === 0 ? "ADMIN" : "USER",
    status: i % 3 === 0 ? "INACTIVE" : "ACTIVE",
    createdAt: new Date(Date.now() - i * 10000000).toISOString(),
  }));

  // Get unified table settings from cookie
  const initialSettings = await getInitialTableSettings("transactions");

  return (
    <ScrollableContent>
      <div className="relative h-full">
        <div className="flex justify-between items-center py-6">
          <UserSearchFilter />
          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-2">
              <UserDataTableColumnVisibility />
              {/* <AddTransactions /> */}
            </div>
            {/* <TransactionTabs /> */}
          </div>
        </div>

        <Suspense
          fallback={
            <TableSkeleton
              columns={userColumns}
              columnVisibility={initialSettings.columns}
              columnSizing={initialSettings.sizing}
              columnOrder={initialSettings.order}
              stickyColumnIds={["select", "date", "description"]}
              actionsColumnId="actions"
            />
          }
        >
          <UserDataTable data={mockUsers} />
        </Suspense>
      </div>
    </ScrollableContent>
  );
}
