import { cookies } from "next/headers";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { HeroSection } from "@/components/sections/hero";
import { HowItWorksSection } from "@/components/sections/how-it-works";
import { FeatureShowcases } from "@/components/sections/feature-showcase";
import { CTASection } from "@/components/sections/cta-section";

export default async function Page() {
  const cookieStore = await cookies();
  const isLoggedIn = cookieStore.has(
    process.env.NEXT_PUBLIC_SESSION_COOKIE_NAME ?? "okane-session",
  );
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  return (
    <div className="flex flex-col min-h-screen">
      <Header isLoggedIn={isLoggedIn} appUrl={appUrl} />

      <main className="flex-1">
        {/* Hero */}
        <HeroSection isLoggedIn={isLoggedIn} appUrl={appUrl} />

        {/* How it works */}
        <HowItWorksSection />

        <div className="h-px w-full border-t border-border" />

        {/* Feature showcases */}
        <FeatureShowcases />

        <div className="h-px w-full border-t border-border" />

        {/* CTA */}
        <CTASection isLoggedIn={isLoggedIn} appUrl={appUrl} />
      </main>

      <Footer />
    </div>
  );
}
