"use client";

import * as React from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  Skeleton,
  Progress,
  Tabs,
  TabsList,
  TabsTrigger,
  cn,
} from "@workspace/ui";
import { Check, Zap, CreditCard, Shield, Rocket } from "lucide-react";
import type { Pricing } from "@workspace/types";
import { getPricing } from "@workspace/modules/pricing/pricing.action";
import { createCheckoutSession, createCustomerPortal } from "@workspace/modules/stripe/stripe.action";
import { toast } from "sonner";
import { formatBytes, displayPrice, getPlanLimits, getStripePrice, annualSavingsPct } from "@workspace/utils";

interface BillingViewProps {
  dictionary: any;
  workspace: any;
}

export function BillingView({ dictionary, workspace }: BillingViewProps) {
  const [billingCycle, setBillingCycle] = React.useState<"monthly" | "annual">("annual");
  const currency = workspace?.currency?.toLowerCase() || "usd";

  const { data: pricingData, isLoading: isLoadingPricing } = useQuery({
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

  const portalMutation = useMutation({
    mutationFn: async () => {
      const result = await createCustomerPortal();
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

  if (isLoadingPricing) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-[200px] w-full" />
        <div className="grid gap-6 md:grid-cols-3">
          <Skeleton className="h-[400px] w-full" />
          <Skeleton className="h-[400px] w-full" />
          <Skeleton className="h-[400px] w-full" />
        </div>
      </div>
    );
  }

  const currentPlanId = workspace.plan_id;
  const vaultUsed = workspace.vault_size_used_bytes || 0;
  const aiUsed = workspace.ai_tokens_used || 0;

  // Find current plan details from pricing list
  const currentPlan = (pricingData?.find((p) => p.id === currentPlanId) || {
    name: "Free Tier",
    max_vault_size_mb: 50,
    max_ai_tokens: 50,
  }) as Pricing;

  const { vaultLimitBytes, aiLimitTokens } = getPlanLimits(currentPlan);
  const vaultProgress = Math.min(100, (vaultUsed / vaultLimitBytes) * 100);
  const aiProgress = Math.min(100, (aiUsed / aiLimitTokens) * 100);

  return (
    <div className="space-y-10">
      {/* Header & Subscription Management */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{dictionary.billing.title}</h1>
          <p className="text-muted-foreground">
            {dictionary.billing.description}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {workspace.stripe_subscription_id && (
            <Button
              variant="outline"
              onClick={() => portalMutation.mutate()}
              disabled={portalMutation.isPending}
            >
              <CreditCard className="mr-2 h-4 w-4" />
              {dictionary.billing.manage_subscription}
            </Button>
          )}
        </div>
      </div>

      {/* Usage Overview */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="shadow-sm">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                {dictionary.billing.vault_storage}
              </CardTitle>
              <Zap className="h-4 w-4 text-primary" />
            </div>
            <CardDescription className="text-2xl font-bold text-foreground mt-1">
              {formatBytes(vaultUsed)} <span className="text-sm font-normal text-muted-foreground">/ {currentPlan.max_vault_size_mb} MB</span>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Progress value={vaultProgress} className="h-2" />
            <p className="mt-3 text-xs text-muted-foreground flex justify-between">
              <span>{vaultProgress.toFixed(1)}% used</span>
              <span>{formatBytes(vaultLimitBytes - vaultUsed)} remaining</span>
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                {dictionary.billing.ai_tokens}
              </CardTitle>
              <Shield className="h-4 w-4 text-primary" />
            </div>
            <CardDescription className="text-2xl font-bold text-foreground mt-1">
              {aiUsed.toLocaleString()} <span className="text-sm font-normal text-muted-foreground">/ {currentPlan.max_ai_tokens.toLocaleString()}</span>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Progress value={aiProgress} className="h-2" />
            <p className="mt-3 text-xs text-muted-foreground flex justify-between">
              <span>{aiProgress.toFixed(1)}% used</span>
              <span>{(aiLimitTokens - aiUsed).toLocaleString()} tokens left</span>
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Plans Selection */}
      <div className="space-y-8">
        ... (rest of the plans grid)
      </div>

      {/* Invoice History (Placeholder) */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Invoice History</h2>
          <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
            View all
          </Button>
        </div>
        
        <Card className="divide-y shadow-sm">
          {!workspace.stripe_subscription_id ? (
            <div className="p-8 text-center">
              <CreditCard className="mx-auto h-10 w-10 text-muted-foreground/30 mb-3" />
              <p className="text-sm text-muted-foreground">No invoices found. Upgrade your plan to see history.</p>
            </div>
          ) : (
            <div className="p-8 text-center">
              <CreditCard className="mx-auto h-10 w-10 text-muted-foreground/30 mb-3" />
              <p className="text-sm text-muted-foreground">Invoice history is managed via the Stripe Customer Portal.</p>
              <Button 
                variant="link" 
                className="mt-2 h-auto p-0"
                onClick={() => portalMutation.mutate()}
              >
                Open Stripe Portal
              </Button>
            </div>
          )}
        </Card>
      </div>
      
      {/* Footer Info */}
      <div className="text-center pt-8 border-t">
        <p className="text-sm text-muted-foreground flex items-center justify-center gap-2">
          <Shield className="h-4 w-4" />
          30-day money-back guarantee · Secure checkout with Stripe
        </p>
      </div>
    </div>
  );
}
