import { cookies } from "next/headers";
import type { Metadata } from "next";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { PricingSection } from "@/components/sections/pricing-section";
import { FAQSection } from "@/components/sections/faq-section";

export const metadata: Metadata = {
  title: "Pricing – Okane",
  description:
    "Simple, transparent pricing for every stage of your business. Start free, upgrade when you need more.",
};

export default async function PricingPage() {
  const cookieStore = await cookies();
  const isLoggedIn = cookieStore.has(
    process.env.NEXT_PUBLIC_SESSION_COOKIE_NAME ?? "okane-session",
  );
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  return (
    <div className="flex flex-col min-h-screen">
      <Header isLoggedIn={isLoggedIn} appUrl={appUrl} />

      <main className="flex-1 pt-20">
        <PricingSection appUrl={appUrl} />

        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="h-px w-full border-t border-border" />
        </div>

        <FAQSection />
      </main>

      <Footer />
    </div>
  );
}
