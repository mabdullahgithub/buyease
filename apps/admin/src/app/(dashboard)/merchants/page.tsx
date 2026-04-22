import Link from "next/link";
import { db } from "@buyease/db";
import { formatDate } from "@buyease/utils";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Badge,
} from "@buyease/ui";

const PAGE_SIZE = 50;

export const dynamic = "force-dynamic";

type SearchParams = Promise<{
  q?: string;
  cursor?: string;
  direction?: "next" | "prev";
}>;

async function getMerchants({
  query,
  cursor,
  direction,
}: {
  query: string;
  cursor?: string;
  direction: "next" | "prev";
}) {
  const where = query
    ? { shop: { contains: query, mode: "insensitive" as const } }
    : {};

  const take = PAGE_SIZE + 1;
  const isPrev = direction === "prev" && Boolean(cursor);
  const orderBy = { id: isPrev ? ("asc" as const) : ("desc" as const) };

  const [rows, total] = await Promise.all([
    db.merchant.findMany({
      where,
      orderBy,
      take,
      ...(cursor
        ? {
            cursor: { id: cursor },
            skip: 1,
          }
        : {}),
      select: {
        id: true,
        shop: true,
        isActive: true,
        installedAt: true,
        plan: { select: { name: true } },
        _count: { select: { orders: true } },
      },
    }),
    db.merchant.count({ where }),
  ]);

  const hasExtraRow = rows.length > PAGE_SIZE;
  const slicedRows = hasExtraRow ? rows.slice(0, PAGE_SIZE) : rows;
  const merchants = isPrev ? slicedRows.reverse() : slicedRows;

  return {
    merchants,
    total,
    hasNextPage: isPrev ? Boolean(cursor) : hasExtraRow,
    hasPrevPage: isPrev ? hasExtraRow : Boolean(cursor),
    startCursor: merchants[0]?.id ?? null,
    endCursor: merchants[merchants.length - 1]?.id ?? null,
  };
}

export default async function MerchantsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const query = params.q ?? "";
  const cursor = params.cursor;
  const direction = params.direction === "prev" ? "prev" : "next";

  const { merchants, total, hasNextPage, hasPrevPage, startCursor, endCursor } =
    await getMerchants({ query, cursor, direction });

  const baseParams = new URLSearchParams();
  if (query) baseParams.set("q", query);

  const createHref = (nextCursor: string | null, nextDirection: "next" | "prev") => {
    const nextParams = new URLSearchParams(baseParams);
    if (nextCursor) {
      nextParams.set("cursor", nextCursor);
      nextParams.set("direction", nextDirection);
    }
    const queryString = nextParams.toString();
    return queryString ? `/merchants?${queryString}` : "/merchants";
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Merchants</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {total} total merchants
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Merchants</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Shop</TableHead>
                <TableHead>Plan</TableHead>
                <TableHead>Orders</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Installed</TableHead>
                <TableHead className="w-20" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {merchants.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="text-center py-12 text-muted-foreground"
                  >
                    No merchants found.
                  </TableCell>
                </TableRow>
              ) : (
                merchants.map((m: typeof merchants[number]) => (
                  <TableRow key={m.id}>
                    <TableCell className="font-medium font-mono text-xs">
                      {m.shop}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{m.plan?.name ?? "Free"}</Badge>
                    </TableCell>
                    <TableCell>{m._count.orders}</TableCell>
                    <TableCell>
                      <Badge variant={m.isActive ? "default" : "secondary"}>
                        {m.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-xs">
                      {formatDate(m.installedAt)}
                    </TableCell>
                    <TableCell>
                      <Link
                        href={`/merchants/${m.id}`}
                        className="text-xs text-primary hover:underline"
                      >
                        View
                      </Link>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground">
          Showing {merchants.length} merchants per page
        </p>
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
