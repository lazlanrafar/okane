"use client";

import type { Transaction } from "@workspace/types";
import { Button, cn } from "@workspace/ui";
import { format, isToday, isYesterday, parseISO } from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { useCurrency } from "@workspace/ui/hooks";

import { TransactionItem } from "./transaction-item";

interface TransactionListProps {
  transactions: Transaction[];
  onRowClick: (transaction: Transaction) => void;
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

interface GroupedTransactions {
  [date: string]: {
    transactions: Transaction[];
    totalIncome: number;
    totalExpense: number;
  };
}

export function TransactionList({ transactions, onRowClick, page, totalPages, onPageChange }: TransactionListProps) {
  const { formatAmount, isIncomeBlue } = useCurrency();

  if (!transactions.length) {
    return (
      <div className="flex flex-col items-center justify-center p-16 text-center text-muted-foreground gap-2">
        <p className="text-base font-medium">No transactions yet</p>
        <p className="text-sm">Click &quot;Add Transaction&quot; to get started.</p>
      </div>
    );
  }

  // Group transactions by date
  const grouped = transactions.reduce<GroupedTransactions>((acc, transaction) => {
    const parts = transaction.date ? transaction.date.split("T") : [];
    const dateStr = parts[0] || "nodate";
    if (!acc[dateStr]) {
      acc[dateStr] = { transactions: [], totalIncome: 0, totalExpense: 0 };
    }
    acc[dateStr].transactions.push(transaction);

    const amount = Number(transaction.amount);
    if (transaction.type === "income") acc[dateStr].totalIncome += amount;
    if (transaction.type === "expense") acc[dateStr].totalExpense += amount;

    return acc;
  }, {});

  const sortedDates = Object.keys(grouped).sort((a, b) => b.localeCompare(a));

  return (
    <div className="w-full flex flex-col min-h-full">
      {/* DataTable Header Row */}
      <div className="grid grid-cols-[2fr_1fr_1fr_1fr] px-6 h-10 items-center border-b bg-background text-xs font-semibold text-muted-foreground uppercase tracking-wide sticky top-0 z-20">
        <span>Description</span>
        <span>Category / Wallet</span>
        <span>Type</span>
        <span className="text-right">Amount</span>
      </div>

      {/* Rows */}
      <div className="flex-1">
        {sortedDates.map((dateStr) => {
          const group = grouped[dateStr];
          if (!group) return null;

          const { transactions, totalIncome, totalExpense } = group;
          const date = parseISO(dateStr);

          let dayLabel = format(date, "EEE, MMM d, yyyy");
          if (isToday(date)) dayLabel = "Today · " + format(date, "MMM d, yyyy");
          else if (isYesterday(date)) dayLabel = "Yesterday · " + format(date, "MMM d, yyyy");

          return (
            <div key={dateStr}>
              {/* Date Group Header */}
              <div className="grid grid-cols-[2fr_1fr_1fr_1fr] items-center px-6 h-10 bg-muted/80 backdrop-blur-sm border-b border-t text-xs sticky top-10 z-10">
                <span className="font-semibold text-foreground">{dayLabel}</span>
                <span />
                <span />
                <div className="flex gap-3 justify-end">
                  {totalIncome > 0 && (
                    <span
                      className={cn(
                        "font-medium",
                        isIncomeBlue ? "text-blue-600 dark:text-blue-400" : "text-green-600 dark:text-green-400",
                      )}
                    >
                      +{formatAmount(totalIncome)}
                    </span>
                  )}
                  {totalExpense > 0 && (
                    <span
                      className={cn(
                        "font-medium",
                        isIncomeBlue ? "text-red-600 dark:text-red-400" : "text-red-600 dark:text-red-400", // Standard is also Red, but to be clear, settings usually swap red/blue
                      )}
                    >
                      -{formatAmount(totalExpense)}
                    </span>
                  )}
                </div>
              </div>

              {/* Transaction Rows */}
              {transactions.map((t) => (
                <TransactionItem key={t.id} transaction={t} onClick={() => onRowClick(t)} />
              ))}
            </div>
          );
        })}
      </div>

      {/* Pagination Footer */}
      {totalPages > 1 && (
        <div className="sticky bottom-0 z-30 flex items-center justify-between px-6 py-3 border-t bg-background shrink-0">
          <span className="text-sm text-muted-foreground">
            Page <span className="font-medium text-foreground">{page}</span> of{" "}
            <span className="font-medium text-foreground">{totalPages}</span>
          </span>

          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(1)}
              disabled={page === 1}
              className="h-8 w-8 p-0"
              aria-label="First page"
            >
              «
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(page - 1)}
              disabled={page === 1}
              className="h-8 w-8 p-0"
              aria-label="Previous page"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>

            {/* Page number pills */}
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
              .reduce<(number | "ellipsis")[]>((acc, p, idx, arr) => {
                if (idx > 0 && p - (arr[idx - 1] as number) > 1) acc.push("ellipsis");
                acc.push(p);
                return acc;
              }, [])
              .map((item, idx) =>
                item === "ellipsis" ? (
                  <span key={`ell-${idx}`} className="px-1 text-muted-foreground text-sm">
                    …
                  </span>
                ) : (
                  <Button
                    key={item}
                    variant={item === page ? "default" : "outline"}
                    size="sm"
                    onClick={() => onPageChange(item)}
                    className="h-8 w-8 p-0 text-sm"
                    aria-label={`Page ${item}`}
                    aria-current={item === page ? "page" : undefined}
                  >
                    {item}
                  </Button>
                ),
              )}

            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(page + 1)}
              disabled={page === totalPages}
              className="h-8 w-8 p-0"
              aria-label="Next page"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(totalPages)}
              disabled={page === totalPages}
              className="h-8 w-8 p-0"
              aria-label="Last page"
            >
              »
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
