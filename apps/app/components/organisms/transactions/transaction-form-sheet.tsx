"use client";

import { useEffect, useMemo, useState } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { Dictionary } from "@workspace/dictionaries";
import { createTransaction, updateTransaction } from "@workspace/modules/transaction/transaction.action";
import { uploadVaultFile } from "@workspace/modules/vault/vault.action";
import type { Transaction } from "@workspace/types";
import {
  Button,
  CurrencyInput,
  cn,
  Editor,
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Input,
  InputDate,
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@workspace/ui";
import { ChevronsUpDown, File, FileText, Film, Image, Paperclip, X } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";

import { SelectAccount } from "@/components/molecules/select-account";
import { SelectCategory } from "@/components/molecules/select-category";
import { SelectUser } from "@/components/molecules/select-user";
import { VaultPickerModal } from "@/components/molecules/vault-picker-modal";
import { useAppStore } from "@/stores/app";

const getTransactionSchema = (dictionary: Dictionary) =>
  z.object({
    amount: z.coerce.number().positive(dictionary.transactions.errors.amount_positive || "Amount must be positive"),
    date: z.string().refine((val) => !Number.isNaN(Date.parse(val)), {
      message: dictionary.transactions.errors.invalid_date || "Invalid date",
    }),
    type: z.enum(["income", "expense", "transfer", "transfer-in", "transfer-out"]),
    walletId: z.string().min(1, dictionary.transactions.errors.wallet_required),
    toWalletId: z.string().optional(),
    categoryId: z.string().optional(),
    name: z.string().optional().nullable(),
    description: z.string().optional().nullable(),
    assignedUserId: z.string().optional(),
    attachmentIds: z.array(z.string()).optional(),
  });

type TransactionFormValues = z.infer<ReturnType<typeof getTransactionSchema>>;

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
  if (type.startsWith("image/")) return <Image className="h-4 w-4" />;
  if (type.startsWith("video/")) return <Film className="h-4 w-4" />;
  if (type === "application/pdf") return <FileText className="h-4 w-4" />;
  return <File className="h-4 w-4" />;
}

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  transaction?: Transaction;
  onSuccess?: () => void;
  dictionary: Dictionary;
}

