"use client";

import { useCallback, useState } from "react";

import { useInfiniteQuery, useQueryClient } from "@tanstack/react-query";
import type { Dictionary } from "@workspace/dictionaries";
import {
  type CreateInvoiceData,
  createInvoice,
  deleteInvoice,
  getInvoices,
  updateInvoice,
} from "@workspace/modules/client";
import type { ApiResponse, Invoice, PaginatedList } from "@workspace/types";
import { Button, DataTable, DataTableColumnsVisibility, DataTableEmptyState, DataTableFilter } from "@workspace/ui";
import { Plus } from "lucide-react";
import { toast } from "sonner";

import { useDataTableFilter } from "@/hooks/use-data-table-filter";
import { useInvoicesStore } from "@/stores/invoices";

import { buildInvoiceColumns } from "./invoice-columns";
import { InvoiceDetailSheet } from "./invoice-detail-sheet";
import { InvoiceFormSheet } from "./invoice-form-sheet";

type InvoiceRow = Invoice & {
  contact?: { name?: string; email?: string } | null;
};

interface Props {
  dictionary: Dictionary;
}

export function InvoicesClient({ dictionary }: Props) {
  const queryClient = useQueryClient();
  const [isFormSheetOpen, setIsFormSheetOpen] = useState(false);
  const [isDetailSheetOpen, setIsDetailSheetOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<InvoiceRow | null>(null);
  const [editInvoice, setEditInvoice] = useState<Invoice | null>(null);

  const { columns, setColumns } = useInvoicesStore();

  const { filters, handleFilterChange } = useDataTableFilter({
    initialFilters: { q: "", status: "" },
    pageSize: 50,
    initialPage: 0,
  });

  const { data, isLoading, isFetchingNextPage, fetchNextPage, hasNextPage } = useInfiniteQuery({
    queryKey: ["invoices", filters.q, filters.status],
    queryFn: async ({ pageParam = 1 }) => {
      const res = await getInvoices({
        search: filters.q as string,
        status: (filters.status as string) || undefined,
        page: pageParam as number,
        limit: 50,
      });
      if (!res.success) throw new Error(res.error || "Failed to fetch invoices");
      return res;
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage: ApiResponse<PaginatedList<InvoiceRow>>) => {
      const meta = lastPage.meta?.pagination;
      if (!meta) return undefined;
      const nextPage = meta.page + 1;
      return nextPage <= meta.total_pages ? nextPage : undefined;
    },
    staleTime: 60000,
    refetchOnWindowFocus: false,
  });

  const allInvoices: InvoiceRow[] =
    data.pages?.flatMap((p) => {
      const items = p.data;
      if (!items) return [];

      if (Array.isArray(items)) {
        return items.map((item: any) => {
          if (item.invoice) {
            return {
              ...item.invoice,
              contact: item.contact,
            };
          }
          return item;
        });
      }

      // Handle single object response if any
      if (items && typeof items === "object" && "invoice" in items) {
        return [{ ...(items as any).invoice, contact: (items as any).contact }];
      }

      return [];
    }) ?? [];

  // Derived counts
  const openCount = allInvoices.filter((i) => i.status === "unpaid" || i.status === "draft").length;
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

  const handleUpdate = useCallback(
    async (id: string, data: Partial<Invoice>) => {
      const res = await updateInvoice(id, data);
      if (res.success) {
        refresh();
        setSelectedInvoice((prev) => (prev.id === id ? { ...prev, ...data } : prev));
      } else {
        throw new Error("Update failed");
      }
    },
    [refresh],
  );

  const handleFormSubmit = useCallback(
    async (formData: CreateInvoiceData, isSilent?: boolean): Promise<Invoice | boolean> => {
      let result: Invoice | boolean = false;
      if (editInvoice.id) {
        const res = await updateInvoice(editInvoice.id, formData);
        if (!res.success) {
          if (!isSilent) toast.error("Failed to update invoice");
          return false;
        }
        result = res.data;
      } else {
        const res = await createInvoice(formData);
        if (!res.success) {
          if (!isSilent) toast.error("Failed to create invoice");
          return false;
        }
        result = res.data;
        if (isSilent) {
          setEditInvoice(result);
        }
      }
      refresh();
      return result || true;
    },
    [editInvoice, refresh],
  );

  const tableColumns = buildInvoiceColumns({
    onEdit: handleEdit,
    onDelete: (invoice) => handleDelete(invoice.id),
    dictionary,
  });

  return (
    <div className="flex h-full w-full flex-col space-y-4">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <div className="flex flex-col gap-1 border border-border p-6">
          <span className="font-medium text-[10px] text-muted-foreground uppercase tracking-[0.2em]">
            {dictionary.invoices.summary.total}
          </span>
          <span className="font-medium font-serif text-3xl tracking-tight">{allInvoices.length}</span>
        </div>
        <div className="flex flex-col gap-1 border border-border p-6">
          <span className="font-medium text-[10px] text-muted-foreground uppercase tracking-[0.2em]">
            {dictionary.invoices.summary.open}
          </span>
          <span className="font-medium font-serif text-3xl text-yellow-600 tracking-tight dark:text-yellow-400">
            {openCount}
          </span>
          <span className="text-[10px] text-muted-foreground">{dictionary.invoices.summary.open_desc}</span>
        </div>
        <div className="flex flex-col gap-1 border border-border p-6">
          <span className="font-medium text-[10px] text-muted-foreground uppercase tracking-[0.2em]">
            {dictionary.invoices.summary.overdue}
          </span>
          <span className="font-medium font-serif text-3xl text-red-600 tracking-tight dark:text-red-400">
            {overdueCount}
          </span>
          <span className="text-[10px] text-muted-foreground">{dictionary.invoices.summary.overdue_desc}</span>
        </div>
        <div className="flex flex-col gap-1 border border-border p-6">
          <span className="font-medium text-[10px] text-muted-foreground uppercase tracking-[0.2em]">
            {dictionary.invoices.summary.paid}
          </span>
          <span className="font-medium font-serif text-3xl text-emerald-600 tracking-tight dark:text-emerald-400">
            {paidCount}
          </span>
          <span className="text-[10px] text-muted-foreground">{dictionary.invoices.summary.paid_desc}</span>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex shrink-0 items-center justify-between gap-4 px-1">
        <div className="flex max-w-sm flex-1 items-center">
          <DataTableFilter
            filters={filters}
            onFilterChange={handleFilterChange}
            placeholder={dictionary.invoices.search_placeholder}
            showDateFilter={false}
            showAmountFilter={false}
            className="w-full border-none bg-transparent p-0 focus-visible:ring-0"
          />
        </div>
        <div className="flex items-center gap-2">
          <DataTableColumnsVisibility columns={columns} />
          <Button
            variant="outline"
            onClick={() => {
              setEditInvoice(null);
              setIsFormSheetOpen(true);
            }}
          >
            <Plus className="h-4 w-4" />
            {dictionary.invoices.add_button}
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="relative min-h-0 flex-1">
        <DataTable
          data={allInvoices}
          columns={tableColumns as any}
          setColumns={setColumns}
          tableId="invoices"
          hFull
          emptyMessage={
            <DataTableEmptyState
              title={dictionary.invoices.empty.title}
              description={dictionary.invoices.empty.description}
              action={{
                label: dictionary.invoices.empty.action,
                onClick: () => {
                  setEditInvoice(null);
                  setIsFormSheetOpen(true);
                },
              }}
            />
          }
          meta={{
            onRowClick: handleRowClick,
          }}
          infiniteScroll
          fetchNextPage={fetchNextPage}
          hasNextPage={hasNextPage}
          isFetchingNextPage={isFetchingNextPage}
        />
      </div>

      <InvoiceFormSheet
        open={isFormSheetOpen}
        onOpenChange={(open) => {
          setIsFormSheetOpen(open);
          if (!open) setEditInvoice(null);
        }}
        invoice={editInvoice}
        onSubmit={handleFormSubmit}
        onSuccess={refresh}
        dictionary={dictionary}
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
        onUpdate={handleUpdate}
        dictionary={dictionary}
      />
    </div>
  );
}
