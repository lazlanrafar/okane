"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import { useInfiniteQuery, useQueryClient } from "@tanstack/react-query";
import { getWallets } from "@workspace/modules/client";
import type { Wallet } from "@workspace/types";
import { Button, DataTable, DataTableColumnsVisibility, DataTableEmptyState, DataTableFilter } from "@workspace/ui";
import { Plus } from "lucide-react";

import { useDataTableFilter } from "@/hooks/use-data-table-filter";
import { useAccountsStore } from "@/stores/accounts";
import { useAppStore } from "@/stores/app";

import { accountColumns } from "./account-columns";
import { AccountDetailSheet } from "./account-detail-sheet";
import { AccountFormSheet } from "./account-form-sheet";

interface Props {
  initialData: Wallet[];
  rowCount: number;
  pageCount: number;
  initialPage: number;
  pageSize: number;
  groups: any[];
  initialFilters?: any;
  dictionary: any;
  locale: string;
}

export function AccountsClient({
  initialData,
  rowCount,
  pageCount,
  initialPage,
  pageSize,
  groups,
  initialFilters,
  dictionary,
  locale,
}: Props) {
  const [isFormSheetOpen, setIsFormSheetOpen] = useState(false);
  const [isDetailSheetOpen, setIsDetailSheetOpen] = useState(false);
  const [selectedWalletId, setSelectedWalletId] = useState<string | undefined>();
  const { settings, formatCurrency } = useAppStore();
  const queryClient = useQueryClient();

  const { filters, handleFilterChange, pagination, handlePaginationChange } = useDataTableFilter({
    initialFilters: initialFilters || {
      q: "",
      groupId: "",
    },
    pageSize,
    initialPage,
  });

  const { columns, setColumns } = useAccountsStore();

  const { data, isLoading, isFetching, fetchNextPage, hasNextPage, isFetchingNextPage } = useInfiniteQuery({
    queryKey: ["wallets", filters.q, filters.groupId],
    queryFn: async ({ pageParam = 1 }) => {
      const res = await getWallets({
        search: filters.q as string,
        groupId: filters.groupId as string,
        page: pageParam,
        limit: pageSize,
      });
      if (!res.success) throw new Error(res.message);
      return res;
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      const pagination = lastPage.meta?.pagination;
      if (!pagination) return undefined;
      return pagination.page < pagination.total_pages ? pagination.page + 1 : undefined;
    },
    initialData: {
      pages: [
        {
          success: true,
          data: initialData,
          code: "OK",
          message: "Initial data",
          meta: {
            pagination: {
              total: rowCount,
              count: rowCount,
              per_page: pageSize,
              current_page: initialPage + 1,
              total_pages: pageCount,
            },
          },
          timestamp: Date.now(),
        },
      ],
      pageParams: [1],
    },
    staleTime: 300000,
    refetchOnWindowFocus: false,
  });

  const wallets = useMemo(() => {
    return data.pages?.flatMap((page: any) => page.data || []) || [];
  }, [data]);

  const selectedWallet = useMemo(() => {
    return wallets.find((w) => w.id === selectedWalletId);
  }, [wallets, selectedWalletId]);

  const totalBalance = useMemo(() => {
    return wallets.reduce((acc, w) => acc + Number(w.balance), 0);
  }, [wallets]);

  const activeAccounts = useMemo(() => {
    return wallets.filter((w) => Number(w.balance) > 0).length;
  }, [wallets]);

  const updateWalletInCache = useCallback(
    (updatedWallet: Wallet) => {
      queryClient.setQueriesData({ queryKey: ["wallets"] }, (oldData: any) => {
        if (!oldData) return oldData;
        return {
          ...oldData,
          pages: oldData.pages?.map((page: any) => ({
            ...page,
            data: page.data.map((wallet: Wallet) => (wallet.id === updatedWallet.id ? updatedWallet : wallet)),
          })),
        };
      });
    },
    [queryClient],
  );

  const handleCreate = () => {
    setSelectedWalletId(undefined);
    setIsFormSheetOpen(true);
  };

  const handleEdit = (wallet: Wallet) => {
    setSelectedWalletId(wallet.id);
    setIsFormSheetOpen(true);
  };

  const handleDelete = (wallet: Wallet) => {
    // Implementation for delete
  };

  const handleSuccess = (wallet: Wallet) => {
    if (selectedWalletId) {
      updateWalletInCache(wallet);
    } else {
      queryClient.invalidateQueries({ queryKey: ["wallets"] });
    }
  };

  const handleRowClick = (wallet: Wallet) => {
    setSelectedWalletId(wallet.id);
    setIsDetailSheetOpen(true);
  };

  const columnsWithActions = useMemo(() => {
    if (!dictionary) return [];
    return accountColumns(handleEdit, updateWalletInCache, dictionary);
  }, [handleEdit, updateWalletInCache, dictionary]);

  const groupOptions = useMemo(() => {
    return groups.map((g) => ({
      name: g.name,
      id: g.id,
    }));
  }, [groups]);

  if (!dictionary) return null;

  return (
    <div className="flex w-full flex-col h-full space-y-4">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-6 flex flex-col gap-1 border border-border">
          <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-[0.2em]">
            {dictionary.accounts.total_balance}
          </span>
          <span className="text-3xl font-serif font-medium tracking-tight">
            {formatCurrency(totalBalance, { locale })}
          </span>
        </div>
        <div className="p-6 flex flex-col gap-1 border border-border">
          <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-[0.2em]">
            {dictionary.accounts.title}
          </span>
          <span className="text-3xl font-serif font-medium tracking-tight">{wallets.length}</span>
        </div>
        <div className="p-6 flex flex-col gap-1 border border-border">
          <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-[0.2em]">
            {dictionary.accounts.active}
          </span>
          <span className="text-3xl font-serif font-medium tracking-tight text-emerald-600 dark:text-emerald-400">
            {activeAccounts}
          </span>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex items-center justify-between gap-4 shrink-0 px-1">
        <div className="flex items-center flex-1 max-w-sm">
          <DataTableFilter
            filters={filters}
            onFilterChange={handleFilterChange as any}
            placeholder={dictionary.accounts.search_placeholder}
            showDateFilter={false}
            showAmountFilter={false}
            statusOptions={groupOptions}
            statusKey="groupId"
            statusLabel={dictionary.accounts.group_label}
            className="w-full bg-transparent border-none p-0 focus-visible:ring-0"
          />
        </div>

        <div className="flex items-center gap-2">
          <DataTableColumnsVisibility columns={columns} />
          <Button onClick={handleCreate} variant="outline" size="sm">
            <Plus className="h-4 w-4 mr-2" />
            {dictionary.accounts.add_account}
          </Button>
        </div>
      </div>

      <div className="flex-1 min-h-0 relative">
        <DataTable
          data={wallets}
          columns={columnsWithActions}
          setColumns={setColumns}
          tableId="accounts"
          sticky={{
            columns: ["name"],
            startFromColumn: 0,
          }}
          emptyMessage={
            <DataTableEmptyState
              title={dictionary.accounts.empty.title}
              description={dictionary.accounts.empty.description}
              action={{
                label: dictionary.accounts.empty.action,
                onClick: handleCreate,
              }}
            />
          }
          infiniteScroll={true}
          fetchNextPage={fetchNextPage}
          hasNextPage={hasNextPage}
          isFetchingNextPage={isFetchingNextPage}
          hFull
          meta={{
            groups: groups,
            settings,
            formatCurrency,
            onRowClick: handleRowClick,
          }}
        />
      </div>

      <AccountFormSheet
        open={isFormSheetOpen}
        onOpenChange={setIsFormSheetOpen}
        walletId={selectedWalletId}
        onSuccess={handleSuccess}
        groups={groups}
        dictionaryByProps={dictionary}
      />

      <AccountDetailSheet
        open={isDetailSheetOpen}
        onOpenChange={setIsDetailSheetOpen}
        walletId={selectedWalletId}
        onEdit={handleEdit}
        onDelete={handleDelete}
        groups={groups}
        dictionary={dictionary}
        locale={locale}
      />
    </div>
  );
}
