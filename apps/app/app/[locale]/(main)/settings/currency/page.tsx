import { getDictionary } from "@/get-dictionary";
import { Locale } from "@/i18n-config";
import {
  getTransactionSettings,
  getSubCurrencies,
} from "@/actions/setting.actions";
import { MainCurrencyForm } from "@/components/setting/main-currency/main-currency-form";
import { SubCurrencyList } from "@/components/setting/sub-currency/sub-currency-list";
import { Separator } from "@workspace/ui";

interface CurrencyPageProps {
  params: Promise<{
    locale: string;
  }>;
}

export default async function CurrencyPage({ params }: CurrencyPageProps) {
  const { locale } = await params;
  const dictionary = await getDictionary(locale as Locale);
  const settings = await getTransactionSettings();
  const subCurrencies = await getSubCurrencies();

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">
          {dictionary.settings.sidebar.currency}
        </h3>
        <p className="text-sm text-muted-foreground">
          Manage your primary currency settings.
        </p>
      </div>
      <MainCurrencyForm settings={settings} dictionary={dictionary} />

      <Separator />

      <SubCurrencyList
        initialSubCurrencies={subCurrencies}
        settings={settings}
        dictionary={dictionary}
      />
    </div>
  );
}
