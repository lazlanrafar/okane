import { BillingView } from "@/components/organisms/setting/billing/billing-view";
import { getPricing } from "@workspace/modules/pricing/pricing.action";
import { getDictionary } from "@/get-dictionary";
import { Locale } from "@/i18n-config";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Billing | Settings",
};

export default async function BillingPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const dictionary = await getDictionary(locale as Locale);
  const pricingResult = await getPricing({ is_addon: "false" });
  const addonsResult = await getPricing({ is_addon: "true" });

  const plans = pricingResult.success
    ? (pricingResult.data?.pricingList ?? [])
    : [];
    
  const addons = addonsResult.success
    ? (addonsResult.data?.pricingList ?? [])
    : [];

  return (
    <div className="space-y-6">
      <BillingView initialPlans={plans} initialAddons={addons} dictionary={dictionary} />
    </div>
  );
}

