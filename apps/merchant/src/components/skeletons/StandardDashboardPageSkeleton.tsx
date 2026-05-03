"use client";

import type { ReactElement } from "react";
import {
  BlockStack,
  Box,
  Card,
  Page,
  SkeletonBodyText,
  SkeletonDisplayText,
} from "@shopify/polaris";

/**
 * Default dashboard placeholder: page header + two stacked cards (unknown or future routes).
 */
export function StandardDashboardPageSkeleton(): ReactElement {
  return (
    <Page>
      <BlockStack gap="400">
        <BlockStack gap="100">
          <SkeletonDisplayText size="large" maxWidth="18ch" />
          <Box maxWidth="min(48ch, 100%)">
            <SkeletonBodyText lines={1} />
          </Box>
        </BlockStack>
        <Card roundedAbove="sm">
          <BlockStack gap="400">
            <SkeletonDisplayText size="small" maxWidth="12ch" />
            <SkeletonBodyText lines={4} />
          </BlockStack>
        </Card>
        <Card roundedAbove="sm">
          <BlockStack gap="400">
            <SkeletonDisplayText size="small" maxWidth="14ch" />
            <SkeletonBodyText lines={6} />
          </BlockStack>
        </Card>
        <Box paddingBlockEnd="400" />
      </BlockStack>
    </Page>
  );
}
