import { t, type UnwrapSchema } from "elysia";

export const InvoiceLineItemDto = t.Object({
  name: t.String({ minLength: 1 }),
  quantity: t.Number({ minimum: 0 }),
  price: t.Number(),
});

export const CreateInvoiceDto = t.Object({
  customerId: t.String({ format: "uuid" }),
  invoiceNumber: t.String({ minLength: 1 }),
  issueDate: t.Optional(t.String()),
  dueDate: t.Optional(t.String()),
  amount: t.Number({ minimum: 0 }),
  vat: t.Optional(t.Number({ minimum: 0 })),
  tax: t.Optional(t.Number({ minimum: 0 })),
  currency: t.String({ minLength: 3, maxLength: 3 }),
  status: t.Optional(t.String({ default: "draft" })),
  internalNote: t.Optional(t.String()),
  noteDetails: t.Optional(t.String()),
  paymentDetails: t.Optional(t.String()),
  logoUrl: t.Optional(t.String()),
  lineItems: t.Array(InvoiceLineItemDto),
  invoiceSize: t.Optional(t.String({ default: "A4" })),
  dateFormat: t.Optional(t.String({ default: "DD/MM/YYYY" })),
  paymentTerms: t.Optional(t.String({ default: "Due on Receipt" })),
  templateName: t.Optional(t.String({ default: "Default" })),
  invoiceSettings: t.Optional(
    t.Object({
      salesTax: t.Boolean(),
      vat: t.Boolean(),
      lineItemTax: t.Boolean(),
      discount: t.Boolean(),
      decimals: t.Boolean(),
      units: t.Boolean(),
      qrCode: t.Boolean(),
    }),
  ),
});

export const UpdateInvoiceDto = t.Partial(CreateInvoiceDto);

export const InvoiceListQuery = t.Object({
  page: t.Optional(t.Numeric({ minimum: 1, default: 1 })),
  limit: t.Optional(t.Numeric({ minimum: 1, maximum: 100, default: 20 })),
  search: t.Optional(t.String()),
  status: t.Optional(t.String()),
});

export type CreateInvoiceInput = UnwrapSchema<typeof CreateInvoiceDto>;
export type UpdateInvoiceInput = UnwrapSchema<typeof UpdateInvoiceDto>;
