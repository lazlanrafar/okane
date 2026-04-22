import type { Metadata } from "next";

import { NotificationSettings } from "@/components/organisms/setting/notification-settings";
import { getDictionary } from "@/get-dictionary";

export const metadata: Metadata = {
  title: "Notifications | Settings",
};

export default async function NotificationsSettingsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const _dictionary = await getDictionary(locale as any);

  return <NotificationSettings />;
}
