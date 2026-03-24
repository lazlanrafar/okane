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
        title="All your transactions, unified"
        description="Every payment in and out of the business is automatically synced and categorized. No more manual entry."
        features={[
          "Auto-categorization with AI",
          "Search and filter instantly",
          "Multi-currency support",
          "Bulk edit transactions",
        ]}
        wireframe="transactions"
      />

      <div className="h-px w-full border-t border-border" />

      <FeatureShowcase
        title="Ask anything about your finances"
        description="Get instant answers about your spending, revenue, and trends. No more digging through reports."
        features={[
          "Natural language queries",
          "Real-time insights",
          "Weekly summaries",
          "Multi-agent AI system",
        ]}
        wireframe="chat"
        reverse
      />

      <div className="h-px w-full border-t border-border" />

      <FeatureShowcase
        title="Professional invoices, payments tracked"
        description="Create and send invoices in seconds. Get paid faster with online payment links."
        features={[
          "Customizable templates",
          "Online payment links",
          "Automatic reminders",
          "VAT and tax support",
        ]}
        wireframe="invoice"
      />

      <div className="h-px w-full border-t border-border" />

      <FeatureShowcase
        title="Complete financial overview"
        description="See your complete financial picture at a glance. Income, expenses, and trends in one dashboard."
        features={[
          "Real-time metrics",
          "Trend analysis",
          "Top expense categories",
          "AI-powered insights",
        ]}
        wireframe="dashboard"
        reverse
      />
    </>
  );
}
