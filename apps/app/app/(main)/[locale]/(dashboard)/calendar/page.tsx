import { Suspense } from "react";
import { CalendarClient } from "@/components/organisms/calendar/calendar-client";
import { Hydrated } from "@/components/shared/hydrated";
import { Locale } from "@/i18n-config";
import { getDictionary } from "@/get-dictionary";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Calendar",
};

interface PageProps {
  params: Promise<{ locale: Locale }>;
}

export default async function CalendarPage({ params }: PageProps) {
  const { locale } = await params;
  const dictionary = await getDictionary(locale);

  return (
    <div className="flex-1 flex flex-col">
      <Hydrated>
        <Suspense fallback={<div>Loading calendar...</div>}>
          <CalendarClient dictionary={dictionary} />
        </Suspense>
      </Hydrated>
    </div>
  );
}
