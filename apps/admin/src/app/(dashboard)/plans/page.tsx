import { db } from "@buyease/db";
import { formatCurrency, formatDate } from "@buyease/utils";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Badge,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@buyease/ui";

async function getPlans() {
  return db.plan.findMany({
    orderBy: { price: "asc" },
    include: { _count: { select: { merchants: true } } },
  });
}

export default async function PlansPage() {
  const plans = await getPlans();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Plans</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Manage subscription tiers
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Pricing Plans</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Interval</TableHead>
                <TableHead>Merchants</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {plans.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="text-center py-12 text-muted-foreground"
                  >
                    No plans configured. Seed the database to get started.
                  </TableCell>
                </TableRow>
              ) : (
                plans.map((plan: typeof plans[number]) => (
                  <TableRow key={plan.id}>
                    <TableCell className="font-medium">{plan.name}</TableCell>
                    <TableCell>
                      {formatCurrency(Number(plan.price), "USD")}
                    </TableCell>
                    <TableCell className="capitalize lowercase">
                      {plan.interval.toLowerCase()}
                    </TableCell>
                    <TableCell>{plan._count.merchants}</TableCell>
                    <TableCell>
                      <Badge
                        variant={plan.isActive ? "success" : "secondary"}
                      >
                        {plan.isActive ? "Active" : "Archived"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-xs">
                      {formatDate(plan.createdAt)}
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
