import type { ReactNode } from "react";
import type { Metadata } from "next";
import { Providers } from "@/components/providers";
import { Toaster } from "@workspace/ui/atoms";
import "@workspace/ui/globals.css";

export const metadata: Metadata = {
  title: "oewang – Run your business finances without manual work",
  description:
    "oewang is the financial OS for modern businesses. AI-powered insights, automatic categorization, real-time sync. Manage spending, send invoices, track transactions.",
};

export default async function RootLayout({
  children,
  params,
}: Readonly<{ children: ReactNode; params: Promise<{ locale: string }> }>) {
  const { locale } = await params;

  return (
    <html lang={locale} suppressHydrationWarning>
      <body className="min-h-screen antialiased">
        <Providers>
          {children}
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
