"use client";

import { useState } from "react";
import { BarChart3, Wallet, Receipt, Zap, Globe2 } from "lucide-react";

const FEATURES = [
  {
    title: "See every account in one timeline",
    subtitle:
      "Cards, bank transfers, and wallet activity stay synced in one place. No manual reconciling.",
    icon: Receipt,
    stat: "Always in sync",
  },
  {
    title: "Know what changed today",
    subtitle:
      "oewang explains jumps in spending and cash flow as they happen, so nothing catches you off guard.",
    icon: BarChart3,
    stat: "Live insights",
  },
  {
    title: "Manage daily money without stress",
    subtitle:
      "Set categories that fit your life and quickly review transactions in minutes, not hours.",
    icon: Wallet,
    stat: "Quick reviews",
  },
  {
    title: "Built for local and global spending",
    subtitle:
      "Track spending across currencies with automatic conversion support whenever you travel or earn globally.",
    icon: Globe2,
    stat: "150+ currencies",
  },
  {
    title: "Ask AI instead of digging through reports",
    subtitle:
      "Ask questions in plain language and get clear answers about where your money went and what to adjust next.",
    icon: Zap,
    stat: "Fast answers",
  },
];

export function HowItWorksSection() {
  const [active, setActive] = useState(0);
  const ActiveIcon = FEATURES[active]?.icon ?? BarChart3;

  return (
    <section className="bg-background py-20 lg:py-28">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-8">
        {/* Mobile – stacked */}
        <div className="lg:hidden space-y-16">
          <h2 className="font-serif text-2xl text-foreground text-center">
            How it works
          </h2>
          {FEATURES.map((feat) => {
            const Icon = feat.icon;
            return (
              <div key={feat.title} className="space-y-4">
                <div className="text-center space-y-2">
                  <h3 className="font-serif text-xl text-foreground">
                    {feat.title}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-6 max-w-sm mx-auto">
                    {feat.subtitle}
                  </p>
                </div>
                <div className="border border-border p-10 flex items-center justify-center">
                  <Icon
                    className="size-24 text-muted-foreground/40"
                    strokeWidth={1}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* Desktop – interactive two-column */}
        <div className="hidden lg:grid grid-cols-2 gap-16 min-h-[600px]">
          {/* Left – text list */}
          <div className="flex flex-col gap-2 justify-center">
            <h2 className="font-serif text-2xl text-foreground mb-8">
              How it works
            </h2>
            {FEATURES.map((feat, i) => (
              <button
                key={feat.title}
                type="button"
                onClick={() => setActive(i)}
                className={`text-left px-0 py-4 border-b border-border transition-all duration-200 ${
                  active === i ? "opacity-100" : "opacity-40 hover:opacity-70"
                }`}
              >
                <p
                  className={`text-base font-medium transition-colors ${
                    active === i ? "text-foreground" : "text-muted-foreground"
                  }`}
                >
                  {feat.title}
                </p>
                {active === i && (
                  <p className="text-sm text-muted-foreground mt-1 leading-6 max-w-md">
                    {feat.subtitle}
                  </p>
                )}
              </button>
            ))}
          </div>

          {/* Right – illustration */}
          <div className="border border-border flex flex-col items-center justify-center gap-6 p-12 bg-background">
            <div
              key={active}
              className="flex flex-col items-center gap-4 animate-in fade-in zoom-in-95 duration-300"
            >
              <ActiveIcon
                className="size-32 text-muted-foreground/30"
                strokeWidth={0.75}
              />
              <span className="text-xs font-mono text-muted-foreground border border-border px-3 py-1">
                {FEATURES[active]?.stat}
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
