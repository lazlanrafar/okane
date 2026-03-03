/**
 * Website top-navigation configuration.
 *
 * - Items with `children` render as a hover dropdown (desktop) / accordion (mobile).
 * - Items without `children` render as a plain link.
 * - Each dropdown has up to two link columns and optional preview cards on the right.
 */

export interface NavLink {
  href: string;
  title: string;
  /** Short description shown below the title in the dropdown */
  desc?: string;
  /** Opens in a new tab */
  external?: boolean;
}

export interface NavPreviewCard {
  href: string;
  /** Bold label at the bottom of the card */
  title: string;
  /** Sub-label at the bottom */
  desc: string;
  /** Large text shown in the card body as a watermark */
  watermark: string;
}

export interface NavDropdown {
  /** Array of link columns */
  columns: NavLink[][];
  /** Optional preview cards on the right side of the dropdown */
  cards?: NavPreviewCard[];
}

export interface NavItem {
  label: string;
  /** Used for plain-link items (no dropdown) */
  href?: string;
  /** Presence of `dropdown` turns this item into a hover-triggered menu */
  dropdown?: NavDropdown;
}

// ─── Edit below to add / remove / reorder navigation items ────────────────────

export const NAV_ITEMS: NavItem[] = [
  {
    label: "Features",
    dropdown: {
      columns: [
        [
          {
            href: "/features/wallets",
            title: "Wallets",
            desc: "Manage cash, digital wallets and bank accounts",
          },
          {
            href: "/features/transactions",
            title: "Transactions",
            desc: "All transactions in one place, auto-categorized",
          },
          {
            href: "/features/insights",
            title: "Insights",
            desc: "Live financial overview and spending trends",
          },
          {
            href: "/features/multi-currency",
            title: "Multi-currency",
            desc: "Handle 150+ currencies with live exchange rates",
          },
          {
            href: "/features/security",
            title: "Security",
            desc: "AES-256 encryption on all your data",
          },
          {
            href: "/features/teams",
            title: "Teams",
            desc: "Collaborate with role-based permissions",
          },
        ],
      ],
      cards: [
        {
          href: "/pricing",
          title: "Get started today",
          desc: "Free plan available. No credit card required.",
          watermark: "Okane",
        },
      ],
    },
  },
  {
    label: "Pricing",
    href: "/pricing",
  },
  {
    label: "About",
    href: "/about",
  },
  {
    label: "Resources",
    dropdown: {
      columns: [
        [
          {
            href: "/docs",
            title: "Documentation",
            desc: "Learn how to use Okane",
          },
          {
            href: "/changelog",
            title: "Changelog",
            desc: "What's new in every release",
          },
          {
            href: "/support",
            title: "Support",
            desc: "Get help from our team",
          },
        ],
        [
          {
            href: "https://github.com",
            title: "GitHub",
            desc: "Open-source code on GitHub",
            external: true,
          },
          {
            href: "/api",
            title: "Developer & API",
            desc: "Programmatic access to Okane",
          },
          { href: "/sdks", title: "SDKs", desc: "Typed SDKs to build faster" },
        ],
      ],
      cards: [
        {
          href: "/api",
          title: "Developer & API",
          desc: "Programmatic access to Okane.",
          watermark: "{ api }",
        },
        {
          href: "/docs",
          title: "Documentation",
          desc: "Everything you need to get started.",
          watermark: "Docs",
        },
      ],
    },
  },
];
