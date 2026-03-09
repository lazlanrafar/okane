"use client";

import { useEffect, useState } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { getCategories } from "@workspace/modules/category/category.action";
import {
  createTransaction,
  updateTransaction,
} from "@workspace/modules/transaction/transaction.action";
import { getWallets } from "@workspace/modules/wallet/wallet.action";
import type { Category, Transaction, Wallet } from "@workspace/types";
import {
  Button,
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CurrencyInput,
  cn,
  Editor,
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Input,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  Tabs,
  TabsList,
  TabsTrigger,
} from "@workspace/ui";
import { useCurrency } from "@workspace/ui/hooks";
import {
  Check,
  ChevronsUpDown,
  File,
  FileText,
  Film,
  Image,
  Paperclip,
  X,
} from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";

import { VaultPickerModal } from "../shared/vault-picker-modal";

const transactionSchema = z.object({
  amount: z.coerce.number().positive("Amount must be positive"),
  date: z.string().refine((val) => !Number.isNaN(Date.parse(val)), {
    message: "Invalid date",
  }),
  type: z.enum([
    "income",
    "expense",
    "transfer",
    "transfer-in",
    "transfer-out",
  ]),
  walletId: z.string().min(1, "Wallet is required"),
  toWalletId: z.string().optional(),
  categoryId: z.string().optional(),
  name: z.string().optional(),
  description: z.string().optional(),
  attachmentIds: z.array(z.string()).optional(),
});

type TransactionFormValues = z.infer<typeof transactionSchema>;

interface VaultFileRef {
  id: string;
  name: string;
  size: number;
  type: string;
}

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function FileIcon({ type }: { type: string }) {
  if (type.startsWith("image/")) return <Image className="w-4 h-4" />;
  if (type.startsWith("video/")) return <Film className="w-4 h-4" />;
  if (type === "application/pdf") return <FileText className="w-4 h-4" />;
  return <File className="w-4 h-4" />;
}

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  transaction?: Transaction;
  onSuccess?: () => void;
}

