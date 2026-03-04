"use client";

import { Button } from "@workspace/ui/atoms";
import Link from "next/link";
import { useRef, useState } from "react";
import { Menu, X } from "lucide-react";
import { NAV_ITEMS, type NavItem } from "@/navigation/nav-items";

// ─── Shared helpers ──────────────────────────────────────────────────────────

function Chevron({ open }: { open: boolean }) {
  return (
    <svg
      className={`size-3.5 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
    </svg>
  );
}

function NavLinkEl({
  href,
  external,
  onClick,
  className,
  children,
}: {
  href: string;
  external?: boolean;
  onClick?: () => void;
  className?: string;
  children: React.ReactNode;
}) {
  if (external) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        onClick={onClick}
        className={className}
      >
        {children}
      </a>
    );
  }
  return (
    <Link href={href} onClick={onClick} className={className}>
      {children}
    </Link>
  );
}

// ─── Dropdown panel (desktop) ─────────────────────────────────────────────────

function DropdownMenu({
  item,
  onClose,
}: {
  item: NavItem;
  onClose: () => void;
}) {
  const { dropdown } = item;
  if (!dropdown) return null;
  const { columns, cards } = dropdown;
  const hasCards = cards && cards.length > 0;

  return (
    <div
      className="fixed left-0 right-0 bg-background border-t border-b border-border shadow-lg z-50"
      style={{ top: "100%" }}
    >
      <div className="max-w-[1400px] mx-auto p-6 xl:p-8">
        <div className="grid grid-cols-4 gap-8">
          {/* Link columns (span 2 cols) */}
          <div
            className={`${hasCards ? "col-span-2" : "col-span-4"} grid gap-x-8`}
            style={{
              gridTemplateColumns: `repeat(${columns.length}, minmax(0, 1fr))`,
            }}
          >
            {columns.map((col, colIdx) => (
              <div key={colIdx}>
                {col.map((link) => (
                  <NavLinkEl
                    key={link.href}
                    href={link.href}
                    external={link.external}
                    onClick={onClose}
                    className="flex flex-col py-3 px-2 group hover:bg-secondary transition-colors duration-150"
                  >
                    <span className="text-sm text-foreground mb-0.5">
                      {link.title}
                    </span>
                    {link.desc && (
                      <span className="text-xs text-muted-foreground group-hover:text-foreground transition-colors">
                        {link.desc}
                      </span>
                    )}
                  </NavLinkEl>
                ))}
              </div>
            ))}
          </div>

          {/* Preview cards (span 2 cols, right side) */}
          {hasCards && (
            <div className="col-span-2 flex items-start justify-end gap-4">
              {cards!.map((card) => (
                <Link
                  key={card.href}
                  href={card.href}
                  onClick={onClose}
                  className="flex-1 h-[196px] border border-border hover:border-foreground/20 hover:scale-[1.01] transition-all duration-200 flex flex-col overflow-hidden"
                >
                  <div className="flex-1 flex items-center justify-center bg-muted/20 p-6">
                    <span className="font-serif text-4xl text-muted-foreground/20 select-none text-center leading-tight">
                      {card.watermark}
                    </span>
                  </div>
                  <div className="border-t border-border p-3 bg-background">
                    <span className="text-xs text-foreground block">
                      {card.title}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {card.desc}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Main Header ──────────────────────────────────────────────────────────────

interface HeaderProps {
  isLoggedIn: boolean;
  appUrl: string;
}

export function Header({ isLoggedIn, appUrl }: HeaderProps) {
  // Track which dropdown is open by its label (null = all closed)
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState<string | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const open = (label: string) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setOpenDropdown(label);
  };

  const close = () => {
    timeoutRef.current = setTimeout(() => setOpenDropdown(null), 150);
  };

  const anyOpen = openDropdown !== null;

  return (
    <>
      {/* Backdrop overlay */}
      <div
        className={`fixed left-0 right-0 bottom-0 z-40 transition-opacity duration-150 ${
          anyOpen
            ? "opacity-100 visible bg-black/40"
            : "opacity-0 invisible pointer-events-none"
        }`}
        style={{ top: "57px" }}
      />

      <nav className="fixed top-0 left-0 right-0 z-50 w-full">
        <div
          className={`relative py-3 px-4 sm:px-6 xl:px-8 flex items-center justify-between backdrop-blur-md bg-background/80 border-b border-border/40 ${
            anyOpen ? "xl:bg-background border-b-0" : ""
          }`}
        >
          {/* Logo */}
          <Link
            href="/"
            onClick={() => setIsMenuOpen(false)}
            className="flex items-center gap-2 hover:opacity-80 transition-opacity duration-200"
            aria-label="Okane – Go to homepage"
          >
            <span className="font-serif text-xl tracking-tight">Okane</span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden xl:flex items-center gap-6">
            {NAV_ITEMS.map((item) => {
              if (item.dropdown) {
                const isOpen = openDropdown === item.label;
                return (
                  <div
                    key={item.label}
                    className="relative -mx-3 -my-2"
                    onMouseEnter={() => open(item.label)}
                    onMouseLeave={close}
                  >
                    <button
                      type="button"
                      className="text-sm text-muted-foreground hover:text-foreground px-3 py-2 flex items-center gap-1 transition-colors"
                    >
                      {item.label}
                      <Chevron open={isOpen} />
                    </button>

                    {/* invisible bridge so hover doesn't drop while moving to panel */}
                    {isOpen && (
                      <div
                        className="absolute left-0 right-0 h-4 pointer-events-auto"
                        style={{ top: "100%" }}
                      />
                    )}

                    {isOpen && (
                      <div
                        onMouseEnter={() => open(item.label)}
                        onMouseLeave={close}
                      >
                        <DropdownMenu
                          item={item}
                          onClose={() => setOpenDropdown(null)}
                        />
                      </div>
                    )}
                  </div>
                );
              }

              return (
                <Link
                  key={item.label}
                  href={item.href!}
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  {item.label}
                </Link>
              );
            })}

            {/* Auth CTA */}
            <div className="flex items-center gap-3 border-l border-border pl-6">
              {isLoggedIn ? (
                <Button asChild size="sm">
                  <Link href={`${appUrl}/`}>Dashboard</Link>
                </Button>
              ) : (
                <Button variant="link" size="sm" asChild>
                  <Link href={`${appUrl}/login`}>Get started</Link>
                </Button>
              )}
            </div>
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
              {NAV_ITEMS.map((item, idx) => (
                <div key={item.label} className="flex flex-col">
                  {item.dropdown ? (
                    <>
                      <button
                        type="button"
                        onClick={() =>
                          setMobileOpen(
                            mobileOpen === item.label ? null : item.label,
                          )
                        }
                        className="flex items-center justify-between text-2xl text-foreground py-2"
                      >
                        <span>{item.label}</span>
                        <Chevron open={mobileOpen === item.label} />
                      </button>

                      {mobileOpen === item.label && (
                        <div className="border-t border-border mt-2 pt-4 flex flex-col gap-3 pl-2">
                          {item.dropdown.columns.flat().map((link) => (
                            <NavLinkEl
                              key={link.href}
                              href={link.href}
                              external={link.external}
                              onClick={() => setIsMenuOpen(false)}
                              className="text-lg text-muted-foreground hover:text-foreground transition-colors"
                            >
                              {link.title}
                            </NavLinkEl>
                          ))}
                        </div>
                      )}
                    </>
                  ) : (
                    <Link
                      href={item.href!}
                      onClick={() => setIsMenuOpen(false)}
                      className="text-2xl text-foreground hover:text-muted-foreground transition-colors py-2"
                    >
                      {item.label}
                    </Link>
                  )}

                  {idx < NAV_ITEMS.length - 1 && (
                    <div className="h-px border-t border-border mt-4" />
                  )}
                </div>
              ))}

              <div className="h-px border-t border-border mt-2" />
              <div className="pt-2">
                {isLoggedIn ? (
                  <Button asChild size="lg" className="w-full">
                    <Link href={`${appUrl}/`}>Dashboard</Link>
                  </Button>
                ) : (
                  <Button variant="link" size="lg" asChild className="w-full">
                    <Link href={`${appUrl}/login`}>Get started</Link>
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
