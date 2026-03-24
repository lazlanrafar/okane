import { Button } from "@workspace/ui/atoms";
import Link from "next/link";

interface HeroSectionProps {
  isLoggedIn: boolean;
  appUrl: string;
}

export function HeroSection({ isLoggedIn, appUrl }: HeroSectionProps) {
  return (
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
        oewang is the financial OS for modern businesses. AI-powered insights,
        automatic categorization, real-time sync. Manage spending, send
        invoices, track transactions.
      </p>

      <div className="flex flex-wrap items-center justify-center gap-4">
        {isLoggedIn ? (
          <Button size="lg" asChild>
            <Link href={`${appUrl}/`}>Go to Dashboard</Link>
          </Button>
        ) : (
          <>
            <Button size="lg" asChild>
              <Link href={`${appUrl}/register`}>Start free trial</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="#how-it-works">See how it works</Link>
            </Button>
          </>
        )}
      </div>

      <p className="mt-6 text-xs text-muted-foreground">
        14-day free trial · Cancel anytime
      </p>
    </section>
  );
}
