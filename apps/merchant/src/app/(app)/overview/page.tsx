import { db } from "@buyease/db";
import { cookies } from "next/headers";
import { OverviewClientBridge } from "./overview-client-bridge";

async function getHomeData(shop: string) {
  const now = new Date();
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const firstOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const [
    ordersLast7,
    revenueResult7,
    deliveredLast7,
    ordersThisMonth,
    totalOrdersAll,
    merchant,
  ] = await Promise.all([
    db.order.count({ where: { shopId: shop, createdAt: { gte: sevenDaysAgo } } }),
    db.order.aggregate({
      where: { shopId: shop, status: "DELIVERED", createdAt: { gte: sevenDaysAgo } },
      _sum: { codAmount: true },
    }),
    db.order.count({
      where: { shopId: shop, status: "DELIVERED", createdAt: { gte: sevenDaysAgo } },
    }),
    db.order.count({ where: { shopId: shop, createdAt: { gte: firstOfMonth } } }),
    db.order.count({ where: { shopId: shop } }),
    db.merchant.findUnique({
      where: { shop },
      select: {
        installedAt: true,
        plan: { select: { name: true, limits: true } },
      },
    }),
  ]);

  const conversionRate =
    ordersLast7 > 0 ? ((deliveredLast7 / ordersLast7) * 100).toFixed(1) : "0.0";

  const limits = merchant?.plan?.limits as Record<string, unknown> | null;
  const rawLimit = limits?.orderLimit;
  const planOrderLimit =
    rawLimit === -1
      ? -1
      : typeof rawLimit === "number" && Number.isFinite(rawLimit) && rawLimit > 0
        ? rawLimit
        : 60;

  return {
    ordersLast7Days: ordersLast7,
    revenueLast7Days: Number(revenueResult7._sum.codAmount ?? 0),
    conversionRateLast7Days: conversionRate,
    ordersThisMonth,
    totalOrders: totalOrdersAll,
    planName: merchant?.plan?.name ?? "Free",
    planOrderLimit,
  };
}

export default async function OverviewPage(): Promise<React.JSX.Element> {
  const cookieStore = await cookies();
  const shopCookie = cookieStore.get("shopify_shop")?.value?.trim().toLowerCase();
  const sessionId = cookieStore.get("shopify_session")?.value;
  const session = sessionId
    ? await db.session.findUnique({ where: { id: sessionId }, select: { shop: true } })
    : null;
  const shop = (shopCookie || session?.shop || "").trim().toLowerCase();

  if (shop) {
    await db.merchant.upsert({
      where: { shop },
      update: { isActive: true, uninstalledAt: null },
      create: { shop, isActive: true },
    });
  }

  const data = await getHomeData(shop);

  return <OverviewClientBridge shop={shop} {...data} />;
}
