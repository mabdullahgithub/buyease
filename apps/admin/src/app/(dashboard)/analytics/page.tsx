import { db } from "@buyease/db";
import { formatCurrency, formatDate } from "@buyease/utils";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@buyease/ui";
import { TrendingUp, Users, ShoppingBag, DollarSign } from "lucide-react";

async function getAnalyticsData() {
  const now = new Date();
  const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);

  const [
    mrrResult,
    totalMerchants,
    newMerchantsThisMonth,
    newMerchantsLastMonth,
    ordersByStatus,
    recentMerchants,
  ] = await Promise.all([
    db.plan.findMany({
      where: { isActive: true },
      select: {
        price: true,
        _count: {
          select: { merchants: { where: { isActive: true } } },
        },
      },
    }),
    db.merchant.count({ where: { isActive: true } }),
    db.merchant.count({ where: { installedAt: { gte: thisMonthStart } } }),
    db.merchant.count({
      where: {
        installedAt: { gte: lastMonthStart, lt: thisMonthStart },
      },
    }),
    db.order.groupBy({ by: ["status"], _count: { _all: true } }),
    db.merchant.findMany({
      where: { isActive: true },
      orderBy: { installedAt: "desc" },
      take: 10,
      select: { shop: true, installedAt: true, plan: { select: { name: true } } },
    }),
  ]);

  const mrr = mrrResult.reduce(
    (sum: number, plan) => sum + Number(plan.price) * plan._count.merchants,
    0
  );

  const churnRate =
    newMerchantsLastMonth > 0
      ? (
          ((newMerchantsLastMonth - newMerchantsThisMonth) /
            newMerchantsLastMonth) *
          100
        ).toFixed(1)
      : "0.0";

  return {
    mrr,
    totalMerchants,
    newMerchantsThisMonth,
    churnRate,
    ordersByStatus,
    recentMerchants,
  };
}

export default async function AnalyticsPage() {
  const {
    mrr,
    totalMerchants,
    newMerchantsThisMonth,
    churnRate,
    ordersByStatus,
    recentMerchants,
  } = await getAnalyticsData();

  const metrics = [
    {
      title: "MRR",
      value: formatCurrency(mrr, "USD"),
      description: "Monthly Recurring Revenue",
      icon: DollarSign,
    },
    {
      title: "Active Merchants",
      value: totalMerchants.toLocaleString(),
      description: "Currently installed",
      icon: Users,
    },
    {
      title: "New This Month",
      value: newMerchantsThisMonth.toLocaleString(),
      description: "New installs",
      icon: TrendingUp,
    },
    {
      title: "Churn Estimate",
      value: `${churnRate}%`,
      description: "vs last month",
      icon: ShoppingBag,
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Analytics</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Platform-wide revenue and growth metrics
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map(({ title, value, description, icon: Icon }) => (
          <Card key={title}>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {title}
                </CardTitle>
                <Icon className="size-4 text-muted-foreground" />
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{value}</p>
              <CardDescription className="mt-0.5">{description}</CardDescription>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Orders by Status</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Status</TableHead>
                  <TableHead>Count</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {ordersByStatus.map((row) => (
                  <TableRow key={row.status}>
                    <TableCell className="font-medium capitalize">
                      {row.status.toLowerCase()}
                    </TableCell>
                    <TableCell>{row._count._all.toLocaleString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Installs</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Shop</TableHead>
                  <TableHead>Plan</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentMerchants.map((m) => (
                  <TableRow key={m.shop}>
                    <TableCell className="font-mono text-xs">{m.shop}</TableCell>
                    <TableCell>{m.plan?.name ?? "Free"}</TableCell>
                    <TableCell className="text-muted-foreground text-xs">
                      {formatDate(m.installedAt)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
