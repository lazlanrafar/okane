"use client";

import {
  Button,
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  DropdownMenuPortal,
  Icons,
  Input,
} from "../../atoms";
import { cn } from "../../../lib/utils";
import { useState, useMemo, useRef, useEffect } from "react";
import { FilterList, type FilterOption } from "./filter-list";
import {
  DateRangePicker,
  DateRangePickerContent,
} from "../../molecules/date-range-picker";
import { parseISO } from "date-fns";
import type { DateRange } from "react-day-picker";

interface DataTableFilterProps {
  placeholder?: string;
  filters: Record<string, any>;
  onFilterChange: (filters: Record<string, any>) => void;
  statusOptions?: FilterOption[];
  showDateFilter?: boolean;
  showAttachments?: boolean;
  showSource?: boolean;
  isLoading?: boolean;
  className?: string;
}

function FilterMenuItem({
  icon: Icon,
  label,
  children,
}: {
  icon: any;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <DropdownMenuSub>
      <DropdownMenuSubTrigger className="gap-3 px-3 py-2.5 cursor-default select-none items-center rounded-none text-xs outline-none focus:bg-accent data-[state=open]:bg-accent group">
        <Icon
          size={16}
          className="text-muted-foreground group-hover:text-foreground transition-colors"
        />
        <span className="flex-1">{label}</span>
      </DropdownMenuSubTrigger>
      <DropdownMenuPortal>
        <DropdownMenuSubContent
          sideOffset={8}
          alignOffset={-4}
          className="p-0 border border-secondary/50 rounded-none shadow-xl bg-popover min-w-[200px]"
        >
          {children}
        </DropdownMenuSubContent>
      </DropdownMenuPortal>
    </DropdownMenuSub>
  );
}

