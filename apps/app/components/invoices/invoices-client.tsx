"use client";

import { useState, useCallback } from "react";
import { Button, DataTable, DataTableFilter } from "@workspace/ui";
import { InvoiceFormSheet } from "./invoice-form-sheet";
import { InvoiceDetailSheet } from "./invoice-detail-sheet";
import { buildInvoiceColumns } from "./invoice-columns";
import type { Invoice } from "@workspace/types";
import { Plus, FileText, Clock, CheckCircle, AlertCircle } from "lucide-react";
import { useInfiniteQuery, useQueryClient } from "@tanstack/react-query";
import {
  getInvoices,
  createInvoice,
  updateInvoice,
  deleteInvoice,
  type CreateInvoiceData,
} from "@workspace/modules/client";
import { useDataTableFilter } from "@/hooks/use-data-table-filter";
import { useInvoicesStore } from "@/stores/invoices";
import { toast } from "sonner";

type InvoiceRow = Invoice & {
  customer?: { name?: string; email?: string } | null;
};

interface SummaryCardProps {
  title: string;
  value: number;
  icon: React.ElementType;
  className?: string;
}

function SummaryCard({
  title,
  value,
  icon: Icon,
  className,
}: SummaryCardProps) {
  return (
    <div
      className={`border border-border rounded-lg p-4 bg-card flex items-center gap-4 ${className ?? ""}`}
    >
      <div className="p-2 rounded-md bg-muted">
        <Icon className="h-5 w-5 text-muted-foreground" />
      </div>
      <div>
        <p className="text-xs text-muted-foreground">{title}</p>
        <p className="text-2xl font-semibold">{value}</p>
      </div>
    </div>
  );
}

interface Props {
  initialData?: any;
  customers?: Array<{ id: string; name: string }>;
}

export function InvoicesClient({ initialData, customers = [] }: Props) {
  const queryClient = useQueryClient();
  const [isFormSheetOpen, setIsFormSheetOpen] = useState(false);
  const [isDetailSheetOpen, setIsDetailSheetOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<InvoiceRow | null>(
    null,
  );
  const [editInvoice, setEditInvoice] = useState<Invoice | null>(null);

  const { columns, setColumns } = useInvoicesStore();

  const { filters, handleFilterChange } = useDataTableFilter({
    initialFilters: { q: "", status: "" },
    pageSize: 50,
    initialPage: 0,
  });

  const { data, isLoading, isFetchingNextPage, fetchNextPage, hasNextPage } =
    useInfiniteQuery({
      queryKey: ["invoices", filters.q, filters.status],
      queryFn: async ({ pageParam = 1 }) => {
        const res = await getInvoices({
          search: filters.q as string,
          status: (filters.status as string) || undefined,
          page: pageParam as number,
          limit: 50,
        });
        if (!res.success) throw new Error((res as any).error);
        return res;
      },
      initialPageParam: 1,
      getNextPageParam: (lastPage: any) => {
        const meta = lastPage.meta?.pagination;
        if (!meta) return undefined;
        const nextPage = meta.page + 1;
        return nextPage <= meta.total_pages ? nextPage : undefined;
      },
      staleTime: 60000,
      refetchOnWindowFocus: false,
    });

  const allInvoices: InvoiceRow[] =
    data?.pages.flatMap((p: any) => {
      const items = p.data;
      if (!items) return [];
      if (Array.isArray(items)) return items;
      // Handles { data: item[], customer: ... } format from joined query
      if (typeof items === "object" && "invoice" in items) return [items];
      return [];
    }) ?? [];

  // Derive summary counts
  const openCount = allInvoices.filter(
    (i) => i.status === "unpaid" || i.status === "draft",
  ).length;
  const overdueCount = allInvoices.filter((i) => i.status === "overdue").length;
  const paidCount = allInvoices.filter((i) => i.status === "paid").length;

  const refresh = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ["invoices"] });
  }, [queryClient]);

  const handleEdit = useCallback((invoice: InvoiceRow) => {
    setEditInvoice(invoice as Invoice);
    setIsFormSheetOpen(true);
  }, []);

  const handleRowClick = useCallback((invoice: InvoiceRow) => {
    setSelectedInvoice(invoice);
    setIsDetailSheetOpen(true);
  }, []);

  const handleDelete = useCallback(
    async (id: string) => {
      const res = await deleteInvoice(id);
      if (res.success) {
        toast.success("Invoice deleted");
        refresh();
      } else {
        toast.error("Failed to delete invoice");
      }
    },
    [refresh],
  );

  const handleStatusChange = useCallback(
    async (id: string, status: string) => {
      const res = await updateInvoice(id, { status } as any);
      if (res.success) {
        refresh();
      } else {
        throw new Error("Update failed");
      }
    },
    [refresh],
  );

  const handleFormSubmit = useCallback(
    async (formData: CreateInvoiceData) => {
      if (editInvoice?.id) {
        const res = await updateInvoice(editInvoice.id, formData as any);
        if (!res.success) {
          toast.error("Failed to update invoice");
          return false;
        }
      } else {
        const res = await createInvoice(formData);
        if (!res.success) {
          toast.error("Failed to create invoice");
          return false;
        }
      }
      refresh();
      return true;
    },
    [editInvoice, refresh],
  );

  const tableColumns = buildInvoiceColumns({
    onEdit: handleEdit,
    onDelete: handleDelete,
  });

  return (
    <div className="h-full flex flex-col">
      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4 px-4 pt-4">
        <SummaryCard title="Open" value={openCount} icon={FileText} />
        <SummaryCard title="Overdue" value={overdueCount} icon={AlertCircle} />
        <SummaryCard title="Paid" value={paidCount} icon={CheckCircle} />
        <SummaryCard title="Total" value={allInvoices.length} icon={Clock} />
      </div>

      {/* Controls */}
      <div className="px-4 pb-3 flex items-center justify-between gap-3">
        <DataTableFilter
          filters={filters}
          onFilterChange={handleFilterChange as any}
          placeholder="Search invoices..."
          showDateFilter={false}
          showAmountFilter={false}
          className="max-w-sm"
        />
        <Button
          size="sm"
          onClick={() => {
            setEditInvoice(null);
            setIsFormSheetOpen(true);
          }}
        >
          <Plus className="h-4 w-4 mr-1" />
          New Invoice
        </Button>
      </div>

      {/* Table */}
      <div className="flex-1 min-h-0 px-4 pb-4">
        <DataTable
          data={allInvoices}
          columns={tableColumns as any}
          setColumns={setColumns}
          tableId="invoices"
          hFull
          isLoading={isLoading}
          emptyMessage="No invoices yet. Create your first invoice to get started."
          meta={{
            onRowClick: handleRowClick,
          }}
          onLoadMore={() => {
            if (hasNextPage && !isFetchingNextPage) {
              fetchNextPage();
            }
          }}
        />
      </div>

      <InvoiceFormSheet
        open={isFormSheetOpen}
        onOpenChange={(open) => {
          setIsFormSheetOpen(open);
          if (!open) setEditInvoice(null);
        }}
        invoice={editInvoice}
        customers={customers}
        onSubmit={handleFormSubmit}
        onSuccess={refresh}
      />

      <InvoiceDetailSheet
        invoice={selectedInvoice}
        open={isDetailSheetOpen}
        onOpenChange={(open) => {
          setIsDetailSheetOpen(open);
          if (!open) setSelectedInvoice(null);
        }}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onStatusChange={handleStatusChange}
      />
    </div>
  );
}
