import React from "react";
import { ScrollableContent } from "@workspace/ui";
import { getWallets } from "@workspace/modules/server";
import { getWalletGroups } from "@workspace/modules/server";
import { AccountsClient } from "@/components/accounts/accounts-client";

export default async function AccountsPage(props: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const searchParams = await props.searchParams;
  const page = Number(searchParams.page) || 1;
  const limit = Number(searchParams.limit) || 20;
  const search =
    typeof searchParams.search === "string" ? searchParams.search : undefined;
  const groupId =
    typeof searchParams.groupId === "string" ? searchParams.groupId : undefined;

  // Get initial data for SSR
  const [walletsRes, groupsRes] = await Promise.all([
    getWallets({ search, groupId }),
    getWalletGroups(),
  ]);

  const wallets = Array.isArray(walletsRes?.data) ? walletsRes.data : [];
  const groups = Array.isArray(groupsRes?.data) ? groupsRes.data : [];

  const rowCount = wallets.length; // Note: In a real app with server-side pagination, this should come from API
  const pageCount = Math.ceil(rowCount / limit);

  return (
    <ScrollableContent className="h-full">
      <div className="flex flex-col h-full bg-background no-scrollbar">
        <AccountsClient
          initialData={wallets}
          rowCount={rowCount}
          pageCount={pageCount}
          initialPage={page - 1}
          pageSize={limit}
          groups={groups}
        />
      </div>
    </ScrollableContent>
  );
}
