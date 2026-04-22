import { Suspense } from "react";

import { getInvoices } from "@workspace/modules/server";
import type { Metadata } from "next";

import { InvoicesClient } from "@/components/organisms/invoices/invoices-client";
import { Hydrated } from "@/components/shared/hydrated";
import { getDictionary } from "@/get-dictionary";
import type { Locale } from "@/i18n-config";

export const metadata: Metadata = {
  title: "Invoices",
};

export default async function InvoicesPage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;

  return (
    <div className="h-[calc(100dvh-5rem)] md:h-[calc(100dvh-6rem)] flex flex-col bg-background no-scrollbar">
      <div className="flex-1 min-h-0 no-scrollbar">
        <Suspense fallback={null}>
          <InvoicesPageContent locale={locale} />
        </Suspense>
      </div>
    </div>
  );
}

async function InvoicesPageContent({ locale }: { locale: Locale }) {
  const [invoicesRes, dictionary] = await Promise.all([getInvoices({ limit: 50 }), getDictionary(locale)]);

  const initialData = invoicesRes.success ? (invoicesRes as any).data : null;

  return (
    <Hydrated fallback={null}>
      <InvoicesClient initialData={initialData} dictionary={dictionary} />
    </Hydrated>
  );
}
