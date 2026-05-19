import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/db";
import { withGuards } from "@/lib/middleware-stack";
import { PLANS, normalizePlanKey } from "@/lib/billing";

export type AnalyticsSummaryResponse = {
  totalOrders: number;
  totalOrderValue: number;
  ordersThisCycle: number;
  cycleOrderLimit: number | null;
  confirmedRate: number;
  statusBreakdown: {
    PENDING: number;
    CONFIRMED: number;
    SHIPPED: number;
    DELIVERED: number;
    CANCELLED: number;
    REFUNDED: number;
  };
  recentOrderTrend: { date: string; count: number }[];
};

export const GET = withGuards({ skipPlanGate: true }, async (_req: NextRequest, ctx) => {
  const shop = ctx.shop;
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  const [merchant, orderAgg, statusGroups, recentRaw] = await Promise.all([
    prisma.merchant.findUnique({
      where: { shop },
      select: {
        ordersThisCycle: true,
        plan: { select: { name: true } },
      },
    }),
    prisma.order.aggregate({
      where: { shopId: shop },
      _count: { id: true },
      _sum: { codAmount: true },
    }),
    prisma.order.groupBy({
      by: ["status"],
      where: { shopId: shop },
      _count: { id: true },
    }),
    prisma.order.findMany({
      where: { shopId: shop, createdAt: { gte: thirtyDaysAgo } },
      select: { createdAt: true },
    }),
  ]);

  const totalOrders = orderAgg._count.id;
  const totalOrderValue = Number(orderAgg._sum.codAmount ?? 0);

  const statusBreakdown = {
    PENDING: 0,
    CONFIRMED: 0,
    SHIPPED: 0,
    DELIVERED: 0,
    CANCELLED: 0,
    REFUNDED: 0,
  };
  for (const group of statusGroups) {
    const key = group.status as keyof typeof statusBreakdown;
    if (key in statusBreakdown) {
      statusBreakdown[key] = group._count.id;
    }
  }

  const positiveCount =
    statusBreakdown.CONFIRMED + statusBreakdown.SHIPPED + statusBreakdown.DELIVERED;
  const confirmedRate =
    totalOrders > 0 ? Math.round((positiveCount / totalOrders) * 100) : 0;

  // Build last-30-days trend with all days filled (zeros for empty days)
  const countByDate: Record<string, number> = {};
  for (const order of recentRaw) {
    const date = order.createdAt.toISOString().split("T")[0]!;
    countByDate[date] = (countByDate[date] ?? 0) + 1;
  }

  const recentOrderTrend: { date: string; count: number }[] = [];
  for (let i = 29; i >= 0; i--) {
    const d = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
    const date = d.toISOString().split("T")[0]!;
    recentOrderTrend.push({ date, count: countByDate[date] ?? 0 });
  }

  const planKey = normalizePlanKey(merchant?.plan?.name ?? "free");
  const planDef = PLANS[planKey];
  const ordersThisCycle = merchant?.ordersThisCycle ?? 0;
  const cycleOrderLimit = Number.isFinite(planDef.orderLimit) ? planDef.orderLimit : null;

  return NextResponse.json(
    {
      totalOrders,
      totalOrderValue,
      ordersThisCycle,
      cycleOrderLimit,
      confirmedRate,
      statusBreakdown,
      recentOrderTrend,
    } satisfies AnalyticsSummaryResponse,
    { headers: { "Cache-Control": "private, max-age=60" } },
  );
});
