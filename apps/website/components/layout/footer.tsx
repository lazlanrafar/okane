"use client";

import { useTheme } from "next-themes";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

const FOOTER_LINKS = {
  Products: [
    { href: "/features", label: "Features", external: false },
    { href: "/pricing", label: "Pricing", external: false },
  ],
  Company: [
    { href: "/about", label: "About", external: false },
    { href: "https://github.com", label: "GitHub", external: true },
    { href: "https://twitter.com", label: "X / Twitter", external: true },
  ],
  Resources: [
    { href: "/terms", label: "Terms of Service", external: false },
    { href: "/policy", label: "Privacy Policy", external: false },
  ],
};

export function Footer() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <footer className="bg-background relative overflow-hidden border-t border-border">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-8 py-16 pb-40 sm:pb-60">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          {/* Left – Links */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-8 gap-y-8">
            {Object.entries(FOOTER_LINKS).map(([group, links]) => (
              <div key={group} className="space-y-3">
                <h3 className="text-sm text-foreground mb-4">{group}</h3>
                <div className="space-y-2.5">
                  {links.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      target={item.external ? "_blank" : undefined}
                      rel={item.external ? "noopener noreferrer" : undefined}
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors block"
                    >
                      {item.label}
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Right – Tagline + theme */}
          <div className="flex flex-col items-start lg:items-end gap-6 lg:gap-10">
            <p className="text-base sm:text-xl text-foreground text-left lg:text-right">
              Business finances that explain themselves.
            </p>
            <button
              type="button"
              onClick={() =>
                setTheme(resolvedTheme === "dark" ? "light" : "dark")
              }
              className="flex items-center gap-2 px-3 py-1.5 border border-border text-muted-foreground hover:text-foreground hover:border-foreground/20 transition-colors"
              aria-label="Toggle theme"
            >
              {mounted ? (
                resolvedTheme === "dark" ? (
                  <Sun className="size-4" />
                ) : (
                  <Moon className="size-4" />
                )
              ) : (
                <div className="size-4" />
              )}
              <span className="text-sm">
                {mounted
                  ? resolvedTheme === "dark"
                    ? "Light mode"
                    : "Dark mode"
                  : "Toggle theme"}
              </span>
            </button>
          </div>
        </div>

        {/* Divider */}
        <div className="my-16 h-px w-full border-t border-border" />

        {/* Copyright */}
        <p className="text-sm text-muted-foreground">
          © {new Date().getFullYear()} Okane. All rights reserved.
        </p>
      </div>

      {/* Large wordmark */}
      <div className="absolute bottom-0 left-0 sm:left-1/2 sm:-translate-x-1/2 translate-y-[25%] sm:translate-y-[40%] overflow-hidden select-none pointer-events-none">
        <span
          className="text-[160px] sm:text-[450px] leading-none font-serif"
          style={{
            WebkitTextStroke: "1px hsl(var(--muted-foreground))",
            color: "hsl(var(--secondary))",
          }}
        >
          Okane
        </span>
      </div>
    </footer>
  );
}
