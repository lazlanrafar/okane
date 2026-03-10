import { InvoicesClient } from "@/components/invoices/invoices-client";
import { getInvoices } from "@workspace/modules/server";
import { getCustomers } from "@workspace/modules/server";

export default async function InvoicesPage() {
  const [invoicesRes, customersRes] = await Promise.all([
    getInvoices({ limit: 50 }),
    getCustomers({ limit: 200 }),
  ]);

  const initialData = invoicesRes.success ? (invoicesRes as any).data : null;
  const customers = customersRes.success
    ? ((customersRes as any).data ?? []).map((c: any) => ({
        id: c.id,
        name: c.name,
      }))
    : [];

  return <InvoicesClient initialData={initialData} customers={customers} />;
}
