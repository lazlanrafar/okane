"use client";

import { Area, Line, Tooltip, XAxis, YAxis } from "recharts";

import { BaseChart, ChartLegend, StyledTooltip } from "./base-charts";
import type { BaseChartProps } from "./chart-utils";
import { createYAxisTickFormatter, useChartMargin } from "./chart-utils";
import { formatAmount } from "./format-amount";

interface RevenueData {
  month: string;
  revenue: number;
  target?: number;
}

interface RevenueChartProps extends BaseChartProps {
  data: RevenueData[];
  showTarget?: boolean;
  showLegend?: boolean;
  currency?: string;
  locale?: string;
  primaryLabel?: string;
  secondaryLabel?: string;
  title?: string;
}

// Custom formatter for revenue tooltip
const revenueTooltipFormatter = (
  value: number | string,
  name: string,
  currency = "USD",
  locale?: string,
  primaryLabel = "Revenue",
  secondaryLabel = "Target",
): [string, string] => {
  const formattedValue =
    formatAmount({
      amount: value,
      currency,
      locale: locale ?? undefined,
      maximumFractionDigits: 0,
    }) || `${currency}${value.toLocaleString()}`;
  const displayName = name === "revenue" ? primaryLabel : secondaryLabel;
  return [formattedValue, displayName];
};

export function RevenueChart({
  data,
  height = 320,
  className = "",
  showTarget = true,
  showLegend = true,
  currency = "USD",
  locale,
  primaryLabel = "Revenue",
  secondaryLabel = "Target",
  title = "Revenue",
}: RevenueChartProps) {
  const tickFormatter = createYAxisTickFormatter(currency, locale);
  const maxValues = data.map((d) => ({
    maxValue: Math.max(d.revenue, d.target ?? 0),
  }));
  const { marginLeft } = useChartMargin(maxValues, "maxValue", tickFormatter);

  return (
    <div className={`w-full ${className}`}>
      {/* Legend */}
      {showLegend && (
        <ChartLegend
          title={title}
          items={[
            { label: primaryLabel, type: "solid" },
            ...(showTarget ? [{ label: secondaryLabel, type: "dashed" as const }] : []),
          ]}
        />
      )}

      {/* Chart */}
      <BaseChart data={data} height={height} margin={{ top: 6, right: 6, left: -marginLeft, bottom: 6 }}>
        <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: "var(--chart-axis-text)", fontSize: 10 }} />
        <YAxis tickFormatter={tickFormatter} axisLine={false} tickLine={false} tick={{ fill: "var(--chart-axis-text)", fontSize: 10 }} />

        <Tooltip
          content={
            <StyledTooltip
              formatter={(value: number | string, name: string) =>
                revenueTooltipFormatter(value, name, currency, locale, primaryLabel, secondaryLabel)
              }
            />
          }
          wrapperStyle={{ zIndex: 9999 }}
        />

        <Area dataKey="revenue" type="monotone" stroke="var(--chart-actual-line)" fill="url(#chartAreaPattern)" strokeWidth={2} isAnimationActive={false} />

        {showTarget && <Line dataKey="target" type="monotone" stroke="var(--chart-line-secondary)" strokeWidth={2} dot={false} isAnimationActive={false} strokeDasharray="5 5" />}
      </BaseChart>
    </div>
  );
}
