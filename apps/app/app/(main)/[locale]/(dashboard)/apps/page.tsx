import { AppsClient } from "@/components/organisms/apps/apps-client";
import { getDictionary } from "@/get-dictionary";
import { Locale } from "@/i18n-config";
import type { Metadata } from "next";
import { Hydrated } from "@/components/shared/hydrated";

export const metadata: Metadata = {
  title: "Apps",
};

export default async function AppsPage({ params }: { params: Promise<{ locale: Locale }> }) {
  const dictionary = await getDictionary((await params).locale);
  return (
    <div className="flex-1 p-6">
      <Hydrated>
        <AppsClient dictionary={dictionary} />
      </Hydrated>
    </div>
  );
}
