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
import { TablePagination } from "@/components/admin/table-pagination";

export const dynamic = "force-dynamic";

const DEFAULT_PAGE_SIZE = 25;
const PAGE_SIZE_OPTIONS = [10, 25, 50, 100] as const;

type SearchParams = Promise<{
  cursor?: string;
  direction?: "next" | "prev";
  pageSize?: string;
}>;

async function getPlans({
  cursor,
  direction,
  pageSize,
}: {
  cursor?: string;
  direction: "next" | "prev";
  pageSize: number;
}) {
  const isPrev = direction === "prev" && Boolean(cursor);
  const rows = await db.plan.findMany({
    orderBy: { id: isPrev ? "asc" : "desc" },
    take: pageSize + 1,
    ...(cursor
      ? {
          cursor: { id: cursor },
          skip: 1,
        }
      : {}),
    include: { _count: { select: { merchants: true } } },
  });

  const hasExtraRow = rows.length > pageSize;
  const slicedRows = hasExtraRow ? rows.slice(0, pageSize) : rows;
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
  const requestedPageSize = Number.parseInt(params.pageSize ?? `${DEFAULT_PAGE_SIZE}`, 10);
  const pageSize = PAGE_SIZE_OPTIONS.includes(requestedPageSize as (typeof PAGE_SIZE_OPTIONS)[number])
    ? requestedPageSize
    : DEFAULT_PAGE_SIZE;
  const { plans, hasNextPage, hasPrevPage, startCursor, endCursor } = await getPlans({
    cursor,
    direction,
    pageSize,
  });

  const createHref = (nextCursor: string | null, nextDirection: "next" | "prev") => {
    const nextParams = new URLSearchParams();
    nextParams.set("pageSize", String(pageSize));
    if (nextCursor) {
      nextParams.set("cursor", nextCursor);
      nextParams.set("direction", nextDirection);
    }
    const queryString = nextParams.toString();
    return queryString ? `/plans?${queryString}` : "/plans";
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

      <TablePagination
        rowsPerPage={pageSize}
        rowOptions={[...PAGE_SIZE_OPTIONS]}
        previousHref={hasPrevPage ? createHref(startCursor, "prev") : null}
        nextHref={hasNextPage ? createHref(endCursor, "next") : null}
      />
    </div>
  );
}
