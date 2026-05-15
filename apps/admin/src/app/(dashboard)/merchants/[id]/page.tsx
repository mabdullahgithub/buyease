import { notFound } from "next/navigation";
import Link from "next/link";
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
import {
  ArrowLeft,
  ShoppingBag,
  DollarSign,
  MessageCircle,
  CreditCard,
  Calendar,
  ExternalLink,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Building2,
  RefreshCw,
  FileSpreadsheet,
  Wallet,
  BarChart3,
  Clock,
  ShieldCheck,
} from "lucide-react";

type Params = Promise<{ id: string }>;

export const dynamic = "force-dynamic";

function getPlanOrderLimit(limits: unknown): number {
  if (
    limits !== null &&
    typeof limits === "object" &&
    !Array.isArray(limits) &&
    "orderLimit" in limits
  ) {
    const val = (limits as Record<string, unknown>).orderLimit;
    if (typeof val === "number" && isFinite(val) && val > 0) return val;
  }
  return 60;
}

function addDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

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
          customerName: true,
          createdAt: true,
        },
      },
      googleSheetsIntegration: true,
    },
  });

  if (!merchant) return null;

  const [revenueResult, totalOrderCount, topups] = await Promise.all([
    db.order.aggregate({
      where: { shopId: merchant.shop, status: "DELIVERED" },
      _sum: { codAmount: true },
    }),
    db.order.count({ where: { shopId: merchant.shop } }),
    db.processedAppOneTimePurchase.findMany({
      where: { shop: merchant.shop },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  return {
    merchant,
    totalRevenue: Number(revenueResult._sum.codAmount ?? 0),
    totalOrderCount,
    topups,
  };
}

function SectionTitle({
  icon: Icon,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-2 mb-4">
      <Icon className="h-4 w-4 text-muted-foreground" />
      <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
        {children}
      </h2>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  sub,
  accent,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  sub: string;
  accent?: "green" | "blue" | "orange" | "purple";
}) {
  const iconColor =
    accent === "green"
      ? "text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40"
      : accent === "blue"
      ? "text-blue-600 bg-blue-50 dark:bg-blue-950/40"
      : accent === "orange"
      ? "text-orange-600 bg-orange-50 dark:bg-orange-950/40"
      : "text-violet-600 bg-violet-50 dark:bg-violet-950/40";

  return (
    <Card>
      <CardContent className="pt-5 pb-4">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              {label}
            </p>
            <p className="mt-1.5 text-2xl font-bold tracking-tight">{value}</p>
            <p className="mt-0.5 text-xs text-muted-foreground">{sub}</p>
          </div>
          <div className={`p-2.5 rounded-lg ${iconColor}`}>
            <Icon className="h-4 w-4" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function InfoRow({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-start justify-between py-2.5 border-b last:border-0">
      <span className="text-sm text-muted-foreground min-w-[140px]">
        {label}
      </span>
      <span className="text-sm font-medium text-right">{children}</span>
    </div>
  );
}

type BadgeVariant = "success" | "destructive" | "outline";

function orderStatusVariant(status: string): BadgeVariant {
  if (status === "DELIVERED") return "success";
  if (status === "CANCELLED" || status === "REFUNDED") return "destructive";
  return "outline";
}

export default async function MerchantDetailPage({
  params,
}: {
  params: Params;
}) {
  const { id } = await params;
  const result = await getMerchantDetail(id);

  if (!result) notFound();

  const { merchant, totalRevenue, totalOrderCount, topups } = result;
  const gs = merchant.googleSheetsIntegration;
  const isGsConnected = !!gs?.googleEmail;

  const orderLimit = merchant.plan
    ? getPlanOrderLimit(merchant.plan.limits)
    : 60;
  const isUnlimited = !isFinite(orderLimit);
  const usagePercent = isUnlimited
    ? 0
    : Math.min(100, Math.round((merchant.ordersThisCycle / orderLimit) * 100));
  const usageColor =
    usagePercent >= 90
      ? "bg-red-500"
      : usagePercent >= 70
      ? "bg-yellow-500"
      : "bg-emerald-500";
  const nextReset = addDays(merchant.billingCycleStart, 30);

  return (
    <div className="space-y-8">
      {/* ── Back + Header ── */}
      <div>
        <Link
          href="/merchants"
          className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground mb-4 transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          All Merchants
        </Link>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold tracking-tight font-mono">
              {merchant.shop}
            </h1>
            <div className="flex items-center gap-3 mt-1.5 flex-wrap">
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                Installed {formatDate(merchant.installedAt)}
              </span>
              <span className="text-xs text-muted-foreground font-mono">
                {merchant.id}
              </span>
            </div>
          </div>
          <Badge
            variant={merchant.isActive ? "success" : "secondary"}
            className="self-start sm:self-center text-sm px-3 py-1"
          >
            {merchant.isActive ? "Active" : "Inactive"}
          </Badge>
        </div>
      </div>

      {/* ── KPI Cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={ShoppingBag}
          label="Total Orders"
          value={totalOrderCount.toLocaleString()}
          sub={`${merchant.ordersThisCycle} this cycle`}
          accent="blue"
        />
        <StatCard
          icon={DollarSign}
          label="COD Revenue"
          value={formatCurrency(totalRevenue, "USD")}
          sub="Delivered orders"
          accent="green"
        />
        <StatCard
          icon={Wallet}
          label="SMS Balance"
          value={formatCurrency(merchant.balance, "USD")}
          sub={`${topups.length} top-up${topups.length !== 1 ? "s" : ""}`}
          accent="orange"
        />
        <StatCard
          icon={CreditCard}
          label="Plan"
          value={merchant.plan?.name ?? "Free"}
          sub={
            merchant.plan?.price
              ? formatCurrency(Number(merchant.plan.price), "USD") + "/mo"
              : "No charge"
          }
          accent="purple"
        />
      </div>

      {/* ── Merchant Info + Billing ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Merchant Information */}
        <Card>
          <CardHeader className="pb-3">
            <SectionTitle icon={Building2}>Merchant Information</SectionTitle>
          </CardHeader>
          <CardContent>
            <InfoRow label="Shop Domain">
              <span className="font-mono text-xs">{merchant.shop}</span>
            </InfoRow>
            <InfoRow label="Status">
              <Badge variant={merchant.isActive ? "success" : "secondary"}>
                {merchant.isActive ? "Active" : "Inactive"}
              </Badge>
            </InfoRow>
            <InfoRow label="Installed">
              {formatDate(merchant.installedAt)}
            </InfoRow>
            {merchant.uninstalledAt && (
              <InfoRow label="Uninstalled">
                <span className="text-destructive">
                  {formatDate(merchant.uninstalledAt)}
                </span>
              </InfoRow>
            )}
            <InfoRow label="SMS Balance">
              <span className="font-semibold">
                {formatCurrency(merchant.balance, "USD")}
              </span>
            </InfoRow>
            <InfoRow label="Merchant ID">
              <span className="font-mono text-xs text-muted-foreground">
                {merchant.id}
              </span>
            </InfoRow>
            {merchant.scopes && (
              <div className="pt-2.5 mt-0.5">
                <p className="text-xs text-muted-foreground mb-1">
                  OAuth Scopes
                </p>
                <p className="font-mono text-xs text-muted-foreground leading-relaxed break-all bg-muted/40 rounded px-2 py-1.5">
                  {merchant.scopes}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Billing & Subscription */}
        <Card>
          <CardHeader className="pb-3">
            <SectionTitle icon={CreditCard}>
              Billing &amp; Subscription
            </SectionTitle>
          </CardHeader>
          <CardContent>
            <InfoRow label="Current Plan">
              <span className="font-semibold">
                {merchant.plan?.name ?? "Free"}
              </span>
            </InfoRow>
            <InfoRow label="Billing Amount">
              {merchant.plan?.price
                ? formatCurrency(Number(merchant.plan.price), "USD") +
                  ` / ${merchant.plan.interval === "ANNUAL" ? "year" : "month"}`
                : "—"}
            </InfoRow>
            <InfoRow label="Shopify Sub ID">
              {merchant.planBillingId ? (
                <span className="font-mono text-xs">
                  {merchant.planBillingId}
                </span>
              ) : (
                <span className="text-muted-foreground italic text-xs">
                  None (free)
                </span>
              )}
            </InfoRow>
            <InfoRow label="Cycle Start">
              {formatDate(merchant.billingCycleStart)}
            </InfoRow>
            <InfoRow label="Next Reset">
              <span className="flex items-center gap-1">
                <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                {formatDate(nextReset)}
              </span>
            </InfoRow>
            <InfoRow label="Orders This Cycle">
              {isUnlimited ? (
                <span>
                  {merchant.ordersThisCycle.toLocaleString()}
                  <span className="text-muted-foreground"> / ∞</span>
                </span>
              ) : (
                <span>
                  {merchant.ordersThisCycle.toLocaleString()}
                  <span className="text-muted-foreground">
                    {" "}
                    / {orderLimit.toLocaleString()}
                  </span>
                </span>
              )}
            </InfoRow>

            {/* Usage progress bar */}
            {!isUnlimited && (
              <div className="mt-4">
                <div className="flex justify-between text-xs text-muted-foreground mb-1.5">
                  <span>Cycle Usage</span>
                  <span>{usagePercent}%</span>
                </div>
                <div className="h-2 rounded-full bg-muted overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${usageColor}`}
                    style={{ width: `${usagePercent}%` }}
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-1.5">
                  {(orderLimit - merchant.ordersThisCycle).toLocaleString()}{" "}
                  orders remaining
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* ── SMS Top-up History ── */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <SectionTitle icon={Wallet}>Top-up History</SectionTitle>
              <CardDescription className="-mt-2">
                SMS &amp; WhatsApp messaging credit purchases
              </CardDescription>
            </div>
            <Badge variant="outline" className="font-mono">
              {topups.length} charge{topups.length !== 1 ? "s" : ""}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="font-mono text-xs">
                  Shopify Charge GID
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {topups.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={4}
                    className="text-center py-10 text-muted-foreground text-sm"
                  >
                    No top-ups recorded for this merchant.
                  </TableCell>
                </TableRow>
              ) : (
                topups.map((t) => (
                  <TableRow key={t.purchaseGid}>
                    <TableCell className="text-xs text-muted-foreground">
                      {formatDate(t.createdAt)}
                    </TableCell>
                    <TableCell className="font-semibold">
                      {formatCurrency(t.amountUsd, "USD")}
                    </TableCell>
                    <TableCell>
                      <span className="inline-flex items-center gap-1 text-xs text-emerald-600 font-medium">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        Credited
                      </span>
                    </TableCell>
                    <TableCell className="font-mono text-xs text-muted-foreground max-w-xs truncate">
                      {t.purchaseGid}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* ── Google Sheets Integration ── */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between gap-4">
            <div>
              <SectionTitle icon={FileSpreadsheet}>
                Google Sheets Integration
              </SectionTitle>
              <CardDescription className="-mt-2">
                Connected Google account and auto-sync configuration
              </CardDescription>
            </div>
            <Badge variant={isGsConnected ? "success" : "secondary"}>
              {isGsConnected ? (
                <span className="flex items-center gap-1">
                  <ShieldCheck className="h-3 w-3" /> Connected
                </span>
              ) : (
                "Not Connected"
              )}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          {!gs ? (
            <div className="flex items-center gap-2 py-4 text-sm text-muted-foreground">
              <XCircle className="h-4 w-4" />
              This merchant has not set up Google Sheets integration.
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-10">
              {/* Left column */}
              <div>
                <InfoRow label="Google Account">
                  {gs.googleEmail ?? (
                    <span className="italic text-muted-foreground text-xs">
                      Not connected
                    </span>
                  )}
                </InfoRow>
                <InfoRow label="Sync Status">
                  <Badge variant={gs.isEnabled ? "default" : "secondary"}>
                    {gs.isEnabled ? "Enabled" : "Disabled"}
                  </Badge>
                </InfoRow>
                <InfoRow label="Auto Sync">
                  <Badge variant={gs.autoSync ? "default" : "outline"}>
                    {gs.autoSync ? "On" : "Off"}
                  </Badge>
                </InfoRow>
                <InfoRow label="Orders Synced">
                  <span className="font-semibold">
                    {totalOrderCount.toLocaleString()}
                  </span>
                </InfoRow>
                <InfoRow label="Last Synced">
                  {gs.lastSyncAt ? (
                    <span className="flex items-center gap-1">
                      <RefreshCw className="h-3.5 w-3.5 text-muted-foreground" />
                      {formatDate(gs.lastSyncAt)}
                    </span>
                  ) : (
                    <span className="italic text-muted-foreground text-xs">
                      Never
                    </span>
                  )}
                </InfoRow>
                {gs.googleTokenExpiresAt && (
                  <InfoRow label="Token Expires">
                    <span className="font-mono text-xs text-muted-foreground">
                      {formatDate(gs.googleTokenExpiresAt)}
                    </span>
                  </InfoRow>
                )}
              </div>

              {/* Right column */}
              <div>
                <InfoRow label="Spreadsheet">
                  {gs.spreadsheetUrl ? (
                    <a
                      href={gs.spreadsheetUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-blue-600 hover:underline font-mono text-xs"
                    >
                      {gs.spreadsheetId
                        ? gs.spreadsheetId.slice(0, 20) + "…"
                        : "Open"}
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  ) : (
                    <span className="italic text-muted-foreground text-xs">
                      Not configured
                    </span>
                  )}
                </InfoRow>
                <InfoRow label="Orders Sheet">
                  {gs.sheetName}
                </InfoRow>
                <InfoRow label="Row Format">
                  {gs.singleRowPerOrder
                    ? "Single row / order"
                    : "Multi-row (line items)"}
                </InfoRow>
                <InfoRow label="Layout Design">
                  {gs.layoutDesign}
                </InfoRow>
                <InfoRow label="Insert Position">
                  {gs.insertAtTop ? "Insert at top" : "Append at bottom"}
                </InfoRow>
              </div>

              {/* Sync error — full width */}
              {gs.lastSyncError && (
                <div className="lg:col-span-2 mt-3 flex items-start gap-2 rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2.5">
                  <AlertCircle className="h-4 w-4 text-destructive mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs font-semibold text-destructive mb-0.5">
                      Last Sync Error
                    </p>
                    <p className="font-mono text-xs text-destructive/80 break-all">
                      {gs.lastSyncError}
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* ── Recent Orders ── */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <SectionTitle icon={BarChart3}>Recent Orders</SectionTitle>
              <CardDescription className="-mt-2">
                Last 20 of {totalOrderCount.toLocaleString()} total orders
              </CardDescription>
            </div>
            <Badge variant="outline" className="font-mono">
              {totalOrderCount.toLocaleString()} total
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order ID</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>COD Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {merchant.orders.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="text-center py-10 text-muted-foreground text-sm"
                  >
                    No orders yet.
                  </TableCell>
                </TableRow>
              ) : (
                merchant.orders.map(
                  (order: (typeof merchant.orders)[number]) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-mono text-xs">
                        {order.orderId}
                      </TableCell>
                      <TableCell className="text-sm">
                        {order.customerName ?? (
                          <span className="text-muted-foreground italic text-xs">
                            Unknown
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="font-semibold">
                        {formatCurrency(Number(order.codAmount), "USD")}
                      </TableCell>
                      <TableCell>
                        <Badge variant={orderStatusVariant(order.status)}>
                          {order.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground text-xs">
                        {formatDate(order.createdAt)}
                      </TableCell>
                    </TableRow>
                  )
                )
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
