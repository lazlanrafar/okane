import { cn, TabsContent, TabsList, TabsTrigger } from "@workspace/ui";
import { Grid2X2, LineChart } from "lucide-react";

import {
  getBurnRateMetrics,
  getCategoryBreakdown,
  getExpenseMetrics,
  getRevenueMetrics,
} from "@workspace/modules/server";
import { getTransactionSettings } from "@workspace/modules/server";
import { getMe } from "@workspace/modules/server";
import { OverviewCards } from "@/components/organisms/overview/overview-cards";
import { OverviewMetrics } from "@/components/organisms/overview/overview-metrics";
import { OverviewTabs } from "@/components/organisms/overview/overview-tabs";

import { ChatProviderWrapper } from "@/components/organisms/chat/chat-provider-wrapper";
import ChatInterface from "@/components/organisms/chat/chat-interface";

export default async function OverviewPage(props: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const searchParams = await props.searchParams;
  const initialTab =
    typeof searchParams.tab === "string" ? searchParams.tab : "overview";

  const [
    meResult,
    incomeResult,
    expenseResult,
    burnRateResult,
    settingsResult,
    expenseCategoryResult,
    incomeCategoryResult,
  ] = await Promise.all([
    getMe(),
    getRevenueMetrics(),
    getExpenseMetrics(),
    getBurnRateMetrics(),
    getTransactionSettings(),
    getCategoryBreakdown("expense"),
    getCategoryBreakdown("income"),
  ]);

  const user = meResult.success ? meResult.data?.user : null;
  const displayName = user?.name
    ? user.name.split(" ")[0]
    : (user?.email?.split("@")[0] ?? "there");

  const incomeData = incomeResult.success ? incomeResult.data! : [];
  const expenseData = expenseResult.success ? expenseResult.data! : [];
  const burnRateData = burnRateResult.success ? burnRateResult.data! : [];
  const expenseCategoryData = expenseCategoryResult.success
    ? expenseCategoryResult.data!
    : [];
  const incomeCategoryData = incomeCategoryResult.success
    ? incomeCategoryResult.data!
    : [];
  const settings = settingsResult.success ? settingsResult.data! : null;

  return (
    <ChatProviderWrapper key={"home"}>
      <div className="h-[calc(100dvh-5rem)] md:h-[calc(100dvh-6rem)] flex flex-col relative overflow-y-auto no-scrollbar pb-10">
        <OverviewTabs defaultTab={initialTab} displayName={displayName}>
          <TabsContent value="overview" className="flex-1 mt-0">
            <OverviewCards
              revenueData={incomeData}
              expenseData={expenseData}
              categoryData={expenseCategoryData}
              settings={settings}
            />
          </TabsContent>
          <TabsContent value="metrics" className="flex-1 mt-0">
            <OverviewMetrics
              incomeData={incomeData}
              expenseData={expenseData}
              burnRateData={burnRateData}
              expenseCategoryData={expenseCategoryData}
              incomeCategoryData={incomeCategoryData}
              settings={settings}
            />
          </TabsContent>
        </OverviewTabs>

        <ChatInterface />
      </div>
    </ChatProviderWrapper>
  );
}
