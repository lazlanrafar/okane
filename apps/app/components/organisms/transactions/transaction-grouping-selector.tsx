"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui";
import { LayoutGrid } from "lucide-react";

export type GroupByInterval = "none" | "daily" | "weekly" | "monthly";

interface Props {
  value: GroupByInterval;
  onValueChange: (value: GroupByInterval) => void;
}

export function TransactionGroupingSelector({ value, onValueChange }: Props) {
  return (
    <Select value={value} onValueChange={(v) => onValueChange(v as GroupByInterval)}>
      <SelectTrigger className="w-[140px]">
        <div className="flex items-center gap-2">
          <LayoutGrid className="h-4 w-4 text-muted-foreground" />
          <SelectValue placeholder="Group by" />
        </div>
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="none">No grouping</SelectItem>
        <SelectItem value="daily">Daily</SelectItem>
        <SelectItem value="weekly">Weekly</SelectItem>
        <SelectItem value="monthly">Monthly</SelectItem>
      </SelectContent>
    </Select>
  );
}
