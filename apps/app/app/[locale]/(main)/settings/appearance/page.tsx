import React from "react";
import { getDictionary } from "@/get-dictionary";
import { Locale } from "@/i18n-config";
import { AppearanceForm } from "@/components/setting/appearance/appearance-form";

interface Props {
  params: Promise<{
    locale: Locale;
  }>;
}

export default async function SettingAppearancePage({ params }: Props) {
  const { locale } = await params;
  const dictionary = await getDictionary(locale);

  return <AppearanceForm dictionary={dictionary} />;
}
