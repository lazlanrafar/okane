"use client";

import type { TooltipProps } from "recharts";
import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import type { NameType, ValueType } from "recharts/types/component/DefaultTooltipContent";

import { BaseChart, ChartLegend, StyledBar, StyledTooltip, StyledXAxis, StyledYAxis } from "./base-charts";
import type { BaseChartProps } from "./chart-utils";
import { createYAxisTickFormatter, useChartMargin } from "./chart-utils";
import { formatAmount } from "./format-amount";
import { SelectableChartWrapper } from "./selectable-chart-wrapper";

interface ExpenseData extends Record<string, unknown> {
  month: string;
  amount: number;
  category: string;
}

interface CategoryData extends Record<string, unknown> {
  name: string;
  value: number;
  color: string;
}

interface ExpensesChartProps extends BaseChartProps {
  data: ExpenseData[];
  categoryData?: CategoryData[];
  chartType?: "bar" | "pie";
  showLegend?: boolean;
  currency?: string;
  locale?: string;
  enableSelection?: boolean;
  onSelectionChange?: (startDate: string | null, endDate: string | null) => void;
  onSelectionComplete?: (startDate: string, endDate: string, chartType: string) => void;
  onSelectionStateChange?: (isSelecting: boolean) => void;
}

// Custom formatter for expenses tooltip
const expensesTooltipFormatter = (
  value: number | string,
  name: string,
  currency = "USD",
  locale?: string,
): [string, string] => {
  const numericValue = typeof value === "number" ? value : Number(value);
  const formattedValue =
    formatAmount({
      amount: Number.isFinite(numericValue) ? numericValue : 0,
      currency,
      locale: locale ?? undefined,
      maximumFractionDigits: 0,
    }) || `${currency}${value.toLocaleString()}`;
  const displayName = name === "amount" ? "Expenses" : name;
  return [formattedValue, displayName];
};

// Custom pie chart tooltip
const pieTooltipFormatter = (
  { active, payload }: TooltipProps<ValueType, NameType>,
  currency = "USD",
  locale?: string,
) => {
  if (active && Array.isArray(payload) && payload.length > 0) {
    const firstPayload = payload[0];
    const rawValue = firstPayload?.value;
    const numericValue = typeof rawValue === "number" ? rawValue : Number(rawValue);
    const formattedValue =
      formatAmount({
        amount: Number.isFinite(numericValue) ? numericValue : 0,
        currency,
        locale: locale ?? undefined,
        maximumFractionDigits: 0,
      }) || `${currency}${numericValue.toLocaleString()}`;
    const payloadRecord = firstPayload?.payload as { name?: string } | undefined;
    const entryName = String(payloadRecord?.name ?? "");
    return (
      <div className="border border-gray-200 bg-white p-2 text-black text-xs dark:border-[#1d1d1d] dark:bg-[#0c0c0c] dark:text-white">
        <p className="mb-1 text-gray-500 dark:text-[#666666]">{entryName}</p>
        <p>{formattedValue}</p>
      </div>
    );
  }
  return null;
};

export function ExpensesChart({
  data,
  categoryData,
  height = 320,
  className = "",
  chartType = "bar",
  showLegend = true,
  currency = "USD",
  locale,
  enableSelection = false,
  onSelectionChange,
  onSelectionComplete,
  onSelectionStateChange,
}: ExpensesChartProps) {
  const tickFormatter = createYAxisTickFormatter(currency, locale);
  const maxValues = data.map((d) => ({ maxValue: d.amount }));
  const { marginLeft } = useChartMargin(maxValues, "maxValue", tickFormatter);

  if (chartType === "pie" && categoryData) {
    return (
      <div className={`w-full ${className}`}>
        {/* Legend */}
        {showLegend && (
          <ChartLegend
            title="Expenses by Category"
            items={categoryData.map((item) => ({
              label: item.name,
              type: "solid" as const,
              color: item.color,
            }))}
          />
        )}

        {/* Pie Chart */}
        <div className="relative" style={{ height }}>
          <ResponsiveContainer width="100%" height="100%" debounce={1}>
            <PieChart>
              <Pie data={categoryData} cx="50%" cy="50%" outerRadius={80} fill="hsl(var(--foreground))" dataKey="value">
                {categoryData.map((entry) => (
                  <Cell key={`cell-${entry.name}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={(props) => pieTooltipFormatter(props, currency, locale)} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    );
  }

  const chartContent = (
    <div className={`w-full ${className}`}>
      {/* Legend */}
      {showLegend && <ChartLegend title="Monthly Expenses" items={[{ label: "Expenses", type: "solid" }]} />}

      {/* Bar Chart */}
      <BaseChart data={data} height={height} margin={{ top: 6, right: 6, left: -marginLeft, bottom: 6 }}>
        <StyledXAxis dataKey="month" />
        <StyledYAxis tickFormatter={tickFormatter} />

        <Tooltip
          content={
            <StyledTooltip
              formatter={(value: number | string, name: string) =>
                expensesTooltipFormatter(value, name, currency, locale)
              }
            />
          }
          wrapperStyle={{ zIndex: 9999 }}
        />

        <StyledBar dataKey="amount" usePattern />
      </BaseChart>
    </div>
  );

  // Pie charts don't support selection
  if (chartType === "pie") {
    return chartContent;
  }

  return (
    <SelectableChartWrapper
      data={data}
      dateKey="month"
      enableSelection={enableSelection}
      onSelectionChange={onSelectionChange}
      onSelectionComplete={(startDate, endDate) => {
        onSelectionComplete?.(startDate, endDate, "expenses");
      }}
      onSelectionStateChange={onSelectionStateChange}
      chartType="expenses"
    >
      {chartContent}
    </SelectableChartWrapper>
  );
}
