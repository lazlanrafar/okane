"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  User,
  Settings,
  Palette,
  Bell,
  Monitor,
  FileText,
  Repeat,
  Copy,
  Wallet,
  TrendingDown,
  Landmark,
  PencilRuler,
  DatabaseBackup,
  Banknote,
  AppWindow,
  Languages,
  Lock,
} from "lucide-react";

import { cn } from "@workspace/ui";
import { buttonVariants } from "@workspace/ui";

const sidebarNavItems = [
  {
    title: "Profile",
    href: "/settings/profile",
    icon: User,
  },
  {
    title: "Account",
    href: "/settings/account",
    icon: Settings,
  },
  {
    title: "Appearance",
    href: "/settings/appearance",
    icon: Palette,
  },
  {
    title: "Notifications",
    href: "/settings/notifications",
    icon: Bell,
  },
  {
    title: "Display",
    href: "/settings/display",
    icon: Monitor,
  },
  {
    groupLabel: "Transaction",
    items: [
      {
        title: "Transaction Settings",
        href: "/settings/transaction",
        icon: FileText,
      },
      {
        title: "Repeat Setting",
        href: "/settings/repeat",
        icon: Repeat,
      },
      {
        title: "Copy-Paste Settings",
        href: "/settings/copy-paste",
        icon: Copy,
      },
    ],
  },
  {
    groupLabel: "Category & Accounts",
    items: [
      {
        title: "Income Category Setting",
        href: "/settings/income-category",
        icon: Wallet,
      },
      {
        title: "Expenses Category Setting",
        href: "/settings/expenses-category",
        icon: TrendingDown,
      },
      {
        title: "Accounts Setting",
        href: "/settings/accounts",
        icon: Landmark,
      },
      {
        title: "Budget Setting",
        href: "/settings/budget",
        icon: PencilRuler,
      },
    ],
  },
  {
    groupLabel: "General Settings",
    items: [
      {
        title: "Backup",
        href: "/settings/backup",
        icon: DatabaseBackup,
      },
      {
        title: "Passcode",
        href: "/settings/passcode",
        icon: Lock,
      },
      {
        title: "Main Currency Setting",
        href: "/settings/main-currency",
        icon: Banknote,
      },
      {
        title: "Sub Currency Setting",
        href: "/settings/sub-currency",
        icon: Banknote,
      },
      {
        title: "Alarm Setting",
        href: "/settings/alarm",
        icon: Bell,
      },
      {
        title: "Style",
        href: "/settings/style",
        icon: Palette,
      },
      {
        title: "Language Setting",
        href: "/settings/language",
        icon: Languages,
      },
    ],
  },
];

interface SidebarNavProps extends React.HTMLAttributes<HTMLElement> {
  // items prop is no longer needed but kept for backward compatibility if needed,
  // though we ignore it in favor of internal items for this specific sidebar.
  // biome-ignore lint/suspicious/noExplicitAny: Legacy prop compatibility
  items?: any[];
}

import { i18n } from "@/i18n-config";

export function SettingSidebar({
  className,
  items,
  ...props
}: SidebarNavProps) {
  const pathname = usePathname();

  // Strip locale from pathname to match sidebar items
  const activePath = pathname.split("/").filter(Boolean);
  if (i18n.locales.some((locale) => locale === activePath[0])) {
    activePath.shift();
  }
  const normalizedPath = `/${activePath.join("/")}`;

  return (
    <nav
      className={cn(
        "flex space-x-2 lg:flex-col lg:space-x-0 lg:space-y-1",
        className,
      )}
      {...props}
    >
      {sidebarNavItems.map((item, index) => {
        if ("groupLabel" in item) {
          return (
            <div key={index} className="mt-4 first:mt-0">
              <h4 className="mb-2 text-xs font-semibold tracking-tight text-muted-foreground">
                {item.groupLabel}
              </h4>
              <div className="space-y-1">
                {/* biome-ignore lint/suspicious/noExplicitAny: implicit any */}
                {item.items?.map((subItem: any) => (
                  <Link
                    key={subItem.href}
                    href={subItem.href}
                    className={cn(
                      buttonVariants({ variant: "ghost" }),
                      normalizedPath === subItem.href
                        ? "bg-muted hover:bg-muted"
                        : "hover:bg-transparent hover:underline",
                      "justify-start w-full",
                    )}
                  >
                    {subItem.icon && <subItem.icon className="mr-2 size-4" />}
                    {subItem.title}
                  </Link>
                ))}
              </div>
            </div>
          );
        }

        // Handle flat items (backward compatibility or mixed use)
        // We cast to any because TS doesn't know for sure it's not a group without a discriminating union type definition
        // biome-ignore lint/suspicious/noExplicitAny: implicit any
        const flatItem = item as any;
        return (
          <Link
            key={flatItem.href}
            href={flatItem.href}
            className={cn(
              buttonVariants({ variant: "ghost" }),
              normalizedPath === flatItem.href
                ? "bg-muted hover:bg-muted"
                : "hover:bg-transparent hover:underline",
              "justify-start w-full",
            )}
          >
            {flatItem.icon && <flatItem.icon className="mr-2 size-4" />}
            {flatItem.title}
          </Link>
        );
      })}
    </nav>
  );
}
