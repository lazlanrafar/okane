import { cookies } from "next/headers";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { HeroSection } from "@/components/sections/hero";
import { HowItWorksSection } from "@/components/sections/how-it-works";
import { FeatureShowcases } from "@/components/sections/feature-showcase";
import { CTASection } from "@/components/sections/cta-section";
import { WEBSITE_CONFIG } from "@workspace/constants";

export default async function Page() {
  const cookieStore = await cookies();
  const isLoggedIn = cookieStore.has(
    process.env.NEXT_PUBLIC_SESSION_COOKIE_NAME ?? "oewang-session",
  );
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Oewang",
    url: WEBSITE_CONFIG.url,
    logo: WEBSITE_CONFIG.logo,
    sameAs: [
      "https://twitter.com/oewang",
      "https://linkedin.com/company/oewang",
    ],
  };

  return (
    <div className="flex flex-col min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
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
