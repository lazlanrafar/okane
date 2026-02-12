"use client";
"use no memo";

import { Download } from "lucide-react";

import {
  DataTable,
  DataTablePagination,
  DataTableViewOptions,
} from "@workspace/ui";
import { Button } from "@workspace/ui";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui";
import { useDataTableInstance } from "@workspace/ui";

import { recentLeadsColumns } from "./columns.crm";
import { recentLeadsData } from "./crm.config";

export function TableCards() {
  const table = useDataTableInstance({
    data: recentLeadsData,
    columns: recentLeadsColumns,
    getRowId: (row) => row.id.toString(),
  });

  return (
    <div className="grid grid-cols-1 gap-4 *:data-[slot=card]:shadow-xs">
      <Card>
        <CardHeader>
          <CardTitle>Recent Leads</CardTitle>
          <CardDescription>
            Track and manage your latest leads and their status.
          </CardDescription>
          <CardAction>
            <div className="flex items-center gap-2">
              <DataTableViewOptions table={table} />
              <Button variant="outline" size="sm">
                <Download />
                <span className="hidden lg:inline">Export</span>
              </Button>
            </div>
          </CardAction>
        </CardHeader>
        <CardContent className="flex size-full flex-col gap-4">
          <div className="overflow-hidden rounded-md border">
            <DataTable table={table} columns={recentLeadsColumns} />
          </div>
          <DataTablePagination table={table} />
        </CardContent>
      </Card>
    </div>
  );
}
