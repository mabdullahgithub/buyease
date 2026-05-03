"use client";

import type { ReactElement } from "react";
import {
  BlockStack,
  Card,
  InlineGrid,
  Page,
  SkeletonBodyText,
  SkeletonDisplayText,
} from "@shopify/polaris";

/**
 * Loading UI for dashboard routes: mirrors typical Page + two-column card layouts (e.g. form builder).
 */
export default function DashboardRouteSkeleton(): ReactElement {
  return (
    <Page>
      <BlockStack gap="400">
        <SkeletonDisplayText size="large" />
        <InlineGrid columns={{ xs: 1, md: ["twoThirds", "oneThird"] }} gap="400" alignItems="start">
          <Card roundedAbove="sm">
            <BlockStack gap="400">
              <SkeletonDisplayText size="small" />
              <SkeletonBodyText lines={8} />
            </BlockStack>
          </Card>
          <Card roundedAbove="sm">
            <BlockStack gap="300">
              <SkeletonDisplayText size="small" />
              <SkeletonBodyText lines={5} />
            </BlockStack>
          </Card>
        </InlineGrid>
      </BlockStack>
    </Page>
  );
}
