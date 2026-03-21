import { Calendar } from "lucide-react";
import {
  Banknote,
  Box,
  Clock,
  DotSquare,
  FileText,
  IdCard,
  Inbox,
  LayoutDashboard,
  type LucideIcon,
  Settings,
  Users,
  Zap,
  HandCoins,
} from "lucide-react";

export interface NavSubItem {
  title: string;
  url: string;
  icon?: LucideIcon;
  comingSoon?: boolean;
  newTab?: boolean;
  isNew?: boolean;
}

export interface NavMainItem {
  title: string;
  url: string;
  icon?: LucideIcon;
  subItems?: NavSubItem[];
  comingSoon?: boolean;
  newTab?: boolean;
  isNew?: boolean;
}

export interface NavGroup {
  id: number;
  label?: string;
  items: NavMainItem[];
}

export const sidebarItems: NavGroup[] = [
  {
    id: 1,
    // label: "Dashboard",
    items: [
      {
        title: "Overview",
        url: "/overview",
        icon: LayoutDashboard,
      },
      {
        title: "Transactions",
        url: "/transactions",
        icon: Banknote,
      },
      {
        title: "Calendar",
        url: "/calendar",
        icon: Calendar,
      },
    ],
  },
  {
    id: 2,
    label: "Finance",
    items: [
      {
        title: "Accounts",
        url: "/accounts",
        icon: IdCard,
      },
      {
        title: "Debts",
        url: "/debts",
        icon: HandCoins,
      },
    ],
  },
  {
    id: 3,
    label: "People",
    items: [
      {
        title: "Contacts",
        url: "/contacts",
        icon: Users,
      },
    ],
  },
  {
    id: 4,
    label: "Workspace",
    items: [
      {
        title: "Vault",
        url: "/vault",
        icon: Box,
      },
      {
        title: "Apps",
        url: "/apps",
        icon: DotSquare,
      },
    ],
  },
  {
    id: 5,
    label: "System",
    items: [
      {
        title: "Settings",
        url: "/settings",
        icon: Settings,
      },
    ],
  },
];
