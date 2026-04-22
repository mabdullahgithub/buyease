import type { ElementType } from "react";
import Link from "next/link";
import { db } from "@buyease/db";
import { formatCurrency } from "@buyease/utils";
import {
  Activity,
  BarChart3,
  CreditCard,
  DollarSign,
  LayoutDashboard,
  LineChart,
  ScrollText,
  Settings,
  ShoppingBag,
  TrendingUp,
  Users,
} from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

async function getOverviewStats() {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const [
    totalMerchants,
    activeMerchants,
    totalOrders,
    revenueResult,
    newMerchantsThisMonth,
  ] = await Promise.all([
    db.merchant.count(),
    db.merchant.count({ where: { isActive: true } }),
    db.order.count(),
    db.order.aggregate({
      where: { status: "DELIVERED" },
      _sum: { codAmount: true },
    }),
    db.merchant.count({
      where: { installedAt: { gte: thirtyDaysAgo } },
    }),
  ]);

  return {
    totalMerchants,
    activeMerchants,
    totalOrders,
    totalRevenue: Number(revenueResult._sum.codAmount ?? 0),
    newMerchantsThisMonth,
  };
}

const QUICK_ACTIONS: { href: string; label: string; icon: ElementType }[] = [
  { href: "/merchants", label: "Merchants", icon: Users },
  { href: "/plans",     label: "Plans",     icon: CreditCard },
  { href: "/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/logs",      label: "Logs",      icon: ScrollText },
  { href: "/settings/system",  label: "System",  icon: Settings },
  { href: "/recent-activities", label: "Activity", icon: Activity },
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
];

export default async function AdminDashboardPage() {
  const {
    totalMerchants,
    activeMerchants,
    totalOrders,
    totalRevenue,
    newMerchantsThisMonth,
  } = await getOverviewStats();

  const stats = [
    {
      title: "Total Merchants",
      value: totalMerchants.toLocaleString(),
      description: `${activeMerchants} active`,
      icon: Users,
    },
    {
      title: "Total Orders",
      value: totalOrders.toLocaleString(),
      description: "All time",
      icon: ShoppingBag,
    },
    {
      title: "COD Revenue",
      value: formatCurrency(totalRevenue, "USD"),
      description: "Delivered orders",
      icon: DollarSign,
    },
    {
      title: "New This Month",
      value: newMerchantsThisMonth.toLocaleString(),
      description: "Merchant installs",
      icon: TrendingUp,
    },
  ];

  return (
    <div className="flex flex-col gap-8">

      {/* ── Stat cards ── */}
      <section className="space-y-3">
        <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
          Overview
        </p>
        <div className="flex gap-3 overflow-x-auto px-1 py-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {stats.map(({ title, value, description, icon: Icon }) => (
            /*
              bg-card = #1c1c1c in dark — same surface as sidebar/navbar.
              border-border for the single thin line.
              No shadow, no ring — pure flat Supabase style.
            */
            <Card
              key={title}
              className="min-w-[180px] shrink-0 flex-1 rounded-lg border border-border bg-card shadow-none ring-0"
            >
              <CardHeader className="pb-1.5 pt-3">
                <div className="flex items-start justify-between gap-3">
                  <CardTitle className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                    {title}
                  </CardTitle>
                  <div className="rounded-md border border-border bg-muted/40 p-1">
                    <Icon className="size-3 shrink-0 text-muted-foreground" />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pb-3">
                <p className="text-xl font-semibold leading-none tracking-tight text-foreground">
                  {value}
                </p>
                <CardDescription className="mt-1 text-[11px]">
                  {description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* ── Quick actions ── */}
      <section className="space-y-3">
        <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
          Quick actions
        </p>
        <div className="grid grid-cols-7 gap-2">
          {QUICK_ACTIONS.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                buttonVariants({ variant: "outline", size: "default" }),
                "h-auto min-w-0 flex-col gap-1.5 rounded-lg border-border bg-card px-2 py-2 text-muted-foreground shadow-none",
                "hover:bg-accent hover:text-foreground",
              )}
            >
              <Icon className="size-3.5 opacity-60" />
              <span className="truncate text-[10px] font-normal">{label}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* ── Revenue chart placeholder ── */}
      <section className="space-y-3">
        <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
          Revenue
        </p>
        <Card className="rounded-lg border border-border bg-card shadow-none ring-0">
          <CardHeader className="flex flex-row items-start justify-between gap-4 space-y-0 pb-3">
            <div className="space-y-1">
              <CardTitle className="text-[14px] font-medium text-foreground">
                Revenue trend
              </CardTitle>
              <CardDescription className="text-[12px]">
                Daily totals for delivered COD orders will appear here.
              </CardDescription>
            </div>
            <LineChart className="size-4 shrink-0 text-muted-foreground/50" />
          </CardHeader>
          <CardContent>
            <div className="flex min-h-[200px] flex-col items-center justify-center rounded-md border border-dashed border-border text-[12px] text-muted-foreground">
              Chart wiring coming soon
            </div>
          </CardContent>
        </Card>
      </section>

    </div>
  );
}
