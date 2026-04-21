import { getDictionary } from "@/get-dictionary";
import type { Locale } from "@/i18n-config";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Budget",
};

export default async function BudgetPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  const dictionary = await getDictionary(locale);

  return (
    <div className="flex-1 flex items-center justify-center p-8">
      <div className="flex flex-col items-center gap-4 text-center">
        <h1 className="text-2xl font-serif font-medium">
          {dictionary.sidebar.budget}
        </h1>
        <p className="text-muted-foreground">
          {dictionary.sidebar.coming_soon}
        </p>
      </div>
    </div>
  );
}
