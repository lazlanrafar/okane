import { getDictionary } from "@/get-dictionary";
import { Locale } from "@/i18n-config";
import { AccountsClient } from "@/components/accounts/accounts-client";

interface AccountsPageProps {
  params: {
    locale: Locale;
  };
}

export default async function AccountsPage({ params }: AccountsPageProps) {
  const { locale } = await params;
  const dictionary = await getDictionary(locale);

  return (
    <AccountsClient
      dictionary={dictionary.accounts}
      walletsDictionary={dictionary.settings.wallets}
    />
  );
}
