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
  SkeletonThumbnail,
} from "@shopify/polaris";

const STAT_GRID_COLUMNS = {
  xs: "minmax(0, 1fr)",
  sm: "repeat(auto-fill, minmax(200px, 1fr))",
} as const;

const FEATURE_GRID_COLUMNS = {
  xs: "minmax(0, 1fr)",
  sm: "repeat(auto-fill, minmax(280px, 1fr))",
} as const;

const FEATURE_CARD_SHELL: CSSProperties = {
  border: "1px solid var(--p-color-border)",
  borderRadius: "12px",
  padding: "20px",
  display: "flex",
  flexDirection: "column",
  gap: "16px",
  height: "100%",
  boxSizing: "border-box",
  background: "var(--p-color-bg-surface)",
};

/**
 * Route-level loading skeleton for the Home page.
 * Mirrors: welcome banner, stats row, 6-card feature grid, quick start checklist.
 */
export default function HomePageSkeleton(): ReactElement {
  return (
    <SkeletonPage fullWidth title="Home">
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        <BlockStack gap="600">

          {/* Welcome banner skeleton */}
          <div
            style={{
              background: "var(--p-color-bg-surface-secondary)",
              borderRadius: "12px",
              padding: "32px",
            }}
          >
            <BlockStack gap="200">
              <SkeletonDisplayText size="small" maxWidth="22ch" />
              <SkeletonDisplayText size="large" maxWidth="28ch" />
              <Box maxWidth="48ch">
                <SkeletonBodyText lines={1} />
              </Box>
              <Box maxWidth="12ch" paddingBlockStart="150">
                <SkeletonDisplayText size="small" maxWidth="100%" />
              </Box>
            </BlockStack>
          </div>

          {/* Stats row skeleton */}
          <InlineGrid columns={STAT_GRID_COLUMNS} gap="400">
            {[0, 1, 2].map((i) => (
              <Card key={i} roundedAbove="sm">
                <BlockStack gap="200">
                  <SkeletonDisplayText size="small" maxWidth="14ch" />
                  <SkeletonDisplayText size="medium" maxWidth="10ch" />
                  <SkeletonBodyText lines={1} />
                </BlockStack>
              </Card>
            ))}
          </InlineGrid>

          {/* Features section skeleton */}
          <BlockStack gap="300">
            <SkeletonDisplayText size="medium" maxWidth="15ch" />
            <InlineGrid columns={FEATURE_GRID_COLUMNS} gap="400">
              {[0, 1, 2, 3, 4, 5].map((i) => (
                <div key={i} style={FEATURE_CARD_SHELL}>
                  <InlineStack align="space-between" blockAlign="start">
                    <SkeletonThumbnail size="small" />
                  </InlineStack>
                  <BlockStack gap="150">
                    <SkeletonDisplayText size="small" maxWidth="12ch" />
                    <SkeletonBodyText lines={2} />
                  </BlockStack>
                  <Box maxWidth="14ch">
                    <SkeletonDisplayText size="small" maxWidth="100%" />
                  </Box>
                </div>
              ))}
            </InlineGrid>
          </BlockStack>

          {/* Quick start checklist skeleton */}
          <Card roundedAbove="sm">
            <BlockStack gap="400">
              <SkeletonDisplayText size="small" maxWidth="20ch" />
              <BlockStack gap="300">
                {[0, 1, 2, 3, 4].map((i) => (
                  <InlineStack key={i} gap="300" blockAlign="center">
                    <Box minWidth="20px">
                      <SkeletonThumbnail size="extraSmall" />
                    </Box>
                    <Box minWidth="0" width="100%">
                      <SkeletonBodyText lines={1} />
                    </Box>
                  </InlineStack>
                ))}
              </BlockStack>
            </BlockStack>
          </Card>

        </BlockStack>
      </div>
    </SkeletonPage>
  );
}
