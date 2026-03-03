import { AccountsClient } from "@/components/accounts/accounts-client";
import { getDictionary } from "@/get-dictionary";
import type { Locale } from "@/i18n-config";

interface AccountsPageProps {
  params: {
    locale: Locale;
  };
}

export default async function AccountsPage({ params }: AccountsPageProps) {
  const { locale } = await params;
  const dictionary = await getDictionary(locale);

  return <AccountsClient dictionary={dictionary.accounts} walletsDictionary={dictionary.settings.wallets} />;
}
