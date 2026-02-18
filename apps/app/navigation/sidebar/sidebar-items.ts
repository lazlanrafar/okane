import {
  Banknote,
  ChartBar,
  LayoutDashboard,
  Settings,
  IdCard,
  LucideIcon,
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
    // label: "Overview",
    items: [
      {
        title: "Overview",
        url: "/dashboard/default",
        icon: LayoutDashboard,
      },
      // {
      //   title: "CRM",
      //   url: "/dashboard/crm",
      //   icon: ChartBar,
      // },
      // {
      //   title: "Finance",
      //   url: "/dashboard/finance",
      //   icon: Banknote,
      // },
      {
        title: "Transactions",
        url: "/transactions",
        icon: Banknote,
      },
      {
        title: "Invoices",
        url: "/invoices",
        icon: Banknote,
      },
    ],
  },
  {
    id: 3,
    label: "Others",
    items: [
      {
        title: "Accounts",
        url: "/accounts",
        icon: IdCard,
      },
      {
        title: "Settings",
        url: "/settings",
        icon: Settings,
      },
    ],
  },
];
