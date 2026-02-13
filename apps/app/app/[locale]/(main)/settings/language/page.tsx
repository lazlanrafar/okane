import React from "react";
import { getDictionary } from "@/get-dictionary";
import { Locale } from "@/i18n-config";
import { LanguageSettingsForm } from "@/components/setting/language/language-settings-form";

interface Props {
  params: Promise<{
    locale: Locale;
  }>;
}

export default async function SettingLanguagePage({ params }: Props) {
  const { locale } = await params;
  const dictionary = await getDictionary(locale);

  return (
    <div className="space-y-6">
      <LanguageSettingsForm currentLocale={locale} dictionary={dictionary} />
    </div>
  );
}
