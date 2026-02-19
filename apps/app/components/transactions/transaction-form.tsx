"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button, Textarea } from "@workspace/ui";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@workspace/ui";
import { Input } from "@workspace/ui";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@workspace/ui";
import { Popover, PopoverContent, PopoverTrigger } from "@workspace/ui";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@workspace/ui";
import { Tabs, TabsList, TabsTrigger } from "@workspace/ui";
import {
  createTransaction,
  updateTransaction,
} from "@/actions/transaction.actions";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Wallet, Category } from "@workspace/types";
import { getWallets } from "@/actions/wallet.actions";
import { getCategories } from "@/actions/category.actions";
import { useCurrency } from "@/hooks/use-currency";
import { CurrencyInput } from "@/components/ui/currency-input";

const transactionSchema = z.object({
  amount: z.coerce.number().positive("Amount must be positive"),
  date: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "Invalid date",
  }),
  type: z.enum(["income", "expense", "transfer"]),
  walletId: z.string().min(1, "Wallet is required"),
  toWalletId: z.string().optional(),
  categoryId: z.string().optional(),
  description: z.string().optional(),
  note: z.string().optional(),
});

type TransactionFormValues = z.infer<typeof transactionSchema>;

interface TransactionFormProps {
  onSuccess?: () => void;
  defaultValues?: Partial<TransactionFormValues>;
  transactionId?: string; // If provided, it's an edit
}

