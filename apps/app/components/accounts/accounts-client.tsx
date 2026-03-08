"use client";

import { accountColumns } from "./account-columns";
import type { Wallet } from "@workspace/types";
import { useState, useMemo } from "react";
import {
  Button,
  DataTable,
  DataTableColumnsVisibility,
  DataTableFilter,
  TableSkeleton,
} from "@workspace/ui";
import { AccountFormSheet } from "./account-form-sheet";
import { AccountDetailSheet } from "./account-detail-sheet";
import { useDataTableFilter } from "@/hooks/use-data-table-filter";
import { useAccountsStore } from "@/stores/accounts";
import { useSearchParams } from "next/navigation";
import { useCurrency } from "@workspace/ui/hooks";

type Props = {
  initialData: Wallet[];
  rowCount: number;
  pageCount: number;
  initialPage: number;
  pageSize: number;
  groups: any[];
};

export function AccountsClient({
  initialData,
  rowCount,
  pageCount,
  initialPage,
  pageSize,
  groups,
}: Props) {
  const [isFormSheetOpen, setIsFormSheetOpen] = useState(false);
  const [isDetailSheetOpen, setIsDetailSheetOpen] = useState(false);
  const [selectedWallet, setSelectedWallet] = useState<Wallet | undefined>();
  const { settings } = useCurrency();

  const { filters, handleFilterChange, pagination, handlePaginationChange } =
    useDataTableFilter({
      initialFilters: {
        q: "",
        groupId: "",
      },
      pageSize,
      initialPage,
    });

  const { columns, setColumns } = useAccountsStore();

  const handleCreate = () => {
    setSelectedWallet(undefined);
    setIsFormSheetOpen(true);
  };

  const handleEdit = (wallet: Wallet) => {
    setSelectedWallet(wallet);
    setIsFormSheetOpen(true);
  };

  const handleRowClick = (wallet: Wallet) => {
    setSelectedWallet(wallet);
    setIsDetailSheetOpen(true);
  };

  const columnsWithActions = useMemo(() => {
    return accountColumns(handleEdit);
  }, []);

  const groupOptions = useMemo(() => {
    return groups.map((group) => ({
      id: group.id,
      name: group.name,
    }));
  }, [groups]);

  return (
    <div className="flex w-full flex-col h-full space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shrink-0">
        <div>
          <h1 className="text-2xl tracking-tight font-sans">Accounts</h1>
          <p className="text-sm text-muted-foreground mt-1">
            View and manage your financial accounts.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={handleCreate}>Add Account</Button>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <DataTableFilter
          filters={filters}
          onFilterChange={handleFilterChange as any}
          placeholder="Search accounts..."
          showDateFilter={false}
          showAmountFilter={false}
          statusOptions={groupOptions}
          statusKey="groupId"
          statusLabel="Category"
        />

        <DataTableColumnsVisibility columns={columns} />
      </div>

      <div className="flex-1 min-h-0 relative">
        <DataTable
          data={initialData}
          columns={columnsWithActions}
          setColumns={setColumns}
          tableId="accounts"
          sticky={{
            columns: ["name"],
            startFromColumn: 0,
          }}
          emptyMessage="No accounts found."
          manualPagination
          pagination={pagination}
          onPaginationChange={handlePaginationChange}
          rowCount={rowCount}
          pageCount={pageCount}
          hFull
          meta={{
            groups,
            settings,
            onRowClick: handleRowClick,
          }}
        />
      </div>

      <AccountFormSheet
        open={isFormSheetOpen}
        onOpenChange={setIsFormSheetOpen}
        wallet={selectedWallet as any}
      />

      <AccountDetailSheet
        open={isDetailSheetOpen}
        onOpenChange={setIsDetailSheetOpen}
        wallet={selectedWallet}
        onEdit={() => {
          setIsDetailSheetOpen(false);
          setIsFormSheetOpen(true);
        }}
      />
    </div>
  );
}
