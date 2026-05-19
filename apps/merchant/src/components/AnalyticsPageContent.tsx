"use client";

import { useEffect, useState } from "react";
import type { CSSProperties, ReactElement } from "react";
import {
  Badge,
  BlockStack,
  Box,
  Button,
  Card,
  InlineGrid,
  InlineStack,
  Page,
  ProgressBar,
  Text,
} from "@shopify/polaris";

import type { AnalyticsSummaryResponse } from "@/app/api/analytics/summary/route";
import AnalyticsPageSkeleton from "@/components/skeletons/AnalyticsPageSkeleton";

type StatusKey = keyof AnalyticsSummaryResponse["statusBreakdown"];

const STATUS_CONFIG: { key: StatusKey; label: string; color: string }[] = [
  { key: "PENDING", label: "Pending", color: "#F59E0B" },
  { key: "CONFIRMED", label: "Confirmed", color: "#0091AE" },
  { key: "SHIPPED", label: "Shipped", color: "#5C6AC4" },
  { key: "DELIVERED", label: "Delivered", color: "#2EA44F" },
  { key: "CANCELLED", label: "Cancelled", color: "#DE3618" },
  { key: "REFUNDED", label: "Refunded", color: "#919EAB" },
];

const STAT_GRID_COLUMNS = {
  xs: "minmax(0, 1fr)",
  sm: "repeat(auto-fill, minmax(180px, 1fr))",
} as const;

const TWO_COL = {
  xs: "minmax(0, 1fr)",
  sm: "repeat(2, minmax(0, 1fr))",
} as const;

const STATUS_DOT: CSSProperties = {
  width: "10px",
  height: "10px",
  borderRadius: "50%",
  flexShrink: 0,
};

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