export function TransactionForm({
  onSuccess,
  defaultValues,
  transactionId,
}: TransactionFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"income" | "expense" | "transfer">(
    (defaultValues?.type as "income" | "expense" | "transfer") || "expense",
  );

  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const { settings } = useCurrency();

  useEffect(() => {
    const loadData = async () => {
      try {
        const [walletsResponse, categoriesResponse] = await Promise.all([
          getWallets(),
          getCategories(),
        ]);

        if (walletsResponse.success && walletsResponse.data) {
          setWallets(walletsResponse.data);
        }

        if (categoriesResponse.success && categoriesResponse.data) {
          setCategories(categoriesResponse.data);
        }
      } catch (error) {
        console.error("Failed to load form data", error);
        toast.error("Failed to load wallets or categories");
      }
    };
    loadData();
  }, []);

  const form = useForm<TransactionFormValues>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      type: "expense",
      date: new Date().toISOString().split("T")[0],
      amount: 0,
      description: "",
      note: "",
      walletId: "",
      categoryId: "",
      toWalletId: "",
      ...defaultValues,
    },
  });

  // Watch type to conditionally render fields
  const type = form.watch("type");

  // In a real app we might want to fetch categories when type changes
  // For now, let's filter the already fetched categories
  const filteredCategories = categories.filter((c) => c.type === activeTab);

  async function onSubmit(data: TransactionFormValues) {
    setIsLoading(true);
    try {
      if (transactionId) {
        await updateTransaction(transactionId, {
          ...data,
          amount: data.amount.toString(),
        });
        toast.success("Transaction updated");
      } else {
        await createTransaction({
          ...data,
          amount: data.amount.toString(),
        });
        toast.success("Transaction created");
      }
      form.reset();
      router.refresh();
      onSuccess?.();
    } catch (error) {
      console.error(error);
      toast.error("Failed to save transaction");
    } finally {
      setIsLoading(false);
    }
  }

  const handleTabChange = (value: string) => {
    const newType = value as "income" | "expense" | "transfer";
    setActiveTab(newType);
    form.setValue("type", newType);
    // Reset category when type changes as it might not be valid
    if (newType === "transfer") {
      form.setValue("categoryId", undefined);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <Tabs
          value={activeTab}
          onValueChange={handleTabChange}
          className="w-full"
        >
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="income">Income</TabsTrigger>
            <TabsTrigger value="expense">Expense</TabsTrigger>
            <TabsTrigger value="transfer">Transfer</TabsTrigger>
          </TabsList>
        </Tabs>

        <FormField
          control={form.control}
          name="amount"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Amount</FormLabel>
              <FormControl>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">
                    {settings?.mainCurrencySymbol ?? "$"}
                  </span>
                  <CurrencyInput
                    value={field.value}
                    onChange={field.onChange}
                    currencySymbol={settings?.mainCurrencySymbol}
                    decimalPlaces={settings?.mainCurrencyDecimalPlaces}
                    className={
                      "pl-8 text-lg font-bold " +
                      (activeTab === "expense"
                        ? "text-red-600"
                        : activeTab === "income"
                          ? "text-green-600"
                          : "text-blue-600")
                    }
                  />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="date"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Date</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          {/* Wallet Selection */}
          <FormField
            control={form.control}
            name="walletId"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>From Wallet</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        role="combobox"
                        className={cn(
                          "w-full justify-between pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground",
                        )}
                      >
                        {field.value
                          ? wallets.find((wallet) => wallet.id === field.value)
                              ?.name
                          : "Select wallet"}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent
                    className="w-[--radix-popover-trigger-width] p-0"
                    align="start"
                  >
                    <Command>
                      <CommandInput placeholder="Search wallet..." />
                      <CommandList>
                        <CommandEmpty>No wallet found.</CommandEmpty>
                        <CommandGroup>
                          {wallets.map((wallet) => (
                            <CommandItem
                              value={wallet.name}
                              key={wallet.id}
                              onSelect={() => {
                                form.setValue("walletId", wallet.id);
                              }}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  wallet.id === field.value
                                    ? "opacity-100"
                                    : "opacity-0",
                                )}
                              />
                              {wallet.name}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {activeTab === "transfer" && (
          <FormField
            control={form.control}
            name="toWalletId"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>To Wallet</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        role="combobox"
                        className={cn(
                          "w-full justify-between pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground",
                        )}
                      >
                        {field.value
                          ? wallets.find((wallet) => wallet.id === field.value)
                              ?.name
                          : "Select destination"}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent
                    className="w-[--radix-popover-trigger-width] p-0"
                    align="start"
                  >
                    <Command>
                      <CommandInput placeholder="Search wallet..." />
                      <CommandList>
                        <CommandEmpty>No wallet found.</CommandEmpty>
                        <CommandGroup>
                          {wallets
                            .filter((w) => w.id !== form.getValues("walletId"))
                            .map((wallet) => (
                              <CommandItem
                                value={wallet.name}
                                key={wallet.id}
                                onSelect={() => {
                                  form.setValue("toWalletId", wallet.id);
                                }}
                              >
                                <Check
                                  className={cn(
                                    "mr-2 h-4 w-4",
                                    wallet.id === field.value
                                      ? "opacity-100"
                                      : "opacity-0",
                                  )}
                                />
                                {wallet.name}
                              </CommandItem>
                            ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        {activeTab !== "transfer" && (
          <FormField
            control={form.control}
            name="categoryId"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Category</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        role="combobox"
                        className={cn(
                          "w-full justify-between pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground",
                        )}
                      >
                        {field.value
                          ? filteredCategories.find(
                              (category) => category.id === field.value,
                            )?.name
                          : "Select category"}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent
                    className="w-[--radix-popover-trigger-width] p-0"
                    align="start"
                  >
                    <Command>
                      <CommandInput placeholder="Search category..." />
                      <CommandList>
                        <CommandEmpty>No category found.</CommandEmpty>
                        <CommandGroup>
                          {filteredCategories.map((category) => (
                            <CommandItem
                              value={category.name}
                              key={category.id}
                              onSelect={() => {
                                form.setValue("categoryId", category.id);
                              }}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  category.id === field.value
                                    ? "opacity-100"
                                    : "opacity-0",
                                )}
                              />
                              {category.name}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Input placeholder="What is this for?" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="note"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Note</FormLabel>
              <FormControl>
                <Input placeholder="Additional notes..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? "Saving..." : "Save Transaction"}
        </Button>
      </form>
    </Form>
  );
}
