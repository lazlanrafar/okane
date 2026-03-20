"use client";

import * as React from "react";
import { useMutation } from "@tanstack/react-query";
import {
  Button,
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  CardDescription,
  Skeleton,
  Progress,
  Badge,
  cn,
} from "@workspace/ui";
import { Check, Zap, CreditCard, Shield } from "lucide-react";
import type { Pricing } from "@workspace/types";
import {
  createCheckoutSession,
  createCustomerPortal,
} from "@workspace/modules/stripe/stripe.action";
import { toast } from "sonner";
import { useWorkspaceStore } from "@/stores/workspace-store";
import {
  formatBytes,
  displayPrice,
  getPlanLimits,
  getStripePrice,
} from "@workspace/utils";

interface BillingViewProps {
  dictionary: any;
  initialPlans: Pricing[];
}


export function BillingView({
  dictionary,
  initialPlans,
}: BillingViewProps) {
  const { workspace, settings } = useWorkspaceStore();
  const [billingCycle, setBillingCycle] = React.useState<
    "monthly" | "annual"
  >("monthly");
  const currency = settings?.mainCurrencyCode?.toLowerCase() || "usd";

  const checkoutMutation = useMutation({
    mutationFn: async (priceId: string) => {
      const result = await createCheckoutSession(priceId);
      if (!result.success) throw new Error(result.error);
      return result.data;
    },
    onSuccess: (data) => {
      if (data.url) window.location.href = data.url;
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
      if (data.url) window.location.href = data.url;
    },
    onError: (error: any) => toast.error(error.message),
  });

  const currentPlanId = workspace?.plan_id;
  const vaultUsed = workspace?.vault_size_used_bytes || 0;
  const aiUsed = workspace?.ai_tokens_used || 0;

  const currentPlan = (initialPlans?.find((p) => p.id === currentPlanId) || {
    name: "Starter",
    max_vault_size_mb: 50,
    max_ai_tokens: 50,
    features: [],
    prices: [],
  }) as Pricing;

  const { vaultLimitBytes, aiLimitTokens } = getPlanLimits(currentPlan);
  const vaultProgress = Math.min(100, (vaultUsed / vaultLimitBytes) * 100);
  const aiProgress = Math.min(100, (aiUsed / aiLimitTokens) * 100);

  const sortedPlans = [...(initialPlans || [])].sort((a, b) => {
    const order = ["starter", "pro", "business"];
    return (
      order.indexOf(a.name.toLowerCase()) - order.indexOf(b.name.toLowerCase())
    );
  });

  return (
    <div className="space-y-8">
      {/* Current Plan + Manage */}
      <div className="flex items-center justify-between border-b pb-4">
        <div className="space-y-0.5">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-widest">
            Current Plan
          </p>
          <p className="text-lg font-medium">{currentPlan.name}</p>
        </div>
        <div className="flex items-center gap-2">
          {workspace?.stripe_subscription_id ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() => portalMutation.mutate()}
              disabled={portalMutation.isPending}
              className="rounded-none text-xs h-8"
            >
              <CreditCard className="mr-1.5 h-3 w-3" />
              {portalMutation.isPending
                ? "Opening..."
                : dictionary.billing?.manage_subscription ||
                  "Manage Subscription"}
            </Button>
          ) : (
            <Badge
              variant="outline"
              className="rounded-none text-[10px] uppercase tracking-wider px-2 py-1 h-8"
            >
              Free Plan
            </Badge>
          )}
        </div>
      </div>

      {/* Usage */}
      <div className="grid gap-3 md:grid-cols-2">
        {/* Vault */}
        <Card className="rounded-none shadow-none">
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-widest flex items-center justify-between">
              {dictionary.billing?.vault_storage || "Vault Storage"}
              <Zap className="h-4 w-4 text-muted-foreground" />
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0 space-y-3">
            <div className="text-2xl font-serif tracking-tight font-medium">
              {formatBytes(vaultUsed)}
              <span className="text-sm font-normal text-muted-foreground ml-1">
                / {currentPlan.max_vault_size_mb} MB
              </span>
            </div>
            <Progress value={vaultProgress} className="h-1 rounded-none" />
            <div className="flex justify-between text-[10px] text-muted-foreground uppercase tracking-wider">
              <span>{vaultProgress.toFixed(1)}% used</span>
              <span>{formatBytes(vaultLimitBytes - vaultUsed)} remaining</span>
            </div>
          </CardContent>
        </Card>

        {/* AI Tokens */}
        <Card className="rounded-none shadow-none">
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-widest flex items-center justify-between">
              {dictionary.billing?.ai_tokens || "AI Tokens"}
              <Shield className="h-4 w-4 text-muted-foreground" />
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0 space-y-3">
            <div className="text-2xl font-serif tracking-tight font-medium">
              {aiUsed.toLocaleString()}
              <span className="text-sm font-normal text-muted-foreground ml-1">
                / {currentPlan.max_ai_tokens.toLocaleString()}
              </span>
            </div>
            <Progress value={aiProgress} className="h-1 rounded-none" />
            <div className="flex justify-between text-[10px] text-muted-foreground uppercase tracking-wider">
              <span>{aiProgress.toFixed(1)}% used</span>
              <span>{(aiLimitTokens - aiUsed).toLocaleString()} remaining</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Plans */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b pb-2">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-widest">
            Available Plans
          </p>
          {/* Billing cycle toggle */}
          <div className="flex border">
            <button
              type="button"
              onClick={() => setBillingCycle("monthly")}
              className={cn(
                "px-3 py-1 text-[10px] uppercase tracking-wider transition-colors",
                billingCycle === "monthly"
                  ? "bg-foreground text-background"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              Monthly
            </button>
            <button
              type="button"
              onClick={() => setBillingCycle("annual")}
              className={cn(
                "px-3 py-1 text-[10px] uppercase tracking-wider transition-colors border-l",
                billingCycle === "annual"
                  ? "bg-foreground text-background"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              Annual
            </button>
          </div>
        </div>

        {sortedPlans.length === 0 ? (
          <p className="text-sm text-muted-foreground py-4">
            No plans available.
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {sortedPlans.map((plan) => {
              const isCurrent = workspace?.plan_id === plan.id;
              const price = displayPrice(plan, billingCycle, {
                currency,
                compact: true,
              });
              const priceId = getStripePrice(plan, billingCycle, currency);

              return (
                <Card
                  key={plan.id}
                  className={cn(
                    "rounded-none shadow-none flex flex-col transition-colors",
                    isCurrent
                      ? "border-foreground"
                      : "hover:border-primary/50 cursor-pointer",
                  )}
                >
                  <CardHeader className="p-4 pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm font-medium">
                        {plan.name}
                      </CardTitle>
                      {isCurrent && (
                        <Badge
                          variant="outline"
                          className="rounded-none text-[9px] uppercase tracking-wider px-1.5 py-0 border-foreground"
                        >
                          Active
                        </Badge>
                      )}
                    </div>
                    <CardDescription className="text-[11px] line-clamp-2 mt-1">
                      {plan.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-4 pt-0 flex-1 space-y-4">
                    <div className="flex items-baseline gap-1 pt-2 border-t">
                      <span className="text-xl font-serif tracking-tight font-medium">
                        {price.label}
                      </span>
                      {plan.name.toLowerCase() !== "starter" && (
                        <span className="text-xs text-muted-foreground">
                          /mo
                        </span>
                      )}
                    </div>
                    <ul className="space-y-1.5">
                      {(plan.features || [])
                        .slice(0, 5)
                        .map((feature: string, i: number) => (
                          <li
                            key={i}
                            className="flex items-start gap-2 text-[11px] text-muted-foreground"
                          >
                            <Check className="h-3 w-3 text-foreground shrink-0 mt-0.5" />
                            {feature}
                          </li>
                        ))}
                    </ul>
                  </CardContent>
                  <CardFooter className="p-4 pt-0">
                    <Button
                      className="w-full h-8 text-[10px] uppercase tracking-wider rounded-none"
                      variant={isCurrent ? "secondary" : "default"}
                      disabled={
                        isCurrent ||
                        (checkoutMutation.isPending && !isCurrent) ||
                        (!priceId && plan.name.toLowerCase() !== "starter")
                      }
                      onClick={() => {
                        if (!isCurrent && priceId)
                          checkoutMutation.mutate(priceId);
                      }}
                    >
                      {isCurrent
                        ? "Current Plan"
                        : checkoutMutation.isPending
                          ? "Connecting..."
                          : plan.name.toLowerCase() === "starter"
                            ? "Downgrade"
                            : "Upgrade"}
                    </Button>
                  </CardFooter>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Billing history */}
      <div className="space-y-4">
        <div className="border-b pb-2">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-widest">
            Billing History
          </p>
        </div>
        <Card className="rounded-none shadow-none">
          <CardContent className="p-8 text-center">
            <CreditCard className="h-8 w-8 text-muted-foreground/30 mx-auto mb-3" />
            {workspace?.stripe_subscription_id ? (
              <>
                <p className="text-sm font-medium mb-1">Managed via Stripe</p>
                <p className="text-xs text-muted-foreground mb-4">
                  Your invoices and payment history are available in the Stripe
                  Customer Portal.
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-none text-xs h-8"
                  onClick={() => portalMutation.mutate()}
                  disabled={portalMutation.isPending}
                >
                  {portalMutation.isPending ? "Opening..." : "Open Portal"}
                </Button>
              </>
            ) : (
              <>
                <p className="text-sm font-medium mb-1">No billing history</p>
                <p className="text-xs text-muted-foreground">
                  Upgrade to a paid plan to see your invoices here.
                </p>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
