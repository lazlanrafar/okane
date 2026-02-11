"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  User,
  Settings,
  Palette,
  Bell,
  Monitor,
} from "lucide-react";

import { cn } from "@workspace/ui";
import { buttonVariants } from "@workspace/ui";

const sidebarNavItems = [
  {
    title: "Profile",
    href: "/dashboard/settings/profile",
    icon: User,
  },
  {
    title: "Account",
    href: "/dashboard/settings/account",
    icon: Settings,
  },
  {
    title: "Appearance",
    href: "/dashboard/settings/appearance",
    icon: Palette,
  },
  {
    title: "Notifications",
    href: "/dashboard/settings/notifications",
    icon: Bell,
  },
  {
    title: "Display",
    href: "/dashboard/settings/display",
    icon: Monitor,
  },
];

interface SidebarNavProps extends React.HTMLAttributes<HTMLElement> {
  // items prop is no longer needed but kept for backward compatibility if needed, 
  // though we ignore it in favor of internal items for this specific sidebar.
  items?: any[]; 
}

export function SettingSidebar({ className, items, ...props }: SidebarNavProps) {
  const pathname = usePathname();

  return (
    <nav
      className={cn(
        "flex space-x-2 lg:flex-col lg:space-x-0 lg:space-y-1",
        className,
      )}
      {...props}
    >
      {sidebarNavItems.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={cn(
            buttonVariants({ variant: "ghost" }),
            pathname === item.href
              ? "bg-muted hover:bg-muted"
              : "hover:bg-transparent hover:underline",
            "justify-start",
          )}
        >
          {item.icon && <item.icon className="mr-2 size-4" />}
          {item.title}
        </Link>
      ))}
    </nav>
  );
}
