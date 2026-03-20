import { getDictionary } from "@/get-dictionary";
import type { Locale } from "@/i18n-config";
import { BillingView } from "@/components/organisms/setting/billing/billing-view";
import { getPricing } from "@workspace/modules/pricing/pricing.action";

export default async function BillingPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const dictionary = await getDictionary(locale as Locale);

  const pricingResult = await getPricing();

  const plans = pricingResult.success
    ? (pricingResult.data?.pricingList ?? [])
    : [];

  return (
    <div className="space-y-6">
      <BillingView
        dictionary={dictionary.settings}
        initialPlans={plans}
      />
    </div>
  );
}

