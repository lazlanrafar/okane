import { getDictionary } from "@/get-dictionary";
import { UpgradeClient } from "@/components/organisms/upgrade/upgrade-client";

export default async function UpgradePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const dictionary = await getDictionary(locale as any);

  return (
    <div className="flex-1 flex flex-col min-h-0 overflow-y-auto">
      <UpgradeClient dictionary={dictionary} />
    </div>
  );
}
