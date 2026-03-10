"use client";

import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod/v3";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Input,
  Button,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Textarea,
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@workspace/ui";
import { Plus, Trash2 } from "lucide-react";
import type { Invoice } from "@workspace/types";
import type { CreateInvoiceData } from "@workspace/modules/client";

const lineItemSchema = z.object({
  name: z.string().min(1, "Name is required"),
  quantity: z.number().min(0, "Must be >= 0"),
  price: z.number(),
});

const formSchema = z.object({
  customerId: z.string().min(1, "Please select a customer"),
  invoiceNumber: z.string().min(1, "Invoice number is required"),
  currency: z.string().min(3).max(3),
  issueDate: z.string().optional(),
  dueDate: z.string().optional(),
  amount: z.number().min(0),
  vat: z.number().min(0).optional(),
  tax: z.number().min(0).optional(),
  internalNote: z.string().optional(),
  noteDetails: z.string().optional(),
  lineItems: z.array(lineItemSchema),
});

type FormValues = z.infer<typeof formSchema>;

interface InvoiceFormSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  invoice?: Invoice | null;
  customers?: Array<{ id: string; name: string }>;
  onSuccess?: () => void;
  onSubmit: (data: CreateInvoiceData) => Promise<boolean>;
}

export function InvoiceFormSheet({
  open,
  onOpenChange,
  invoice,
  customers = [],
  onSuccess,
  onSubmit,
}: InvoiceFormSheetProps) {
  const [loading, setLoading] = useState(false);
  const isEditing = !!invoice;

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      customerId: invoice?.customerId ?? "",
      invoiceNumber: invoice?.invoiceNumber ?? "",
      currency: invoice?.currency ?? "USD",
      issueDate: invoice?.issueDate?.slice(0, 10) ?? "",
      dueDate: invoice?.dueDate?.slice(0, 10) ?? "",
      amount: Number(invoice?.amount ?? 0),
      vat: Number(invoice?.vat ?? 0),
      tax: Number(invoice?.tax ?? 0),
      internalNote: invoice?.internalNote ?? "",
      noteDetails: invoice?.noteDetails ?? "",
      lineItems: (invoice?.lineItems as any[]) ?? [
        { name: "", quantity: 1, price: 0 },
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "lineItems",
  });

  useEffect(() => {
    if (invoice) {
      form.reset({
        customerId: invoice.customerId ?? "",
        invoiceNumber: invoice.invoiceNumber ?? "",
        currency: invoice.currency ?? "USD",
        issueDate: invoice.issueDate?.slice(0, 10) ?? "",
        dueDate: invoice.dueDate?.slice(0, 10) ?? "",
        amount: Number(invoice.amount ?? 0),
        vat: Number(invoice.vat ?? 0),
        tax: Number(invoice.tax ?? 0),
        internalNote: invoice.internalNote ?? "",
        noteDetails: invoice.noteDetails ?? "",
        lineItems: (invoice.lineItems as any[]) ?? [
          { name: "", quantity: 1, price: 0 },
        ],
      });
    } else {
      form.reset({
        customerId: "",
        invoiceNumber: "",
        currency: "USD",
        issueDate: "",
        dueDate: "",
        amount: 0,
        vat: 0,
        tax: 0,
        internalNote: "",
        noteDetails: "",
        lineItems: [{ name: "", quantity: 1, price: 0 }],
      });
    }
  }, [invoice, form]);

  const handleSubmit = async (values: FormValues) => {
    setLoading(true);
    try {
      const success = await onSubmit(values as CreateInvoiceData);
      if (success) {
        toast.success(isEditing ? "Invoice updated" : "Invoice created");
        onSuccess?.();
        onOpenChange(false);
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-[520px] overflow-y-auto p-0">
        <SheetHeader className="p-6 pb-0">
          <SheetTitle>{isEditing ? "Edit Invoice" : "New Invoice"}</SheetTitle>
        </SheetHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="flex flex-col h-full"
          >
            <div className="flex-1 overflow-y-auto p-6">
              <Accordion
                type="multiple"
                defaultValue={["general", "items", "details"]}
                className="space-y-4"
              >
                {/* General */}
                <AccordionItem value="general" className="border-none">
                  <AccordionTrigger className="text-sm font-medium py-2">
                    General
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-4 pt-2">
                      <FormField
                        control={form.control}
                        name="customerId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs text-muted-foreground font-normal">
                              Customer
                            </FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              value={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select customer" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {customers.map((c) => (
                                  <SelectItem key={c.id} value={c.id}>
                                    {c.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="invoiceNumber"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs text-muted-foreground font-normal">
                              Invoice Number
                            </FormLabel>
                            <FormControl>
                              <Input placeholder="INV-001" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="grid grid-cols-2 gap-3">
                        <FormField
                          control={form.control}
                          name="issueDate"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-xs text-muted-foreground font-normal">
                                Issue Date
                              </FormLabel>
                              <FormControl>
                                <Input type="date" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="dueDate"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-xs text-muted-foreground font-normal">
                                Due Date
                              </FormLabel>
                              <FormControl>
                                <Input type="date" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <FormField
                          control={form.control}
                          name="currency"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-xs text-muted-foreground font-normal">
                                Currency
                              </FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="USD"
                                  maxLength={3}
                                  {...field}
                                  className="uppercase"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="amount"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-xs text-muted-foreground font-normal">
                                Total Amount
                              </FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  step="0.01"
                                  {...field}
                                  onChange={(e) =>
                                    field.onChange(
                                      parseFloat(e.target.value) || 0,
                                    )
                                  }
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>

                {/* Line Items */}
                <AccordionItem value="items" className="border-none">
                  <AccordionTrigger className="text-sm font-medium py-2">
                    Line Items
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-3 pt-2">
                      {fields.map((field, index) => (
                        <div key={field.id} className="flex gap-2 items-start">
                          <div className="flex-1 grid grid-cols-3 gap-2">
                            <FormField
                              control={form.control}
                              name={`lineItems.${index}.name`}
                              render={({ field }) => (
                                <FormItem className="col-span-3 sm:col-span-1">
                                  <FormControl>
                                    <Input placeholder="Item name" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={form.control}
                              name={`lineItems.${index}.quantity`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormControl>
                                    <Input
                                      type="number"
                                      placeholder="Qty"
                                      {...field}
                                      onChange={(e) =>
                                        field.onChange(
                                          parseFloat(e.target.value) || 0,
                                        )
                                      }
                                    />
                                  </FormControl>
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={form.control}
                              name={`lineItems.${index}.price`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormControl>
                                    <Input
                                      type="number"
                                      step="0.01"
                                      placeholder="Price"
                                      {...field}
                                      onChange={(e) =>
                                        field.onChange(
                                          parseFloat(e.target.value) || 0,
                                        )
                                      }
                                    />
                                  </FormControl>
                                </FormItem>
                              )}
                            />
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 mt-1 shrink-0"
                            onClick={() => remove(index)}
                            disabled={fields.length <= 1}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      ))}
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="w-full gap-1"
                        onClick={() =>
                          append({ name: "", quantity: 1, price: 0 })
                        }
                      >
                        <Plus className="h-4 w-4" /> Add Item
                      </Button>
                    </div>
                  </AccordionContent>
                </AccordionItem>

                {/* Details */}
                <AccordionItem value="details" className="border-none">
                  <AccordionTrigger className="text-sm font-medium py-2">
                    Details
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-4 pt-2">
                      <div className="grid grid-cols-2 gap-3">
                        <FormField
                          control={form.control}
                          name="vat"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-xs text-muted-foreground font-normal">
                                VAT
                              </FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  step="0.01"
                                  {...field}
                                  onChange={(e) =>
                                    field.onChange(
                                      parseFloat(e.target.value) || 0,
                                    )
                                  }
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="tax"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-xs text-muted-foreground font-normal">
                                Tax
                              </FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  step="0.01"
                                  {...field}
                                  onChange={(e) =>
                                    field.onChange(
                                      parseFloat(e.target.value) || 0,
                                    )
                                  }
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={form.control}
                        name="noteDetails"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs text-muted-foreground font-normal">
                              Note (Customer-facing)
                            </FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="Thank you for your business."
                                className="min-h-[80px] resize-none"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="internalNote"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs text-muted-foreground font-normal">
                              Internal Note
                            </FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="Internal notes..."
                                className="min-h-[80px] resize-none"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>

            <div className="border-t px-6 py-4 flex justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading
                  ? isEditing
                    ? "Saving..."
                    : "Creating..."
                  : isEditing
                    ? "Save"
                    : "Create"}
              </Button>
            </div>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
}
