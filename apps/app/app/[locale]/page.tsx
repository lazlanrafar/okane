import { getDictionary } from "@/get-dictionary";
import type { Locale } from "@/i18n-config";
import Link from "next/link";
import { Button } from "@workspace/ui";

export default async function IndexPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  const dictionary = await getDictionary(locale);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2">
      <main className="flex flex-col items-center justi∏fy-center w-full flex-1 px-20 text-center">
        <h1 className="text-6xl font-bold">{dictionary.home.welcome}</h1>

        <p className="mt-3 text-2xl">{dictionary.home.description}</p>

        <div className="flex flex-wrap items-center justify-around max-w-4xl mt-6 sm:w-full">
          <Link href={`/${locale}/dashboard`}>
            <Button>{dictionary.navigation.dashboard}</Button>
          </Link>
        </div>
      </main>
    </div>
  );
}
