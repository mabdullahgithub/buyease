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
 * Loading skeleton for `(dashboard)` routes while Server Components resolve.
 */
export default function DashboardRouteSkeleton(): ReactElement {
  return (
    <Page>
      <BlockStack gap="400">
        <SkeletonDisplayText size="large" />
        <Card roundedAbove="sm">
          <BlockStack gap="400">
            <SkeletonDisplayText size="small" />
            <SkeletonBodyText lines={6} />
          </BlockStack>
        </Card>
        <Box paddingBlockEnd="400" />
      </BlockStack>
    </Page>
  );
}
