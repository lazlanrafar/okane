"use client";

import { TableSkeleton } from "@workspace/ui";

export function DebtTableSkeleton() {
  const dictionary: any = null; // We don't need real dictionary for skeleton headers if we mock them

  const columns = [
    { id: "select", header: "" },
    { id: "type", header: "Type" },
    { id: "contactName", header: "Contact" },
    { id: "description", header: "Description" },
    { id: "amount", header: "Amount" },
    { id: "status", header: "Status" },
    { id: "dueDate", header: "Due Date" },
    { id: "actions", header: "" },
  ];

  return (
    <div className="flex w-full flex-col h-full space-y-4">
      {/* Toolbar Skeleton */}
      <div className="flex items-center justify-between gap-4 shrink-0 px-1">
        <div className="flex items-center flex-1 max-w-sm h-10 bg-muted/30 animate-pulse rounded-md" />
        <div className="flex items-center gap-2">
          <div className="w-10 h-9 bg-muted/30 animate-pulse rounded-md" />
          <div className="w-32 h-9 bg-muted/30 animate-pulse rounded-md" />
        </div>
      </div>

      <div className="flex-1 min-h-0 relative">
        <TableSkeleton
          columns={columns as any}
          rowCount={10}
          stickyColumnIds={["select", "contactName"]}
          actionsColumnId="actions"
        />
      </div>
    </div>
  );
}
