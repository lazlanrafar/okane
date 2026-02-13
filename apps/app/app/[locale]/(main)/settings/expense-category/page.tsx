import { getDictionary } from "@/get-dictionary";
import { Locale } from "@/i18n-config";
import { CategoryForm } from "@/components/setting/category/category-form";

export default async function ExpenseCategoryPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const dictionary = await getDictionary(locale as Locale);

  return (
    <CategoryForm
      type="expense"
      dictionary={dictionary.settings.category.expense}
    />
  );
}
