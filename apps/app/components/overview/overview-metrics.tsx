"use client";

import * as React from "react";
import { formatCurrency } from "@/lib/currency";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@workspace/ui";
import { TrendingUp } from "lucide-react";
import {
  Line,
  LineChart,
  CartesianGrid,
  XAxis,
  YAxis,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import type {
  ChartDataPoint,
  CategoryBreakdownPoint,
} from "@/actions/metrics.actions";
import type { TransactionSettings } from "@/types/settings";
import { COLORS } from "@workspace/constants";

const chartConfig = {
  current: {
    label: "Current",
    color: "var(--primary)",
  },
  average: {
    label: "Average",
    color: "var(--muted-foreground)",
  },
} satisfies ChartConfig;

function formatYAxisTick(value: number): string {
  if (value === 0) return "0";
  if (Math.abs(value) >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (Math.abs(value) >= 1_000) return `${(value / 1_000).toFixed(0)}k`;
  return `${value}`;
}

function MetricLineChart({
  title,
  data,
  settings,
  compact = false,
}: {
  title: string;
  data: ChartDataPoint[];
  settings?: TransactionSettings | null;
  compact?: boolean;
}) {
  const currentTotal = data[data.length - 1]?.current || 0;

  return (
    <Card className="flex flex-col bg-background border-border overflow-hidden">
      <CardHeader className="items-start pb-0 pt-4 px-4">
        <CardDescription className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          {title}
        </CardDescription>
        <CardTitle className="text-2xl font-semibold tracking-tight mt-0.5">
          {formatCurrency(currentTotal, settings)}
        </CardTitle>
      </CardHeader>
      <CardContent className="pb-3 px-2 pt-2">
        <ChartContainer
          config={chartConfig}
          className="w-full"
          style={{ height: compact ? 110 : 140 }}
        >
          <LineChart
            accessibilityLayer
            data={data}
            margin={{
              left: 8,
              right: 8,
              top: 8,
              bottom: 0,
            }}
          >
            <CartesianGrid vertical={false} strokeDasharray="3 3" />
            <XAxis
              dataKey="name"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              interval="preserveStartEnd"
              tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={4}
              width={36}
              tickCount={4}
              tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
              tickFormatter={formatYAxisTick}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent className="text-xs" />}
            />
            <Line
              type="monotone"
              dataKey="average"
              stroke="var(--color-average)"
              strokeWidth={1.5}
              strokeDasharray="4 4"
              dot={false}
            />
            <Line
              type="monotone"
              dataKey="current"
              stroke="var(--color-current)"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4, strokeWidth: 0 }}
            />
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

function CategoryDonutChart({
  title,
  data,
  settings,
}: {
  title: string;
  data: CategoryBreakdownPoint[];
  settings?: TransactionSettings | null;
}) {
  const MAX_CATEGORIES = 7;

  // Process data to group excess into "Others"
  const processedData = React.useMemo(() => {
    if (data.length <= MAX_CATEGORIES) return data;

    const topCategories = data.slice(0, MAX_CATEGORIES - 1);
    const othersValue = data
      .slice(MAX_CATEGORIES - 1)
      .reduce((sum, item) => sum + item.value, 0);

    return [
      ...topCategories,
      { categoryId: "others", name: "Others", value: othersValue },
    ];
  }, [data]);

  const total = processedData.reduce((sum, item) => sum + item.value, 0);

  const dynamicConfig = processedData.reduce((acc, curr, index) => {
    acc[curr.name] = {
      label: curr.name,
      color: COLORS[index % COLORS.length],
    };
    return acc;
  }, {} as ChartConfig);

  const chartData = processedData.map((item, index) => ({
    ...item,
    fill: COLORS[index % COLORS.length],
  }));

  return (
    <Card className="flex flex-col bg-background border-border overflow-hidden h-full w-full">
      <CardHeader className="items-center pb-0 pt-5 px-5">
        <CardTitle className="text-xl font-semibold tracking-tight">
          {title}
        </CardTitle>
        <CardDescription className="text-sm font-medium">
          Current Month
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0 px-5 pt-6 flex flex-col items-center overflow-hidden min-h-0">
        {processedData.length === 0 ? (
          <div className="flex items-center justify-center h-[250px] text-muted-foreground text-sm pb-4">
            No data available
          </div>
        ) : (
          <ChartContainer
            config={dynamicConfig}
            className="[&_.recharts-pie-label-text]:fill-foreground mx-auto aspect-square w-full max-h-[300px] pb-0"
          >
            <PieChart>
              <ChartTooltip
                cursor={false}
                content={
                  <ChartTooltipContent
                    hideLabel
                    formatter={(value, name) => (
                      <div className="flex w-full items-center justify-between gap-4">
                        <span className="text-muted-foreground">{name}</span>
                        <span className="font-medium text-foreground">
                          {formatCurrency(value as number, settings)}
                        </span>
                      </div>
                    )}
                  />
                }
              />
              <Pie
                data={chartData}
                dataKey="value"
                nameKey="name"
                label={({ value }) => formatCurrency(value, settings)}
                innerRadius={60}
                outerRadius={100}
                strokeWidth={2}
                stroke="hsl(var(--background))"
              />
            </PieChart>
          </ChartContainer>
        )}
      </CardContent>
      <div className="mt-auto border-t border-border/40 p-5 bg-muted/20">
        <div className="flex flex-col gap-2 text-sm justify-center items-center">
          <div className="flex items-center gap-2 leading-none font-medium">
            Total Expenses{" "}
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="text-muted-foreground leading-none font-medium">
            {formatCurrency(total, settings)}
          </div>
        </div>
      </div>
    </Card>
  );
}

export function OverviewMetrics({
  revenueData,
  expenseData,
  burnRateData,
  categoryData,
  settings,
}: {
  revenueData: ChartDataPoint[];
  expenseData: ChartDataPoint[];
  burnRateData: ChartDataPoint[];
  categoryData: CategoryBreakdownPoint[];
  settings?: TransactionSettings | null;
}) {
  return (
    <div className="flex flex-col gap-3">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        <div className="lg:col-span-2 flex flex-col gap-3">
          <MetricLineChart
            title="Revenue"
            data={revenueData}
            settings={settings}
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <MetricLineChart
              title="Average Monthly Burn Rate"
              data={burnRateData}
              settings={settings}
              compact
            />
            <MetricLineChart
              title="Total Expenses"
              data={expenseData}
              settings={settings}
              compact
            />
          </div>
        </div>
        <div className="lg:col-span-1 relative">
          <div className="h-[420px] lg:h-auto lg:absolute lg:inset-0 w-full">
            <CategoryDonutChart
              title="Expense Breakdown"
              data={categoryData}
              settings={settings}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
