import { db } from "@buyease/db";
import Link from "next/link";
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

export const dynamic = "force-dynamic";

const PAGE_SIZE = 20;

type SearchParams = Promise<{
  cursor?: string;
  direction?: "next" | "prev";
}>;

async function getPlans({
  cursor,
  direction,
}: {
  cursor?: string;
  direction: "next" | "prev";
}) {
  const isPrev = direction === "prev" && Boolean(cursor);
  const rows = await db.plan.findMany({
    orderBy: { id: isPrev ? "asc" : "desc" },
    take: PAGE_SIZE + 1,
    ...(cursor
      ? {
          cursor: { id: cursor },
          skip: 1,
        }
      : {}),
    include: { _count: { select: { merchants: true } } },
  });

  const hasExtraRow = rows.length > PAGE_SIZE;
  const slicedRows = hasExtraRow ? rows.slice(0, PAGE_SIZE) : rows;
  const plans = isPrev ? slicedRows.reverse() : slicedRows;

  return {
    plans,
    hasNextPage: isPrev ? Boolean(cursor) : hasExtraRow,
    hasPrevPage: isPrev ? hasExtraRow : Boolean(cursor),
    startCursor: plans[0]?.id ?? null,
    endCursor: plans[plans.length - 1]?.id ?? null,
  };
}

export default async function PlansPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const cursor = params.cursor;
  const direction = params.direction === "prev" ? "prev" : "next";
  const { plans, hasNextPage, hasPrevPage, startCursor, endCursor } = await getPlans({
    cursor,
    direction,
  });

  const createHref = (nextCursor: string | null, nextDirection: "next" | "prev") => {
    if (!nextCursor) return "/plans";
    const nextParams = new URLSearchParams();
    nextParams.set("cursor", nextCursor);
    nextParams.set("direction", nextDirection);
    return `/plans?${nextParams.toString()}`;
  };

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

      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground">Showing {plans.length} plans per page</p>
        <div className="flex items-center gap-2">
          {hasPrevPage ? (
            <Link
              href={createHref(startCursor, "prev")}
              className="text-xs text-primary hover:underline"
            >
              Previous
            </Link>
          ) : (
            <span className="text-xs text-muted-foreground">Previous</span>
          )}
          {hasNextPage ? (
            <Link
              href={createHref(endCursor, "next")}
              className="text-xs text-primary hover:underline"
            >
              Next
            </Link>
          ) : (
            <span className="text-xs text-muted-foreground">Next</span>
          )}
        </div>
      </div>
    </div>
  );
}
