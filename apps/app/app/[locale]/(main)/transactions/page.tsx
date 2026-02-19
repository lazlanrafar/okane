import { getTransactions } from "@/actions/transaction.actions";
import { TransactionView } from "@/components/transactions/transaction-view";
import { Suspense } from "react";
import { Transaction } from "@workspace/types";

export const dynamic = "force-dynamic"; // Ensure fresh data on every request

export default async function TransactionPage() {
  // Fetch initial data server-side
  // If this fails (e.g. 401), error boundary or middleware should handle it.
  // We'll assume auth middleware redirects if unauthed.
  let initialTransactions: Transaction[] = [];
  try {
    const response = await getTransactions({ limit: 50 });
    if (response?.success && response?.data) {
      initialTransactions = response.data;
    }
  } catch (error) {
    console.error("Failed to fetch transactions:", error);
    // Fallback to empty list or handle error UI
  }

  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 min-h-0">
        <Suspense
          fallback={
            <div className="p-8 text-center text-muted-foreground">
              Loading...
            </div>
          }
        >
          <TransactionView initialTransactions={initialTransactions} />
        </Suspense>
      </div>
    </div>
  );
}
