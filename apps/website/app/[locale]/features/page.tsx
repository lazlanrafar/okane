import { cookies } from "next/headers";
import Link from "next/link";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { CTASection } from "@/components/sections/cta-section";
import { getDictionary } from "@/lib/translations";
import {
  CreditCard,
  Bot,
  FileText,
  FolderOpen,
  Wallet,
  Calendar,
  Users,
  DollarSign,
  BarChart3,
  ArrowRight,
} from "lucide-react";

const FEATURE_ICONS: Record<string, React.ReactNode> = {
  transactions: <CreditCard className="size-6" />,
  "ai-assistant": <Bot className="size-6" />,
  invoices: <FileText className="size-6" />,
  vault: <FolderOpen className="size-6" />,
  wallets: <Wallet className="size-6" />,
  calendar: <Calendar className="size-6" />,
  contacts: <Users className="size-6" />,
  debts: <DollarSign className="size-6" />,
  reports: <BarChart3 className="size-6" />,
};

const FEATURES_LIST = [
  {
    slug: "transactions",
    titleKey: "howItWorks.transactions.title" as const,
    descKey: "howItWorks.transactions.description" as const,
  },
  {
    slug: "ai-assistant",
    titleKey: "howItWorks.aiAssistant.title" as const,
    descKey: "howItWorks.aiAssistant.description" as const,
  },
  {
    slug: "invoices",
    titleKey: "howItWorks.invoices.title" as const,
    descKey: "howItWorks.invoices.description" as const,
  },
  {
    slug: "vault",
    titleKey: "features.transactions.title" as const,
    descKey: "features.transactions.description" as const,
  },
  {
    slug: "wallets",
    titleKey: "features.dashboard.title" as const,
    descKey: "features.dashboard.description" as const,
  },
  {
    slug: "calendar",
    titleKey: "sidebar.calendar" as const,
    descKey: "features.transactions.description" as const,
  },
  {
    slug: "contacts",
    titleKey: "sidebar.contacts" as const,
    descKey: "features.transactions.description" as const,
  },
  {
    slug: "debts",
    titleKey: "debts.title" as const,
    descKey: "debts.description" as const,
  },
  {
    slug: "reports",
    titleKey: "features.dashboard.title" as const,
    descKey: "features.dashboard.description" as const,
  },
];

export default async function FeaturesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const dictionary = getDictionary(locale);
  const cookieStore = await cookies();
  const isLoggedIn = cookieStore.has(
    process.env.NEXT_PUBLIC_SESSION_COOKIE_NAME ?? "okane-session",
  );
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  return (
    <div className="flex flex-col min-h-screen">
      <Header isLoggedIn={isLoggedIn} appUrl={appUrl} />

      <main className="flex-1 pt-24">
        {/* Header */}
        <section className="py-16 sm:py-24">
          <div className="max-w-[800px] mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="font-serif text-3xl sm:text-5xl tracking-tight text-foreground mb-6">
              {dictionary.features.title}
            </h1>
            <p className="text-muted-foreground text-lg sm:text-xl max-w-2xl mx-auto">
              {dictionary.howItWorks.subtitle}
            </p>
          </div>
        </section>

        {/* Features Grid */}
        <section className="py-16 bg-muted/30">
          <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {FEATURES_LIST.map((feature) => (
                <Link
                  key={feature.slug}
                  href={`/features/${feature.slug}`}
                  className="group p-6 border border-border hover:border-foreground/20 transition-colors"
                >
                  <div className="size-12 rounded-lg bg-background flex items-center justify-center mb-4 text-muted-foreground group-hover:text-foreground transition-colors">
                    {FEATURE_ICONS[feature.slug]}
                  </div>
                  <h3 className="text-lg font-medium text-foreground mb-2 group-hover:text-foreground">
                    {dictionary.howItWorks.transactions.title}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    {dictionary.howItWorks.transactions.description}
                  </p>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground group-hover:text-foreground transition-colors">
                    Learn more
                    <ArrowRight className="size-3" />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <CTASection isLoggedIn={isLoggedIn} appUrl={appUrl} />
      </main>

      <Footer />
    </div>
  );
}
