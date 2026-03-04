import type { ReactNode } from "react";
import type { Metadata } from "next";
import { Providers } from "@/components/providers";
import { Toaster } from "@workspace/ui/atoms";
import "@workspace/ui/globals.css";

export const metadata: Metadata = {
  title: "Okane – Financial intelligence for modern business",
  description:
    "Okane is the operating system for your business. Manage spending, send invoices, and gain real-time visibility into your finances.",
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
