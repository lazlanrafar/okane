"use client";

import { useTheme } from "next-themes";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

const FOOTER_LINKS: Record<
  string,
  Array<{ href: string; label: string; external?: boolean }>
> = {
  Features: [
    { href: "/features/transactions", label: "Transactions" },
    { href: "/features/ai-assistant", label: "AI Assistant" },
    { href: "/features/invoices", label: "Invoices" },
    { href: "/features/vault", label: "Vault" },
    { href: "/features/wallets", label: "Wallets" },
    { href: "/features/calendar", label: "Calendar" },
  ],
  Product: [
    { href: "/pricing", label: "Pricing" },
    { href: "/integrations", label: "Integrations" },
    { href: "/story", label: "Story" },
  ],
  Company: [
    { href: "/support", label: "Support" },
    { href: "#", label: "GitHub", external: true },
  ],
  Resources: [
    { href: "/terms", label: "Terms of Service" },
    { href: "/policy", label: "Privacy Policy" },
  ],
};

export function Footer() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <footer className="bg-background border-t border-border">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8 lg:gap-12">
          <div className="col-span-2 lg:col-span-2">
            <Link href="/" className="inline-block mb-4">
              <span className="font-serif text-xl tracking-tight">oewang</span>
            </Link>
            <p className="text-sm text-muted-foreground mb-6 max-w-xs">
              Run your company. Not the admin.
            </p>
            <button
              type="button"
              onClick={() =>
                setTheme(resolvedTheme === "dark" ? "light" : "dark")
              }
              className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Toggle theme"
            >
              {mounted ? (
                resolvedTheme === "dark" ? (
                  <Sun className="size-3.5" />
                ) : (
                  <Moon className="size-3.5" />
                )
              ) : (
                <div className="size-3.5" />
              )}
              <span>
                {mounted
                  ? resolvedTheme === "dark"
                    ? "Light mode"
                    : "Dark mode"
                  : "Theme"}
              </span>
            </button>
          </div>

          {Object.entries(FOOTER_LINKS).map(([group, links]) => (
            <div key={group} className="space-y-3">
              <h3 className="text-xs text-foreground font-medium">{group}</h3>
              <div className="space-y-2.5">
                {links.map((item) => (
                  <a
                    key={item.href}
                    href={item.href}
                    target={item.external ? "_blank" : undefined}
                    rel={item.external ? "noopener noreferrer" : undefined}
                    className="text-xs text-muted-foreground hover:text-foreground transition-colors block"
                  >
                    {item.label}
                  </a>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="my-10 h-px w-full border-t border-border" />

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} Latoe. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <a
              href="#"
              className="text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              X / Twitter
            </a>
            <a
              href="#"
              className="text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              LinkedIn
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
