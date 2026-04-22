import { getTransactionSettings } from "@workspace/modules/server";

import { CalendarClient } from "@/components/organisms/calendar/calendar-client";
import { Hydrated } from "@/components/shared/hydrated";
import { getDictionary } from "@/get-dictionary";
import type { Locale } from "@/i18n-config";

export const metadata: Metadata = {
  title: "Calendar",
};

interface PageProps {
  params: Promise<{ locale: Locale }>;
}

export default async function CalendarPage({ params }: PageProps) {
  const { locale } = await params;
  const [dictionary, settingsRes] = await Promise.all([getDictionary(locale), getTransactionSettings()]);

  const settings =
    settingsRes.success && settingsRes.data
      ? settingsRes.data
      : ({
          monthly_start_date: 1,
          weekly_start_day: "monday",
          default_period: "monthly",
          start_screen: "daily",
          income_expense_color: "blue-red",
          carry_over: false,
          autocomplete: true,
          time_input: "time",
          swipe_action: "delete",
          input_order: "amount",
          show_description: true,
          quick_note_button: true,
        } as any);

  return (
    <div className="flex flex-1 flex-col">
      <Hydrated>
        <Suspense fallback={<div>Loading calendar...</div>}>
          <CalendarClient dictionary={dictionary} settings={settings} />
        </Suspense>
      </Hydrated>
    </div>
  );
}
