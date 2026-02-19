import { Transaction } from "@workspace/types";
import { TransactionItem } from "./transaction-item";
import { format, parseISO, isToday, isYesterday } from "date-fns";

interface TransactionListProps {
  transactions: Transaction[];
}

interface GroupedTransactions {
  [date: string]: {
    transactions: Transaction[];
    totalIncome: number;
    totalExpense: number;
  };
}

import { useCurrency } from "@/hooks/use-currency";

export function TransactionList({ transactions }: TransactionListProps) {
  const { formatAmount } = useCurrency(); // Use the hook

  if (!transactions.length) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center text-muted-foreground">
        <p>No transactions found</p>
      </div>
    );
  }

  // Group transactions by date
  const grouped = transactions.reduce<GroupedTransactions>(
    (acc, transaction) => {
      // transaction.date is ISO string or close to it
      const parts = transaction.date ? transaction.date.split("T") : [];
      const dateStr = parts[0] || "nodate";
      if (!acc[dateStr]) {
        acc[dateStr] = { transactions: [], totalIncome: 0, totalExpense: 0 };
      }
      acc[dateStr].transactions.push(transaction);

      // Calculate daily totals
      const amount = Number(transaction.amount);
      if (transaction.type === "income") acc[dateStr].totalIncome += amount;
      if (transaction.type === "expense") acc[dateStr].totalExpense += amount;

      return acc;
    },
    {},
  );

  const sortedDates = Object.keys(grouped).sort((a, b) => b.localeCompare(a));

  return (
    <div className="flex flex-col">
      {sortedDates.map((dateStr) => {
        const group = grouped[dateStr];
        if (!group) return null;

        const { transactions, totalIncome, totalExpense } = group;
        const date = parseISO(dateStr);
        let dateLabel = format(date, "dd");
        let dayLabel = format(date, "EEE");

        if (isToday(date)) dayLabel = "Today";
        else if (isYesterday(date)) dayLabel = "Yesterday";

        // Calculate Header Summary
        // Design usually shows Total Income and Expense for the day in the header line

        return (
          <div key={dateStr} className="mb-2">
            <div className="flex items-center justify-between px-4 py-2 bg-muted/30 text-sm">
              <div className="flex items-baseline gap-2">
                <span className="font-bold text-lg">{dateLabel}</span>
                <span
                  className={
                    isToday(date) || isYesterday(date)
                      ? "font-medium bg-primary/10 text-primary px-1.5 rounded text-xs"
                      : "text-muted-foreground"
                  }
                >
                  {dayLabel}
                </span>
              </div>
              <div className="flex gap-4 text-xs">
                {totalIncome > 0 && (
                  <span className="text-blue-600">
                    {formatAmount(totalIncome)}
                  </span>
                )}
                {totalExpense > 0 && (
                  <span className="text-red-600">
                    {formatAmount(totalExpense)}
                  </span>
                )}
              </div>
            </div>
            <div className="bg-card">
              {transactions.map((t) => (
                <TransactionItem key={t.id} transaction={t} />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
