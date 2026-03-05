"use server";

import { ScrollableContent } from "@workspace/ui";
import { getPricing } from "@workspace/modules/pricing/pricing.action";
import { PricingClient } from "@/components/pricing/pricing-client";
import { PricingSheet } from "@/components/pricing/pricing-sheet";
import { PricingDetailSheet } from "@/components/pricing/pricing-detail-sheet";

interface Props {
  searchParams: Promise<{
    search?: string;
    page?: string;
    limit?: string;
    sortBy?: string;
    sortOrder?: string;
    status?: string;
  }>;
}

export default async function PricingPage({ searchParams }: Props) {
  const params = await searchParams;

  const res = await getPricing({
    search: params.search,
    page: params.page ?? "1",
    limit: params.limit ?? "20",
    sortBy: params.sortBy,
    sortOrder: params.sortOrder as "asc" | "desc",
    // Note: getPricing action might need to be updated to support status if it doesn't already
  });

  const pricingList = res.success ? res.data.pricingList : [];
  const pagination = res.success
    ? res.data.meta
    : { total: 0, total_pages: 0, page: 1, limit: 20 };

  return (
    <ScrollableContent className="h-full">
      <div className="flex flex-col h-full bg-background no-scrollbar space-y-4">
        <PricingClient
          initialData={pricingList}
          rowCount={pagination.total}
          pageCount={pagination.total_pages}
          initialPage={pagination.page - 1}
          pageSize={pagination.limit}
        />

        <PricingSheet />
        <PricingDetailSheet />
      </div>
    </ScrollableContent>
  );
}
