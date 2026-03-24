"use client";

import { Button } from "@workspace/ui/atoms";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { NAV_ITEMS } from "@/navigation/nav-items";

interface HeaderProps {
  isLoggedIn: boolean;
  appUrl: string;
}

export function Header({ isLoggedIn, appUrl }: HeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <>
      <div
        className={`fixed left-0 right-0 bottom-0 z-40 transition-opacity duration-200 ${
          isMenuOpen
            ? "opacity-100 visible bg-black/40"
            : "opacity-0 invisible pointer-events-none"
        }`}
        style={{ top: "57px" }}
        onClick={() => setIsMenuOpen(false)}
        onKeyDown={() => setIsMenuOpen(false)}
        role="button"
        tabIndex={0}
      />

      <nav className="fixed top-0 left-0 right-0 z-50 w-full">
        <div className="py-3 px-4 sm:px-6 xl:px-8 flex items-center justify-between backdrop-blur-md bg-background/80 border-b border-border/40">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-2 hover:opacity-80 transition-opacity duration-200"
            aria-label="oewang – Go to homepage"
          >
            <span className="font-serif text-xl tracking-tight">oewang</span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden xl:flex items-center gap-6">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href ?? "/"}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                {item.label}
              </Link>
            ))}
          </div>

          {/* Auth CTA */}
          <div className="hidden xl:flex items-center gap-3">
            {isLoggedIn ? (
              <Button asChild size="sm">
                <Link href={`${appUrl}/`}>Dashboard</Link>
              </Button>
            ) : (
              <Button asChild variant="link" size="sm">
                <Link href={`${appUrl}/login`}>Sign in</Link>
              </Button>
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            type="button"
            className="xl:hidden p-2 text-foreground"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label={isMenuOpen ? "Close menu" : "Open menu"}
          >
            {isMenuOpen ? (
              <X className="size-5" />
            ) : (
              <Menu className="size-5" />
            )}
          </button>
        </div>

        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="xl:hidden fixed inset-0 z-40 bg-background pt-16 overflow-y-auto">
            <div className="px-6 py-8 flex flex-col gap-4">
              {NAV_ITEMS.map((item) => (
                <Link
                  key={item.href}
                  href={item.href ?? "/"}
                  onClick={() => setIsMenuOpen(false)}
                  className="text-2xl text-foreground hover:text-muted-foreground transition-colors py-2"
                >
                  {item.label}
                </Link>
              ))}

              <div className="h-px border-t border-border mt-4" />

              <div className="pt-2">
                {isLoggedIn ? (
                  <Button asChild size="lg" className="w-full">
                    <Link href={`${appUrl}/`}>Dashboard</Link>
                  </Button>
                ) : (
                  <Button variant="link" size="lg" className="w-full" asChild>
                    <Link href={`${appUrl}/login`}>Sign in</Link>
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}
      </nav>
    </>
  );
}
