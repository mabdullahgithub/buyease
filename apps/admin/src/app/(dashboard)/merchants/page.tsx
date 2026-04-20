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

type SearchParams = Promise<{ page?: string; q?: string }>;

async function getMerchants(page: number, query: string) {
  const skip = (page - 1) * PAGE_SIZE;
  const where = query
    ? { shop: { contains: query, mode: "insensitive" as const } }
    : {};

  const [merchants, total] = await Promise.all([
    db.merchant.findMany({
      where,
      orderBy: { installedAt: "desc" },
      skip,
      take: PAGE_SIZE,
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

  return { merchants, total };
}

export default async function MerchantsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const page = Math.max(1, parseInt(params.page ?? "1", 10));
  const query = params.q ?? "";

  const { merchants, total } = await getMerchants(page, query);

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
    </div>
  );
}
