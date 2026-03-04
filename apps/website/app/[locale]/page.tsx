import { cookies } from "next/headers";
import Link from "next/link";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { HowItWorksSection } from "@/components/sections/how-it-works";
import { StatsSection } from "@/components/sections/stats";
import { TestimonialsSection } from "@/components/sections/testimonials";
import { FeaturesGridSection } from "@/components/sections/features-grid";
import { Button } from "@workspace/ui/atoms";

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
        {/* ─── HERO ─── */}
        <section className="relative flex flex-col items-center justify-center min-h-screen text-center px-4 pt-24 pb-16">
          <div
            className="absolute inset-0 -z-10 pointer-events-none"
            style={{
              backgroundImage:
                "radial-gradient(circle at 50% 50%, hsl(var(--muted) / 0.4) 0%, transparent 70%)",
            }}
          />

          <div className="inline-flex items-center gap-2 rounded-full border border-border px-3 py-1 text-xs text-muted-foreground mb-8">
            <span className="size-1.5 rounded-full bg-green-500 animate-pulse" />
            Open-source financial OS
          </div>

          <h1 className="font-serif text-4xl sm:text-6xl md:text-7xl tracking-tight text-foreground max-w-4xl mb-6">
            Run your business finances without manual work.
          </h1>

          <p className="text-muted-foreground text-lg sm:text-xl max-w-2xl mb-10">
            One place for transactions, wallets, invoices and everything around
            it. Okane keeps your finances in order — automatically.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4">
            {isLoggedIn ? (
              <Button size="lg" asChild>
                <Link href={`${appUrl}/`}>Go to Dashboard</Link>
              </Button>
            ) : (
              <>
                <Button size="lg" asChild>
                  <Link href={`${appUrl}/register`}>Get Started for Free</Link>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <Link href={`${appUrl}/login`}>Log in</Link>
                </Button>
              </>
            )}
          </div>

          <p className="mt-6 text-xs text-muted-foreground">
            No credit card required. Free forever plan available.
          </p>
        </section>

        {/* Stats strip */}
        <StatsSection />

        {/* How it works */}
        <HowItWorksSection />

        <div className="h-px w-full border-t border-border" />

        {/* Features grid */}
        <FeaturesGridSection />

        <div className="h-px w-full border-t border-border" />

        {/* Testimonials */}
        <TestimonialsSection />

        <div className="h-px w-full border-t border-border" />

        {/* ─── CTA ─── */}
        <section className="max-w-[1400px] mx-auto px-4 sm:px-8 py-24 text-center">
          <h2 className="font-serif text-3xl sm:text-5xl tracking-tight text-foreground mb-6">
            Start managing your finances today.
          </h2>
          <p className="text-muted-foreground text-lg mb-10 max-w-lg mx-auto">
            Join hundreds of businesses already using Okane to take control of
            their money.
          </p>
          {isLoggedIn ? (
            <Button size="lg" asChild>
              <Link href={`${appUrl}/`}>Go to Dashboard</Link>
            </Button>
          ) : (
            <Button size="lg" asChild>
              <Link href={`${appUrl}/register`}>Create a free account</Link>
            </Button>
          )}
        </section>
      </main>

      <Footer />
    </div>
  );
}
