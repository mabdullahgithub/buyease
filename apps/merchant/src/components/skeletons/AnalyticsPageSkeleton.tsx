"use client";

import type { CSSProperties, ReactElement } from "react";
import {
  BlockStack,
  Box,
  Card,
  InlineGrid,
  InlineStack,
  SkeletonBodyText,
  SkeletonDisplayText,
  SkeletonPage,
} from "@shopify/polaris";

const STAT_GRID_COLUMNS = {
  xs: "minmax(0, 1fr)",
  sm: "repeat(auto-fill, minmax(180px, 1fr))",
} as const;

const TWO_COL = {
  xs: "minmax(0, 1fr)",
  sm: "repeat(2, minmax(0, 1fr))",
} as const;

const STATUS_ROW: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "12px",
};

/**
 * Route-level loading skeleton for the Analytics page.
 * Mirrors: header, 4 stat cards, plan usage + status breakdown, 30-day trend.
 */
export default function AnalyticsPageSkeleton(): ReactElement {
  return (
    <SkeletonPage fullWidth title="Analytics">
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        <BlockStack gap="600">

          {/* Page header */}
          <BlockStack gap="100">
            <SkeletonDisplayText size="large" maxWidth="16ch" />
            <Box maxWidth="50ch">
              <SkeletonBodyText lines={1} />
            </Box>
          </BlockStack>

          {/* 4 stat cards */}
          <InlineGrid columns={STAT_GRID_COLUMNS} gap="400">
            {[0, 1, 2, 3].map((i) => (
              <Card key={i} roundedAbove="sm">
                <BlockStack gap="200">
                  <SkeletonDisplayText size="small" maxWidth="14ch" />
                  <SkeletonDisplayText size="large" maxWidth="8ch" />
                  <SkeletonBodyText lines={1} />
                </BlockStack>
              </Card>
            ))}
          </InlineGrid>

          {/* Plan usage + status breakdown */}
          <InlineGrid columns={TWO_COL} gap="400">
            <Card roundedAbove="sm">
              <BlockStack gap="400">
                <BlockStack gap="100">
                  <SkeletonDisplayText size="small" maxWidth="14ch" />
                  <SkeletonBodyText lines={1} />
                </BlockStack>
                <BlockStack gap="200">
                  <SkeletonDisplayText size="medium" maxWidth="20ch" />
                  <Box
                    background="bg-surface-secondary"
                    borderRadius="100"
                    minHeight="12px"
                  />
                </BlockStack>
              </BlockStack>
            </Card>

            <Card roundedAbove="sm">
              <BlockStack gap="400">
                <BlockStack gap="100">
                  <SkeletonDisplayText size="small" maxWidth="14ch" />
                  <SkeletonBodyText lines={1} />
                </BlockStack>
                <BlockStack gap="300">
                  {[0, 1, 2, 3, 4, 5].map((i) => (
                    <div key={i} style={STATUS_ROW}>
                      <Box
                        background="bg-surface-secondary"
                        borderRadius="full"
                        minWidth="10px"
                        minHeight="10px"
                      />
                      <Box minWidth="80px">
                        <SkeletonBodyText lines={1} />
                      </Box>
                      <Box minWidth="0" width="100%">
                        <SkeletonBodyText lines={1} />
                      </Box>
                      <Box minWidth="28px">
                        <SkeletonBodyText lines={1} />
                      </Box>
                    </div>
                  ))}
                </BlockStack>
              </BlockStack>
            </Card>
          </InlineGrid>

          {/* 30-day trend card */}
          <Card roundedAbove="sm">
            <BlockStack gap="400">
              <InlineStack align="space-between" blockAlign="center">
                <BlockStack gap="100">
                  <SkeletonDisplayText size="small" maxWidth="22ch" />
                  <SkeletonBodyText lines={1} />
                </BlockStack>
              </InlineStack>
              {/* Chart area */}
              <div
                style={{
                  height: "80px",
                  display: "flex",
                  alignItems: "flex-end",
                  gap: "2px",
                }}
              >
                {Array.from({ length: 30 }, (_, i) => (
                  <div
                    key={i}
                    style={{
                      flex: 1,
                      height: `${20 + Math.sin(i * 0.5) * 15 + (i % 3) * 8}%`,
                      background: "var(--p-color-bg-surface-secondary)",
                      borderRadius: "2px 2px 0 0",
                    }}
                  />
                ))}
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
                {[0, 1, 2].map((i) => (
                  <Box key={i} maxWidth="8ch">
                    <SkeletonBodyText lines={1} />
                  </Box>
                ))}
              </div>
            </BlockStack>
          </Card>

        </BlockStack>
      </div>
    </SkeletonPage>
  );
}
