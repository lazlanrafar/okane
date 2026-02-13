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
  Switch,
  Separator,
  Label,
  RadioGroup,
  RadioGroupItem,
  Skeleton,
} from "@workspace/ui";
import {
  WEEKLY_START_DAY_OPTIONS,
  PERIOD_OPTIONS,
  INCOME_EXPENSES_COLOR_OPTIONS,
  TIME_INPUT_OPTIONS,
  START_SCREEN_OPTIONS,
  SWIPE_ACTION_OPTIONS,
  INPUT_ORDER_OPTIONS,
  MONTHLY_START_DATE_WEEKEND_HANDLING_OPTIONS,
} from "@workspace/constants";
import { toast } from "sonner";

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
            {i < 2 && <Skeleton className="h-px w-full" />}
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
          <h4 className="text-base font-medium">Date & Time</h4>
          <p className="text-sm text-muted-foreground">
            Configure how dates and times are handled in transactions.
          </p>
        </div>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-sm">Monthly Start Date</Label>
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
          <div className="space-y-3 pt-1">
            <Label className="text-sm text-muted-foreground font-normal">
              If monthly start date is weekend,
            </Label>
            <RadioGroup
              value={settings.monthlyStartDateWeekendHandling}
              onValueChange={(val) =>
                updateSetting("monthlyStartDateWeekendHandling", val)
              }
              className="space-y-1"
            >
              {MONTHLY_START_DATE_WEEKEND_HANDLING_OPTIONS.map((option) => (
                <div className="flex items-center space-x-2" key={option.value}>
                  <RadioGroupItem
                    value={option.value}
                    id={`handling-${option.value}`}
                  />
                  <Label
                    htmlFor={`handling-${option.value}`}
                    className="font-normal cursor-pointer text-sm"
                  >
                    {option.label}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-sm">Weekly Start Day</Label>
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
          <h4 className="text-base font-medium">General Preferences</h4>
          <p className="text-sm text-muted-foreground">
            Customize general behavior and display options.
          </p>
        </div>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-sm">Default Period</Label>
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
              <Label className="text-sm">Start Screen</Label>
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

          <div className="space-y-3 pt-1">
            <Label className="text-sm text-muted-foreground font-normal">
              By default, income is shown in 'Blue' color and expenses in 'Red'
              color. You can customize it to the other way around.
            </Label>
            <RadioGroup
              value={settings.incomeExpensesColor}
              onValueChange={(val) => updateSetting("incomeExpensesColor", val)}
              className="space-y-2"
            >
              {INCOME_EXPENSES_COLOR_OPTIONS.map((option) => (
                <div key={option.value} className="flex flex-col space-y-2">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem
                      value={option.value}
                      id={`color-${option.value}`}
                    />
                    <Label
                      htmlFor={`color-${option.value}`}
                      className="font-normal cursor-pointer text-sm"
                    >
                      {option.label}
                    </Label>
                  </div>

                  <div className="flex items-center">
                    <div className="ml-6 border rounded-md p-2 w-full max-w-[100px] bg-card text-xs font-medium">
                      <span className={option.expensesColor}>Exp.</span>
                    </div>
                    <div className="ml-6 border rounded-md p-2 w-full max-w-[100px] bg-card text-xs font-medium">
                      <span className={option.incomeColor}>Inc.</span>
                    </div>
                  </div>
                </div>
              ))}
            </RadioGroup>
          </div>
        </div>
      </div>
      <Separator />

      {/* Input & Interaction */}
      <div className="space-y-4">
        <div>
          <h4 className="text-base font-medium">Input & Interaction</h4>
          <p className="text-sm text-muted-foreground">
            Fine-tune how you input data and interact with lists.
          </p>
        </div>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-sm">Carry-over Balance</Label>
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
              <Label className="text-sm">Autocomplete</Label>
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
              <Label className="text-sm">Time Input</Label>
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
              <Label className="text-sm">Swipe Action</Label>
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
              <Label className="text-sm">Input Order</Label>
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
              <Label className="text-sm">Show Description</Label>
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
              <Label className="text-sm">Quick Note Button</Label>
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
