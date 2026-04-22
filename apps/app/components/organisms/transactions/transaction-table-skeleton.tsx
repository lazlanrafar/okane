"use client";

import { TableSkeleton } from "@workspace/ui";

export function TransactionTableSkeleton({ hideHeader = false }: { hideHeader?: boolean }) {
  const columns = [
    { id: "select", header: "" },
    { id: "date", header: "Date" },
    { id: "type", header: "Type" },
    { id: "category", header: "Category" },
    { id: "name", header: "Name" },
    { id: "amount", header: "Amount" },
    { id: "wallet", header: "Wallet" },
    { id: "actions", header: "" },
  ];

  return (
    <div className="flex h-full w-full flex-col space-y-4">
      {/* Skeleton for Header (Search and Actions) */}
      {!hideHeader && (
        <div className="flex shrink-0 items-center justify-between gap-4">
          <div className="flex h-10 max-w-sm flex-1 animate-pulse items-center rounded-md bg-muted/30" />
          <div className="flex items-center gap-2">
            <div className="h-9 w-24 animate-pulse rounded-md bg-muted/30" />
            <div className="h-9 w-24 animate-pulse rounded-md bg-muted/30" />
          </div>
        </div>
      )}

      <div className="relative min-h-0 flex-1">
        <TableSkeleton
          columns={columns as unknown}
          rowCount={20}
          stickyColumnIds={["select", "date", "name", "actions"]}
          actionsColumnId="actions"
        />
      </div>
    </div>
  );
}
