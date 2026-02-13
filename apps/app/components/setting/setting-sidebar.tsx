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
    comingSoon: true,
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
    comingSoon: true,
  },
  {
    title: "Display",
    href: "/settings/display",
    icon: Monitor,
    comingSoon: true,
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
        comingSoon: true,
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
        comingSoon: true,
      },
      {
        title: "Expenses Category Setting",
        href: "/settings/expenses-category",
        icon: TrendingDown,
        comingSoon: true,
      },
      {
        title: "Accounts Setting",
        href: "/settings/accounts",
        icon: Landmark,
        comingSoon: true,
      },
      {
        title: "Budget Setting",
        href: "/settings/budget",
        icon: PencilRuler,
        comingSoon: true,
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
        comingSoon: true,
      },
      {
        title: "Passcode",
        href: "/settings/passcode",
        icon: Lock,
        comingSoon: true,
      },
      {
        title: "Main Currency Setting",
        href: "/settings/main-currency",
        icon: Banknote,
        comingSoon: true,
      },
      {
        title: "Sub Currency Setting",
        href: "/settings/sub-currency",
        icon: Banknote,
        comingSoon: true,
      },
      {
        title: "Alarm Setting",
        href: "/settings/alarm",
        icon: Bell,
        comingSoon: true,
      },
      {
        title: "Style",
        href: "/settings/style",
        icon: Palette,
        comingSoon: true,
      },
      {
        title: "Language Setting",
        href: "/settings/language",
        icon: Languages,
        comingSoon: true,
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
                      subItem.comingSoon && "opacity-60 pointer-events-none",
                    )}
                  >
                    {subItem.icon && <subItem.icon className="mr-2 size-4" />}
                    <span className="flex-1 text-left">{subItem.title}</span>
                    {subItem.comingSoon && (
                      <span className="ml-auto text-[10px] font-medium text-muted-foreground border px-1.5 py-0.5 rounded-md bg-muted/50">
                        Soon
                      </span>
                    )}
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
              flatItem.comingSoon && "opacity-60 pointer-events-none",
            )}
          >
            {flatItem.icon && <flatItem.icon className="mr-2 size-4" />}
            <span className="flex-1 text-left">{flatItem.title}</span>
            {flatItem.comingSoon && (
              <span className="ml-auto text-[10px] font-medium text-muted-foreground border px-1.5 py-0.5 rounded-md bg-muted/50">
                Soon
              </span>
            )}
          </Link>
        );
      })}
    </nav>
  );
}
