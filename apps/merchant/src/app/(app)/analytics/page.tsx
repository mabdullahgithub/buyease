import { db } from "@buyease/db";
import { cookies } from "next/headers";
import { AnalyticsClient } from "./analytics-client";

async function getAnalytics(shop: string) {
  const [totalOrders, deliveredOrders, cancelledOrders, revenueResult] =
    await Promise.all([
      db.order.count({ where: { shopId: shop } }),
      db.order.count({ where: { shopId: shop, status: "DELIVERED" } }),
      db.order.count({ where: { shopId: shop, status: "CANCELLED" } }),
      db.order.aggregate({
        where: { shopId: shop, status: "DELIVERED" },
        _sum: { codAmount: true },
      }),
    ]);

  const conversionRate =
    totalOrders > 0
      ? ((deliveredOrders / totalOrders) * 100).toFixed(1)
      : "0.0";

  const cancelRate =
    totalOrders > 0
      ? ((cancelledOrders / totalOrders) * 100).toFixed(1)
      : "0.0";

  return {
    totalOrders,
    deliveredOrders,
    cancelledOrders,
    totalRevenue: Number(revenueResult._sum.codAmount ?? 0),
    conversionRate,
    cancelRate,
  };
}

export default async function AnalyticsPage() {
  const cookieStore = await cookies();
  const shop = cookieStore.get("shopify_shop")?.value ?? "demo.myshopify.com";

  const {
    totalOrders,
    deliveredOrders,
    cancelledOrders,
    totalRevenue,
    conversionRate,
    cancelRate,
  } = await getAnalytics(shop);

  return (
    <AnalyticsClient
      totalOrders={totalOrders}
      deliveredOrders={deliveredOrders}
      cancelledOrders={cancelledOrders}
      totalRevenue={totalRevenue}
      conversionRate={conversionRate}
      cancelRate={cancelRate}
    />
  );
}
