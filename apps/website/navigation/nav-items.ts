/**
 * Website navigation configuration - Midday-style simple nav.
 */

export interface NavLink {
  href: string;
  title: string;
  desc?: string;
  external?: boolean;
}

export interface NavItem {
  label: string;
  href?: string;
}

// Simple navigation items - no dropdowns
export const NAV_ITEMS: NavItem[] = [
  {
    label: "Features",
    href: "/features",
  },
  {
    label: "Pricing",
    href: "/pricing",
  },
  {
    label: "Story",
    href: "/story",
  },
];
