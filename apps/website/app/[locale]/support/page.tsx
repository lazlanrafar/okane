import { cookies } from "next/headers";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { CTASection } from "@/components/sections/cta-section";
import { getDictionary } from "@/lib/translations";
import { Mail } from "lucide-react";

const FAQ_ITEMS = [
  {
    question: "What is oewang?",
    answer:
      "oewang is a financial OS for modern businesses. It brings your financial data together—transactions, invoices, receipts, and more—in one connected system.",
  },
  {
    question: "Who is oewang for?",
    answer:
      "oewang is designed for founders, freelancers, and small teams who want to stay on top of their business finances without spending hours on manual work.",
  },
  {
    question: "How does the AI Assistant work?",
    answer:
      "Our AI Assistant can answer questions about your finances in plain language. Ask things like 'What were my top expenses last month?' or 'How much did I earn this quarter?'",
  },
  {
    question: "Is my data secure?",
    answer:
      "Yes. We use AES-256 encryption for all your data, both in transit and at rest. Your financial data is private and secure.",
  },
  {
    question: "Can I use oewang on mobile?",
    answer:
      "Yes! oewang is a web app that works on any device—desktop, tablet, or mobile browser. We also offer Telegram integration for quick receipt capture.",
  },
  {
    question: "What integrations do you support?",
    answer:
      "Currently, we support Telegram for receipt capture. More integrations like Gmail, Outlook, QuickBooks, and Xero are coming soon.",
  },
];

export default async function SupportPage({
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
              {dictionary.support.title}
            </h1>
            <p className="text-muted-foreground text-lg sm:text-xl max-w-2xl mx-auto">
              {dictionary.support.subtitle}
            </p>
          </div>
        </section>

        {/* FAQ */}
        <section className="py-16 bg-muted/30">
          <div className="max-w-[800px] mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="font-serif text-2xl text-foreground mb-2">
              {dictionary.support.faqTitle}
            </h2>
            <p className="text-muted-foreground mb-8">
              {dictionary.support.faqSubtitle}
            </p>

            <div className="space-y-4">
              {FAQ_ITEMS.map((item, index) => (
                <details key={index} className="group border border-border">
                  <summary className="flex items-center justify-between cursor-pointer p-4 hover:bg-muted/50 transition-colors list-none">
                    <span className="text-sm font-medium text-foreground">
                      {item.question}
                    </span>
                    <span className="text-muted-foreground group-open:rotate-180 transition-transform">
                      ▼
                    </span>
                  </summary>
                  <div className="px-4 pb-4">
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {item.answer}
                    </p>
                  </div>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* Contact */}
        <section className="py-16">
          <div className="max-w-[600px] mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="font-serif text-xl text-foreground mb-4">
              {dictionary.support.contactTitle}
            </h2>
            <p className="text-muted-foreground mb-6">
              {dictionary.support.contactText}
            </p>
            <a
              href="mailto:support@oewang.com"
              className="inline-flex items-center gap-2 text-sm font-medium text-foreground hover:text-muted-foreground transition-colors"
            >
              <Mail className="size-4" />
              {dictionary.support.contactEmail}
            </a>
          </div>
        </section>

        {/* CTA */}
        <CTASection isLoggedIn={isLoggedIn} appUrl={appUrl} />
      </main>

      <Footer />
    </div>
  );
}
