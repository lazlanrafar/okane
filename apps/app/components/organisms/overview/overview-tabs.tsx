"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { cn, Tabs, TabsList, TabsTrigger } from "@workspace/ui";
import { Grid2X2 } from "lucide-react";
import { LineChart } from "lucide-react";

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

export function OverviewTabs({
  defaultTab,
  displayName,
  children,
}: {
  defaultTab: string;
  displayName?: string;
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const activeTab = searchParams.get("tab") || defaultTab;

  const handleTabChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", value);
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  return (
    <Tabs
      value={activeTab}
      onValueChange={handleTabChange}
      className="flex flex-col flex-1"
    >
      <div className="flex justify-between items-end mb-6">
        <div>
          <h1 className="text-2xl font-serif">
            {getGreeting()} {displayName},
          </h1>
          <p className="mt-1 text-xm text-muted-foreground">
            here's a quick look at how things are going.
          </p>
        </div>

        <div className="ml-2 relative flex items-stretch bg-[#f7f7f7] dark:bg-[#131313] w-fit">
          <TabsList className="flex items-stretch h-auto p-0 bg-transparent">
            <TabsTrigger
              value="overview"
              className={cn(
                "group relative flex items-center gap-1.5 px-3 py-1.5 text-[14px] transition-all whitespace-nowrap border border-transparent h-9 min-h-9",
                "text-[#707070] hover:text-black bg-[#f7f7f7] dark:text-[#666666] dark:hover:text-white dark:bg-[#131313] mb-0 relative z-[1]",
                "data-[state=active]:text-black data-[state=active]:bg-[#e6e6e6] dark:data-[state=active]:text-white dark:data-[state=active]:bg-[#1d1d1d] data-[state=active]:mb-[-1px] data-[state=active]:z-10",
              )}
            >
              <Grid2X2 className="w-4 h-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger
              value="metrics"
              className={cn(
                "group relative flex items-center gap-1.5 px-3 py-1.5 text-[14px] transition-all whitespace-nowrap border border-transparent h-9 min-h-9",
                "text-[#707070] hover:text-black bg-[#f7f7f7] dark:text-[#666666] dark:hover:text-white dark:bg-[#131313] mb-0 relative z-[1]",
                "data-[state=active]:text-black data-[state=active]:bg-[#e6e6e6] dark:data-[state=active]:text-white dark:data-[state=active]:bg-[#1d1d1d] data-[state=active]:mb-[-1px] data-[state=active]:z-10",
              )}
            >
              <LineChart className="w-4 h-4" />
              Metrics
            </TabsTrigger>
          </TabsList>
        </div>
      </div>

      {children}
    </Tabs>
  );
}
