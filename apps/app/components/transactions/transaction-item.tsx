import { Transaction } from "@workspace/types";
import { formatCurrency } from "@workspace/utils";
import {
  ArrowRightLeft,
  ArrowUpRight,
  ArrowDownLeft,
  Wallet,
  Utensils,
  ShoppingBag,
  Home,
  FileText,
} from "lucide-react";
import { cn } from "@workspace/ui";
import { format } from "date-fns";

interface TransactionItemProps {
  transaction: Transaction;
}

const getCategoryIcon = (categoryName?: string | null) => {
  // Simple mapping - in a real app this might be dynamic or stored in DB
  const name = categoryName?.toLowerCase() || "";
  if (name.includes("food")) return Utensils;
  if (name.includes("shopping")) return ShoppingBag;
  if (name.includes("rent") || name.includes("home")) return Home;
  if (name.includes("bill")) return FileText;
  return Wallet;
};

export function TransactionItem({ transaction }: TransactionItemProps) {
  const isExpense = transaction.type === "expense";
  const isIncome = transaction.type === "income";
  const isTransfer = transaction.type === "transfer";

  const Icon = isTransfer
    ? ArrowRightLeft
    : transaction.categoryId
      ? getCategoryIcon(transaction.categoryId) // We only have ID here, ideally we need the name or category object
      : Wallet;

  // For now using Wallet/Icon based on type if category not resolved
  const DisplayIcon = isTransfer
    ? ArrowRightLeft
    : isIncome
      ? ArrowDownLeft
      : ArrowUpRight;

  return (
    <div className="flex items-center justify-between p-4 border-b last:border-b-0 hover:bg-muted/50 transition-colors cursor-pointer">
      <div className="flex items-center gap-4">
        <div
          className={cn(
            "p-2 rounded-full",
            isExpense && "bg-red-100 text-red-600 dark:bg-red-900/20",
            isIncome && "bg-green-100 text-green-600 dark:bg-green-900/20",
            isTransfer && "bg-blue-100 text-blue-600 dark:bg-blue-900/20",
          )}
        >
          <DisplayIcon className="w-5 h-5" />
        </div>
        <div className="flex flex-col">
          <span className="font-medium text-sm">
            {transaction.description ||
              (isTransfer
                ? `Transfer to ${transaction.toWallet?.name || "Unknown"}`
                : transaction.category?.name || "Uncategorized")}
          </span>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            {isTransfer ? (
              <span>From {transaction.wallet?.name}</span>
            ) : (
              <span>{transaction.wallet?.name}</span>
            )}
            {transaction.note && <span>• {transaction.note}</span>}
          </div>
        </div>
      </div>
      <div className="text-right">
        <div
          className={cn(
            "font-semibold text-sm",
            isExpense && "text-red-600",
            isIncome && "text-green-600",
            isTransfer && "text-blue-600",
          )}
        >
          {isExpense ? "-" : "+"}
          {formatCurrency(Number(transaction.amount))}
        </div>
        <div className="text-xs text-muted-foreground">
          {format(new Date(transaction.date), "MMM d, yyyy")}
        </div>
      </div>
    </div>
  );
}