export function TransactionFormSheet({
  open,
  onOpenChange,
  transaction,
  onSuccess,
}: Props) {
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<TransactionFormValues["type"]>(
    (transaction?.type as TransactionFormValues["type"]) || "expense",
  );
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [attachments, setAttachments] = useState<VaultFileRef[]>([]);
  const [vaultPickerOpen, setVaultPickerOpen] = useState(false);
  const { settings } = useCurrency();

  const form = useForm<TransactionFormValues>({
    resolver: zodResolver(transactionSchema as any),
    defaultValues: {
      type: "expense",
      date: new Date().toISOString().split("T")[0],
      amount: 0,
      name: "",
      description: "",
      walletId: "",
      categoryId: "",
      toWalletId: "",
      attachmentIds: [],
    },
  });

  const filteredCategories = categories.filter((c) => c.type === activeTab);

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

        if (transaction) {
          form.reset({
            amount: Number(transaction.amount),
            date:
              typeof transaction.date === "string"
                ? transaction.date.slice(0, 10)
                : new Date(transaction.date).toISOString().slice(0, 10),
            type: transaction.type as "income" | "expense" | "transfer",
            walletId: transaction.walletId ?? "",
            toWalletId: transaction.toWalletId ?? "",
            categoryId: transaction.categoryId ?? "",
            name: (transaction as any).name ?? "",
            description: transaction.description ?? "",
            attachmentIds: (transaction as any).attachmentIds ?? [],
          });
          setAttachments((transaction as any).attachments ?? []);
          setActiveTab(transaction.type as any);
        } else {
          form.reset({
            type: "expense",
            date: new Date().toISOString().split("T")[0],
            amount: 0,
            name: "",
            description: "",
            walletId: "",
            categoryId: "",
            toWalletId: "",
            attachmentIds: [],
          });
          setAttachments([]);
          setActiveTab("expense");
        }
      } catch (error) {
        console.error("Failed to load form data", error);
        toast.error("Failed to load wallets or categories");
      }
    };
    if (open) {
      loadData();
    }
  }, [open, transaction, form]);

  async function onSubmit(data: TransactionFormValues) {
    setIsLoading(true);
    try {
      const payload = {
        ...data,
        amount: data.amount.toString(),
        attachmentIds: attachments.map((a) => a.id),
      };

      if (transaction?.id) {
        await updateTransaction(transaction.id, payload);
        toast.success("Transaction updated");
      } else {
        await createTransaction(payload);
        toast.success("Transaction created");
      }
      form.reset();
      onOpenChange(false);
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
    if (newType === "transfer") {
      form.setValue("categoryId", undefined);
    }
  };

  const handleVaultConfirm = (ids: string[]) => {
    const newAttachments = ids.map((id) => {
      const existing = attachments.find((a) => a.id === id);
      return (
        existing ?? { id, name: id, size: 0, type: "application/octet-stream" }
      );
    });
    setAttachments(newAttachments);
  };

  const removeAttachment = (id: string) =>
    setAttachments((prev) => prev.filter((a) => a.id !== id));

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent>
        <SheetHeader className="mb-10">
          <SheetTitle className="text-3xl font-sans tracking-tight font-bold">
            {transaction ? "Edit Transaction" : "New Transaction"}
          </SheetTitle>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-6 pb-20 no-scrollbar">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              {/* Type tabs */}
              <Tabs
                value={activeTab}
                onValueChange={handleTabChange}
                className="w-full mb-8"
              >
                <TabsList className="grid w-full grid-cols-3 bg-muted/30 h-11 p-1">
                  <TabsTrigger
                    value="income"
                    className="rounded-sm data-[state=active]:bg-background data-[state=active]:shadow-sm"
                  >
                    Income
                  </TabsTrigger>
                  <TabsTrigger
                    value="expense"
                    className="rounded-sm data-[state=active]:bg-background data-[state=active]:shadow-sm"
                  >
                    Expense
                  </TabsTrigger>
                  <TabsTrigger
                    value="transfer"
                    className="rounded-sm data-[state=active]:bg-background data-[state=active]:shadow-sm"
                  >
                    Transfer
                  </TabsTrigger>
                </TabsList>
              </Tabs>

              {/* Amount */}
              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem className="space-y-3 mb-8">
                    <FormLabel className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                      Amount
                    </FormLabel>
                    <FormControl>
                      <div className="relative group">
                        <span className="absolute left-0 top-1/2 -translate-y-1/2 text-3xl font-light text-muted-foreground/50 transition-colors group-focus-within:text-foreground">
                          {settings?.mainCurrencySymbol ?? "$"}
                        </span>
                        <CurrencyInput
                          value={field.value}
                          onChange={field.onChange}
                          currencySymbol={settings?.mainCurrencySymbol}
                          decimalPlaces={settings?.mainCurrencyDecimalPlaces}
                          className={cn(
                            "pl-8 text-5xl font-bold bg-transparent border-none focus-visible:ring-0 transition-all",
                            activeTab === "expense"
                              ? "text-red-500"
                              : activeTab === "income"
                                ? "text-green-500"
                                : "text-blue-500",
                          )}
                          autoFocus
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Date + Wallet */}
              <div className="grid grid-cols-2 gap-6 mb-6">
                <FormField
                  control={form.control}
                  name="date"
                  render={({ field }) => (
                    <FormItem className="space-y-2">
                      <FormLabel className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Date
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="date"
                          {...field}
                          className="bg-transparent border-muted/40 h-10 transition-colors focus:border-foreground"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="walletId"
                  render={({ field }) => (
                    <FormItem className="flex flex-col space-y-2">
                      <FormLabel className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        From Wallet
                      </FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              role="combobox"
                              className={cn(
                                "w-full justify-between pl-3 text-left font-normal bg-transparent border-muted/40 h-10 transition-colors hover:bg-muted/10",
                                !field.value && "text-muted-foreground",
                              )}
                            >
                              {field.value
                                ? wallets.find((w) => w.id === field.value)
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
                                    onSelect={() =>
                                      form.setValue("walletId", wallet.id)
                                    }
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

              {/* To Wallet (transfer only) */}
              {activeTab === "transfer" && (
                <FormField
                  control={form.control}
                  name="toWalletId"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        To Wallet
                      </FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              role="combobox"
                              className={cn(
                                "w-full justify-between pl-3 text-left font-normal bg-transparent border-muted/40 h-10 transition-colors hover:bg-muted/10",
                                !field.value && "text-muted-foreground",
                              )}
                            >
                              {field.value
                                ? wallets.find((w) => w.id === field.value)
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
                                  .filter(
                                    (w) => w.id !== form.getValues("walletId"),
                                  )
                                  .map((wallet) => (
                                    <CommandItem
                                      value={wallet.name}
                                      key={wallet.id}
                                      onSelect={() =>
                                        form.setValue("toWalletId", wallet.id)
                                      }
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

              {/* Category (non-transfer only) */}
              {activeTab !== "transfer" && (
                <FormField
                  control={form.control}
                  name="categoryId"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Category
                      </FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              role="combobox"
                              className={cn(
                                "w-full justify-between pl-3 text-left font-normal bg-transparent border-muted/40 h-10 transition-colors hover:bg-muted/10",
                                !field.value && "text-muted-foreground",
                              )}
                            >
                              {field.value
                                ? categories.find((c) => c.id === field.value)
                                    ?.name
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
                                    onSelect={() =>
                                      form.setValue("categoryId", category.id)
                                    }
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

              {/* Name (transaction title) */}
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem className="space-y-2 mb-6">
                    <FormLabel className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Name
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g. Grocery shopping, Salary…"
                        {...field}
                        className="bg-transparent border-muted/40 h-10 transition-colors focus:border-foreground"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Description (rich text) */}
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem className="space-y-2 mb-8">
                    <FormLabel className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Description
                    </FormLabel>
                    <FormControl>
                      <div className="min-h-[100px] rounded-md border border-muted/40 bg-transparent px-3 py-2 text-sm transition-colors focus-within:border-foreground focus-within:ring-0">
                        <Editor
                          initialContent={field.value || ""}
                          placeholder="Add notes, links, or any details…"
                          onUpdate={(editor) =>
                            field.onChange(editor.getHTML())
                          }
                          onBlur={field.onBlur}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Attachments */}
              <div className="space-y-3 mb-10">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Attachments
                  </span>
                  <Button
                    type="button"
                    variant="link"
                    size="sm"
                    onClick={() => setVaultPickerOpen(true)}
                    className="h-auto p-0 text-xs text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <Paperclip className="w-3 h-3 mr-1.5" />
                    Attach from Vault
                  </Button>
                </div>

                {attachments.length > 0 && (
                  <div className="grid grid-cols-1 gap-2">
                    {attachments.map((file) => (
                      <div
                        key={file.id}
                        className="flex items-center gap-3 px-3 py-2.5 rounded-md border border-muted/20 bg-muted/5 text-sm group transition-colors hover:border-muted/40"
                      >
                        <FileIcon type={file.type} />
                        <span className="flex-1 truncate">{file.name}</span>
                        {file.size > 0 && (
                          <span className="text-xs text-muted-foreground shrink-0">
                            {formatBytes(file.size)}
                          </span>
                        )}
                        <button
                          type="button"
                          onClick={() => removeAttachment(file.id)}
                          className="shrink-0 text-muted-foreground hover:text-destructive transition-colors"
                          aria-label={`Remove ${file.name}`}
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <Button
                type="submit"
                className="w-full h-12 text-sm font-bold tracking-wide uppercase transition-all hover:scale-[1.01] active:scale-[0.99]"
                disabled={isLoading}
              >
                {isLoading ? "Saving…" : "Save Transaction"}
              </Button>
            </form>

            <VaultPickerModal
              open={vaultPickerOpen}
              onOpenChange={setVaultPickerOpen}
              selectedIds={attachments.map((a) => a.id)}
              onConfirm={handleVaultConfirm}
            />
          </Form>
        </div>
      </SheetContent>
    </Sheet>
  );
}
