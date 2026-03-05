"use client";

import {
  ScrollArea,
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@workspace/ui";
import { PricingForm } from "./pricing-form";
import { usePricingStore } from "@/stores/pricing";

export function PricingSheet() {
  const { isOpen, close, mode, selectedPricing } = usePricingStore();

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && close()}>
      <SheetContent className="flex flex-col">
        <SheetHeader className="p-6 mb-0">
          <SheetTitle>
            {mode === "create" ? "Create Pricing Plan" : "Edit Pricing Plan"}
          </SheetTitle>
        </SheetHeader>

        <ScrollArea className="h-full p-0 pb-[130px]">
          <PricingForm
            key={selectedPricing?.id ?? "create"}
            initialData={selectedPricing}
            onSuccess={close}
          />
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
