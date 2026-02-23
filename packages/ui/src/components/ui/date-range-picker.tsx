"use client";

import type React from "react";
import type { DateRange } from "react-day-picker";
import { format } from "date-fns";
import { Button } from "./button";
import { Calendar } from "./calendar";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";
import { cn } from "../../lib/utils";
import { Icons } from "./icons";

type Props = {
  range?: DateRange;
  className?: string;
  onSelect: (range?: DateRange) => void;
  placeholder?: string;
  disabled?: boolean;
};

export function DateRangePicker({
  className,
  range,
  disabled,
  onSelect,
  placeholder,
}: Props) {
  return (
    <div className={cn("grid gap-2", className)}>
      <Popover>
        <PopoverTrigger asChild disabled={disabled}>
          <Button
            variant="outline"
            className={cn("justify-start text-left font-medium space-x-2")}
          >
            <span>
              {range?.from ? (
                range.to ? (
                  <>
                    {format(range.from, "LLL dd, y")} -{" "}
                    {format(range.to, "LLL dd, y")}
                  </>
                ) : (
                  format(range.from, "LLL dd, y")
                )
              ) : (
                placeholder
              )}
            </span>
            <Icons.ChevronDown />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0 mt-2" align="end">
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={range?.from}
            selected={range}
            onSelect={onSelect}
            numberOfMonths={2}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
