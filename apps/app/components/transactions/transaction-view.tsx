"use client";

import { Transaction } from "@workspace/types";
import { TransactionList } from "./transaction-list";
import { TransactionForm } from "./transaction-form";
import { Button } from "@workspace/ui";
import { Plus } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@workspace/ui";
import { useState } from "react";
import { useRouter } from "next/navigation";

interface TransactionViewProps {
  initialTransactions: Transaction[];
}

export function TransactionView({ initialTransactions }: TransactionViewProps) {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();

  const handleSuccess = () => {
    setIsOpen(false);
    router.refresh(); // Refresh server data
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-6 py-4 border-b shrink-0">
        <h1 className="text-xl font-semibold">Transactions</h1>
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Transaction
            </Button>
          </SheetTrigger>
          <SheetContent className="sm:max-w-[540px]">
            <SheetHeader className="px-6 pt-6">
              <SheetTitle>Add Transaction</SheetTitle>
            </SheetHeader>
            <div className="p-6">
              <TransactionForm onSuccess={handleSuccess} />
            </div>
          </SheetContent>
        </Sheet>
      </div>

      <div className="flex-1 overflow-auto">
        <TransactionList transactions={initialTransactions} />
      </div>
    </div>
  );
}
