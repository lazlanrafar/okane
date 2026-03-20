"use client";

import * as React from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import {
  Button,
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  Skeleton,
  Tabs,
  TabsList,
  TabsTrigger,
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
  cn,
} from "@workspace/ui";
import { Check, Info } from "lucide-react";
import { getPricing } from "@workspace/modules/pricing/pricing.action";
import { createCheckoutSession } from "@workspace/modules/stripe/stripe.action";
import { toast } from "sonner";
import {
  displayPrice,
  getStripePrice,
  annualSavingsPct,
} from "@workspace/utils";
import { useWorkspaceStore } from "@/stores/workspace-store";

interface UpgradeClientProps {
  dictionary: any;
}

export function UpgradeClient({ dictionary }: UpgradeClientProps) {
  const { workspace } = useWorkspaceStore();
  const [billingCycle, setBillingCycle] = React.useState<"monthly" | "annual">(
    "annual",
  );
  const [currency, setCurrency] = React.useState("usd");

  const { data: pricingData, isLoading } = useQuery({
    queryKey: ["pricing"],
    queryFn: async () => {
      const result = await getPricing({ is_active: "true" });
      if (result.success) return result.data.pricingList;
      throw new Error(result.error);
    },
  });

  const checkoutMutation = useMutation({
    mutationFn: async (priceId: string) => {
      const result = await createCheckoutSession(priceId);
      if (!result.success) throw new Error(result.error);
      return result.data;
    },
    onSuccess: (data) => {
      if (data.url) {
        window.location.href = data.url;
      }
    },
    onError: (error: any) => toast.error(error.message),
  });

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 space-y-8 animate-pulse">
        <div className="h-8 w-64 bg-muted rounded" />
        <div className="h-4 w-48 bg-muted rounded" />
        <div className="w-full max-w-2xl h-[500px] bg-muted rounded-xl" />
      </div>
    );
  }

  // Find the non-free plan (e.g., Pro or Business) to display prominently
  // For this design, we'll pick the first paid plan available
  const proPlan = pricingData?.find((p) => {
    const price = p.prices.find((pr) => pr.currency === currency);
    return price && (price.monthly > 0 || price.yearly > 0);
  });

  if (!proPlan) {
    return (
      <div className="flex flex-col items-center justify-center p-20 text-center">
        <Info className="h-12 w-12 text-muted-foreground mb-4" />
        <h2 className="text-xl font-semibold">No paid plans available</h2>
        <p className="text-muted-foreground mt-2">
          Please check back later or contact support.
        </p>
      </div>
    );
  }

  const savings = annualSavingsPct(proPlan, currency);
  const currentPrice = displayPrice(proPlan, billingCycle, {
    currency,
    showCents: false,
  });
  
  const yearlyRef = proPlan.prices.find(p => p.currency === currency);
  const totalYearly = yearlyRef ? yearlyRef.yearly / 100 : 0;

  return (
    <div className="max-w-4xl mx-auto w-full px-6 py-16 md:py-24 space-y-16">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl md:text-5xl font-medium tracking-tight">
          Continue with Okane
        </h1>
        {workspace?.plan_status === "trialing" && (
          <p className="text-muted-foreground text-lg">
            Your trial ends in {Math.max(0, Math.floor((new Date(workspace.stripe_current_period_end || "").getTime() - Date.now()) / (1000 * 60 * 60 * 24)))} days.
          </p>
        )}
      </div>

      {/* Main Pricing Section */}
      <div className="flex flex-col items-center space-y-12">
        <div className="bg-muted/50 p-1 rounded-lg inline-flex">
          <Tabs
            value={billingCycle}
            onValueChange={(v) => setBillingCycle(v as any)}
            className="w-auto"
          >
            <TabsList className="bg-transparent h-9">
              <TabsTrigger
                value="monthly"
                className="data-[state=active]:bg-background px-6 py-1.5 text-xs font-medium"
              >
                Monthly
              </TabsTrigger>
              <TabsTrigger
                value="annual"
                className="data-[state=active]:bg-background px-6 py-1.5 text-xs font-medium"
              >
                Yearly {savings ? `(Save ${savings}%)` : ""}
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        <div className="w-full max-w-2xl border rounded-3xl p-8 md:p-12 space-y-10 bg-card shadow-sm hover:shadow-md transition-shadow">
          <div className="text-center space-y-2">
            <div className="flex items-center justify-center gap-1">
              <span className="text-6xl md:text-7xl font-bold tracking-tighter">
                {currentPrice.label}
              </span>
              <span className="text-xl md:text-2xl text-muted-foreground font-medium mt-4">
                /month
              </span>
            </div>
            {billingCycle === "annual" && (
              <p className="text-muted-foreground font-medium">
                {new Intl.NumberFormat(undefined, { style: 'currency', currency: currency.toUpperCase(), maximumFractionDigits: 0 }).format(totalYearly)}/year - billed annually
              </p>
            )}
          </div>

          <Button
            size="lg"
            className="w-full h-14 text-lg font-semibold rounded-2xl bg-foreground text-background hover:bg-foreground/90 transition-all active:scale-[0.98]"
            onClick={() => {
              const priceId = getStripePrice(proPlan, billingCycle, currency);
              if (priceId) checkoutMutation.mutate(priceId);
              else toast.error("Price not configured for this currency/cycle.");
            }}
            disabled={checkoutMutation.isPending}
          >
            {checkoutMutation.isPending ? "Configuring checkout..." : "Upgrade"}
          </Button>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-4 pt-4">
            {proPlan.features.map((feature, i) => (
              <div key={i} className="flex items-center gap-3 py-1">
                <div className="h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <Check className="h-3 w-3 text-primary stroke-[3px]" />
                </div>
                <span className="text-[14px] text-muted-foreground font-medium leading-none">
                  {feature}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Currency & Guarantee */}
        <div className="flex flex-col items-center space-y-4 text-xs text-muted-foreground/60 tracking-wide font-medium">
          <p>
            30-day money-back guarantee · Tax calculated at checkout
          </p>
          <div className="flex items-center gap-1.5 uppercase">
            {["usd", "eur", "idr"].map((c) => (
              <button
                key={c}
                onClick={() => setCurrency(c)}
                className={cn(
                  "hover:text-foreground transition-colors px-1",
                  currency === c && "text-foreground font-bold underline underline-offset-4"
                )}
              >
                {c}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="max-w-2xl mx-auto w-full pt-16">
        <Accordion type="single" collapsible className="w-full border-t">
          <AccordionItem value="item-1" className="border-b px-0">
            <AccordionTrigger className="text-base font-medium py-6 hover:no-underline">
              Can I switch between monthly and yearly?
            </AccordionTrigger>
          <AccordionContent className="text-muted-foreground pb-6">
              Yes, you can switch your billing cycle at any time from your workspace settings.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-2" className="border-b px-0">
            <AccordionTrigger className="text-base font-medium py-6 hover:no-underline">
              What happens if I cancel?
            </AccordionTrigger>
            <AccordionContent className="text-muted-foreground pb-6">
              If you cancel your subscription, you'll still have access to your paid features until the end of your current billing period.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-3" className="border-b px-0">
            <AccordionTrigger className="text-base font-medium py-6 hover:no-underline">
              Can I export my data?
            </AccordionTrigger>
            <AccordionContent className="text-muted-foreground pb-6">
              Absolutely. You can export your data at any time from the settings panel in CSV or PDF format.
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </div>
  );
}
