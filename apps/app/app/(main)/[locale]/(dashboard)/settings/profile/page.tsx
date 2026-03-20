import { Separator } from "@workspace/ui";

import { SettingProfileForm } from "@/components/organisms/setting/profile/setting-profile-form";
import { getDictionary } from "@/get-dictionary";
import type { Locale } from "@/i18n-config";

interface Props {
  params: Promise<{
    locale: Locale;
  }>;
}

export default async function SettingsProfilePage({ params }: Props) {
  const { locale } = await params;
  const dictionary = await getDictionary(locale);
  const { profile } = dictionary.settings;

  return (
    <div className="space-y-6">
      <SettingProfileForm dictionary={dictionary} />
    </div>
  );
}
