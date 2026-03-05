"use server";

import { getInitialTableSettings, ScrollableContent } from "@workspace/ui";
import { getSystemAdminUsers } from "@workspace/modules/system-admin/system-admin.action";
import { UsersClient } from "@/components/users/users-client";

export default async function UsersPage(props: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const searchParams = await props.searchParams;
  const page = Number(searchParams.page) || 1;
  const limit = Number(searchParams.limit) || 20;
  const search =
    typeof searchParams.search === "string" ? searchParams.search : undefined;

  // Get initial data for SSR
  const response = await getSystemAdminUsers({
    page,
    limit,
    search,
  });

  const users = response.success ? response.data.users : [];
  const meta = response.success
    ? response.data.meta
    : { total: 0, total_pages: 0 };

  return (
    <ScrollableContent className="h-full">
      <div className="flex flex-col h-full bg-background no-scrollbar space-y-4">
        <UsersClient
          initialData={users}
          rowCount={meta?.total}
          pageCount={meta?.total_pages}
          initialPage={page - 1}
          pageSize={limit}
        />
      </div>
    </ScrollableContent>
  );
}
