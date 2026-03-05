import { getAdminOrders } from "@workspace/modules/orders/orders.action";
import { OrdersClient } from "@/components/orders/orders-client";
import { OrdersDetailSheet } from "@/components/orders/orders-detail-sheet";

export default async function OrdersPage(props: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const searchParams = await props.searchParams;

  const page = searchParams?.page ? parseInt(searchParams.page as string) : 1;
  const limit = searchParams?.limit
    ? parseInt(searchParams.limit as string)
    : 10;
  // Make sure we pass the search param to getAdminOrders if needed in backend,
  // but for UI layout let's mount the filter here:
  const search = (searchParams?.search as string) || undefined;
  const status = (searchParams?.status as string) || undefined;
  const start = (searchParams?.start as string) || undefined;
  const end = (searchParams?.end as string) || undefined;

  const response = await getAdminOrders({
    page,
    limit,
    search,
    status,
    start,
    end,
  });
  const orders = response?.data?.orders ?? [];
  const meta = response?.data?.meta ?? {
    total: 0,
    total_pages: 1,
    page: 1,
    limit: 10,
  };

  return (
    <>
      <OrdersClient
        initialData={orders}
        rowCount={meta.total}
        pageCount={meta.total_pages}
        initialPage={meta.page - 1}
        pageSize={meta.limit}
      />

      <OrdersDetailSheet />
    </>
  );
}
