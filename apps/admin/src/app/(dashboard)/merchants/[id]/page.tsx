import { notFound } from "next/navigation";
import { db } from "@buyease/db";
import { formatDate, formatCurrency } from "@buyease/utils";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  Badge,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@buyease/ui";

type Params = Promise<{ id: string }>;

async function getMerchantDetail(id: string) {
  const merchant = await db.merchant.findUnique({
    where: { id },
    include: {
      plan: true,
      orders: {
        orderBy: { createdAt: "desc" },
        take: 20,
        select: {
          id: true,
          orderId: true,
          codAmount: true,
          status: true,
          createdAt: true,
        },
      },
    },
  });

  if (!merchant) return null;

  const revenueResult = await db.order.aggregate({
    where: { shopId: merchant.shop, status: "DELIVERED" },
    _sum: { codAmount: true },
  });

  return {
    merchant,
    totalRevenue: Number(revenueResult._sum.codAmount ?? 0),
  };
}

export default async function MerchantDetailPage({
  params,
}: {
  params: Params;
}) {
  const { id } = await params;
  const result = await getMerchantDetail(id);

  if (!result) notFound();

  const { merchant, totalRevenue } = result;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight font-mono">
            {merchant.shop}
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Installed {formatDate(merchant.installedAt)}
          </p>
        </div>
        <Badge variant={merchant.isActive ? "default" : "secondary"}>
          {merchant.isActive ? "Active" : "Inactive"}
        </Badge>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Plan
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xl font-bold">
              {merchant.plan?.name ?? "Free"}
            </p>
            <CardDescription>
              {merchant.plan?.price
                ? formatCurrency(Number(merchant.plan.price), "USD") + "/mo"
                : "No charge"}
            </CardDescription>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Orders
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xl font-bold">
              {merchant.orders.length}
            </p>
            <CardDescription>Last 20 shown</CardDescription>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              COD Revenue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xl font-bold">
              {formatCurrency(totalRevenue, "USD")}
            </p>
            <CardDescription>Delivered orders</CardDescription>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Orders</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order ID</TableHead>
                <TableHead>COD Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {merchant.orders.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={4}
                    className="text-center py-8 text-muted-foreground"
                  >
                    No orders yet.
                  </TableCell>
                </TableRow>
              ) : (
                merchant.orders.map((order: typeof merchant.orders[number]) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-mono text-xs">
                      {order.orderId}
                    </TableCell>
                    <TableCell>
                      {formatCurrency(Number(order.codAmount), "USD")}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          order.status === "DELIVERED"
                            ? "success"
                            : order.status === "CANCELLED"
                            ? "destructive"
                            : "outline"
                        }
                      >
                        {order.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-xs">
                      {formatDate(order.createdAt)}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