function formatChartDate(dateStr: string): string {
  const [year, month, day] = dateStr.split("-").map(Number);
  const d = new Date(year!, month! - 1, day!);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function planUsageTone(pct: number): "success" | "highlight" | "critical" {
  if (pct >= 90) return "critical";
  if (pct >= 70) return "highlight";
  return "success";
}

export function AnalyticsPageContent(): ReactElement {
  const [data, setData] = useState<AnalyticsSummaryResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData(): Promise<void> {
      try {
        const res = await fetch("/api/analytics/summary");
        if (!res.ok) throw new Error("Failed to load analytics");
        const json = (await res.json()) as AnalyticsSummaryResponse;
        setData(json);
      } catch {
        setError("Unable to load analytics. Please try refreshing the page.");
      } finally {
        setLoading(false);
      }
    }
    void fetchData();
  }, []);

  if (loading) return <AnalyticsPageSkeleton />;

  if (error || !data) {
    return (
      <Page fullWidth>
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <Card roundedAbove="sm">
            <BlockStack gap="300">
              <Text as="p" variant="bodyMd" tone="critical">
                {error ?? "Something went wrong."}
              </Text>
              <Button onClick={() => window.location.reload()} size="slim">
                Retry
              </Button>
            </BlockStack>
          </Card>
        </div>
      </Page>
    );
  }

  const {
    totalOrders,
    totalOrderValue,
    ordersThisCycle,
    cycleOrderLimit,
    confirmedRate,
    statusBreakdown,
    recentOrderTrend,
  } = data;

  const usagePct =
    cycleOrderLimit !== null && cycleOrderLimit > 0
      ? Math.min(Math.round((ordersThisCycle / cycleOrderLimit) * 100), 100)
      : 0;

  const maxStatusCount = Math.max(...Object.values(statusBreakdown), 1);
  const maxDailyOrders = Math.max(...recentOrderTrend.map((d) => d.count), 1);
  const hasAnyOrders = totalOrders > 0;
  const hasTrendData = recentOrderTrend.some((d) => d.count > 0);

  return (
    <Page fullWidth>
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        <BlockStack gap="600">

          {/* Page Header */}
          <BlockStack gap="100">
            <Text as="h1" variant="headingXl" fontWeight="bold">
              Analytics
            </Text>
            <Text as="p" variant="bodyMd" tone="subdued">
              Track your orders, revenue, and store performance.
            </Text>
          </BlockStack>

          {/* Key Metrics */}
          <InlineGrid columns={STAT_GRID_COLUMNS} gap="400">
            <Card roundedAbove="sm">
              <BlockStack gap="200">
                <Text as="p" variant="bodySm" tone="subdued">
                  Total Orders
                </Text>
                <Text as="p" variant="headingXl" fontWeight="bold">
                  {totalOrders.toLocaleString()}
                </Text>
                <Text as="p" variant="bodyXs" tone="subdued">
                  all time
                </Text>
              </BlockStack>
            </Card>

            <Card roundedAbove="sm">
              <BlockStack gap="200">
                <Text as="p" variant="bodySm" tone="subdued">
                  This Month
                </Text>
                <Text as="p" variant="headingXl" fontWeight="bold">
                  {ordersThisCycle.toLocaleString()}
                </Text>
                <Text as="p" variant="bodyXs" tone="subdued">
                  {cycleOrderLimit !== null
                    ? `of ${cycleOrderLimit.toLocaleString()} limit`
                    : "unlimited plan"}
                </Text>
              </BlockStack>
            </Card>

            <Card roundedAbove="sm">
              <BlockStack gap="200">
                <Text as="p" variant="bodySm" tone="subdued">
                  Total Order Value
                </Text>
                <Text as="p" variant="headingXl" fontWeight="bold">
                  {formatCurrency(totalOrderValue)}
                </Text>
                <Text as="p" variant="bodyXs" tone="subdued">
                  across all orders
                </Text>
              </BlockStack>
            </Card>

            <Card roundedAbove="sm">
              <BlockStack gap="200">
                <InlineStack align="space-between" blockAlign="center">
                  <Text as="p" variant="bodySm" tone="subdued">
                    Confirmation Rate
                  </Text>
                  <Badge
                    tone={
                      confirmedRate >= 70
                        ? "success"
                        : confirmedRate >= 40
                          ? "attention"
                          : "critical"
                    }
                  >
                    {hasAnyOrders ? `${confirmedRate}%` : "—"}
                  </Badge>
                </InlineStack>
                <Text as="p" variant="headingXl" fontWeight="bold">
                  {hasAnyOrders ? `${confirmedRate}%` : "0%"}
                </Text>
                <Text as="p" variant="bodyXs" tone="subdued">
                  confirmed + shipped + delivered
                </Text>
              </BlockStack>
            </Card>
          </InlineGrid>

          {/* Plan Usage + Status Breakdown */}
          <InlineGrid columns={TWO_COL} gap="400">

            {/* Plan Usage */}
            <Card roundedAbove="sm">
              <BlockStack gap="400">
                <BlockStack gap="100">
                  <Text as="h2" variant="headingMd" fontWeight="semibold">
                    Plan Usage
                  </Text>
                  <Text as="p" variant="bodySm" tone="subdued">
                    Orders used in the current billing cycle
                  </Text>
                </BlockStack>

                {cycleOrderLimit !== null ? (
                  <BlockStack gap="300">
                    <InlineStack align="space-between" blockAlign="center">
                      <Text as="p" variant="headingLg" fontWeight="bold">
                        {ordersThisCycle.toLocaleString()}
                        <Text as="span" variant="bodySm" tone="subdued">
                          {" "}/ {cycleOrderLimit.toLocaleString()} orders
                        </Text>
                      </Text>
                      <Text
                        as="p"
                        variant="bodySm"
                        tone={usagePct >= 90 ? "critical" : "subdued"}
                      >
                        {usagePct}%
                      </Text>
                    </InlineStack>
                    <ProgressBar
                      progress={usagePct}
                      tone={planUsageTone(usagePct)}
                      size="medium"
                      animated
                    />
                    {usagePct >= 90 && (
                      <InlineStack align="space-between" blockAlign="center">
                        <Text as="p" variant="bodySm" tone="critical">
                          You&apos;re close to your monthly limit.
                        </Text>
                        <Button url="/billing" size="slim" variant="primary">
                          Upgrade
                        </Button>
                      </InlineStack>
                    )}
                  </BlockStack>
                ) : (
                  <BlockStack gap="200">
                    <Text as="p" variant="headingLg" fontWeight="bold">
                      {ordersThisCycle.toLocaleString()} orders
                    </Text>
                    <Badge tone="success">Unlimited Plan</Badge>
                    <Text as="p" variant="bodySm" tone="subdued">
                      No order limit on your current plan.
                    </Text>
                  </BlockStack>
                )}
              </BlockStack>
            </Card>

            {/* Status Breakdown */}
            <Card roundedAbove="sm">
              <BlockStack gap="400">
                <BlockStack gap="100">
                  <Text as="h2" variant="headingMd" fontWeight="semibold">
                    Order Status
                  </Text>
                  <Text as="p" variant="bodySm" tone="subdued">
                    Breakdown of all orders by status
                  </Text>
                </BlockStack>

                {hasAnyOrders ? (
                  <BlockStack gap="300">
                    {STATUS_CONFIG.map(({ key, label, color }) => {
                      const count = statusBreakdown[key];
                      const widthPct =
                        maxStatusCount > 0
                          ? Math.max((count / maxStatusCount) * 100, count > 0 ? 4 : 0)
                          : 0;
                      return (
                        <InlineStack key={key} gap="200" blockAlign="center">
                          <div style={{ ...STATUS_DOT, background: color }} />
                          <Box minWidth="80px">
                            <Text as="span" variant="bodySm">
                              {label}
                            </Text>
                          </Box>
                          <div
                            style={{
                              flex: 1,
                              height: "6px",
                              background: "var(--p-color-bg-surface-secondary)",
                              borderRadius: "4px",
                              overflow: "hidden",
                            }}
                          >
                            <div
                              style={{
                                width: `${widthPct}%`,
                                height: "100%",
                                background: color,
                                borderRadius: "4px",
                              }}
                            />
                          </div>
                          <Box minWidth="28px">
                            <Text as="span" variant="bodySm" tone="subdued">
                              {count}
                            </Text>
                          </Box>
                        </InlineStack>
                      );
                    })}
                  </BlockStack>
                ) : (
                  <Box paddingBlock="400">
                    <Text as="p" variant="bodyMd" tone="subdued" alignment="center">
                      No orders yet. Your order breakdown will appear here once orders come in.
                    </Text>
                  </Box>
                )}
              </BlockStack>
            </Card>
          </InlineGrid>

          {/* 30-Day Order Trend */}
          <Card roundedAbove="sm">
            <BlockStack gap="400">
              <InlineStack align="space-between" blockAlign="center">
                <BlockStack gap="100">
                  <Text as="h2" variant="headingMd" fontWeight="semibold">
                    Orders — Last 30 Days
                  </Text>
                  <Text as="p" variant="bodySm" tone="subdued">
                    Daily order volume over the past month
                  </Text>
                </BlockStack>
                {hasTrendData && (
                  <Text as="p" variant="bodySm" tone="subdued">
                    Total:{" "}
                    <Text as="span" variant="bodySm" fontWeight="bold">
                      {recentOrderTrend.reduce((s, d) => s + d.count, 0).toLocaleString()}
                    </Text>
                  </Text>
                )}
              </InlineStack>

              {hasTrendData ? (
                <BlockStack gap="200">
                  {/* Bar chart */}
                  <div
                    style={{
                      height: "80px",
                      display: "flex",
                      alignItems: "flex-end",
                      gap: "2px",
                    }}
                  >
                    {recentOrderTrend.map(({ date, count }) => {
                      const heightPct =
                        maxDailyOrders > 0
                          ? Math.max((count / maxDailyOrders) * 100, count > 0 ? 8 : 2)
                          : 2;
                      return (
                        <div
                          key={date}
                          title={`${formatChartDate(date)}: ${count} order${count !== 1 ? "s" : ""}`}
                          style={{
                            flex: 1,
                            height: `${heightPct}%`,
                            background:
                              count > 0
                                ? "#0091AE"
                                : "var(--p-color-bg-surface-secondary)",
                            borderRadius: "2px 2px 0 0",
                            cursor: count > 0 ? "default" : "default",
                          }}
                        />
                      );
                    })}
                  </div>

                  {/* Date labels */}
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      paddingTop: "4px",
                      borderTop: "1px solid var(--p-color-border)",
                    }}
                  >
                    <Text as="span" variant="bodyXs" tone="subdued">
                      {formatChartDate(recentOrderTrend[0]!.date)}
                    </Text>
                    <Text as="span" variant="bodyXs" tone="subdued">
                      {formatChartDate(recentOrderTrend[14]!.date)}
                    </Text>
                    <Text as="span" variant="bodyXs" tone="subdued">
                      Today
                    </Text>
                  </div>
                </BlockStack>
              ) : (
                <Box paddingBlock="600">
                  <BlockStack gap="200">
                    <Text as="p" variant="bodyMd" tone="subdued" alignment="center">
                      No orders in the last 30 days.
                    </Text>
                    <Text as="p" variant="bodySm" tone="subdued" alignment="center">
                      Your daily order chart will appear here once customers start placing orders.
                    </Text>
                  </BlockStack>
                </Box>
              )}
            </BlockStack>
          </Card>

        </BlockStack>
      </div>
    </Page>
  );
}
