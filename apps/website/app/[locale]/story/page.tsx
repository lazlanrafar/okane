import { cookies } from "next/headers";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { CTASection } from "@/components/sections/cta-section";
import { getDictionary } from "@/lib/translations";

export default async function StoryPage({
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
        {/* Story Content */}
        <section className="py-16 sm:py-24">
          <div className="max-w-[800px] mx-auto px-4 sm:px-6 lg:px-8">
            {/* Header */}
            <div className="text-center mb-16">
              <span className="text-xs text-muted-foreground uppercase tracking-wider">
                {dictionary.story.title}
              </span>
              <h1 className="font-serif text-3xl sm:text-5xl tracking-tight text-foreground mt-4 mb-6">
                {dictionary.story.heading}
              </h1>
            </div>

            {/* Problem */}
            <div className="mb-16">
              <h2 className="font-serif text-xl sm:text-2xl text-foreground mb-4">
                {dictionary.story.problemTitle}
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                {dictionary.story.problemText}
              </p>
            </div>

            {/* Solution */}
            <div className="mb-16">
              <h2 className="font-serif text-xl sm:text-2xl text-foreground mb-4">
                {dictionary.story.solutionTitle}
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                {dictionary.story.solutionText}
              </p>
            </div>

            {/* Modern Businesses */}
            <div className="mb-16">
              <h2 className="font-serif text-xl sm:text-2xl text-foreground mb-4">
                {dictionary.story.modernTitle}
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                {dictionary.story.modernText}
              </p>
            </div>

            {/* Focus */}
            <div className="mb-16">
              <h2 className="font-serif text-xl sm:text-2xl text-foreground mb-4">
                {dictionary.story.focusTitle}
              </h2>
              <ul className="space-y-3">
                {dictionary.story.focusItems.map((item, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <span className="mt-1.5 size-1.5 rounded-full bg-foreground shrink-0" />
                    <span className="text-muted-foreground">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Founder */}
            <div className="border-t border-border pt-12 text-center">
              <p className="font-serif text-lg text-foreground">
                — {dictionary.story.founder}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                {dictionary.story.founderTitle}
              </p>
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