export function TransactionFormSheet({ open, onOpenChange, transaction, onSuccess, dictionary }: Props) {
  const [mounted, setMounted] = useState(false);
  const queryClient = useQueryClient();
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<TransactionFormValues["type"]>(
    (transaction?.type as TransactionFormValues["type"]) || "expense",
  );
  const [attachments, setAttachments] = useState<VaultFileRef[]>([]);
  const [vaultPickerOpen, setVaultPickerOpen] = useState(false);
  const { settings, user } = useAppStore();

  useEffect(() => {
    setMounted(true);
  }, []);

  const schema = useMemo(() => getTransactionSchema(dictionary), [dictionary]);

  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: {
      type: "expense",
      date: new Date().toISOString().split("T")[0],
      amount: 0,
      name: "",
      description: "",
      walletId: "",
      categoryId: "",
      toWalletId: "",
      assignedUserId: user?.id ?? "",
      attachmentIds: [],
    },
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        if (transaction) {
          form.reset({
            amount: Number(transaction?.amount),
            date:
              typeof transaction?.date === "string"
                ? transaction?.date.slice(0, 10)
                : new Date(transaction?.date).toISOString().slice(0, 10),
            type: transaction?.type as "income" | "expense" | "transfer",
            walletId: transaction?.walletId ?? "",
            toWalletId: transaction?.toWalletId ?? "",
            categoryId: transaction?.categoryId ?? "",
            name: transaction?.name ?? "",
            description: transaction?.description ?? "",
            attachmentIds: transaction?.attachmentIds ?? [],
            assignedUserId: transaction?.assignedUserId ?? "",
          });
          setAttachments(transaction?.attachments ?? []);
          setActiveTab(transaction?.type as TransactionFormValues["type"]);
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
            assignedUserId: user?.id ?? "",
          });
          setAttachments([]);
          setActiveTab("expense");
        }
      } catch (error) {
        console.error("Failed to load transaction data:", error);
      }
    };
    if (open) {
      loadData();
    }
  }, [open, transaction, form, user?.id]);

  async function onSubmit(data: TransactionFormValues) {
    if (!dictionary) return;
    setIsLoading(true);
    try {
      const payload = {
        ...data,
        amount: data.amount.toString(),
        attachmentIds: attachments.map((a) => a.id),
      };

      if (transaction?.id) {
        const result = await updateTransaction(transaction?.id, payload);
        if (!result.success) {
          throw new Error(result.error || dictionary.transactions.errors.save_failed);
        }
        toast.success(dictionary.transactions.toasts.updated);
      } else {
        const result = await createTransaction(payload);
        if (!result.success) {
          throw new Error(result.error || dictionary.transactions.errors.save_failed);
        }
        toast.success(dictionary.transactions.toasts.created);
      }

      form.reset();
      setAttachments([]);
      onOpenChange(false);
      onSuccess?.();
      void queryClient.invalidateQueries({ queryKey: ["transactions"] });
    } catch (error) {
      console.error(error);
      toast.error(error instanceof Error ? error.message : dictionary.transactions.errors.save_failed);
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
      return existing ?? { id, name: id, size: 0, type: "application/octet-stream" };
    });
    setAttachments(newAttachments);
  };

  const removeAttachment = (id: string) => setAttachments((prev) => prev.filter((a) => a.id !== id));

  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      const ALLOWED_TYPES = [
        "image/jpeg",
        "image/png",
        "image/gif",
        "image/webp",
        "application/pdf",
        "application/vnd.ms-excel",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "text/csv",
      ];
      if (!ALLOWED_TYPES.includes(file.type)) {
        throw new Error(`Invalid file type for ${file.name}. Only documents and images are allowed.`);
      }
      const formData = new FormData();
      formData.append("file", file);
      const result = await uploadVaultFile(formData);
      if (result.success) return result.data;
      throw new Error(result.error);
    },
    onSuccess: (data: { id: string; name: string; size: number; type: string }) => {
      queryClient.invalidateQueries({ queryKey: ["vault-files"] });
      setAttachments((prev) => {
        if (prev.find((a) => a.id === data.id)) return prev;
        return [...prev, { id: data.id, name: data.name, size: data.size, type: data.type }];
      });
    },
    onError: (error: Error) => {
      toast.error(error.message || dictionary.transactions.errors.upload_failed);
    },
  });

  const handleUploadFiles = async (selectedFiles: FileList | File[]) => {
    if (!dictionary) return;
    const filesArray = Array.from(selectedFiles);
    if (filesArray.length === 0) return;

    const toastId = toast.loading(
      dictionary.transactions.uploading_files.replace("{count}", filesArray.length.toString()),
    );

    try {
      await Promise.all(filesArray.map((file) => uploadMutation.mutateAsync(file)));
      toast.success(dictionary.transactions.all_uploads_success, {
        id: toastId,
      });
    } catch (_error) {
      toast.error(dictionary.transactions.errors.some_uploads_failed, {
        id: toastId,
      });
    }
  };

  if (!mounted || !dictionary) return null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="flex h-full flex-col p-0">
        <SheetHeader className="shrink-0 border-b px-6 py-6">
          <SheetTitle>
            {transaction ? dictionary.transactions.edit_transaction : dictionary.transactions.new_transaction}
          </SheetTitle>
        </SheetHeader>

        <div className="no-scrollbar flex-1 overflow-y-auto px-6 py-6">
          <Form {...form}>
            <form id="transaction-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <div className="flex w-full overflow-hidden border border-border bg-muted/30">
                <Button
                  type="button"
                  variant="ghost"
                  disabled={!!transaction}
                  className={cn(
                    "h-full flex-1 rounded-none border-border border-r text-xs last:border-r-0",
                    activeTab === "expense"
                      ? "bg-muted font-medium shadow-sm"
                      : "bg-transparent text-muted-foreground hover:bg-muted/50",
                  )}
                  onClick={() => handleTabChange("expense")}
                >
                  {dictionary.transactions.types.expense}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  disabled={!!transaction}
                  className={cn(
                    "h-full flex-1 rounded-none border-border border-r text-xs last:border-r-0",
                    activeTab === "income"
                      ? "bg-muted font-medium shadow-sm"
                      : "bg-transparent text-muted-foreground hover:bg-muted/50",
                  )}
                  onClick={() => handleTabChange("income")}
                >
                  {dictionary.transactions.types.income}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  disabled={!!transaction}
                  className={cn(
                    "h-full flex-1 rounded-none text-xs",
                    activeTab === "transfer"
                      ? "bg-muted font-medium shadow-sm"
                      : "bg-transparent text-muted-foreground hover:bg-muted/50",
                  )}
                  onClick={() => handleTabChange("transfer")}
                >
                  {dictionary.transactions.types.transfer}
                </Button>
              </div>
              <p className="mt-[-24px] mb-4 text-[11px] text-muted-foreground">{dictionary.transactions.hints.type}</p>

              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-medium text-sm">{dictionary.transactions.description_label}</FormLabel>
                    <FormControl>
                      <Input
                        placeholder={dictionary.transactions.placeholders.description}
                        {...field}
                        value={field.value ?? ""}
                        className="h-10 bg-transparent transition-colors focus:border-foreground"
                      />
                    </FormControl>
                    <FormDescription className="text-[11px]">
                      {dictionary.transactions.hints.description}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="amount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-medium text-sm">{dictionary.transactions.amount_label}</FormLabel>
                      <FormControl>
                        <div className="group relative">
                          <span className="-translate-y-1/2 absolute top-1/2 left-3 text-muted-foreground/50 text-sm transition-colors group-focus-within:text-foreground">
                            {settings?.mainCurrencySymbol ?? "$"}
                          </span>
                          <CurrencyInput
                            value={field.value}
                            onChange={field.onChange}
                            currencySymbol={settings?.mainCurrencySymbol}
                            decimalPlaces={settings?.mainCurrencyDecimalPlaces}
                            className={cn(
                              "h-10 bg-transparent pl-8 font-medium text-sm transition-colors focus:border-foreground",
                              activeTab === "expense"
                                ? "text-red-500"
                                : activeTab === "income"
                                  ? "text-green-500"
                                  : "text-blue-500",
                            )}
                          />
                        </div>
                      </FormControl>
                      <FormDescription className="text-[11px]">{dictionary.transactions.hints.amount}</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex flex-col">
                  <FormLabel className="mb-1 pt-1 pr-4 font-medium text-sm">
                    {dictionary.transactions.currency_label}
                  </FormLabel>
                  <Button
                    variant="outline"
                    className="h-10 w-full justify-between bg-transparent pl-3 text-left font-normal text-muted-foreground hover:bg-muted/10"
                    disabled
                  >
                    {settings?.mainCurrencyCode || "USD"}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                  <FormDescription className="mt-2 text-[11px]">
                    {dictionary.transactions.hints.currency}
                  </FormDescription>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="walletId"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel className="font-medium text-sm">{dictionary.transactions.account}</FormLabel>
                      <FormControl>
                        <SelectAccount
                          value={field.value ?? undefined}
                          onChange={(id) => form.setValue("walletId", id)}
                          className="h-10 w-full justify-start bg-transparent px-3 text-left font-normal transition-colors hover:bg-muted/10 hover:bg-transparent"
                        />
                      </FormControl>
                      <FormDescription className="text-[11px]">{dictionary.transactions.hints.account}</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="date"
                  render={({ field }) => (
                    <FormItem className="">
                      <FormLabel className="font-medium text-sm">{dictionary.transactions.date_label}</FormLabel>
                      <FormControl>
                        <InputDate
                          value={field.value}
                          onChange={field.onChange}
                          className="h-10 bg-transparent transition-colors focus:border-foreground"
                        />
                      </FormControl>
                      <FormDescription className="text-[11px]">{dictionary.transactions.hints.date}</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                {activeTab !== "transfer" ? (
                  <FormField
                    control={form.control}
                    name="categoryId"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel className="font-medium text-sm">{dictionary.transactions.category}</FormLabel>
                        <FormControl>
                          <SelectCategory
                            value={field.value ?? undefined}
                            type={activeTab === "income" ? "income" : "expense"}
                            onChange={(id) => form.setValue("categoryId", id)}
                          />
                        </FormControl>
                        <FormDescription className="text-[11px]">
                          {dictionary.transactions.hints.category}
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                ) : (
                  <FormField
                    control={form.control}
                    name="toWalletId"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel className="font-medium text-sm">{dictionary.transactions.to_account}</FormLabel>
                        <FormControl>
                          <SelectAccount
                            value={field.value ?? undefined}
                            onChange={(id) => form.setValue("toWalletId", id)}
                            placeholder={dictionary.transactions.placeholders.destination}
                          />
                        </FormControl>
                        <FormDescription className="text-[11px]">
                          {dictionary.transactions.hints.to_account}
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                <FormField
                  control={form.control}
                  name="assignedUserId"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel className="font-medium text-sm">{dictionary.transactions.assign}</FormLabel>
                      <FormControl>
                        <SelectUser
                          value={field.value ?? undefined}
                          onChange={(id) => form.setValue("assignedUserId", id)}
                          placeholder={dictionary.transactions.placeholders.member}
                        />
                      </FormControl>
                      <FormDescription className="text-[11px]">{dictionary.transactions.hints.assign}</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel className="font-medium text-sm">{dictionary.transactions.notes_label}</FormLabel>
                    <FormControl>
                      <div className="mb-4 min-h-[120px] border bg-transparent px-3 py-2 text-sm transition-colors focus-within:border-foreground focus-within:ring-0">
                        <Editor
                          initialContent={field.value || ""}
                          placeholder={dictionary.transactions.placeholders.notes}
                          onUpdate={(editor) => field.onChange(editor.getHTML())}
                          onBlur={field.onBlur}
                        />
                      </div>
                    </FormControl>
                    <FormDescription className="text-[11px]">{dictionary.transactions.hints.notes}</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="mb-10 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-muted-foreground text-xs uppercase tracking-wider">
                    {dictionary.transactions.attachments}
                  </span>
                </div>

                {attachments.length > 0 && (
                  <div className="grid grid-cols-1 gap-2">
                    {attachments.map((file) => (
                      <div
                        key={file.id}
                        className="group flex items-center gap-3 rounded-md border border-muted/20 bg-muted/5 px-3 py-2.5 text-sm transition-colors hover:bg-muted/10"
                      >
                        <FileIcon type={file.type} />
                        <span className="flex-1 truncate">{file.name}</span>
                        {file.size > 0 && (
                          <span className="hidden shrink-0 text-muted-foreground text-xs sm:inline-block">
                            {formatBytes(file.size)}
                          </span>
                        )}
                        <button
                          type="button"
                          onClick={() => removeAttachment(file.id)}
                          className="shrink-0 p-1 text-muted-foreground transition-colors hover:text-destructive"
                          aria-label={`Remove ${file.name}`}
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <button
                  type="button"
                  className="group relative mt-2 flex aspect-3/1 cursor-pointer flex-col items-center justify-center gap-3 overflow-hidden border-2 border-dashed bg-muted/5 transition-all hover:border-border/60 hover:bg-muted/10 sm:aspect-[4/1]"
                  onDragOver={(e) => {
                    e.preventDefault();
                    e.currentTarget.classList.add("bg-muted/20", "border-primary/50");
                  }}
                  onDragLeave={(e) => {
                    e.preventDefault();
                    e.currentTarget.classList.remove("bg-muted/20", "border-primary/50");
                  }}
                  onDrop={(e) => {
                    e.preventDefault();
                    e.currentTarget.classList.remove("bg-muted/20", "border-primary/50");
                    if (e.dataTransfer.files) handleUploadFiles(e.dataTransfer.files);
                  }}
                  onClick={() => setVaultPickerOpen(true)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      setVaultPickerOpen(true);
                    }
                  }}
                >
                  <div className="rounded-full border border-border/20 bg-background p-2 shadow-sm transition-transform group-hover:scale-110">
                    <Paperclip className="h-4 w-4 text-muted-foreground transition-colors group-hover:text-primary" />
                  </div>
                  <p className="px-4 text-center text-[11px] text-muted-foreground leading-relaxed sm:px-8">
                    <span className="font-medium text-foreground">{dictionary.transactions.click_to_browse}</span>{" "}
                    {dictionary.transactions.drag_drop}
                    <br />
                    <span className="text-[10px] opacity-60">{dictionary.transactions.upload_hint}</span>
                  </p>

                  {uploadMutation.isPending && (
                    <div className="absolute inset-0 flex items-center justify-center bg-background/50 backdrop-blur-sm">
                      <span className="animate-pulse font-medium text-xs">{dictionary.transactions.saving}</span>
                    </div>
                  )}
                </button>
              </div>
            </form>

            <VaultPickerModal
              open={vaultPickerOpen}
              onOpenChange={setVaultPickerOpen}
              selectedIds={attachments.map((a) => a.id)}
              onConfirm={handleVaultConfirm}
            />
          </Form>
        </div>

        <div className="mt-auto shrink-0 border-t bg-background p-6">
          <Button form="transaction-form" type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? dictionary.transactions.saving : dictionary.transactions.save_transaction}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
