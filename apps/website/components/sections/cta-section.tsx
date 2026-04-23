import { Button } from "@workspace/ui/atoms";
import Link from "next/link";

interface CTASectionProps {
  isLoggedIn: boolean;
  appUrl: string;
}

export function CTASection({ isLoggedIn, appUrl }: CTASectionProps) {
  return (
    <section className="py-16 sm:py-24 bg-background">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="font-serif text-2xl sm:text-4xl tracking-tight text-foreground mb-4">
            Ready for calmer money decisions?
          </h2>
          <p className="text-muted-foreground text-base sm:text-lg mb-8 max-w-lg mx-auto">
            Join people using oewang to track spending, understand cash flow,
            and stay ahead of bills without financial busywork.
          </p>

          {isLoggedIn ? (
            <Button size="lg" asChild>
              <Link href={`${appUrl}/`}>Go to Dashboard</Link>
            </Button>
          ) : (
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Button size="lg" asChild>
                <Link href={`${appUrl}/register`}>Get started free</Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/pricing">View pricing</Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
