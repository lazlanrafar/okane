import { Suspense } from "react";
import type { Metadata } from "next";
import { getContacts, getTransactionSettings } from "@workspace/modules/server";
import { ContactsClient } from "@/components/organisms/contacts/contacts-client";
import { ContactTableSkeleton } from "@/components/organisms/contacts/contact-table-skeleton";
import { Hydrated } from "@/components/shared/hydrated";
import { getDictionary } from "@/get-dictionary";
import { Locale } from "@/i18n-config";

export const metadata: Metadata = {
  title: "Contacts",
};

export default async function ContactsPage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  return (
    <div className="h-[calc(100dvh-5rem)] md:h-[calc(100dvh-6rem)] flex flex-col bg-background no-scrollbar">
      <div className="flex-1 min-h-0 no-scrollbar">
        <Suspense fallback={<ContactTableSkeleton />}>
          <ContactsPageContent locale={locale} />
        </Suspense>
      </div>
    </div>
  );
}

async function ContactsPageContent({ locale }: { locale: Locale }) {
  const [result, dictionary, settingsResult] = await Promise.all([
    getContacts({ limit: 50 }),
    getDictionary(locale),
    getTransactionSettings(),
  ]);

  const contacts = result.success ? (result.data ?? []) : [];
  const settings = settingsResult.success ? settingsResult.data : null;

  return (
    <Hydrated fallback={<ContactTableSkeleton />}>
      <ContactsClient
        initialData={contacts}
        dictionary={dictionary}
        settings={settings}
      />
    </Hydrated>
  );
}
