"use client";

import type { BudgetStatus } from "@workspace/types";
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  cn,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  Progress,
} from "@workspace/ui";
import { formatCurrency } from "@workspace/utils";
import { Edit2, MoreHorizontal, Trash2 } from "lucide-react";

interface BudgetCardProps {
  budget: BudgetStatus;
  onEdit: (budget: BudgetStatus) => void;
  onDelete: (id: string) => void;
  currencyCode?: string;
  locale?: string;
}

export function BudgetCard({ budget, onEdit, onDelete, currencyCode = "USD", locale = "en-US" }: BudgetCardProps) {
  const isOverBudget = budget.spent > budget.amount;
  const isWarning = budget.percentage >= 80 && !isOverBudget;

  const currencySettings = {
    mainCurrencySymbol: currencyCode === "IDR" ? "Rp" : "$", // Simplified for now, should come from settings
    mainCurrencySymbolPosition: "Front" as const,
    mainCurrencyDecimalPlaces: currencyCode === "IDR" ? 0 : 2,
  };

  return (
    <Card className="overflow-hidden transition-all hover:shadow-md h-full flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium truncate flex-1">{budget.categoryName}</CardTitle>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onEdit(budget)}>
              <Edit2 className="mr-2 h-4 w-4" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => onDelete(budget.id)}>
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col justify-between pt-2">
        <div className="space-y-3">
          <div className="flex items-baseline justify-between gap-1">
            <span className="text-2xl font-bold">{formatCurrency(budget.spent, currencySettings, { locale })}</span>
            <span className="text-sm text-muted-foreground whitespace-nowrap">
              of {formatCurrency(budget.amount, currencySettings, { locale })}
            </span>
          </div>

          <div className="space-y-1">
            <Progress
              value={Math.min(budget.percentage, 100)}
              className={cn("h-2", isOverBudget ? "[&>div]:bg-destructive" : isWarning ? "[&>div]:bg-yellow-500" : "")}
            />
            <div className="flex justify-between items-center text-xs">
              <span
                className={cn(
                  "font-medium",
                  isOverBudget ? "text-destructive" : isWarning ? "text-yellow-600" : "text-muted-foreground",
                )}
              >
                {budget.percentage}% spent
              </span>
              {isOverBudget && (
                <span className="text-destructive font-medium uppercase tracking-wider">Over Budget</span>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
