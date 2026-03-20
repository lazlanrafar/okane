import { redirect } from "next/navigation";
import type { Locale } from "@/i18n-config";

export default async function UpgradePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  redirect(`/${locale}/settings/billing`);
}
