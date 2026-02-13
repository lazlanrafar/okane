"use client";

import * as React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getTransactionSettings,
  updateTransactionSettings,
} from "@/actions/setting.actions";
import type { TransactionSettings } from "@/types/settings";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui";
import { Switch } from "@workspace/ui";
import { Separator } from "@workspace/ui";
import { Label } from "@workspace/ui";
import { Skeleton } from "@workspace/ui";
import { toast } from "sonner";
import {
  WEEKLY_START_DAY_OPTIONS,
  PERIOD_OPTIONS,
  INCOME_EXPENSES_COLOR_OPTIONS,
  TIME_INPUT_OPTIONS,
  START_SCREEN_OPTIONS,
  SWIPE_ACTION_OPTIONS,
  INPUT_ORDER_OPTIONS,
} from "@workspace/constants";

export function TransactionSettingsForm() {
  const queryClient = useQueryClient();

  const { data: settings, isLoading } = useQuery({
    queryKey: ["settings", "transaction"],
    queryFn: async () => {
      const data = await getTransactionSettings();
      return data as TransactionSettings;
    },
  });

  const mutation = useMutation({
    mutationFn: async (vars: Partial<TransactionSettings>) => {
      return updateTransactionSettings(vars);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["settings", "transaction"] });
      toast.success("Settings updated");
    },
    onError: () => {
      toast.error("Failed to update settings");
    },
  });

  const updateSetting = (key: keyof TransactionSettings, value: any) => {
    mutation.mutate({ [key]: value });
  };

  if (isLoading || !settings) {
    return (
      <div className="space-y-6">
        {[1, 2, 3].map((section, i) => (
          <React.Fragment key={i}>
            <div className="space-y-4">
              <div>
                <Skeleton className="h-5 w-32 mb-2" />
                <Skeleton className="h-4 w-64" />
              </div>
              <div className="space-y-4">
                {[1, 2, 3].map((row) => (
                  <div key={row} className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-48" />
                    </div>
                    <Skeleton className="h-10 w-[180px]" />
                  </div>
                ))}
              </div>
            </div>
            {i < 2 && <Skeleton className="h-[1px] w-full" />}
          </React.Fragment>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Date & Time Settings */}
      <div className="space-y-4">
        <div>
          <h4 className="text-sm font-medium">Date & Time</h4>
          <p className="text-sm text-muted-foreground">
            Configure how dates and times are handled in transactions.
          </p>
        </div>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Monthly Start Date</Label>
              <p className="text-xs text-muted-foreground">
                The day of the month when your tracking period begins.
              </p>
            </div>
            <Select
              value={settings.monthlyStartDate?.toString()}
              onValueChange={(val) =>
                updateSetting("monthlyStartDate", parseInt(val))
              }
            >
              <SelectTrigger className="w-[180px] cursor-pointer">
                <SelectValue placeholder="Select date" />
              </SelectTrigger>
              <SelectContent>
                {Array.from({ length: 31 }, (_, i) => i + 1).map((date) => (
                  <SelectItem
                    key={date}
                    value={date.toString()}
                    className="cursor-pointer"
                  >
                    {date}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Weekly Start Day</Label>
              <p className="text-xs text-muted-foreground">
                The day of the week your weekly tracking begins.
              </p>
            </div>
            <Select
              value={settings.weeklyStartDay}
              onValueChange={(val) => updateSetting("weeklyStartDay", val)}
            >
              <SelectTrigger className="w-[180px] cursor-pointer">
                <SelectValue placeholder="Select day" />
              </SelectTrigger>
              <SelectContent>
                {WEEKLY_START_DAY_OPTIONS.map((day) => (
                  <SelectItem key={day} value={day} className="cursor-pointer">
                    {day}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
      <Separator />

      {/* General Preferences */}
      <div className="space-y-4">
        <div>
          <h4 className="text-sm font-medium">General Preferences</h4>
          <p className="text-sm text-muted-foreground">
            Customize general behavior and display options.
          </p>
        </div>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Default Period</Label>
              <p className="text-xs text-muted-foreground">
                The default view period for your transactions.
              </p>
            </div>
            <Select
              value={settings.period}
              onValueChange={(val) => updateSetting("period", val)}
            >
              <SelectTrigger className="w-[180px] cursor-pointer">
                <SelectValue placeholder="Select period" />
              </SelectTrigger>
              <SelectContent>
                {PERIOD_OPTIONS.map((period) => (
                  <SelectItem
                    key={period}
                    value={period}
                    className="cursor-pointer"
                  >
                    {period}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Start Screen</Label>
              <p className="text-xs text-muted-foreground">
                The initial screen shown when opening the transaction view.
              </p>
            </div>
            <Select
              value={settings.startScreen}
              onValueChange={(val) => updateSetting("startScreen", val)}
            >
              <SelectTrigger className="w-[180px] cursor-pointer">
                <SelectValue placeholder="Select start screen" />
              </SelectTrigger>
              <SelectContent>
                {START_SCREEN_OPTIONS.map((screen) => (
                  <SelectItem
                    key={screen}
                    value={screen}
                    className="cursor-pointer"
                  >
                    {screen}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Income/Expense Color</Label>
              <p className="text-xs text-muted-foreground">
                Choose the color scheme for income and expenses.
              </p>
            </div>
            <Select
              value={settings.incomeExpensesColor}
              onValueChange={(val) => updateSetting("incomeExpensesColor", val)}
            >
              <SelectTrigger className="w-[180px] cursor-pointer">
                <SelectValue placeholder="Select color mode" />
              </SelectTrigger>
              <SelectContent>
                {INCOME_EXPENSES_COLOR_OPTIONS.map((option) => (
                  <SelectItem
                    key={option.value}
                    value={option.value}
                    className="cursor-pointer"
                  >
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
      <Separator />

      {/* Input & Interaction */}
      <div className="space-y-4">
        <div>
          <h4 className="text-sm font-medium">Input & Interaction</h4>
          <p className="text-sm text-muted-foreground">
            Fine-tune how you input data and interact with lists.
          </p>
        </div>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Carry-over Balance</Label>
              <p className="text-xs text-muted-foreground">
                Automatically carry over the remaining balance to the next
                period.
              </p>
            </div>
            <Switch
              checked={settings.carryOver}
              onCheckedChange={(val) => updateSetting("carryOver", val)}
              className="cursor-pointer"
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Autocomplete</Label>
              <p className="text-xs text-muted-foreground">
                Suggest previous entries when typing.
              </p>
            </div>
            <Switch
              checked={settings.autocomplete}
              onCheckedChange={(val) => updateSetting("autocomplete", val)}
              className="cursor-pointer"
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Time Input</Label>
              <p className="text-xs text-muted-foreground">
                Enable time selection for transactions.
              </p>
            </div>
            <Select
              value={settings.timeInput}
              onValueChange={(val) => updateSetting("timeInput", val)}
            >
              <SelectTrigger className="w-[180px] cursor-pointer">
                <SelectValue placeholder="Select time input" />
              </SelectTrigger>
              <SelectContent>
                {TIME_INPUT_OPTIONS.map((option) => (
                  <SelectItem
                    key={option.value}
                    value={option.value}
                    className="cursor-pointer"
                  >
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Swipe Action</Label>
              <p className="text-xs text-muted-foreground">
                Configure the action when swiping on a transaction.
              </p>
            </div>
            <Select
              value={settings.swipeAction}
              onValueChange={(val) => updateSetting("swipeAction", val)}
            >
              <SelectTrigger className="w-[180px] cursor-pointer">
                <SelectValue placeholder="Select swipe action" />
              </SelectTrigger>
              <SelectContent>
                {SWIPE_ACTION_OPTIONS.map((action) => (
                  <SelectItem
                    key={action}
                    value={action}
                    className="cursor-pointer"
                  >
                    {action}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Input Order</Label>
              <p className="text-xs text-muted-foreground">
                Choose the order of fields when adding a transaction.
              </p>
            </div>
            <Select
              value={settings.inputOrder}
              onValueChange={(val) => updateSetting("inputOrder", val)}
            >
              <SelectTrigger className="w-[180px] cursor-pointer">
                <SelectValue placeholder="Select input order" />
              </SelectTrigger>
              <SelectContent>
                {INPUT_ORDER_OPTIONS.map((option) => (
                  <SelectItem
                    key={option.value}
                    value={option.value}
                    className="cursor-pointer"
                  >
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Show Description</Label>
              <p className="text-xs text-muted-foreground">
                Display transaction descriptions in the list view.
              </p>
            </div>
            <Switch
              checked={settings.showDescription}
              onCheckedChange={(val) => updateSetting("showDescription", val)}
              className="cursor-pointer"
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Quick Note Button</Label>
              <p className="text-xs text-muted-foreground">
                Show a button to quickly add notes to transactions.
              </p>
            </div>
            <Switch
              checked={settings.noteButton}
              onCheckedChange={(val) => updateSetting("noteButton", val)}
              className="cursor-pointer"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
