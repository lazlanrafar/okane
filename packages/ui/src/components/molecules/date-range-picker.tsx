"use client";

import type React from "react";
import type { DateRange } from "react-day-picker";
import {
  format,
  startOfMonth,
  endOfMonth,
  subMonths,
  startOfYear,
  endOfYear,
  subDays,
} from "date-fns";
import { Button } from "../atoms/button";
import { Calendar } from "../organisms/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";
import { cn } from "../../lib/utils";
import { Icons } from "../atoms/icons";

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
            className={cn("justify-between text-left font-medium space-x-2")}
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
            <Icons.ChevronDown className="opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0 mt-2" align="start">
          <div className="flex flex-col sm:flex-row divide-y sm:divide-y-0 sm:divide-x">
            <div className="flex flex-col gap-1 p-3 w-full sm:w-[150px]">
              <div className="text-xs font-semibold text-muted-foreground mb-1 px-2 uppercase tracking-wide">
                Presets
              </div>
              <Button
                variant="ghost"
                className="justify-start font-normal text-sm h-8 px-2"
                onClick={() =>
                  onSelect({
                    from: new Date(),
                    to: new Date(),
                  })
                }
              >
                Today
              </Button>
              <Button
                variant="ghost"
                className="justify-start font-normal text-sm h-8 px-2"
                onClick={() =>
                  onSelect({
                    from: subDays(new Date(), 7),
                    to: new Date(),
                  })
                }
              >
                Last 7 Days
              </Button>
              <Button
                variant="ghost"
                className="justify-start font-normal text-sm h-8 px-2"
                onClick={() =>
                  onSelect({
                    from: startOfMonth(new Date()),
                    to: endOfMonth(new Date()),
                  })
                }
              >
                This Month
              </Button>
              <Button
                variant="ghost"
                className="justify-start font-normal text-sm h-8 px-2"
                onClick={() =>
                  onSelect({
                    from: startOfMonth(subMonths(new Date(), 1)),
                    to: endOfMonth(subMonths(new Date(), 1)),
                  })
                }
              >
                Last Month
              </Button>
              <Button
                variant="ghost"
                className="justify-start font-normal text-sm h-8 px-2"
                onClick={() =>
                  onSelect({
                    from: subMonths(new Date(), 3),
                    to: new Date(),
                  })
                }
              >
                Past 3 Months
              </Button>
              <Button
                variant="ghost"
                className="justify-start font-normal text-sm h-8 px-2"
                onClick={() =>
                  onSelect({
                    from: startOfYear(new Date()),
                    to: endOfYear(new Date()),
                  })
                }
              >
                This Year
              </Button>
            </div>
            <div className="p-1">
              <Calendar
                initialFocus
                mode="range"
                defaultMonth={range?.from}
                selected={range}
                onSelect={onSelect}
                numberOfMonths={2}
              />
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
