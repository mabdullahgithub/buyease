import { db } from "@buyease/db";
import { cookies } from "next/headers";
import { OrdersList } from "./orders-client";

const PAGE_SIZE = 25;

type SearchParams = Promise<{ page?: string }>;

async function getOrders(shop: string, page: number) {
  const skip = (page - 1) * PAGE_SIZE;

  const [orders, total] = await Promise.all([
    db.order.findMany({
      where: { shopId: shop },
      orderBy: { createdAt: "desc" },
      skip,
      take: PAGE_SIZE,
      select: {
        id: true,
        orderId: true,
        codAmount: true,
        status: true,
        customerName: true,
        createdAt: true,
      },
    }),
    db.order.count({ where: { shopId: shop } }),
  ]);

  return { orders, total };
}

export default async function OrdersPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const page = Math.max(1, parseInt(params.page ?? "1", 10));

  const cookieStore = await cookies();
  const shop = cookieStore.get("shopify_shop")?.value ?? "demo.myshopify.com";

  const { orders, total } = await getOrders(shop, page);
  const totalPages = Math.ceil(total / PAGE_SIZE);

  return <OrdersList orders={orders} total={total} page={page} totalPages={totalPages} />;
}
