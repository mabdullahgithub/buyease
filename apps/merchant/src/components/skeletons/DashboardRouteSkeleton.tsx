"use client";

import type { ReactElement } from "react";
import {
  BlockStack,
  Card,
  SkeletonBodyText,
  SkeletonDisplayText,
  SkeletonPage,
} from "@shopify/polaris";

/**
 * Full-width loading skeleton for dashboard routes that render ComingSoonPage.
 * Uses SkeletonPage for the proper Polaris page shell with animated title placeholder.
 */
export default function DashboardRouteSkeleton(): ReactElement {
  return (
    <SkeletonPage title="">
      <BlockStack gap="400">
        <Card roundedAbove="sm">
          <BlockStack gap="400">
            <SkeletonDisplayText size="small" />
            <SkeletonBodyText lines={3} />
          </BlockStack>
        </Card>
        <Card roundedAbove="sm">
          <BlockStack gap="300">
            <SkeletonDisplayText size="small" />
            <SkeletonBodyText lines={2} />
          </BlockStack>
        </Card>
      </BlockStack>
    </SkeletonPage>
  );
}
