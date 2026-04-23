import { ArrowRight } from "lucide-react";
import { DashboardWireframe } from "./wireframe/dashboard-wireframe";
import { TransactionsWireframe } from "./wireframe/transactions-wireframe";
import { ChatWireframe } from "./wireframe/chat-wireframe";
import { InvoiceWireframe } from "./wireframe/invoice-wireframe";

interface FeatureShowcaseProps {
  title: string;
  description: string;
  features: string[];
  wireframe: "dashboard" | "transactions" | "chat" | "invoice";
  reverse?: boolean;
}

const WIREFRAMES = {
  dashboard: DashboardWireframe,
  transactions: TransactionsWireframe,
  chat: ChatWireframe,
  invoice: InvoiceWireframe,
};

export function FeatureShowcase({
  title,
  description,
  features,
  wireframe,
  reverse = false,
}: FeatureShowcaseProps) {
  const WireframeComponent = WIREFRAMES[wireframe];

  return (
    <section className="py-16 sm:py-24 bg-background">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        <div
          className={`grid grid-cols-1 lg:grid-cols-2 gap-12 items-center ${
            reverse ? "lg:flex-row-reverse" : ""
          }`}
        >
          {/* Text */}
          <div className={reverse ? "lg:order-2" : ""}>
            <h3 className="font-serif text-2xl sm:text-3xl tracking-tight text-foreground mb-4">
              {title}
            </h3>
            <p className="text-muted-foreground text-base sm:text-lg mb-6">
              {description}
            </p>
            <ul className="space-y-3">
              {features.map((feature) => (
                <li key={feature} className="flex items-start gap-3">
                  <span className="mt-1.5 size-1.5 rounded-full bg-foreground shrink-0" />
                  <span className="text-sm text-foreground">{feature}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Wireframe */}
          <div className={reverse ? "lg:order-1" : ""}>
            <div className="bg-muted/30 p-4 rounded-lg">
              <WireframeComponent />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export function FeatureShowcases() {
  return (
    <>
      <FeatureShowcase
        title="One money feed, not five disconnected apps"
        description="Bring your accounts into one view and let oewang categorize activity automatically so your day-to-day tracking stays clean."
        features={[
          "Auto-categorization that improves over time",
          "Search, filter, and review in seconds",
          "Personal categories you can customize",
          "Bulk actions for fast cleanup",
        ]}
        wireframe="transactions"
      />

      <div className="h-px w-full border-t border-border" />

      <FeatureShowcase
        title="Ask plain questions, get useful money answers"
        description="Skip spreadsheet detective work. Ask what changed, where you overspent, or what is due next, and get a direct answer."
        features={[
          "Natural language money questions",
          "Weekly trend summaries",
          "Category-level spending insights",
          "Action-focused suggestions",
        ]}
        wireframe="chat"
        reverse
      />

      <div className="h-px w-full border-t border-border" />

      <FeatureShowcase
        title="Handle personal and freelance payments in one flow"
        description="Track recurring bills and, when needed, send clean payment requests for side work without leaving your finance workspace."
        features={[
          "Recurring bill visibility",
          "Simple payment request templates",
          "Automatic due reminders",
          "Payment status tracking",
        ]}
        wireframe="invoice"
      />

      <div className="h-px w-full border-t border-border" />

      <FeatureShowcase
        title="A dashboard that tells you where you stand"
        description="See income, spending, and trend shifts at a glance so you can decide quickly, not guess."
        features={[
          "Daily money snapshot",
          "Month-over-month trend view",
          "Top expense categories",
          "AI highlights that matter",
        ]}
        wireframe="dashboard"
        reverse
      />
    </>
  );
}
