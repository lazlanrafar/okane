"use client";

import { useMemo, useState } from "react";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { deleteBudget, getBudgetStatus } from "@workspace/modules/client";
import { ApiResponse, type BudgetStatus } from "@workspace/types";
import { Button, DataTableEmptyState, Input, Progress } from "@workspace/ui";
import { formatCurrency } from "@workspace/utils";
import { PiggyBank, Plus, Search } from "lucide-react";
import { toast } from "sonner";

import { useAppStore } from "@/stores/app";

import { BudgetCard } from "./budget-card";
import { BudgetFormSheet } from "./budget-form-sheet";

interface Props {
  initialData: BudgetStatus[];
  dictionary: any;
  locale: string;
}

export function BudgetClient({ initialData, dictionary, locale }: Props) {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedBudget, setSelectedBudget] = useState<BudgetStatus | undefined>();
  const [searchQuery, setSearchQuery] = useState("");
  const queryClient = useQueryClient();
  const { settings } = useAppStore();

  const { data: budgets = [] } = useQuery({
    queryKey: ["budgets"],
    queryFn: async () => {
      const res = await getBudgetStatus();
      if (!res.success) throw new Error(res.message);
      return res.data || [];
    },
    initialData,
    staleTime: 60000,
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await deleteBudget(id);
      if (!res.success) throw new Error(res.message);
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["budgets"] });
      toast.success("Budget deleted successfully");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to delete budget");
    },
  });

  const handleEdit = (budget: BudgetStatus) => {
    setSelectedBudget(budget);
    setIsFormOpen(true);
  };

  const handleAdd = () => {
    setSelectedBudget(undefined);
    setIsFormOpen(true);
  };

  const filteredBudgets = useMemo(() => {
    return (budgets as BudgetStatus[]).filter((b: BudgetStatus) =>
      b.categoryName.toLowerCase().includes(searchQuery.toLowerCase()),
    );
  }, [budgets, searchQuery]);

  const totalBudgeted = (budgets as BudgetStatus[]).reduce((acc: number, b: BudgetStatus) => acc + b.amount, 0);
  const totalSpent = (budgets as BudgetStatus[]).reduce((acc: number, b: BudgetStatus) => acc + b.spent, 0);

  const usagePercent = totalBudgeted > 0 ? (totalSpent / totalBudgeted) * 100 : 0;

  return (
    <div className="flex w-full flex-col h-full space-y-4 animate-in fade-in duration-500">
      {/* Summary Cards - Matching Accounts Page Style */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-6 flex flex-col gap-1 border border-border">
          <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-[0.2em]">
            Total Monthly Budget
          </span>
          <span className="text-3xl font-serif font-medium tracking-tight">
            {formatCurrency(totalBudgeted, settings, { locale })}
          </span>
        </div>
        <div className="p-6 flex flex-col gap-1 border border-border">
          <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-[0.2em]">
            Total Spent (Current Month)
          </span>
          <span className="text-3xl font-serif font-medium tracking-tight">
            {formatCurrency(totalSpent, settings, { locale })}
          </span>
        </div>
        <div className="p-6 flex flex-col gap-1 border border-border">
          <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-[0.2em]">
            Overall Usage
          </span>
          <div className="flex items-center gap-4 mt-1">
            <span className="text-3xl font-serif font-medium tracking-tight">{Math.round(usagePercent)}%</span>
            <Progress value={usagePercent} className="h-1 flex-1 bg-muted" />
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex items-center justify-between gap-4 shrink-0 px-1">
        <div className="flex items-center flex-1 max-w-sm relative group">
          <Search className="absolute left-0 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-foreground transition-colors" />
          <Input
            placeholder="Search categories..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-7 bg-transparent border-none focus-visible:ring-0 shadow-none h-9"
          />
        </div>

        <div className="flex items-center gap-2">
          <Button onClick={handleAdd} variant="outline" size="sm">
            <Plus className="h-4 w-4 mr-2" />
            New Budget
          </Button>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 min-h-0 relative no-scrollbar overflow-y-auto">
        {filteredBudgets.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-10">
            {filteredBudgets.map((budget: BudgetStatus) => (
              <BudgetCard
                key={budget.id}
                budget={budget}
                onEdit={handleEdit}
                onDelete={deleteMutation.mutate}
                currencyCode={settings?.mainCurrencyCode}
                locale={locale}
              />
            ))}
          </div>
        ) : (
          <DataTableEmptyState
            title={searchQuery ? "No results found" : "No budgets set"}
            description={
              searchQuery ? "Try adjusting your search filters." : "Start tracking your spending by creating a budget."
            }
            action={{
              label: "Create Budget",
              onClick: handleAdd,
            }}
          />
        )}
      </div>

      <BudgetFormSheet open={isFormOpen} onOpenChange={setIsFormOpen} budget={selectedBudget} />
    </div>
  );
}
