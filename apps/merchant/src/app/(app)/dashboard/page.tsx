import { db } from "@buyease/db";
import { cookies } from "next/headers";
import { DashboardClient } from "./dashboard-client";

async function getDashboardData(shop: string) {
  const [totalOrders, merchant] = await Promise.all([
    db.order.count({ where: { shopId: shop } }),
    db.merchant.findUnique({
      where: { shop },
      select: { installedAt: true, plan: { select: { name: true } } },
    }),
  ]);

  const revenueResult = await db.order.aggregate({
    where: { shopId: shop, status: "DELIVERED" },
    _sum: { codAmount: true },
  });

  return {
    totalOrders,
    totalRevenue: Number(revenueResult._sum.codAmount ?? 0),
    plan: merchant?.plan?.name ?? "Free",
    installedAt: merchant?.installedAt ?? new Date(),
  };
}

export default async function DashboardPage(): Promise<React.JSX.Element> {
  const cookieStore = await cookies();
  const shop = cookieStore.get("shopify_shop")?.value ?? "demo.myshopify.com";

  const { totalOrders, totalRevenue, plan } = await getDashboardData(shop);

  return (
    <DashboardClient
      shop={shop}
      totalOrders={totalOrders}
      totalRevenue={totalRevenue}
      plan={plan}
    />
  );
}