export function DataTableFilter({
  placeholder = "Search...",
  filters,
  onFilterChange,
  statusOptions,
  showDateFilter = true,
  isLoading,
  className,
  showAttachments,
  showSource,
}: DataTableFilterProps) {
  const [searchValue, setSearchValue] = useState(filters.q || "");
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLFormElement>(null);
  const [triggerWidth, setTriggerWidth] = useState<number | null>(null);

  useEffect(() => {
    if (containerRef.current) {
      setTriggerWidth(containerRef.current.offsetWidth);
    }
  }, [isOpen]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchValue(value);
    onFilterChange({ ...filters, q: value || null });
  };

  const handleClearSearch = () => {
    setSearchValue("");
    onFilterChange({ ...filters, q: null });
  };

  const handleStatusChange = (statusId: string) => {
    const newStatus = filters.status === statusId ? null : statusId;
    onFilterChange({ ...filters, status: newStatus });
  };

  const handleDateSelect = (range: DateRange | undefined) => {
    onFilterChange({
      ...filters,
      start: range?.from?.toISOString() ?? null,
      end: range?.to?.toISOString() ?? null,
    });
  };

  const dateRange: DateRange | undefined = useMemo(() => {
    if (!filters.start && !filters.end) return undefined;
    return {
      from: filters.start ? parseISO(filters.start) : undefined,
      to: filters.end ? parseISO(filters.end) : undefined,
    };
  }, [filters.start, filters.end]);

  const handleRemoveFilter = (key: string) => {
    if (key === "date") {
      onFilterChange({ ...filters, start: null, end: null });
    } else {
      onFilterChange({ ...filters, [key]: null });
    }
  };

  const hasActiveFilters = useMemo(() => {
    return Object.entries(filters).some(
      ([key, value]) =>
        value !== null &&
        value !== undefined &&
        value !== "" &&
        key !== "q" &&
        key !== "page" &&
        key !== "limit",
    );
  }, [filters]);

  return (
    <div className={cn("flex flex-row items-center gap-3 w-full", className)}>
      <form
        className="relative flex-1 max-w-sm group"
        ref={containerRef}
        onSubmit={(e) => {
          e.preventDefault();
        }}
      >
        <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
          <div className="relative flex items-center">
            <Icons.Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none transition-colors group-focus-within:text-foreground" />
            <Input
              placeholder={placeholder}
              value={searchValue}
              onChange={handleSearchChange}
              className="pl-9 pr-16 h-9 border border-secondary/50 bg-secondary/10 focus-visible:ring-1 focus-visible:ring-ring/20 transition-all shadow-none placeholder:text-muted-foreground/50 rounded-none text-xs"
            />

            <div className="absolute right-1 top-1/2 -translate-y-1/2 flex items-center gap-0.5">
              {searchValue && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-muted-foreground hover:text-foreground hover:bg-transparent rounded-none"
                  onClick={handleClearSearch}
                >
                  <Icons.Clear size={14} />
                </Button>
              )}
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className={cn(
                    "h-7 w-7 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors rounded-none outline-none cursor-pointer",
                    (isOpen || hasActiveFilters) && "text-foreground",
                  )}
                >
                  <Icons.Filter size={15} />
                </button>
              </DropdownMenuTrigger>
            </div>
          </div>

          <DropdownMenuContent
            align="end"
            alignOffset={-4}
            sideOffset={4}
            className="rounded-none p-0 border border-secondary/50 shadow-2xl bg-popover overflow-hidden"
            style={{ width: triggerWidth ? `${triggerWidth}px` : "320px" }}
          >
            <div className="flex flex-col py-1">
              {showDateFilter && (
                <FilterMenuItem icon={Icons.CalendarMonth} label="Date">
                  <div className="w-auto min-w-[500px]">
                    <DateRangePickerContent
                      range={dateRange}
                      onSelect={handleDateSelect}
                    />
                  </div>
                </FilterMenuItem>
              )}

              <FilterMenuItem icon={Icons.Amount} label="Amount">
                <div className="p-4 text-center text-[10px] text-muted-foreground font-medium uppercase tracking-widest opacity-50">
                  Amount range UI coming soon
                </div>
              </FilterMenuItem>

              {statusOptions && (
                <FilterMenuItem icon={Icons.Status} label="Status">
                  <div className="p-1 min-w-[180px]">
                    {statusOptions.map((option) => (
                      <DropdownMenuCheckboxItem
                        key={option.id}
                        checked={filters.status === option.id}
                        onCheckedChange={() => handleStatusChange(option.id)}
                        className="text-xs rounded-none py-2 pr-3 focus:bg-accent cursor-default"
                      >
                        {option.name}
                      </DropdownMenuCheckboxItem>
                    ))}
                  </div>
                </FilterMenuItem>
              )}

              {showAttachments && (
                <FilterMenuItem icon={Icons.Attachments} label="Attachments">
                  <div className="p-1 min-w-[180px]">
                    <DropdownMenuCheckboxItem
                      checked={filters.attachments === "include"}
                      onCheckedChange={() =>
                        onFilterChange({
                          ...filters,
                          attachments:
                            filters.attachments === "include"
                              ? null
                              : "include",
                        })
                      }
                      className="text-xs rounded-none py-2 pr-3 focus:bg-accent cursor-default"
                    >
                      Has attachments
                    </DropdownMenuCheckboxItem>
                    <DropdownMenuCheckboxItem
                      checked={filters.attachments === "exclude"}
                      onCheckedChange={() =>
                        onFilterChange({
                          ...filters,
                          attachments:
                            filters.attachments === "exclude"
                              ? null
                              : "exclude",
                        })
                      }
                      className="text-xs rounded-none py-2 pr-3 focus:bg-accent cursor-default"
                    >
                      No attachments
                    </DropdownMenuCheckboxItem>
                  </div>
                </FilterMenuItem>
              )}

              {showSource && (
                <FilterMenuItem icon={Icons.Import} label="Source">
                  <div className="p-1 min-w-[180px]">
                    <DropdownMenuCheckboxItem
                      checked={filters.manual === "include"}
                      onCheckedChange={() =>
                        onFilterChange({
                          ...filters,
                          manual:
                            filters.manual === "include" ? null : "include",
                        })
                      }
                      className="text-xs rounded-none py-2 pr-3 focus:bg-accent cursor-default"
                    >
                      Manual
                    </DropdownMenuCheckboxItem>
                    <DropdownMenuCheckboxItem
                      checked={filters.manual === "exclude"}
                      onCheckedChange={() =>
                        onFilterChange({
                          ...filters,
                          manual:
                            filters.manual === "exclude" ? null : "exclude",
                        })
                      }
                      className="text-xs rounded-none py-2 pr-3 focus:bg-accent cursor-default"
                    >
                      Bank connection
                    </DropdownMenuCheckboxItem>
                  </div>
                </FilterMenuItem>
              )}

              <div className="mt-1 pt-1 border-t border-secondary/50 px-1">
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start text-[10px] h-8 font-normal text-muted-foreground hover:text-foreground rounded-none px-3"
                  onClick={() => onFilterChange({ q: filters.q })}
                  disabled={!hasActiveFilters}
                >
                  Clear all filters
                </Button>
              </div>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
      </form>

      <FilterList
        filters={filters}
        loading={isLoading}
        onRemove={handleRemoveFilter}
        statusFilters={statusOptions}
      />
    </div>
  );
}
