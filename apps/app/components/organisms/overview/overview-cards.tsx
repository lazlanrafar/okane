"use client";

import { useChatActions } from "@ai-sdk-tools/store";
import { useQuery } from "@tanstack/react-query";
import { getCategoryBreakdown, getExpenseMetrics, getRevenueMetrics } from "@workspace/modules/server";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, cn, Skeleton } from "@workspace/ui";
import { ArrowDownRight, ArrowUpRight, LineChart, Minus, PieChart, Receipt, TrendingUp, Wallet } from "lucide-react";

import type { AppDictionary } from "@/modules/types/dictionary";
import { useAppStore } from "@/stores/app";

/** Skeleton block for a monetary value line */
function ValueSkeleton() {
  return <Skeleton className="h-6 w-40" />;
}

/** Skeleton block for a sub-line (trend) */
function TrendSkeleton() {
  return <Skeleton className="mt-1 h-3 w-24" />;
}

export function OverviewCards({ dictionary }: { dictionary: AppDictionary }) {
  const { sendMessage } = useChatActions();
  const { formatCurrency } = useAppStore();

  // —— Data fetching ——
  const { data: incomeResult, isLoading: loadingIncome } = useQuery({
    queryKey: ["metrics", "revenue"],
    queryFn: getRevenueMetrics,
    staleTime: 5 * 60 * 1000,
  });

  const { data: expenseResult, isLoading: loadingExpense } = useQuery({
    queryKey: ["metrics", "expense"],
    queryFn: getExpenseMetrics,
    staleTime: 5 * 60 * 1000,
  });

  const { data: categoryResult, isLoading: loadingCategory } = useQuery({
    queryKey: ["metrics", "category", "expense"],
    queryFn: () => getCategoryBreakdown("expense"),
    staleTime: 5 * 60 * 1000,
  });

  if (!dictionary) return null;

  const SUGGESTION_CHIPS = [
    {
      icon: <Wallet className="h-3.5 w-3.5" />,
      label: dictionary.overview.chips.wallet_balances,
      message: dictionary.overview.chips.wallet_balances_msg,
    },
    {
      icon: <LineChart className="h-3.5 w-3.5" />,
      label: dictionary.overview.chips.spending_analysis,
      message: dictionary.overview.chips.spending_analysis_msg,
    },
    {
      icon: <Receipt className="h-3.5 w-3.5" />,
      label: dictionary.overview.chips.latest_transactions,
      message: dictionary.overview.chips.latest_transactions_msg,
    },
    {
      icon: <TrendingUp className="h-3.5 w-3.5" />,
      label: dictionary.overview.chips.monthly_summary,
      message: dictionary.overview.chips.monthly_summary_msg,
    },
    {
      icon: <PieChart className="h-3.5 w-3.5" />,
      label: dictionary.overview.chips.top_expenses,
      message: dictionary.overview.chips.top_expenses_msg,
    },
  ];

  const isLoading = loadingIncome || loadingExpense;

  // —— Derived values ——
  const revenueData = incomeResult?.success ? (incomeResult.data ?? []) : [];
  const expenseData = expenseResult?.success ? (expenseResult.data ?? []) : [];
  const categoryData = categoryResult?.success ? (categoryResult.data ?? []) : [];

  const fmt = (v: number) => formatCurrency(v);

  const currentRevenue = revenueData[revenueData.length - 1]?.current ?? 0;
  const previousRevenue =
    revenueData[revenueData.length - 1]?.previous ?? revenueData[revenueData.length - 2]?.current ?? 0;

  const currentExpense = expenseData[expenseData.length - 1]?.current ?? 0;
  const previousExpense =
    expenseData[expenseData.length - 1]?.previous ?? expenseData[expenseData.length - 2]?.current ?? 0;

  const currentNetIncome = currentRevenue - currentExpense;
  const previousNetIncome = previousRevenue - previousExpense;

  const topCategory = categoryData.length
    ? categoryData.reduce((prev, current) => (prev.value > current.value ? prev : current))
    : null;

  // —— Helpers ——
  const handleCardClick = (message: string) => {
    sendMessage({
      role: "user",
      parts: [{ type: "text", text: message }],
    });
  };

  const renderTrend = (current: number, previous: number, reverseColors = false) => {
    if (isLoading) return <TrendSkeleton />;
    if (!previous && !current) return null;
    if (!previous)
      return <span className="ml-2 text-muted-foreground text-xs">{dictionary.overview.metrics.no_prior_data}</span>;

    const percentage = ((current - previous) / previous) * 100;
    const isPositive = percentage > 0;
    const isNeutral = percentage === 0;

    let colorClass = isNeutral ? "text-muted-foreground" : isPositive ? "text-emerald-500" : "text-red-500";
    if (reverseColors && !isNeutral) {
      colorClass = isPositive ? "text-red-500" : "text-emerald-500";
    }

    return (
      <span className={cn("ml-2 flex items-center font-medium text-xs tracking-tight", colorClass)}>
        {isPositive ? (
          <ArrowUpRight className="mr-0.5 h-3 w-3" />
        ) : isNeutral ? (
          <Minus className="mr-0.5 h-3 w-3" />
        ) : (
          <ArrowDownRight className="mr-0.5 h-3 w-3" />
        )}
        {Math.abs(percentage).toFixed(1)}% {dictionary.overview.metrics.vs_last_month}
      </span>
    );
  };

  return (
    <>
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-4">
        {/* Total Income */}
        <Card
          className="cursor-pointer rounded-none shadow-none transition-colors hover:border-primary/50"
          onClick={() => handleCardClick(dictionary.overview.chips.monthly_summary_msg)}
        >
          <CardHeader className="p-4 pb-2">
            <CardTitle className="flex items-center justify-between font-medium text-muted-foreground text-xs uppercase tracking-widest">
              {dictionary.overview.metrics.total_income}
              <TrendingUp className="h-4 w-4 text-emerald-500" />
            </CardTitle>
            <CardDescription className="sr-only">Current month total income</CardDescription>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            {isLoading ? (
              <ValueSkeleton />
            ) : (
              <div className="font-medium font-serif text-2xl tracking-tight">{fmt(currentRevenue)}</div>
            )}
            <div className="mt-1 flex items-center">
              <span className="text-muted-foreground text-xs">{dictionary.overview.metrics.this_month}</span>
              {renderTrend(currentRevenue, previousRevenue)}
            </div>
          </CardContent>
        </Card>

        {/* Total Expenses */}
        <Card
          className="cursor-pointer rounded-none shadow-none transition-colors hover:border-primary/50"
          onClick={() => handleCardClick(dictionary.overview.chips.spending_analysis_msg)}
        >
          <CardHeader className="p-4 pb-2">
            <CardTitle className="flex items-center justify-between font-medium text-muted-foreground text-xs uppercase tracking-widest">
              {dictionary.overview.metrics.total_expenses}
              <Receipt className="h-4 w-4 text-red-500" />
            </CardTitle>
            <CardDescription className="sr-only">Current month total expenses</CardDescription>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            {isLoading ? (
              <ValueSkeleton />
            ) : (
              <div className="font-medium font-serif text-2xl tracking-tight">{fmt(currentExpense)}</div>
            )}
            <div className="mt-1 flex items-center">
              <span className="text-muted-foreground text-xs">{dictionary.overview.metrics.this_month}</span>
              {renderTrend(currentExpense, previousExpense, true)}
            </div>
          </CardContent>
        </Card>

        {/* Net Income */}
        <Card
          className="cursor-pointer rounded-none shadow-none transition-colors hover:border-primary/50"
          onClick={() => handleCardClick(dictionary.overview.chips.monthly_summary_msg)}
        >
          <CardHeader className="p-4 pb-2">
            <CardTitle className="flex items-center justify-between font-medium text-muted-foreground text-xs uppercase tracking-widest">
              {dictionary.overview.metrics.net_income}
              <Wallet className="h-4 w-4 text-blue-500" />
            </CardTitle>
            <CardDescription className="sr-only">Current month net income</CardDescription>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            {isLoading ? (
              <ValueSkeleton />
            ) : (
              <div className="font-medium font-serif text-2xl tracking-tight">{fmt(currentNetIncome)}</div>
            )}
            <div className="mt-1 flex items-center">
              <span className="text-muted-foreground text-xs">{dictionary.overview.metrics.this_month}</span>
              {renderTrend(currentNetIncome, previousNetIncome)}
            </div>
          </CardContent>
        </Card>

        {/* Top Expense Category */}
        <Card
          className="flex cursor-pointer flex-col justify-between rounded-none shadow-none transition-colors hover:border-primary/50"
          onClick={() => handleCardClick(dictionary.overview.chips.top_expenses_msg)}
        >
          <CardHeader className="p-4 pb-2">
            <CardTitle className="flex items-center justify-between font-medium text-muted-foreground text-xs uppercase tracking-widest">
              {dictionary.overview.metrics.top_expense}
              <PieChart className="h-4 w-4 text-amber-500" />
            </CardTitle>
            <CardDescription className="sr-only">Highest expense category this month</CardDescription>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            {loadingCategory ? (
              <>
                <ValueSkeleton />
                <TrendSkeleton />
              </>
            ) : topCategory ? (
              <>
                <div className="truncate font-medium text-lg">{topCategory.name}</div>
                <div className="mt-1 text-muted-foreground text-xs">
                  {fmt(topCategory.value)} {dictionary.overview.metrics.this_month}
                </div>
              </>
            ) : (
              <div className="mt-2 text-muted-foreground text-sm">{dictionary.overview.metrics.no_expenses}</div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="mt-6 flex w-full flex-wrap justify-center gap-2">
        {SUGGESTION_CHIPS.map((chip) => (
          <button
            key={chip.label}
            type="button"
            onClick={() => handleCardClick(chip.message)}
            className={cn(
              "border bg-background px-3 py-2 text-xs transition-all",
              "hover:border-foreground/50 hover:text-foreground",
              "disabled:cursor-not-allowed disabled:opacity-50",
              "flex items-center gap-1.5 text-muted-foreground",
              "cursor-pointer",
            )}
          >
            {chip.icon}
            {chip.label}
          </button>
        ))}
      </div>
    </>
  );
}
