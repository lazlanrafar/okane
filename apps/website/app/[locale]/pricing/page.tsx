import { cookies } from "next/headers";
import type { Metadata } from "next";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { PricingSection } from "@/components/sections/pricing-section";
import { FAQSection } from "@/components/sections/faq-section";
import { Env } from "@workspace/constants";

export const metadata: Metadata = {
  title: "Pricing – oewang",
  description:
    "Simple, transparent pricing for every stage of your business. Start free, upgrade when you need more.",
};

async function getPricingPlans() {
  const apiUrl = Env.API_BASE_URL ?? "http://localhost:3002";

  try {
    const res = await fetch(`${apiUrl}/v1/public/pricing`, {
      next: { revalidate: 3600 },
    });

    if (!res.ok) {
      return null;
    }

    const json = await res.json();
    return json.data ?? null;
  } catch {
    return null;
  }
}

export default async function PricingPage() {
  const cookieStore = await cookies();
  const isLoggedIn = cookieStore.has(
    process.env.NEXT_PUBLIC_SESSION_COOKIE_NAME ?? "okane-session",
  );
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const plans = await getPricingPlans();

  return (
    <div className="flex flex-col min-h-screen">
      <Header isLoggedIn={isLoggedIn} appUrl={appUrl} />

      <main className="flex-1 pt-20">
        <PricingSection appUrl={appUrl} plans={plans} />

        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="h-px w-full border-t border-border" />
        </div>

        <FAQSection />
      </main>

      <Footer />
    </div>
  );
}
