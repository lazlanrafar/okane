import { Button } from "@workspace/ui";
import { CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { getDictionary } from "@/get-dictionary";
import type { Locale } from "@/i18n-config";
import { syncMayarAction } from "@/actions/mayar.actions";

export default async function SuccessPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const dict = await getDictionary(locale as Locale);

  // Automatically attempt to sync unpaid Mayar transactions for the active workspace
  // to bypass Sandbox webhook limitations or act as a manual reconciliation trigger.
  await syncMayarAction();

  return (
    <div className="flex h-full min-h-[calc(100vh-4rem)] flex-col items-center justify-center space-y-4 px-4">
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-green-100 ring-8 ring-green-50">
        <CheckCircle2 className="h-10 w-10 text-green-600" />
      </div>
      
      <div className="text-center">
        <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          {dict.settings.billing.success.title}
        </h1>
        <p className="mt-2 text-muted-foreground max-w-md">
          {dict.settings.billing.success.description}
        </p>
      </div>

      <div className="flex gap-4">
        <Button asChild variant="outline">
          <Link href={`/${locale}/settings/billing`}>
            {dict.settings.billing.success.view_billing}
          </Link>
        </Button>
        <Button asChild>
          <Link href={`/${locale}/`}>
            {dict.settings.billing.success.back_to_dashboard}
          </Link>
        </Button>
      </div>
    </div>
  );
}
